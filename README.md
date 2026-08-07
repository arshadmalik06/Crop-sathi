# Crop-sathi
Crop-Sathi is an AI-powered, offline-first digital companion that empowers farmers with hyper-localized crop recommendations, real-time disease diagnosis, and precision farming advisories to maximize their yield and profitability.

## Crop recommendation model

The recommender is an XGBoost classifier over
`N, P, K, temperature, humidity, ph, rainfall` → one of 22 crops. Its Jharkhand
soil characteristics come from the **Soil Health Card "Soil Nutrient Analysis"**
export (data.gov.in): 429,178 rows covering 12,029 villages across 24 districts,
surveyed in 2023-24 and 2024-25.

### Reading the raw export

That file is in **long format** — one row per
`(year × village × nutrient × nutrient level)`, where `value` is the *number of
soil samples* in that level, not a measurement. A single village legitimately
produces ~29 rows that share state/district/village and differ only in
nutrient/level/value. They look like duplicates but are a histogram; dropping
them would destroy the distribution. There are zero exact duplicate rows. The
pipeline pivots them into one row per village instead.

Because the export reports categories (Low/Medium/High) while the model consumes
continuous N/P/K on a different scale, levels are anchored by *distribution*:
Low → 15th percentile of that feature in the model's own training data, Medium →
50th, High → 85th, then averaged per village weighted by sample counts. pH is a
shared physical scale, so Acidic/Neutral/Alkaline map to real agronomic values.

### Retraining

```bash
cd backend
python scripts/build_soil_profiles.py      # raw export -> 12,014 village soil profiles
python scripts/augment_jharkhand_data.py   # village profiles -> training set
python scripts/train_xgboost.py            # train + evaluate on a held-out 20%
```

Step 1 needs `scripts/data/raw/soil_nutrient_analysis_jharkhand.csv` (gitignored;
re-downloadable from data.gov.in). It writes the village lookup the API serves.

The train/test split is stratified by crop and written to
`scripts/data/crop_recommendation_{train,test}.csv`. Current held-out test
accuracy is **0.977** (metrics land in
`ml_models/crop-recommendation/training_metrics.json`).

### Village soil auto-fill

Rather than asking a farmer for lab numbers, the wizard has district → block →
village dropdowns that pull that village's measured soil from the API:

| Endpoint | Purpose |
| --- | --- |
| `GET /soil/coverage` | districts / blocks / villages available |
| `GET /soil/districts` | list districts |
| `GET /soil/districts/{district}/blocks` | blocks in a district |
| `GET /soil/districts/{district}/blocks/{block}/villages` | villages in a block |
| `GET /soil/village/{village_code}` | measured N/P/K/pH for one village |

The values stay editable — a farmer with their own soil test can override them.
