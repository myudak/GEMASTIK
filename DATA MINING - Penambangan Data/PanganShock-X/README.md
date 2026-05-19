# PanganShock-X Submission Pack

This folder is the planning package for a full GEMASTIK Data Mining submission. It is intentionally **not** an implementation folder yet. It defines what to build, how to evaluate it, how to write the technical report, and how to present the work cleanly.

## Final Direction

**PanganShock-X** predicts short-term food price spike risk for strategic commodities in Indonesia and converts model outputs into a ranked province-commodity priority list for monitoring and intervention.

Recommended title:

> **PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**

## Why This Is The Main Pick

Compared with the other explored ideas, PanganShock-X has the best balance of:

- clear public benefit
- available public data
- strong but manageable data mining methods
- clean evaluation metrics
- easy-to-write technical report
- good room for novelty through spike-risk ranking, calibration, ablation, and explainability

## Documents

Read these in order:

1. [01-submission-blueprint.md](01-submission-blueprint.md)  
   Competition framing, judging strategy, novelty claims, scope, final deliverables.

2. [02-dataset-and-feature-plan.md](02-dataset-and-feature-plan.md)  
   Data sources, schema, target labels, merge strategy, feature engineering, leakage rules.

3. [03-methodology-and-experiment-design.md](03-methodology-and-experiment-design.md)  
   Model stack, validation design, metrics, ablations, result-table templates.

4. [04-technical-report-draft.md](04-technical-report-draft.md)  
   Indonesian technical report draft structure aligned to GEMASTIK expected sections.

5. [05-dashboard-and-visual-concept.md](05-dashboard-and-visual-concept.md)  
   Optional dashboard/poster/mockup concept for later presentation and report figures.

6. [06-implementation-roadmap.md](06-implementation-roadmap.md)  
   Practical execution checklist, roles, milestones, risks, and next `/goal` prompts.

The earlier concept file is still available at:

- [../panganshock-x-spec.md](../panganshock-x-spec.md)

## Implemented Pipeline

The implemented research pipeline lives in:

- [src/panganshock_pipeline.py](src/panganshock_pipeline.py)
- [requirements.txt](requirements.txt)

It performs:

1. Bapanas monthly provincial food-price data download/cache.
2. Open-Meteo historical weather download/cache by province-capital coordinate.
3. Monthly province-commodity panel construction.
4. Feature engineering for price lags, returns, rolling statistics, calendar windows, weather, province, and commodity.
5. Time-aware train/validation/test split.
6. Baseline and main model experiments.
7. Classification, regression, threshold, horizon, ablation, calibration, feature-importance, and alert-ranking outputs.
8. Figure generation.
9. Markdown and PDF technical-report draft generation.

Current implemented scope:

- Grain: `province x commodity x month`
- Period: 2021-01 to 2025-06
- Provinces: 38
- Strategic commodities used: 12
- Main prediction task: spike of at least 5% within the next 2 months

The original 7-14 day concept remains the ideal if the team obtains daily PIHPS/BI export access. This implementation uses the clean open monthly Bapanas dataset to keep the submission reproducible.

## Key Outputs

- [reports/technical-report-draft.md](reports/technical-report-draft.md)
- [reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - PanganShock-X.pdf](<reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - PanganShock-X.pdf>)
- [reports/final_metrics.json](reports/final_metrics.json)
- [data/processed/panganshock_monthly_panel.csv](data/processed/panganshock_monthly_panel.csv)
- [outputs/tables/latest_alert_ranking.csv](outputs/tables/latest_alert_ranking.csv)
- [outputs/tables/classification_model_results.csv](outputs/tables/classification_model_results.csv)
- [outputs/tables/regression_model_results.csv](outputs/tables/regression_model_results.csv)
- [outputs/figures/](outputs/figures/)

Current main result:

| Metric | Value |
| --- | ---: |
| PR-AUC | 0.515 |
| ROC-AUC | 0.785 |
| Recall@Top-10% | 0.341 |
| Precision@Top-10% | 0.632 |
| Brier score | 0.171 |
| Calibrated Brier score | 0.124 |
| MAE | 3,626 |
| wMAPE | 0.084 |

## Reproduce

From this folder:

```powershell
python -m venv .venv-panganshock
.\.venv-panganshock\Scripts\python.exe -m pip install -r requirements.txt
.\.venv-panganshock\Scripts\python.exe src\panganshock_pipeline.py
```

After rerunning, replace `ID_TIM` and `NAMA_TIM` in the generated PDF filename with the official team data.

## Non-Negotiables

- Use time-aware validation, never random split.
- Report PR-AUC, Recall@Top-K, and calibration for spike alerts.
- Keep the output as a ranked decision-support list, not only a dashboard.
- Start with baselines before advanced models.
- Treat news/text features as optional so the project does not depend on scraping.
- Keep final GEMASTIK writing original and team-verified. These docs are planning scaffolds, not a finished report to submit blindly.
