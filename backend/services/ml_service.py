"""
Loads the Jharkhand-fine-tuned crop model and the Crop-AI ResNet disease models
once at startup, and exposes prediction functions consumed by the API routes.
"""

import io
import json
from typing import Optional

import joblib
import numpy as np
import onnxruntime as ort
from PIL import Image

from core.config import (
    CROP_LABEL_MAPPING_PATH,
    CROP_MODEL_PATH,
    DEFAULT_HUMIDITY_PCT,
    DEFAULT_TEMPERATURE_C,
    DISEASE_MODEL_DIR,
)
from services.weather_service import fetch_weather

DISEASE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy',
]

DISEASE_MODEL_PATHS = {
    "resnet9": DISEASE_MODEL_DIR / "resnet9_plant_disease.onnx",
    "resnet50": DISEASE_MODEL_DIR / "resnet50_plant_disease.onnx",
}

_crop_model = None
_crop_label_mapping: dict[int, str] = {}
_disease_sessions: dict[str, ort.InferenceSession] = {}


def load_models():
    """Call once on FastAPI startup (see main.py lifespan)."""
    global _crop_model, _crop_label_mapping

    if CROP_MODEL_PATH.exists():
        _crop_model = joblib.load(CROP_MODEL_PATH)
        print(f"Loaded crop recommendation model from {CROP_MODEL_PATH}")
    else:
        print(f"WARNING: crop model not found at {CROP_MODEL_PATH}")

    if CROP_LABEL_MAPPING_PATH.exists():
        with open(CROP_LABEL_MAPPING_PATH) as f:
            _crop_label_mapping = {int(k): v for k, v in json.load(f).items()}

    for name, path in DISEASE_MODEL_PATHS.items():
        if path.exists():
            _disease_sessions[name] = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
            print(f"Loaded disease model '{name}' from {path}")
        else:
            print(f"WARNING: disease model '{name}' not found at {path}")


def predict_crop(
    n: int, p: int, k: int, ph: float, rainfall: float,
    lat: Optional[float] = None, lon: Optional[float] = None,
    temperature: Optional[float] = None, humidity: Optional[float] = None,
):
    if _crop_model is None:
        raise RuntimeError("Crop recommendation model is not loaded.")

    if temperature is None or humidity is None:
        weather = fetch_weather(lat, lon) if lat is not None and lon is not None else None
        if weather and weather[0] is not None:
            temperature = temperature if temperature is not None else weather[0]
            humidity = humidity if humidity is not None else weather[1]
        else:
            temperature = temperature if temperature is not None else DEFAULT_TEMPERATURE_C
            humidity = humidity if humidity is not None else DEFAULT_HUMIDITY_PCT

    features = np.array([[n, p, k, temperature, humidity, ph, rainfall]])

    if hasattr(_crop_model, "predict_proba"):
        probs = _crop_model.predict_proba(features)[0]
        top_idx = np.argsort(probs)[::-1][:3]
        top_3 = [_crop_label_mapping.get(int(i), str(i)) for i in top_idx]
        prediction = top_3[0]
    else:
        pred_idx = int(_crop_model.predict(features)[0])
        prediction = _crop_label_mapping.get(pred_idx, str(pred_idx))
        top_3 = [prediction]

    return {
        "success": True,
        "prediction": prediction,
        "top_3": top_3,
        "inputs": {
            "N": n, "P": p, "K": k, "ph": ph, "rainfall": rainfall,
            "temperature": temperature, "humidity": humidity,
        },
    }


def predict_disease(image_bytes: bytes, model_name: str = "resnet50", confidence_threshold: float = 0.5):
    session = _disease_sessions.get(model_name)
    if session is None:
        raise RuntimeError(f"Disease model '{model_name}' is not loaded.")

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((256, 256))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))[np.newaxis, ...]  # NCHW

    input_name = session.get_inputs()[0].name
    logits = session.run(None, {input_name: arr})[0]

    probabilities = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    probabilities = probabilities / np.sum(probabilities, axis=1, keepdims=True)
    confidence = float(np.max(probabilities))
    predicted_idx = int(np.argmax(probabilities))

    predicted_class = DISEASE_CLASSES[predicted_idx] if predicted_idx < len(DISEASE_CLASSES) else f"class_{predicted_idx}"
    parts = predicted_class.split("___")
    plant_name = parts[0].replace("_", " ").title() if parts else "Unknown"
    disease_status = parts[1].replace("_", " ").title() if len(parts) > 1 else "Unknown"

    return {
        "success": True,
        "predicted_class": predicted_class,
        "plant_name": plant_name,
        "disease_status": disease_status,
        "confidence": confidence,
        "is_confident": confidence >= confidence_threshold,
        "model_used": model_name,
    }
