# PanganFlow.ID: Spesifikasi Riset GEMASTIK

## Judul

**PanganFlow.ID: Penambangan Pola Surplus-Defisit dan Rekomendasi Redistribusi Beras Antarprovinsi Berbasis Disparitas Harga, Produksi, dan Konsumsi**

## Masalah

Stok pangan nasional dapat terlihat cukup, tetapi harga dan akses pangan antarprovinsi tetap timpang. Pada beras, sebuah provinsi dapat menjadi sentra produksi sementara provinsi lain menghadapi harga tinggi, kenaikan cepat, dan produksi lokal yang tidak cukup untuk kebutuhan penduduknya. PanganFlow.ID memformulasikan masalah ini sebagai data mining spatio-temporal: mendeteksi provinsi berisiko tekanan pasokan dan menyusun prioritas aliran dari provinsi surplus ke provinsi defisit.

## Unit Analisis

- Unit utama: provinsi-bulan-komoditas.
- Komoditas v1: beras medium, dengan pemetaan:
  - PIHPS BI: `Beras Kualitas Medium I` dan `Beras Kualitas Medium II`.
  - Bapanas: `Beras Medium`.
- Rekomendasi: pasangan asal-tujuan provinsi untuk tinjauan redistribusi.

## Dataset

Sumber resmi:

- PIHPS BI: harga pangan antar daerah, tabel harga, referensi provinsi/komoditas.
- Manual PIHPS BI: definisi fungsi harga, peta, tabel, dan ekspor laporan.
- Bapanas Satu Data: rata-rata harga pangan bulanan tingkat konsumen provinsi.
- BPS: produksi padi/beras menurut provinsi dan konsumsi penduduk per provinsi.

Jika portal resmi memblokir scraping otomatis, pipeline menerima snapshot manual di `data/raw/` dan mencatat statusnya di `reports/tables/source_status.csv`.

## Formulasi Fitur

Fitur harga:

- harga provinsi,
- gap terhadap median nasional,
- perubahan harga 1 dan 3 bulan,
- rolling mean, rolling standard deviation, dan z-score.

Fitur neraca:

- kebutuhan beras = populasi x konsumsi per kapita,
- surplus proxy = produksi beras - kebutuhan,
- skor defisit dan skor surplus berbasis normalisasi min-max.

Fitur spasial:

- koordinat centroid provinsi,
- jarak haversine antarprovinsi,
- region group: Jawa, Sumatra, Kalimantan, Sulawesi, Bali-Nusa, Maluku-Papua.

## Metode

1. **Anomaly detection**: rolling z-score dan Isolation Forest untuk tekanan harga.
2. **Surplus-deficit estimation**: proxy produksi dikurangi kebutuhan.
3. **Clustering**: K-Means dan PCA untuk tipologi provinsi.
4. **Priority modeling**: model tree-based untuk mempelajari skor prioritas tujuan.
5. **Graph redistribution scoring**: semua pasangan asal-tujuan diskor berdasarkan price gap, surplus asal, defisit tujuan, dan penalti jarak.
6. **Explainability**: permutation importance dan alasan tekstual per flow.

## Evaluasi

- NDCG@K, Precision@K, Recall@K untuk ranking provinsi tujuan.
- Lift terhadap weighted-index baseline.
- Ablation study per keluarga fitur.
- Stabilitas ranking dengan bootstrap.
- Validasi flow: tidak self-flow, asal surplus, tujuan defisit.
- Analisis kasus 3-5 provinsi/flow.

## Dashboard

MBG-style dashboard diganti menjadi **PanganFlow.ID Watchboard**:

- peta tekanan beras nasional,
- panel surplus-defisit,
- anomaly alert,
- rekomendasi flow berpanah,
- profil provinsi dengan alasan model.

## Batasan

PanganFlow.ID tidak mengklaim arus distribusi aktual, stok gudang real-time, atau biaya logistik detail. Rekomendasi adalah prioritas tinjauan awal untuk membantu analis melihat provinsi yang layak diperiksa lebih dulu.

