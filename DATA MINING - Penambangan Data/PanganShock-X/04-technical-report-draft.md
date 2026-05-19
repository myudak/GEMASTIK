# 04 - Technical Report Draft

This is a working draft scaffold for the GEMASTIK technical report. The final report must be rewritten, verified, and completed by the team with actual experiment results.

## Judul

**PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**

## Abstrak

Lonjakan harga pangan strategis dapat menurunkan daya beli masyarakat dan menyulitkan pengambil kebijakan dalam menentukan wilayah prioritas intervensi. Penelitian ini mengusulkan PanganShock-X, sebuah pendekatan data mining berbasis panel time-series multiview untuk memprediksi risiko lonjakan harga pangan pada level provinsi-komoditas dalam horizon 7 dan 14 hari. Dataset dibangun dari data harga pangan harian, fitur kalender, fitur cuaca, metadata wilayah, dan sinyal peristiwa opsional. Metode yang diusulkan menggabungkan pemodelan regresi untuk memperkirakan perubahan harga dan klasifikasi untuk memprediksi probabilitas lonjakan harga. Evaluasi dilakukan menggunakan validasi berbasis waktu, rolling-origin backtesting, metrik kesalahan regresi, PR-AUC, Recall@Top-K, dan kalibrasi probabilitas. Output akhir berupa daftar prioritas provinsi-komoditas dengan skor risiko terkalibrasi dan penjelasan faktor pendorong utama. Hasil yang diharapkan adalah sistem peringatan dini yang dapat membantu monitoring pasar dan prioritas intervensi harga pangan secara lebih tepat sasaran.

Kata kunci:

```text
data mining, harga pangan, time-series, spike detection, early warning, explainable machine learning
```

## 1. Pendahuluan

### 1.1 Latar Belakang

Harga pangan strategis seperti beras, cabai, bawang merah, telur ayam, minyak goreng, dan gula pasir memiliki pengaruh langsung terhadap daya beli masyarakat. Lonjakan harga dapat disebabkan oleh faktor musiman, cuaca, distribusi, hari besar keagamaan, perubahan pasokan, serta dinamika permintaan pasar. Jika lonjakan baru diketahui setelah terjadi, respons kebijakan seperti operasi pasar, penguatan distribusi, atau monitoring stok dapat terlambat dilakukan.

Sebagian besar pendekatan pemantauan harga pangan masih berfokus pada observasi harga terkini atau prediksi harga secara umum. Padahal dalam konteks pengambilan keputusan, pertanyaan yang lebih penting adalah wilayah dan komoditas mana yang perlu diprioritaskan karena memiliki risiko lonjakan harga paling tinggi dalam waktu dekat.

### 1.2 Rumusan Masalah

1. Bagaimana memprediksi risiko lonjakan harga pangan strategis pada level provinsi-komoditas dalam horizon 7 dan 14 hari?
2. Bagaimana menggabungkan fitur harga historis, kalender, cuaca, dan metadata wilayah dalam satu pipeline data mining?
3. Model apa yang paling efektif untuk menghasilkan probabilitas lonjakan dan prediksi kenaikan harga?
4. Bagaimana mengubah prediksi model menjadi ranking prioritas intervensi yang dapat dijelaskan?

### 1.3 Tujuan

Penelitian ini bertujuan untuk:

1. membangun dataset panel time-series provinsi-komoditas-hari untuk analisis lonjakan harga pangan;
2. merancang target regresi dan klasifikasi untuk prediksi harga serta risiko lonjakan;
3. membandingkan baseline time-series, model machine learning klasik, dan model boosted tree;
4. mengevaluasi model dengan validasi berbasis waktu dan metrik yang sesuai untuk kasus alert ranking;
5. menghasilkan daftar prioritas provinsi-komoditas dengan skor risiko dan penjelasan faktor pendorong.

### 1.4 Manfaat

Manfaat penelitian:

- membantu deteksi dini lonjakan harga pangan;
- mendukung prioritas monitoring pasar;
- membantu alokasi intervensi secara lebih tepat sasaran;
- menyediakan pendekatan data mining yang transparan dan dapat dievaluasi ulang;
- memberikan insight faktor-faktor yang berhubungan dengan lonjakan harga.

