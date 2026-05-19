# 01 - Submission Blueprint

## Core Framing

PanganShock-X is a multiview time-series data mining project for early warning of food price spikes. The project predicts which province-commodity pairs are likely to experience disruptive price increases in the next 7-14 days, then ranks them by intervention priority.

Weak framing:

> Memprediksi harga pangan menggunakan machine learning.

Strong framing:

> Memprediksi risiko lonjakan harga pangan strategis dan menghasilkan ranking prioritas provinsi-komoditas untuk intervensi dini.

That framing is stronger because it connects the model to a decision-making problem: limited monitoring/intervention capacity should be directed to the highest-risk commodities and regions first.

## Recommended Title

**PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**

Alternative:

**PanganShock-X: Sistem Peringatan Dini Lonjakan Harga Pangan Strategis Berbasis Data Mining Multisumber**

## Abstract Direction

This is the intended abstract story:

1. Food price spikes disrupt household purchasing power and policy response.
2. Existing monitoring often observes spikes after they happen.
3. PanganShock-X builds a province-commodity daily panel dataset from food price, calendar, weather, and optional event/news signals.
4. The project models both future price magnitude and spike probability.
5. The final output is a calibrated risk score and ranked alert list.
6. Evaluation uses time-aware backtesting, PR-AUC, Recall@Top-K, regression error, calibration, ablation, and explainability.

## Competition Rubric Strategy

| GEMASTIK Criterion | Submission Strategy |
| --- | --- |
| Keaslian | Emphasize spike-risk ranking, not generic price forecasting. Add risk scoring and intervention-priority output. |
| Kebaruan dataset/metode | Use multiview features: price history, calendar, weather, commodity metadata, optional news/event signals. Compare baseline, boosted trees, calibration, and ensemble. |
| Manfaat | Tie output to market monitoring, food security, inflation response, and household protection. |
| Kejelasan tulisan | Keep the main story simple: "7-14 day early warning for province-commodity spikes." |
| Kelengkapan laporan | Include dataset construction, preprocessing, target definition, baselines, experiments, ablation, error analysis, explainability, and limitations. |

## Novelty Claims

Use careful claims. Do not claim that food price prediction itself is new.

Better novelty claims:

- Converts food-price forecasting into **spike-risk ranking** for intervention.
- Uses dual-task learning: **price magnitude forecasting** plus **spike classification**.
- Uses **time-aware backtesting** and **Recall@Top-K** to match decision-maker needs.
- Combines multiple data views in one panel: historical price, calendar, weather, regional and commodity features, optional news/event signals.
- Produces **calibrated risk scores** and **SHAP explanations** for top alerts.

## Scope Freeze

Recommended scope for a strong first submission:

- Geography: province level.
- Grain: `province x commodity x date`.
- Horizon: 7 days and 14 days.
- Commodities: start with 4-8 strategic commodities.
- Core commodities:
  - beras
  - cabai merah
  - cabai rawit
  - bawang merah
  - telur ayam
  - minyak goreng
  - gula pasir
  - daging ayam

If the dataset is messy, reduce to the cleanest 4 commodities instead of expanding scope.

## Main Research Questions

1. Can short-term food price spikes be predicted 7-14 days ahead at province-commodity level?
2. Which feature groups contribute most to spike prediction?
3. Do boosted tree models with engineered panel features outperform simple time-series baselines?
4. Does calibration improve the usefulness of risk scores?
5. Can predictions be converted into a ranked priority list that is interpretable for intervention planning?

## Expected Contributions

1. A reproducible multiview panel dataset design for Indonesian food price spike detection.
2. A dual-task modeling pipeline for price forecasting and spike classification.
3. A priority-ranking formulation that combines spike probability and expected impact.
4. A time-aware evaluation protocol using rolling-origin backtesting.
5. An explainability layer showing why a province-commodity pair is high risk.

## Final Output

The key deliverable is a ranked alert table:

| Rank | Province | Commodity | Current Price | Forecast Price | Spike Probability | Expected Increase | Priority |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | East Java | Red Chili | 42,000 | 54,300 | 0.78 | +29.3% | Critical |
| 2 | Central Java | Red Chili | 39,500 | 49,100 | 0.73 | +24.3% | Critical |
| 3 | South Sulawesi | Rice | 15,100 | 16,900 | 0.66 | +11.9% | High |

Each alert should also have top explanation factors, for example:

- high 7-day momentum
- elevated 14-day volatility
- approaching national holiday
- rainfall anomaly
- recent regional price gap

## What The Submission Must Avoid

- Do not make the work look like only an app/dashboard.
- Do not use random train-test split.
- Do not report only accuracy.
- Do not make the optional news branch the center of the project before the core price pipeline works.
- Do not overclaim real-world deployment without discussing limitations.

## One-Sentence Pitch

PanganShock-X is a multiview data mining pipeline that predicts 7-14 day food price spike risk and ranks province-commodity intervention priorities using time-aware validation, calibrated probability, and explainable risk scoring.

