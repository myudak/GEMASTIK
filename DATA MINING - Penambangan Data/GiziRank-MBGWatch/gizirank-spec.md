# GiziRank / MBGWatch Specification

## 1. Problem Framing

GiziRank answers one operational data-mining question:

> When MBG monitoring capacity is limited, which kabupaten/kota should be prioritized first for service-quality support?

The output is a district-level ranked queue. It is not a list of unsafe kitchens, not an accusation mechanism, and not an individual student/household model. MBGWatch is the interface for reading, filtering, and explaining the queue.

## 2. Unit of Analysis

The main unit is `kabupaten/kota`. SPPG and school-level records are only used as aggregated supply/exposure signals.

Minimum output schema:

```text
region_code, province, district, year_month,
mbg_beneficiaries, mbg_satpen, sppg_operational_count,
sppg_density_per_100k_beneficiaries, nutrition_need,
poverty_rate, ikp, food_vulnerability, price_stress,
education_exposure, coverage_gap
```

## 3. Public Data Sources

| Source | Role | Access mode |
|---|---|---|
| BGN SPPG Operasional | Supply-side SPPG count and location aggregate | Public HTML pagination scrape |
| Dashboard MBG Kemendikdasmen | MBG satpen, beneficiary, and learner characteristic recap | Public JSON endpoints used by dashboard |
| Bapanas IKP/FSVA | Food-vulnerability structural layer | Public CSV download |
| Bapanas harga pangan | Province food-price stress | Public CSV download |
| BPS poverty table | Socioeconomic stress layer | Public page/API when reachable; manual snapshot supported |
| Dashboard Stunting TP2S | Nutrition context and optional manual stunting table | Public dashboard; optional `data/raw/stunting_kabupaten.csv` |

## 4. Target Definition

Because official incident or expert-priority labels are not public at national district scale, v1 uses a transparent proxy label:

```text
monitoring_priority = top 20% districts by reference_priority_score
```

The reference score combines nutrition need, coverage gap, food vulnerability, socioeconomic stress, and food-price stress. The report must state clearly that this is a prioritization proxy, not a causal claim.

## 5. Modeling

Baselines:

- Random ranking.
- Transparent weighted index.

Main model:

- A lightweight tree-stump boosting ranker implemented with NumPy so the pipeline remains runnable without heavyweight ML dependencies.
- Feature importance is computed from cumulative split gains.

TransferRisk analysis:

- Compare performance and score distributions across Java vs non-Java, eastern vs western Indonesia, and low-data vs high-data districts.

## 6. Metrics

Ranking:

- NDCG@K
- Precision@K
- Recall@K
- Lift over random baseline

Calibration:

- Brier score for the top-priority label.

Reliability:

- Ablation by feature family.
- Bootstrap Top-K stability.
- Subgroup/fairness gap across region groups.

## 7. Deliverables

- Reproducible dataset builder.
- Ranking model and output tables.
- MBGWatch dashboard.
- 8-12 page Indonesian technical report in DOCX and PDF.
- Source-status table documenting which public sources were fetched and which optional/manual sources were unavailable.

