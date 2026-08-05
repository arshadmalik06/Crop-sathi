import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

ML_MODELS_DIR = BASE_DIR / "ml_models"
CROP_MODEL_PATH = ML_MODELS_DIR / "crop-recommendation" / "XGBoost.pkl"
CROP_LABEL_MAPPING_PATH = ML_MODELS_DIR / "crop-recommendation" / "label_mapping.json"
DISEASE_MODEL_DIR = ML_MODELS_DIR / "plant-disease"

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# Fallback climate figures used when no lat/lon (offline) is provided.
# Averages for Jharkhand's monsoon season (Jun-Oct), from IMD Ranchi normals.
DEFAULT_TEMPERATURE_C = float(os.getenv("DEFAULT_TEMPERATURE_C", 26.5))
DEFAULT_HUMIDITY_PCT = float(os.getenv("DEFAULT_HUMIDITY_PCT", 72.0))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500,http://localhost:8000",
).split(",")
