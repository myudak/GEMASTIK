# PanganShock-X Spec

## Full Submission Pack

A fuller submission planning package has been created in:

- [PanganShock-X/README.md](PanganShock-X/README.md)

Use that folder for the complete GEMASTIK planning flow: submission blueprint, dataset plan, experiment design, technical report draft, dashboard concept, and implementation roadmap.

## One-Line Direction

**PanganShock-X** is a GEMASTIK Data Mining project for predicting short-term food price spike risk and producing a ranked province-commodity intervention priority list.

The core framing is not just "forecast food prices." The stronger competition framing is:

> Which province-commodity pairs are most likely to experience disruptive food price spikes in the next 7-14 days, and which should be prioritized for monitoring or intervention?

## Why This Idea

PanganShock-X is the safest high-score direction because it balances novelty, usefulness, clarity, and execution feasibility.

| Rubric Item | Why PanganShock-X Fits |
| --- | --- |
| Keaslian | Reframes price forecasting into spike-risk ranking and intervention prioritization. |
| Kebaruan dataset/metode | Combines market price, weather, calendar, supply/logistics, macro, and optional news/text signals. |
| Manfaat | Supports food security, inflation control, market monitoring, and household protection. |
| Kejelasan tulisan | Easy to explain: early warning for price spikes. |
| Kelengkapan laporan | Data, preprocessing, baseline, advanced models, evaluation, ablation, and explainability are all straightforward to document. |

## Project Title Options

1. **PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**
2. **PanganShock-X: Sistem Peringatan Dini Lonjakan Harga Pangan Berbasis Data Mining Multisumber**
3. **PanganShock-X: Data Mining untuk Prioritas Intervensi Harga Pangan Strategis di Indonesia**

Recommended title:

> **PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**

## Problem Statement

Harga pangan strategis seperti beras, cabai, telur, dan minyak goreng sering mengalami lonjakan tajam akibat faktor musiman, cuaca, distribusi, permintaan hari besar, dan dinamika pasar. Lonjakan harga yang terlambat terdeteksi dapat menekan daya beli masyarakat dan menyulitkan pengambil kebijakan dalam menentukan wilayah prioritas intervensi.

Penelitian ini mengusulkan pendekatan data mining berbasis panel time-series multiview untuk memprediksi risiko lonjakan harga pangan pada level provinsi-komoditas dalam horizon 7-14 hari ke depan. Output utama penelitian adalah skor risiko terkalibrasi dan daftar prioritas provinsi-komoditas yang dapat digunakan untuk monitoring, inspeksi pasar, operasi pasar, atau penguatan distribusi.

## Main Research Questions

1. Bagaimana memprediksi risiko lonjakan harga pangan strategis pada level provinsi-komoditas dalam horizon 7-14 hari?
2. Fitur apa yang paling berpengaruh terhadap lonjakan harga pangan: harga historis, volatilitas, cuaca, kalender, supply/logistik, atau sinyal berita?
3. Apakah pendekatan multiview dan ensemble dapat mengungguli baseline time-series dan machine learning tunggal?
4. Bagaimana mengubah prediksi model menjadi ranking prioritas intervensi yang jelas dan dapat dijelaskan?

## Target Output

Primary output:

- Ranked alert list of **province-commodity pairs** for the next 7-14 days.

Each row should contain:

- province
- commodity
- current price
- predicted price
- predicted percentage increase
- spike probability
- calibrated risk score
- priority level: critical, high, medium, low
- top explanation factors

Example:

| Rank | Province | Commodity | Spike Probability | Expected Increase | Priority |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | East Java | Red Chili | 0.78 | +28.4% | Critical |
| 2 | Central Java | Red Chili | 0.74 | +23.2% | Critical |
| 3 | West Nusa Tenggara | Rice | 0.69 | +18.1% | High |

## Dataset Plan

### Core Data

| Data View | Possible Source | Usage |
| --- | --- | --- |
| Daily food prices | PIHPS, SP2KP, Bapanas, local market price portals | Main target and historical features |
| Commodity metadata | Bapanas / internal mapping | Commodity grouping and normalization |
| Province / region data | BPS / administrative boundaries | Region identifiers and vulnerability context |
| Weather data | BMKG / open weather APIs | Rainfall, temperature, humidity, extreme events |
| Calendar events | National holidays, Ramadan, Idul Fitri, school holidays | Demand shock and seasonal effects |
| Macro indicators | BI, BPS, fuel price references | Inflation, exchange rate, fuel price context |

### Optional Data

| Data View | Possible Source | Usage |
| --- | --- | --- |
| News articles | public news search / RSS / curated articles | Event, disruption, policy, harvest, import signals |
| Search trends | Google Trends if accessible | Demand and public attention proxy |
| Mobility / transport proxy | public mobility datasets if accessible | Distribution disruption proxy |

### Minimum Viable Dataset

The project can still be strong with only:

