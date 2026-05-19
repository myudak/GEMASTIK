# 06 - Implementation Roadmap

This roadmap turns the submission plan into a practical build sequence. It does not start implementation by itself.

## Team Roles

Assuming a 3-person team:

| Role | Owner Focus |
| --- | --- |
| Data Lead | Data source checks, scraping/export, cleaning, panel construction, data dictionary |
| Modeling Lead | Target definitions, baselines, boosted models, calibration, tuning |
| Report/Analysis Lead | Literature review, experiment tables, figures, explainability, technical report |

Everyone should understand the full pipeline, but clear ownership prevents drift.

## Milestone Plan

### Phase 0: Scope Lock

Goal:

Decide exactly what the first version will cover.

Checklist:

- [ ] final title selected
- [ ] data source priority selected
- [ ] province-level grain confirmed
- [ ] commodity list selected
- [ ] horizons confirmed: 7 and 14 days
- [ ] spike thresholds selected for testing: 5%, 8%, 10%
- [ ] optional news/text branch marked as optional

Exit criteria:

The team can explain the project in one sentence and name the exact unit of analysis.

### Phase 1: Dataset Feasibility

Goal:

Prove that a clean `province x commodity x date` panel can be built.

Checklist:

- [ ] download/export food price data
- [ ] inspect date range and missing values
- [ ] standardize province names
- [ ] standardize commodity names
- [ ] create initial panel table
- [ ] create calendar features
- [ ] test weather merge for at least 3 provinces
- [ ] produce dataset coverage table

Exit criteria:

A sample processed dataset exists and can generate target labels.

### Phase 2: Target And Baseline

Goal:

Create labels and establish minimum baselines.

Checklist:

- [ ] build `target_price_h7`
- [ ] build `target_price_h14`
- [ ] build `spike_h7`
- [ ] build `spike_h14`
- [ ] inspect spike positive rates
- [ ] run persistence baseline
- [ ] run moving average baseline
- [ ] run logistic regression baseline
- [ ] set up time-aware validation

Exit criteria:

There is a baseline result table with no leakage.

### Phase 3: Strong Models

Goal:

Train reliable tabular models and compare them fairly.

Checklist:

- [ ] train LightGBM
- [ ] train XGBoost
- [ ] train CatBoost
- [ ] tune basic hyperparameters
- [ ] compare 7-day and 14-day performance
- [ ] calibrate probabilities
- [ ] select provisional final model

Exit criteria:

At least one model beats baselines on PR-AUC and Recall@Top-K.

### Phase 4: Experiment Pack

Goal:

Generate report-ready evidence.

Checklist:

- [ ] baseline comparison table
- [ ] model comparison table
- [ ] horizon comparison table
- [ ] threshold comparison table
- [ ] feature ablation table
- [ ] calibration table
- [ ] commodity error analysis
- [ ] province error analysis
- [ ] top alert examples

Exit criteria:

The Results and Analysis sections have enough material.

### Phase 5: Explainability And Output

Goal:

Make the model understandable.

Checklist:

- [ ] global SHAP feature importance
- [ ] local explanations for 3-5 top alerts
- [ ] province-commodity heatmap
- [ ] ranked alert table
- [ ] case study around a spike period

Exit criteria:

Judges can see why the model produced its top recommendations.

### Phase 6: Technical Report

Goal:

Turn experiments into a polished GEMASTIK technical report.

Checklist:

- [ ] abstract
- [ ] introduction
- [ ] related work
- [ ] proposed method
- [ ] dataset and preprocessing
- [ ] experiments
- [ ] analysis
- [ ] conclusion
- [ ] references
- [ ] final PDF

Exit criteria:

Report satisfies every required GEMASTIK section and stays within file limits.

## Suggested 14-Day Sprint

| Day | Focus |
| ---: | --- |
| 1 | Lock scope, commodities, data source priority |
| 2 | Acquire food price data |
| 3 | Clean price data and build panel |
| 4 | Calendar features and target labels |
| 5 | Weather merge feasibility |
| 6 | Baseline models |
| 7 | LightGBM/XGBoost/CatBoost first runs |
| 8 | Validation and calibration |
| 9 | Ablation experiments |
| 10 | Error analysis and explainability |
| 11 | Generate figures and ranked alerts |
| 12 | Draft technical report |
| 13 | Polish report, tables, and diagrams |
| 14 | Final review and PDF packaging |

## Risk Register

| Risk | Trigger | Response |
| --- | --- | --- |
| Food price export unavailable | PIHPS/Bapanas cannot be downloaded cleanly | Switch to whichever source has CSV/API/export; reduce scope if needed. |
| Missing data too high | Many provinces/commodities have gaps | Start with cleanest commodities and provinces. |
| Spike class too rare | Positive rate below 2-3% | Lower threshold or use top percentile spike labels. |
| Weather merge too slow | Province/station mapping takes too long | Use province capital coordinate and Open-Meteo fallback. |
| Model improvement small | Boosted model barely beats baseline | Strengthen features, use rolling stats, report honest ablation. |
| Report too software-like | Dashboard dominates narrative | Move dashboard to optional output, emphasize data mining experiments. |

## Decision Gates

### Gate A: Data Feasibility

Continue only if:

- at least 1 year of daily price data exists;
- at least 4 commodities are usable;
- at least most provinces have reasonable coverage.

If not:

- reduce province/commodity scope;
- switch data source;
- consider weekly aggregation.

### Gate B: Label Feasibility

Continue only if:

- spike positive rate is not too rare;
- labels behave sensibly around known volatile periods.

If not:

- lower threshold;
- use percentile-based spike definition;
- focus on most volatile commodities.

### Gate C: Model Feasibility

Continue only if:

- final model beats baseline on at least PR-AUC or Recall@Top-K;
- top alerts are explainable.

If not:

- simplify the claim;
- improve feature engineering;
- use better thresholding/calibration.

## Next `/goal` Options

### Planning To Report Draft

```text
/goal Turn the PanganShock-X submission pack into a polished GEMASTIK technical report draft, using DATA MINING - Penambangan Data/PanganShock-X as the source, with placeholders for experiment results and figures.
```

### Implementation

```text
/goal Implement the PanganShock-X data mining pipeline from DATA MINING - Penambangan Data/PanganShock-X, including data ingestion, feature engineering, baseline models, boosted models, evaluation, explainability, and report-ready outputs.
```

### Dataset Feasibility Only

```text
/goal Verify dataset feasibility for PanganShock-X by finding usable food price, calendar, and weather data sources, then produce a sample province-commodity-date panel design without training models.
```