### 1.5 Batasan

Batasan awal:

- analisis dilakukan pada level provinsi, bukan pasar individual;
- horizon prediksi difokuskan pada 7 dan 14 hari;
- komoditas difokuskan pada pangan strategis dengan data paling konsisten;
- fitur berita atau teks bersifat opsional;
- penelitian tidak mengklaim menggantikan kebijakan, tetapi memberi dukungan analitik untuk prioritas monitoring.

## 2. Kajian Terkait

Bagian ini perlu membahas:

1. forecasting harga pangan dan komoditas;
2. spike detection pada data time-series;
3. machine learning untuk panel time-series;
4. gradient boosted decision tree untuk data tabular;
5. validasi berbasis waktu dan rolling backtesting;
6. evaluasi pada kasus imbalanced classification;
7. explainable machine learning dengan SHAP.

Draft narasi:

Penelitian harga pangan umumnya menggunakan pendekatan time-series seperti moving average, ARIMA, atau model pembelajaran mesin untuk memprediksi nilai harga di masa depan. Namun, prediksi nilai harga saja belum langsung menjawab kebutuhan pengambil keputusan yang harus menentukan prioritas intervensi. Oleh karena itu, penelitian ini mengombinasikan prediksi nilai harga dan deteksi lonjakan harga sebagai masalah klasifikasi tidak seimbang. Pendekatan ini dievaluasi tidak hanya dengan metrik kesalahan regresi, tetapi juga dengan PR-AUC dan Recall@Top-K yang lebih sesuai untuk skenario peringatan dini.

## 3. Solusi Usulan

### 3.1 Gambaran Umum Sistem

PanganShock-X terdiri dari lima tahap utama:

1. pengumpulan dan standardisasi data;
2. konstruksi panel time-series;
3. feature engineering berbasis harga historis, kalender, cuaca, dan metadata;
4. pelatihan model regresi dan klasifikasi;
5. kalibrasi probabilitas, risk scoring, ranking prioritas, dan explainability.

Diagram yang perlu dibuat:

```text
Data harga + kalender + cuaca + metadata
  -> preprocessing
  -> feature engineering
  -> regression head + classification head
  -> calibration
  -> priority ranking
  -> explanation
```

### 3.2 Dataset

Unit analisis:

```text
provinsi x komoditas x tanggal
```

Sumber data kandidat:

- PIHPS Nasional / Bank Indonesia untuk data harga pangan;
- Portal Data Badan Pangan Nasional untuk data pangan;
- BMKG atau fallback weather API untuk data cuaca;
- BPS untuk metadata wilayah dan konteks statistik;
- kalender hari libur nasional dan periode Ramadan/Idul Fitri.

Tabel yang perlu diisi setelah data dikumpulkan:

| Komponen | Nilai |
| --- | --- |
| Rentang tanggal | TBD |
| Jumlah provinsi | TBD |
| Jumlah komoditas | TBD |
| Jumlah observasi | TBD |
| Persentase missing awal | TBD |
| Persentase missing setelah cleaning | TBD |

### 3.3 Target Prediksi

Regresi:

```text
target_return_h = (price(t+h) - price(t)) / price(t)
```

Klasifikasi:

```text
spike_h = 1 jika max(price(t+1), ..., price(t+h)) >= price(t) * (1 + threshold)
```

Horizon:

- 7 hari
- 14 hari

Threshold yang diuji:

- 5%
- 8%
- 10%

### 3.4 Feature Engineering

Kelompok fitur:

- lag harga;
- rolling mean, min, max, dan volatilitas;
- momentum harga;
- jarak harga provinsi terhadap rata-rata nasional;
- fitur kalender dan hari besar;
- fitur cuaca dan anomali cuaca;
- metadata provinsi dan komoditas;
- fitur berita/peristiwa opsional.

### 3.5 Model

Baseline:

- persistence;
- moving average;
- linear/ridge regression;
- logistic regression.

Model utama:

- LightGBM;
- XGBoost;
- CatBoost.

