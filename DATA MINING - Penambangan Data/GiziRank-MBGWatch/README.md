# GiziRank / MBGWatch

GiziRank is a GEMASTIK Data Mining project for ranking Indonesian districts/cities that should receive MBG monitoring, support, or coverage improvement first. MBGWatch is the dashboard layer for exploring the ranked priority queue.

The project is intentionally framed as service-quality support, not individual student profiling, unsafe-kitchen labeling, or accusation/audit tooling.

## Run

```powershell
python src/build_dataset.py
python src/train_gizirank.py
python src/build_formal_report.py
streamlit run dashboard/app.py
```

The scripts can run with public official sources. If a portal blocks automated access, place manually downloaded files in `data/raw/` and rerun the same commands.

## Main Outputs

- `data/processed/district_panel.csv`
- `reports/tables/ranking_snapshot.csv`
- `reports/tables/metrics_summary.csv`
- `reports/figures/*.png`
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - GiziRank.docx`
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - GiziRank.pdf`

## Official Source Spine

- BGN SPPG Operasional: https://www.bgn.go.id/operasional-sppg
- Dashboard MBG Kemendikdasmen: https://mbg.pdm.kemendikdasmen.go.id/portal
- Dashboard Stunting TP2S: https://dashboard.stunting.go.id/
- Bapanas IKP/FSVA: https://data.badanpangan.go.id/datasetpublications/frq/ikp-kab-kota-2024
- Bapanas harga pangan: https://satudata.badanpangan.go.id/datasetpublications/tq2/harga-pangan-tingkat-konsumen-provinsi
- BPS poverty table: https://www.bps.go.id/id/statistics-table/2/NjIxIzI=/persentase-penduduk-miskin--p0--menurut-kabupaten-kota.html

