# PanganFlow.ID

PanganFlow.ID adalah paket riset GEMASTIK Penambangan Data untuk mendeteksi ketimpangan pasokan beras antarprovinsi dan menyusun rekomendasi prioritas aliran redistribusi berbasis harga, produksi, estimasi kebutuhan, dan jarak logistik.

Fokus v1 adalah **beras** agar formulasi surplus-defisit bisa dipertanggungjawabkan. Komoditas lain dapat ditambahkan setelah dataset produksi/konsumsi per komoditas tersedia.

## Struktur

```text
PanganFlow-ID/
  data/raw/                 sumber dan snapshot mentah
  data/processed/           panel provinsi-komoditas dan rekomendasi flow
  reports/tables/           tabel evaluasi, validasi, dan model card
  reports/figures/          grafik untuk laporan dan dashboard
  src/build_dataset.py      pengambilan data dan konstruksi panel
  src/train_panganflow.py   modeling, evaluasi, clustering, dan flow scoring
  src/build_formal_report.py DOCX/PDF technical report
  dashboard/app.py          dashboard Streamlit PanganFlow.ID
```

## Cara Jalan

Direkomendasikan memakai `uv`:

```powershell
cd "D:\Home\Projects\GEMASTIK\DATA MINING - Penambangan Data\PanganFlow-ID"
uv run python src/build_dataset.py
uv run python src/train_panganflow.py
uv run python src/build_formal_report.py
uv run streamlit run dashboard/app.py
```

Jika semua dependensi sudah tersedia di environment aktif, perintah `python src/...` juga bisa dipakai.

## Output Utama

- `data/processed/province_commodity_panel.csv`
- `data/processed/flow_recommendations.csv`
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - PanganFlow.ID.docx`
- `reports/GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - PanganFlow.ID.pdf`

## Catatan Data

Pipeline bersifat official-first:

- PIHPS BI dipakai untuk referensi komoditas/provinsi dan dicoba untuk harga harian.
- Bapanas Satu Data dipakai sebagai fallback stabil untuk harga bulanan tingkat konsumen provinsi.
- BPS dipakai untuk produksi beras dan proxy konsumsi/kebutuhan. Jika unduhan portal tidak stabil, pipeline menyimpan snapshot resmi/manual yang ditandai pada `reports/tables/source_status.csv`.

Sistem ini memberi **prioritas tinjauan kebijakan dan redistribusi**, bukan keputusan final distribusi aktual.

