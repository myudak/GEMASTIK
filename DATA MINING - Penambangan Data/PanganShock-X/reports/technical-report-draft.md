# PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining

> **Status:** draft teknis berbasis eksperimen. Tim wajib memeriksa ulang, menyunting, dan mempertanggungjawabkan seluruh analisis sebelum dikumpulkan sebagai technical report final.

## Abstrak

Lonjakan harga pangan strategis dapat mengganggu daya beli masyarakat dan menyulitkan pengambilan keputusan intervensi pasar. Penelitian ini mengusulkan PanganShock-X, pipeline data mining berbasis panel time-series untuk memprediksi risiko lonjakan harga pangan pada level provinsi-komoditas. Implementasi awal menggunakan dataset terbuka Badan Pangan Nasional berupa rata-rata harga pangan bulanan tingkat konsumen provinsi periode 2021-01 sampai 2025-06. Karena dataset terbuka yang konsisten tersedia dalam bentuk bulanan, horizon prediksi diimplementasikan sebagai 1 dan 2 bulan ke depan. Model melakukan dua tugas: regresi perubahan harga dan klasifikasi risiko lonjakan. Evaluasi menggunakan time-based split, PR-AUC, Recall@Top-K, Brier score, MAE, RMSE, dan wMAPE. Pada konfigurasi utama horizon 2 bulan dan threshold lonjakan 5%, model final memperoleh PR-AUC 0.515, Recall@Top-10% 0.341, Brier score 0.171, MAE 3626, dan wMAPE 0.084. Output akhir berupa ranking prioritas provinsi-komoditas yang dilengkapi probabilitas lonjakan, estimasi kenaikan harga, skor prioritas, dan faktor penjelas.

## Pendahuluan

Harga pangan strategis seperti beras, cabai, bawang, telur, daging ayam, gula, dan minyak goreng berpengaruh langsung terhadap kebutuhan rumah tangga. Perubahan harga yang tajam dapat dipicu oleh cuaca, pola musiman, perubahan permintaan saat hari besar, distribusi, dan perbedaan kondisi antarwilayah. Monitoring harga saja belum cukup apabila pengambil kebijakan harus menentukan wilayah dan komoditas mana yang perlu diprioritaskan.

Tujuan penelitian ini adalah membangun pipeline data mining yang mengubah data harga pangan historis dan fitur pendukung menjadi sistem peringatan dini berbasis ranking prioritas. Manfaat yang diharapkan adalah membantu monitoring pasar, prioritas observasi wilayah, serta analisis faktor yang berkaitan dengan lonjakan harga.

Batasan penelitian ini adalah penggunaan data bulanan terbuka, sehingga horizon prediksi yang dihasilkan adalah 1-2 bulan. Pipeline tetap dirancang agar dapat ditingkatkan ke data harian PIHPS apabila akses ekspor/API harian tersedia bagi tim.

## Dataset

Dataset utama berasal dari Portal Data Badan Pangan Nasional: `Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi (Angka Juni 2025)`. Dataset diperkaya dengan fitur kalender dan data cuaca historis Open-Meteo berdasarkan koordinat ibu kota provinsi. Data cuaca digunakan sebagai fallback terbuka dan perlu diganti/diperkuat dengan BMKG bila tim memiliki akses historis resmi yang lebih rinci.

- Baris raw: 29,622
- Baris panel terproses: 21,665
- Rentang waktu: 2021-01 sampai 2025-06
- Jumlah provinsi: 38
- Jumlah komoditas strategis terpakai: 12
- Missing harga raw: 2.03%

## Metode

Unit analisis adalah `provinsi x komoditas x bulan`. Target regresi adalah return harga pada horizon 1 dan 2 bulan. Target klasifikasi didefinisikan sebagai lonjakan apabila harga maksimum pada horizon ke depan naik minimal 5%, 8%, atau 10% dibanding harga bulan observasi. Konfigurasi utama menggunakan threshold 5%.

