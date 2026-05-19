# JudolFlow-X

JudolFlow-X is a GEMASTIK Data Mining package for ranking public online-gambling promotion clusters in Indonesian digital spaces. The system is framed as a review-priority and public-safety tool, not as an accusation engine.

The demo artifacts intentionally use anonymized, synthetic public-signal-style samples. Real social, complaint, or platform snapshots can be placed in `data/raw/` after manual review. The pipeline masks extracted identifiers before writing processed outputs.

## Public CLI

```powershell
python src/build_dataset.py
python src/train_judolflow.py
python src/build_formal_report.py
streamlit run dashboard/app.py
```

## Main Outputs

- `data/processed/content_features.csv`: cleaned text, weak labels, entity counts, and feature groups.
- `data/processed/entity_graph_edges.csv`: masked sample-entity and entity-entity edges.
- `reports/tables/ranking_snapshot.csv`: Top-K review-priority clusters.
- `reports/tables/metrics_summary.csv`: model, baseline, ranking, and calibration metrics.
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - JudolFlow-X.docx`
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - JudolFlow-X.pdf`
- `dashboard/app.py`: Streamlit demo for the review queue, cluster profile, and feature explanations.

## Data Contract

Optional manual input: `data/raw/content_samples.csv`

Required columns:

```text
sample_id, platform, timestamp, text, source_type, human_label
```

Optional columns:

```text
url, report_channel, reviewer_note, gold_entities
```

Labels should be one of:

```text
benign, suspicious, promotional, unknown
```

The default synthetic corpus exists so the full GEMASTIK workflow can be tested end to end without exposing live illegal domains, handles, phone numbers, or payment aliases.
