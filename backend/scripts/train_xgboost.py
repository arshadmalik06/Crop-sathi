"""
Retrains the crop recommendation XGBoost model on the Jharkhand-augmented
dataset (see augment_jharkhand_data.py) and saves it to
ml_models/crop-recommendation/XGBoost.pkl, matching the format the original
Crop-AI ml-server's xgboost_inference.py expects (joblib-dumped classifier,
label order = sorted crop names -> 0..21).
"""

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

BASE_DIR = Path(__file__).parent
DATA_CSV = BASE_DIR / "data" / "crop_recommendation_jharkhand.csv"
MODEL_OUT = BASE_DIR.parent / "ml_models" / "crop-recommendation" / "XGBoost.pkl"
MAPPING_OUT = BASE_DIR.parent / "ml_models" / "crop-recommendation" / "label_mapping.json"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def main():
    df = pd.read_csv(DATA_CSV)
    print(f"Training on {len(df)} rows, {df['label'].nunique()} crops")

    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label"])
    X = df[FEATURES]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\nTest accuracy: {acc:.4f}\n")
    print(classification_report(y_test, preds, target_names=encoder.classes_))

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_OUT)
    print(f"Saved model -> {MODEL_OUT}")

    mapping = {int(i): label for i, label in enumerate(encoder.classes_)}
    with open(MAPPING_OUT, "w") as f:
        json.dump(mapping, f, indent=2)
    print(f"Saved label mapping -> {MAPPING_OUT}")
    print(mapping)


if __name__ == "__main__":
    main()