Fitur yang digunakan meliputi lag harga, return historis, rolling mean, rolling volatility, momentum, gap harga provinsi terhadap rata-rata komoditas nasional, fitur kalender, jendela Ramadan/Idul Fitri, fitur cuaca bulanan, dan encoding provinsi serta komoditas.

Model baseline meliputi persistence, moving average, ridge regression, dan logistic regression. Model utama menggunakan Random Forest dan HistGradientBoosting untuk regresi dan klasifikasi. Probabilitas klasifikasi dikalibrasi menggunakan Platt scaling pada validation set.

## Hasil Eksperimen

### Klasifikasi Risiko Lonjakan

| model                |   pr_auc |   recall_top10 |   precision_top10 |    brier |   cal_pr_auc |   cal_brier |
|:---------------------|---------:|---------------:|------------------:|---------:|-------------:|------------:|
| LogisticRegression   | 0.279387 |       0.115727 |          0.214286 | 0.216242 |     0.279387 |    0.170018 |
| RandomForest         | 0.516994 |       0.323442 |          0.598901 | 0.146169 |     0.516994 |    0.121799 |
| HistGradientBoosting | 0.514622 |       0.341246 |          0.631868 | 0.170512 |     0.514622 |    0.123724 |

### Regresi Perubahan Harga

| model                                |     mae |     rmse |     wmape |
|:-------------------------------------|--------:|---------:|----------:|
| Persistence                          | 3964.9  |  9020.88 | 0.0919427 |
| MovingAverage3                       | 4178.57 |  9318.92 | 0.0968974 |
| Ridge                                | 6664.64 | 12743.9  | 0.154547  |
| RandomForest                         | 4441.94 |  8719.88 | 0.103005  |
| HistGradientBoosting                 | 4609.5  |  8748.6  | 0.10689   |
| HistGradientBoosting Final Train+Val | 3626.19 |  7945.15 | 0.0840883 |

### Ablation Study

| feature_set            |   pr_auc |   roc_auc |       f1 |   recall |   precision |   recall_top10 |   precision_top10 |   recall_top20 |   precision_top20 |    brier |
|:-----------------------|---------:|----------:|---------:|---------:|------------:|---------------:|------------------:|---------------:|------------------:|---------:|
| price_only             | 0.44278  |  0.749343 | 0.438144 | 0.504451 |    0.387244 |       0.278932 |          0.516484 |       0.436202 |          0.403846 | 0.18371  |
| price_calendar         | 0.474472 |  0.777424 | 0.479055 | 0.661721 |    0.375421 |       0.311573 |          0.576923 |       0.498516 |          0.461538 | 0.183489 |
| price_calendar_weather | 0.514622 |  0.784958 | 0.484848 | 0.664688 |    0.381601 |       0.341246 |          0.631868 |       0.501484 |          0.464286 | 0.170512 |
| all                    | 0.514622 |  0.784958 | 0.484848 | 0.664688 |    0.381601 |       0.341246 |          0.631868 |       0.501484 |          0.464286 | 0.170512 |

### Ranking Alert Terbaru