Model lanjutan opsional:

- stacking ensemble;
- deep time-series model;
- text/event branch.

### 3.6 Risk Scoring

Skor prioritas:

```text
priority_score = calibrated_spike_probability
               x expected_percentage_increase
               x commodity_importance_weight
```

Jika bobot komoditas belum tersedia:

```text
priority_score = calibrated_spike_probability x expected_percentage_increase
```

### 3.7 Explainability

Penjelasan model dilakukan dengan:

- SHAP global feature importance;
- SHAP local explanation untuk alert teratas;
- ablation study berdasarkan kelompok fitur;
- analisis error per komoditas dan provinsi.

## 4. Hasil Eksperimen Dan Pengujian

### 4.1 Setup Eksperimen

Validasi:

- simple time split untuk eksperimen awal;
- rolling-origin backtesting untuk hasil akhir.

Metrik regresi:

- MAE
- RMSE
- wMAPE

Metrik klasifikasi:

- PR-AUC
- F1
- Recall@Top-K
- Precision@Top-K
- Brier Score

### 4.2 Hasil Baseline

| Model | MAE | wMAPE | PR-AUC | Recall@Top-10% |
| --- | ---: | ---: | ---: | ---: |
| Persistence | TBD | TBD | - | - |
| Moving Average | TBD | TBD | - | - |
| Logistic Regression | - | - | TBD | TBD |

### 4.3 Hasil Model Utama

| Model | MAE | wMAPE | PR-AUC | Recall@Top-10% | Brier |
| --- | ---: | ---: | ---: | ---: | ---: |
| LightGBM | TBD | TBD | TBD | TBD | TBD |
| XGBoost | TBD | TBD | TBD | TBD | TBD |
| CatBoost | TBD | TBD | TBD | TBD | TBD |

### 4.4 Ablation Study

| Fitur | PR-AUC | Recall@Top-10% | Catatan |
| --- | ---: | ---: | --- |
| Harga saja | TBD | TBD | baseline feature |
| Harga + kalender | TBD | TBD | efek hari besar |
| Harga + kalender + cuaca | TBD | TBD | efek cuaca |
| Semua fitur | TBD | TBD | model akhir |

### 4.5 Hasil Ranking Prioritas

| Rank | Provinsi | Komoditas | P(spike) | Prediksi Kenaikan | Skor Prioritas | Level |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 1 | TBD | TBD | TBD | TBD | TBD | Critical |

## 5. Analisis Hasil

Isi bagian ini setelah eksperimen:

1. model mana yang paling stabil;
2. apakah horizon 7 hari lebih baik dari 14 hari;
3. threshold spike mana yang paling masuk akal;
4. fitur apa yang paling penting;
5. kapan model gagal;
6. apakah model dapat menangkap lonjakan sebelum terjadi;
7. seberapa berguna ranking prioritas untuk kasus intervensi.

## 6. Kesimpulan

Draft:

Penelitian ini mengusulkan PanganShock-X sebagai pendekatan data mining untuk prediksi risiko lonjakan harga pangan strategis dan penyusunan ranking prioritas provinsi-komoditas. Dengan membangun panel time-series multiview dan mengevaluasi model melalui validasi berbasis waktu, penelitian ini berupaya menghasilkan peringatan dini yang tidak hanya akurat secara prediktif, tetapi juga dapat dijelaskan dan relevan untuk pengambilan keputusan. Pengembangan selanjutnya dapat memperluas cakupan data, menambahkan sinyal berita/peristiwa, dan menguji penerapan pada tingkat pasar atau kabupaten/kota.

## Checklist Kelengkapan GEMASTIK

- [ ] Judul
- [ ] Abstrak
- [ ] Pendahuluan: latar belakang, tujuan, manfaat, batasan
- [ ] Kajian terkait
- [ ] Solusi usulan: dataset, metode, perbedaan dari solusi sebelumnya, metrik evaluasi
- [ ] Hasil eksperimen dan pengujian
- [ ] Analisis hasil eksperimen
- [ ] Kesimpulan
- [ ] Daftar pustaka
- [ ] Lampiran jika diperlukan

