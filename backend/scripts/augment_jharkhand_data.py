"""
Augments the base Crop-AI crop_recommendation dataset with synthetic rows that
reflect Jharkhand's actual growing conditions, so the retrained model leans
toward locally-viable crops instead of only the generalized all-India distribution.

Jharkhand agronomic facts baked into the augmentation (source: Jharkhand
Department of Agriculture advisories / ICAR Ranchi soil surveys):
  - Soil is predominantly acidic laterite/red soil, pH ~4.5-6.5 (vs the pan-India
    dataset's broader ~5.5-7.5 range).
  - Farming is overwhelmingly rain-fed (monsoon-dependent, Jun-Oct), so rainfall
    is lower and more erratic than irrigated regions in the base dataset.
  - Dominant/viable crops: rice (~80% of cropped area), maize, and pulses
    (pigeonpeas/arhar, blackgram/urad, mungbean/moong, chickpea/chana, lentil/masoor),
    plus jute in the eastern districts.

The base dataset already has 100 balanced rows per crop (22 crops). This script
does NOT invent a new crop label (the existing XGBoost label encoding, and the
frontend/app expecting a fixed 22-crop set, must stay compatible) - it re-weights
the *feature distribution* for the crops that are actually grown in Jharkhand by
adding extra acidic-soil, monsoon-rainfall samples drawn from perturbations of
each crop's real rows. This nudges the retrained model to prefer these crops
whenever it sees Jharkhand-like acidic/rain-fed input, without touching the
crops that were never realistic for the region.
"""

import numpy as np
import pandas as pd
from pathlib import Path

SEED = 42
rng = np.random.default_rng(SEED)

BASE_DIR = Path(__file__).parent
INPUT_CSV = BASE_DIR / "data" / "crop_recommendation_base.csv"
OUTPUT_CSV = BASE_DIR / "data" / "crop_recommendation_jharkhand.csv"

# Crops actually grown at meaningful scale in Jharkhand.
JHARKHAND_CROPS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
    "mungbean", "blackgram", "mothbeans", "lentil", "jute",
]

# How many extra synthetic rows to add per Jharkhand crop.
ROWS_PER_CROP = 120

# Target acidic soil range for Jharkhand (laterite/red soil).
JH_PH_MEAN, JH_PH_STD = 5.4, 0.55
JH_PH_MIN, JH_PH_MAX = 4.5, 6.5


def augment_crop(df: pd.DataFrame, crop: str, n_rows: int) -> pd.DataFrame:
    crop_rows = df[df["label"] == crop]
    if crop_rows.empty:
        print(f"  skip '{crop}': not present in base dataset")
        return pd.DataFrame(columns=df.columns)

    sampled = crop_rows.sample(n=n_rows, replace=True, random_state=SEED)

    new_ph = rng.normal(JH_PH_MEAN, JH_PH_STD, size=n_rows)
    new_ph = np.clip(new_ph, JH_PH_MIN, JH_PH_MAX)

    # Rain-fed monsoon agriculture: pull rainfall down slightly and widen the
    # spread to reflect erratic monsoons, but keep it within a plausible band
    # for the crop instead of a fixed constant.
    rainfall_scale = rng.normal(0.85, 0.18, size=n_rows)
    rainfall_scale = np.clip(rainfall_scale, 0.5, 1.15)
    new_rainfall = np.clip(sampled["rainfall"].to_numpy() * rainfall_scale, 20, 300)

    # Small realistic jitter on N/P/K and temperature/humidity so rows aren't
    # exact duplicates of existing samples.
    def jitter(col, pct=0.08):
        vals = sampled[col].to_numpy()
        noise = rng.normal(0, pct, size=n_rows)
        return np.clip(vals * (1 + noise), 0, None)

    out = pd.DataFrame({
        "N": jitter("N").round(0),
        "P": jitter("P").round(0),
        "K": jitter("K").round(0),
        "temperature": jitter("temperature", 0.05),
        "humidity": jitter("humidity", 0.05),
        "ph": new_ph,
        "rainfall": new_rainfall,
        "label": crop,
    })
    return out


def main():
    df = pd.read_csv(INPUT_CSV)
    print(f"Base dataset: {len(df)} rows, {df['label'].nunique()} crops")

    augmented_frames = [df]
    print(f"Augmenting {len(JHARKHAND_CROPS)} Jharkhand-relevant crops "
          f"with {ROWS_PER_CROP} acidic/rain-fed rows each...")
    for crop in JHARKHAND_CROPS:
        extra = augment_crop(df, crop, ROWS_PER_CROP)
        augmented_frames.append(extra)
        print(f"  + {crop}: {len(extra)} rows (ph ~N({JH_PH_MEAN}, {JH_PH_STD}) clipped [{JH_PH_MIN},{JH_PH_MAX}])")

    final = pd.concat(augmented_frames, ignore_index=True)
    final = final.sample(frac=1.0, random_state=SEED).reset_index(drop=True)  # shuffle

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    final.to_csv(OUTPUT_CSV, index=False)

    print(f"\nWrote {len(final)} rows -> {OUTPUT_CSV}")
    print(final["label"].value_counts().sort_index())


if __name__ == "__main__":
    main()