1. daily price data
2. province
3. commodity
4. calendar features
5. weather features

Optional news/text features should be treated as a bonus branch, not a dependency.

## Unit of Analysis

Recommended grain:

```text
province x commodity x date
```

This keeps the project manageable and report-friendly. City/market-level data can be used if available, but province-level is safer for completeness.

## Target Definition

The project should have two prediction tasks.

### Task A: Price Forecasting

Predict the future price:

```text
price(t + h)
```

Recommended horizons:

```text
h = 7 days and 14 days
```

Metrics:

- MAE
- RMSE
- MAPE / sMAPE
- wMAPE

### Task B: Spike Classification

Predict whether a price spike will happen in the next horizon.

Example spike label:

```text
spike = 1 if max_price(t+1 ... t+h) >= price(t) * (1 + threshold)
```

Recommended thresholds to test:

- 5%
- 8%
- 10%

Primary classification metrics:

- PR-AUC
- F1
- Recall@Top-K
- Precision@Top-K
- Brier score / calibration error

Recommended main metric:

> **Recall@Top-K province-commodity alerts**, because decision-makers care whether the highest-risk alerts capture real spikes.

## Feature Engineering Plan

### Price Features

- lag price: 1, 3, 7, 14, 21, 28 days
- rolling mean: 7, 14, 28 days
- rolling standard deviation / volatility
- rolling min and max
- price momentum
- price difference and percentage change
- distance from recent minimum / maximum
- commodity-specific z-score

### Calendar Features

- day of week
- month
- week of year
- Ramadan flag
- Idul Fitri proximity
- national holiday proximity
- school holiday flag
- payday / end-of-month proxy if useful

### Weather Features

- rainfall
- temperature
- humidity
- extreme rainfall indicator
- rolling weather statistics
- weather anomaly from recent average

### Region and Commodity Features

- province encoding
- island / region grouping
- commodity category
- historical volatility per province-commodity
- baseline average price per commodity-region

### Optional News/Text Features

If time allows:

- collect article titles/snippets about food prices, harvest, imports, distribution, weather, or policy
- classify or embed articles into event categories
- aggregate daily/province-level signals:
  - supply disruption
  - harvest issue
  - import policy
  - weather shock
  - market panic

Keep this branch lightweight unless the core model is already stable.

## Modeling Plan

### Baselines

These are mandatory because judges need clear comparison.

1. Persistence baseline: future price equals current price.
2. Moving average baseline.
3. Linear / Ridge regression on lag features.
4. Logistic regression for spike classification.

### Strong Classical Models

These should be the main reliable models.

1. LightGBM
2. XGBoost
3. CatBoost
4. Random Forest as an additional baseline if useful

### Advanced Models

Use only after baselines are stable.

1. Temporal Fusion Transformer or another deep time-series model.
2. Stacked ensemble combining regression and classification outputs.
3. Optional text-signal model using IndoBERT / multilingual embeddings.

Recommended final strategy:

```text
Feature pipeline -> LightGBM/CatBoost/XGBoost -> calibration -> risk ranking
```

Then add advanced branches only if they clearly improve the report.

## Risk Score Formula

The final ranking should not depend only on spike probability. It should combine probability, expected impact, and vulnerability.

Draft formula:

```text
risk_score =
  w1 * P(spike)
  + w2 * expected_price_increase
  + w3 * uncertainty
  + w4 * vulnerability_weight
```

Simpler version for early experiments:

```text
risk_score = P(spike) * expected_price_increase
```

Report-friendly version:

```text
priority_score = calibrated_spike_probability
               x expected_percentage_increase
               x commodity_importance_weight
```

## Evaluation Design

Use time-aware validation. Random split is not acceptable for this topic because it leaks future patterns.

Recommended split:

```text
train: earliest 70%
validation: next 15%
test: latest 15%
```

Better final evaluation:

```text
rolling-origin backtesting
```

Example:

1. Train on January-June, validate July.
2. Train on January-July, validate August.
3. Continue rolling forward.

### Required Experiments

1. Baseline comparison.
2. Model comparison.
3. Horizon comparison: 7 days vs 14 days.
4. Spike threshold comparison: 5%, 8%, 10%.
5. Feature ablation:
   - price-only
   - price + calendar
   - price + calendar + weather
   - all features
6. Calibration check.
7. Error analysis by commodity and province.

## Explainability Plan

Use:

- SHAP global feature importance
- SHAP local explanation for selected province-commodity alerts
- reliability diagram for calibration
- error analysis table
- case study of a real/representative spike period

Key explanation questions:

1. Why did the model rank this province-commodity pair as high risk?
2. Which features drove the prediction?
3. Did the model catch the spike early enough?
4. In which commodities or provinces does the model fail most often?

## Technical Report Structure

Follow the GEMASTIK expected report points.

1. **Judul**
   - PanganShock-X title.
2. **Abstrak**
   - Problem, method, dataset, results, impact.