|   rank | date                | province         | commodity              |   price_filled |   spike_probability_calibrated |   predicted_return |   priority_score | priority_level   | top_driver_1                               |
|-------:|:--------------------|:-----------------|:-----------------------|---------------:|-------------------------------:|-------------------:|-----------------:|:-----------------|:-------------------------------------------|
|      1 | 2025-04-01 00:00:00 | Papua Selatan    | Telur Ayam Ras         |          41000 |                       0.611994 |          0.141375  |        0.0865206 | Critical         | Volatilitas harga terbaru tinggi           |
|      2 | 2025-04-01 00:00:00 | Papua Barat      | Telur Ayam Ras         |          38270 |                       0.59765  |          0.120214  |        0.0718458 | Critical         | Harga di atas rata-rata nasional komoditas |
|      3 | 2025-04-01 00:00:00 | Papua Tengah     | Bawang Merah           |          51714 |                       0.59644  |          0.103061  |        0.0614697 | Critical         | Harga di atas rata-rata nasional komoditas |
|      4 | 2025-04-01 00:00:00 | Sumatera Utara   | Bawang Merah           |          40424 |                       0.612938 |          0.0929901 |        0.0569972 | Critical         | Momentum harga 3 bulan meningkat           |
|      5 | 2025-04-01 00:00:00 | Papua Tengah     | Bawang Putih (Bonggol) |          54619 |                       0.565114 |          0.0960168 |        0.0542604 | Critical         | Harga di atas rata-rata nasional komoditas |
|      6 | 2025-04-01 00:00:00 | Papua Tengah     | Telur Ayam Ras         |          37502 |                       0.578121 |          0.090114  |        0.0520967 | Critical         | Volatilitas harga terbaru tinggi           |
|      7 | 2025-04-01 00:00:00 | Papua Selatan    | Daging Ayam Ras        |          41000 |                       0.606202 |          0.0618314 |        0.0374823 | Critical         | Volatilitas harga terbaru tinggi           |
|      8 | 2025-04-01 00:00:00 | Bengkulu         | Daging Ayam Ras        |          32638 |                       0.548454 |          0.0613543 |        0.03365   | Critical         | Periode Ramadan/Idul Fitri                 |
|      9 | 2025-04-01 00:00:00 | Sumatera Barat   | Bawang Merah           |          37294 |                       0.555587 |          0.0564563 |        0.0313664 | Critical         | Momentum harga 3 bulan meningkat           |
|     10 | 2025-04-01 00:00:00 | Kalimantan Barat | Bawang Merah           |          40118 |                       0.619241 |          0.0503989 |        0.031209  | Critical         | Periode Ramadan/Idul Fitri                 |

## Analisis

Hasil eksperimen menunjukkan bahwa tugas deteksi lonjakan harga lebih cocok dievaluasi dengan PR-AUC dan Recall@Top-K daripada akurasi biasa karena kelas positif relatif tidak seimbang. Model gradient boosting dipilih sebagai model final karena mampu menangkap hubungan non-linear dari fitur momentum, volatilitas, kalender, cuaca, dan perbedaan harga antarwilayah. Kalibrasi probabilitas digunakan agar skor risiko lebih layak dijadikan dasar ranking.

Ranking prioritas tidak hanya bergantung pada probabilitas lonjakan, tetapi juga memperhitungkan estimasi kenaikan harga. Dengan demikian, provinsi-komoditas yang diprioritaskan adalah kombinasi dengan risiko dan dampak harga yang relatif tinggi. Analisis feature importance membantu menjelaskan apakah model terutama dipengaruhi oleh pola harga historis, volatilitas, faktor kalender, atau fitur cuaca.

Keterbatasan utama adalah granularitas bulanan. Untuk kebutuhan operasional 7-14 hari, tim perlu memperoleh data harian yang konsisten dari PIHPS/BI atau sumber resmi lain. Selain itu, data cuaca Open-Meteo merupakan fallback terbuka; penggunaan data BMKG historis akan lebih kuat untuk versi final.

## Kesimpulan

PanganShock-X berhasil diimplementasikan sebagai pipeline data mining end-to-end untuk prediksi risiko lonjakan harga pangan strategis pada level provinsi-komoditas. Pipeline mencakup akuisisi data, pembersihan, feature engineering, model baseline, model utama, evaluasi berbasis waktu, kalibrasi, feature importance, dan ranking prioritas. Hasil ini dapat menjadi dasar technical report GEMASTIK, dengan catatan bahwa tim perlu melakukan verifikasi substansi, menyunting narasi akhir, dan menyesuaikan identitas tim sebelum pengumpulan.

## Sumber Data

- Badan Pangan Nasional, Portal Data: https://data.badanpangan.go.id/
- Dataset Bapanas: https://data.badanpangan.go.id/datasetpublications/3xv/rata-rata-harga-pangan-bulanan-konsumen-provinsi
- Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
- PIHPS/Bank Indonesia sebagai kandidat upgrade data harian: https://hargapangan.id/ dan https://www.bi.go.id/hargapangan
