# 03 - Methodology And Experiment Design

## Method Overview

PanganShock-X uses a dual-task data mining pipeline:

1. forecast future price magnitude
2. classify spike risk
3. calibrate probability
4. combine probability and expected impact into a priority ranking

Pipeline:

```text
Raw data
  -> cleaning and panel construction
  -> leakage-safe feature engineering
  -> regression and classification targets
  -> baseline models
  -> boosted tree models
  -> calibration
  -> risk score and ranking
  -> explainability and error analysis
```

## Model Stack

### Baselines

Baselines are mandatory. They make the report credible.

| Model | Task | Purpose |
| --- | --- | --- |
| Persistence | Regression | `price(t+h) = price(t)` |
| Moving Average | Regression | Simple time-series baseline |
| Ridge / Linear Regression | Regression | Interpretable lag-feature baseline |
| Logistic Regression | Classification | Simple spike-risk baseline |
| Random Forest | Classification/Regression | Nonlinear classical baseline |

### Main Models

| Model | Why |
| --- | --- |
| LightGBM | Strong for tabular features, fast iteration, good baseline winner model. |
| XGBoost | Robust boosted-tree comparison. |
| CatBoost | Useful for categorical features such as province and commodity. |

Recommended main model:

```text
LightGBM or CatBoost with engineered lag, rolling, calendar, weather, and metadata features.
```

### Advanced Branches

Only add these after the main pipeline works:

| Branch | When To Add |
| --- | --- |
| Stacked ensemble | If multiple models have complementary strengths. |
| Temporal Fusion Transformer / deep time-series model | If enough clean historical data exists and baseline models are already stable. |
| News/text event branch | If data collection is easy and report time remains. |

## Final Prediction Design

### Regression Head

Predict:

```text
target_return_h7
target_return_h14
target_price_h7
target_price_h14
```

Metrics:

- MAE
- RMSE
- MAPE or sMAPE
- wMAPE

### Classification Head

Predict:

```text
P(spike_h7)
P(spike_h14)
```

Metrics:

- PR-AUC
- ROC-AUC as secondary
- F1
- Recall@Top-K
- Precision@Top-K
- Brier score
- Expected calibration error if implemented

Primary classification metric:

```text
Recall@Top-K alerts
```

Reason: the operational question is whether the top-risk alerts capture real price spikes.

## Priority Score

Version 1:

```text
priority_score = calibrated_spike_probability * expected_percentage_increase
```

Version 2:

```text
priority_score =
  calibrated_spike_probability
  * max(expected_percentage_increase, 0)
  * commodity_weight
```

Optional version:

```text
priority_score =
  0.50 * normalized_probability
  + 0.30 * normalized_expected_increase
  + 0.10 * normalized_recent_volatility
  + 0.10 * vulnerability_weight
```

Keep the formula simple enough to explain.

## Validation Design

Do not use random split.

### Simple Time Split

Use this first:

```text
Train      earliest 70%
Validation next 15%
Test       latest 15%
```

### Rolling-Origin Backtest

Use this for final report:

| Fold | Train Period | Validation/Test Period |
| --- | --- | --- |
| 1 | first 6 months | next 1 month |
| 2 | first 7 months | next 1 month |
| 3 | first 8 months | next 1 month |
| ... | ... | ... |

Report mean and standard deviation across folds.

## Required Experiments

### Experiment 1: Baseline Comparison

Question:

> Does machine learning beat simple time-series baselines?

Table:

| Model | MAE | wMAPE | PR-AUC | Recall@Top-10% | Brier |
| --- | ---: | ---: | ---: | ---: | ---: |
| Persistence | TBD | TBD | - | - | - |
| Moving Average | TBD | TBD | - | - | - |
| Logistic Regression | - | - | TBD | TBD | TBD |
| LightGBM | TBD | TBD | TBD | TBD | TBD |
| CatBoost | TBD | TBD | TBD | TBD | TBD |

### Experiment 2: Horizon Comparison

Question:

> Is 7-day prediction more reliable than 14-day prediction?

Table:

| Horizon | MAE | wMAPE | PR-AUC | Recall@Top-10% |
| --- | ---: | ---: | ---: | ---: |
| 7 days | TBD | TBD | TBD | TBD |
| 14 days | TBD | TBD | TBD | TBD |

### Experiment 3: Spike Threshold Comparison

Question:

> Which spike threshold creates a useful and learnable alert target?

Table:

| Threshold | Positive Rate | PR-AUC | Recall@Top-10% | Precision@Top-10% |
| --- | ---: | ---: | ---: | ---: |
| 5% | TBD | TBD | TBD | TBD |
| 8% | TBD | TBD | TBD | TBD |
| 10% | TBD | TBD | TBD | TBD |

### Experiment 4: Feature Ablation

Question:

> Which data views actually improve performance?

Table:

| Feature Set | PR-AUC | Recall@Top-10% | wMAPE | Notes |
| --- | ---: | ---: | ---: | --- |
| Price only | TBD | TBD | TBD | baseline feature set |
| Price + calendar | TBD | TBD | TBD | demand/holiday effect |
| Price + calendar + weather | TBD | TBD | TBD | supply/weather effect |
| All core features | TBD | TBD | TBD | final core model |
| All + optional news | TBD | TBD | TBD | only if implemented |

### Experiment 5: Calibration

Question:

> Are predicted probabilities reliable enough for risk ranking?

Compare:

- raw model probability
- Platt scaling
- isotonic calibration

Report:

| Calibration | Brier Score | ECE | Recall@Top-10% |
| --- | ---: | ---: | ---: |
| None | TBD | TBD | TBD |
| Platt | TBD | TBD | TBD |
| Isotonic | TBD | TBD | TBD |

### Experiment 6: Error Analysis

Break down performance by:

- commodity
- province
- month/season
- high-volatility vs low-volatility commodities
- holiday vs non-holiday periods

Tables:

| Commodity | PR-AUC | Recall@Top-10% | Spike Rate | Main Error Pattern |
| --- | ---: | ---: | ---: | --- |
| Red chili | TBD | TBD | TBD | volatile, harder |
| Rice | TBD | TBD | TBD | stable, easier |

## Explainability Plan

### Global Explanations

Use:

- SHAP feature importance
- feature group ablation
- permutation importance if SHAP is too slow

Expected important features:

- recent price momentum
- 7/14-day volatility
- province gap to national average
- days to holiday
- rainfall anomaly
- commodity category

### Local Explanations

For top alerts, show:

| Alert | Top Positive Drivers | Top Negative Drivers |
| --- | --- | --- |
| East Java - Red Chili | price momentum, volatility, holiday proximity | normal rainfall |

## Report-Ready Figures

Generate these later:

1. pipeline diagram
2. dataset coverage chart
3. spike positive-rate chart by commodity
4. model comparison bar chart
5. PR curve
6. calibration curve
7. feature importance plot
8. province-commodity heatmap
9. ranked alert table
10. local explanation card

## Success Criteria

Minimum acceptable result:

- boosted model beats baseline on PR-AUC and Recall@Top-K
- model has reasonable calibration or calibrated output improves Brier score
- feature ablation shows at least one non-price feature group adds value
- top alert examples are explainable

Strong result:

- final model beats logistic baseline by clear margin
- Recall@Top-10% is operationally meaningful
- rolling-origin results are stable across folds
- report includes a convincing case study around a real spike period