3. **Pendahuluan**
   - Background, objective, benefit, scope.
4. **Kajian Terkait**
   - Food price forecasting, spike detection, time-series data mining, multiview learning.
5. **Solusi Usulan**
   - Dataset, preprocessing, features, model, risk score, evaluation metrics.
6. **Hasil Eksperimen dan Pengujian**
   - Dataset summary, baseline comparison, model results, ablation, calibration, ranking output.
7. **Analisis Hasil**
   - Why the model works, where it fails, feature importance, case studies.
8. **Kesimpulan**
   - Contribution, benefit, limitations, future work.

## Deliverables

### Research Deliverables

- final dataset table or reproducible dataset construction plan
- preprocessing notebook/script
- model training experiments
- evaluation tables
- ablation study
- explainability plots
- final technical report PDF

### Visual Deliverables

- system pipeline diagram
- ranked alert mockup
- feature importance chart
- province-commodity heatmap
- example local explanation card

### Optional Demo Deliverable

A simple dashboard can help presentation later, but it should not distract from the Data Mining report.

Recommended dashboard pages:

1. alert ranking
2. commodity trend view
3. province heatmap
4. model explanation
5. experiment summary

## Suggested Folder Structure Later

Do not create this yet unless implementation starts.

```text
DATA MINING - Penambangan Data/
  panganshock-x-spec.md
  data/
    raw/
    interim/
    processed/
  notebooks/
  src/
    data/
    features/
    models/
    evaluation/
    visualization/
  reports/
    figures/
    technical-report.md
  dashboard/
```

## Execution Roadmap

### Phase 0: Lock the Scope

- Decide final title.
- Pick commodities.
- Pick geographic grain: province recommended.
- Pick horizon: 7 and 14 days.
- Pick spike threshold candidates.

### Phase 1: Dataset Feasibility

- Find and inspect food price data source.
- Check date coverage.
- Check missing values.
- Check province and commodity consistency.
- Decide whether weather/calendar data can be merged cleanly.

Exit criteria:

- A clean panel dataset can be built with `province x commodity x date`.

### Phase 2: Baseline Pipeline

- Build target labels.
- Build lag and rolling features.
- Train persistence, moving average, linear, and logistic baselines.
- Establish first score table.

Exit criteria:

- Baselines run with time-aware validation.

### Phase 3: Strong Models

- Train LightGBM / XGBoost / CatBoost.
- Tune basic parameters.
- Compare regression and classification heads.
- Calibrate spike probabilities.

Exit criteria:

- One strong model beats baselines clearly.

### Phase 4: Evaluation and Ablation

- Run horizon comparison.
- Run threshold comparison.
- Run feature ablation.
- Run commodity/province error analysis.

Exit criteria:

- Results are report-ready and defensible.

### Phase 5: Explainability and Ranking

- Generate SHAP plots.
- Create sample alert ranking.
- Create heatmap and case study.
- Explain top alerts in human-readable terms.

Exit criteria:

- The output looks like decision support, not just model metrics.

### Phase 6: Report and Presentation Assets

- Write technical report.
- Build diagrams and tables.
- Create final mockup/dashboard screenshots if needed.
- Prepare final story for judging.

## Main Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Food price data source is incomplete | High | Start with fewer commodities/provinces; choose the cleanest source. |
| Spike labels are too rare | High | Test thresholds 5%, 8%, 10%; use PR-AUC and Recall@Top-K. |
| Model only learns seasonal patterns | Medium | Add rolling volatility, holiday proximity, and weather features; evaluate by rolling backtest. |
| Report becomes too software-like | Medium | Keep focus on data mining pipeline, experiments, metrics, and analysis. |
| Optional news branch becomes messy | Medium | Treat it as optional; core model must stand without it. |

## What Not To Do

- Do not frame it as only a dashboard.
- Do not use random train-test split.
- Do not only report accuracy.
- Do not start with deep learning before baselines.
- Do not make news scraping a blocker.
- Do not claim policy impact without showing ranking and explainability.

## Success Criteria

The project is strong if it can show:

1. A clean, reproducible dataset.
2. A clear spike definition.
3. Time-aware evaluation.
4. Strong baselines.
5. A model that improves over baselines.
6. A ranked alert output.
7. Explainable top-risk predictions.
8. A complete technical report aligned with GEMASTIK criteria.

## Suggested `/goal` After This Spec

Use this when ready:

```text
/goal Build a complete GEMASTIK Data Mining submission plan for PanganShock-X based on DATA MINING - Penambangan Data/panganshock-x-spec.md, then prepare the dataset plan, experiment plan, technical report draft, and implementation roadmap without starting model implementation until approved.
```

If implementation is approved later, use a second goal:

```text
/goal Implement the PanganShock-X data mining pipeline from DATA MINING - Penambangan Data/panganshock-x-spec.md, including data preparation, feature engineering, baseline models, strong models, evaluation, explainability, and report-ready outputs.
```
