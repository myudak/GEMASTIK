# PROPOSAL GEMASTIK XIX
# PENGEMBANGAN PERANGKAT LUNAK

---

# HAWKEYE: Platform Investigasi Digital Berbasis Graf dan AI untuk Deteksi dan Analisis Jaringan Judi *Online* dari Sumber Terbuka

---

Dirancang oleh Tim:
**Ajarin Kami Sepuh**

| Nama | NIM |
|---|---|
| Muchammad Yuda Tri Ananda | 24060124110142 |
| Olivia Oktaviani | 24060124120050 |
| Syifa Aeni Mudrikah | 24060124120027 |

**UNIVERSITAS DIPONEGORO**
**2026**

---

## DAFTAR ISI

- [1. Nama Perangkat Lunak](#1-nama-perangkat-lunak)
- [2. Latar Belakang Ide Perangkat Lunak](#2-latar-belakang-ide-perangkat-lunak)
- [3. Tujuan dan Manfaat Dikembangkannya Perangkat Lunak](#3-tujuan-dan-manfaat-dikembangkannya-perangkat-lunak)
- [4. Batasan Perangkat Lunak yang Dikembangkan](#4-batasan-perangkat-lunak-yang-dikembangkan)
- [5. Metodologi Pengembangan Perangkat Lunak](#5-metodologi-pengembangan-perangkat-lunak)
- [6. Analisis Kebutuhan dan Desain Solusi Perangkat Lunak](#6-analisis-kebutuhan-dan-desain-solusi-perangkat-lunak)
- [7. Implementasi Perangkat Lunak](#7-implementasi-perangkat-lunak)
- [8. *Screenshot Mockup Interface* Perangkat Lunak](#8-screenshot-mockup-interface-perangkat-lunak)
- [9. Dokumentasi Cara Penggunaan Perangkat Lunak](#9-dokumentasi-cara-penggunaan-perangkat-lunak)

---

## DAFTAR GAMBAR

| No. | Judul Gambar |
|---|---|
| Gambar 1 | Diagram Metodologi Pengembangan *Agile Scrum* HAWKEYE |
| Gambar 2 | *Flowchart Pipeline* Investigasi HAWKEYE |
| Gambar 3 | *Flowchart* Pengumpulan Bukti dan *Evidence Collection* HAWKEYE |
| Gambar 4 | Pemrosesan OCR dan Ekstraksi Entitas |
| Gambar 5 | Arsitektur Sistem HAWKEYE |

---

## DAFTAR TABEL

| No. | Judul Tabel |
|---|---|
| Tabel 1 | Rancangan Bobot Sinyal Risiko HAWKEYE |
| Tabel 2 | Kategori Prioritas Risiko HAWKEYE |
| Tabel 3 | Kebutuhan Fungsional HAWKEYE |
| Tabel 4 | Kebutuhan Non-Fungsional HAWKEYE |
| Tabel 5 | Perbandingan HAWKEYE dengan Solusi *Existing* |
| Tabel 6 | Teknologi yang Digunakan |
| Tabel 7 | Data yang Digunakan |
| Tabel 8 | Rencana *Sprint* Pengembangan HAWKEYE |

---

## 1. Nama Perangkat Lunak

Nama perangkat lunak ini adalah **HAWKEYE**, sebuah platform investigasi digital berbasis graf dan AI untuk mendeteksi dan menganalisis jaringan judi *online* dari sumber terbuka. HAWKEYE merepresentasikan kemampuan sistem dalam mengumpulkan bukti digital secara otomatis, memetakan hubungan antardata dalam bentuk *evidence graph*, mengidentifikasi pola *mirror domain*, serta menghitung skor risiko secara terstruktur dan berbasis bukti yang dapat diaudit.

---

## 2. Latar Belakang Ide Perangkat Lunak

Perkembangan teknologi yang pesat memberikan banyak kemudahan bagi masyarakat untuk mengakses informasi dan berbagai layanan berbasis internet. Berdasarkan data dari Asosiasi Penyelenggara Jasa Internet Indonesia (APJII), jumlah pengguna internet di Indonesia pada tahun 2025 mencapai 229 juta jiwa (APJII, 2025). Penggunaan internet yang semakin luas membuat aktivitas digital semakin cepat, mudah, dan efisien. Namun, kemudahan ini juga dimanfaatkan oleh pihak-pihak tertentu untuk kepentingan yang merugikan masyarakat. Salah satunya adalah menjamurnya aktivitas perjudian yang dilakukan secara daring, atau yang umum disebut judi *online* (Sahputra, dkk., 2022).

Kementerian Komunikasi dan Digital (Kemkomdigi) sepanjang 20 Oktober 2024 hingga 15 April 2026 tercatat telah menangani 4.198.606 konten negatif, dengan dominasi konten perjudian sebanyak 3.292.203 kasus (Nugraha, 2026). Judi *online* merupakan permainan menggunakan uang sebagai taruhan dengan jumlah yang telah ditentukan oleh pelaku, dilakukan melalui platform digital berbasis internet (Jadidah, dkk., 2023). Aktivitas ini kini menyebar di berbagai kanal, mulai dari situs web, aplikasi, hingga media sosial dan layanan pesan publik seperti Telegram. Berdasarkan Pasal 303 Kitab Undang-Undang Hukum Pidana (KUHP) dan Pasal 27 ayat (2) serta Pasal 45 ayat (2) Undang-Undang Nomor 19 Tahun 2016 tentang Informasi dan Transaksi Elektronik (UU ITE), seluruh bentuk perjudian, baik konvensional maupun *online*, dikriminalisasi karena dianggap melanggar hukum dan merugikan masyarakat. Pada tahun 2025, Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) mencatat perputaran dana judi *online* sebesar Rp286,84 triliun yang dilakukan sebanyak 422,1 juta kali transaksi (PPATK, 2026).

Semakin meluasnya aktivitas judi *online* menimbulkan berbagai dampak negatif dari aspek ekonomi, sosial, dan keamanan digital. Judi *online* tidak hanya berpotensi memicu tindak kriminal dan kecanduan, tetapi juga mengancam privasi serta data pribadi pengguna (Ihsanudin, dkk., 2023). Di sisi lain, proses investigasi masih menghadapi berbagai tantangan serius. Investigator sering menemukan bukti digital yang tersebar dalam berbagai bentuk seperti tautan afiliasi, nama domain, *screenshot* halaman promosi, serta rekening pembayaran yang berubah-ubah. Proses pengumpulan dan analisis bukti yang dilakukan secara manual menyebabkan investigasi menjadi lebih lambat dan tidak terstruktur, sementara jaringan judi *online* terus berkembang dengan kecepatan yang jauh lebih tinggi melalui teknik *mirror domain* dan distribusi kanal promosi yang masif.

Belum terdapat solusi lokal yang mengintegrasikan seluruh tahap investigasi digital judi *online* dalam satu platform terpadu. *Tool* OSINT (*Open Source Intelligence*) global seperti Maltego dan SpiderFoot bersifat generik, tidak dirancang untuk konteks konten berbahasa Indonesia, tidak mendukung pengenalan pola pembayaran digital lokal seperti QRIS, dompet elektronik, dan rekening bank Indonesia, serta tidak memiliki kanal pelaporan publik. Kondisi ini menciptakan kesenjangan yang signifikan antara kebutuhan investigasi di lapangan dan ketersediaan alat bantu yang sesuai.

Perkembangan *Artificial Intelligence* (AI), pengelolaan data graf, *Optical Character Recognition* (OCR) (Memon dkk., 2020), dan *Open Source Intelligence* (OSINT) (Glassman & Kang, 2012) memberikan peluang nyata untuk membangun sistem investigasi digital yang lebih efektif. Integrasi teknologi-teknologi tersebut dapat digunakan untuk mengekstraksi informasi dari berbagai sumber terbuka, memetakan hubungan antardata, mengidentifikasi pola keterkaitan, serta melakukan analisis risiko secara otomatis dan terdokumentasi.

Berdasarkan kondisi tersebut, HAWKEYE dikembangkan sebagai platform investigasi digital berbasis graf dan AI yang tidak hanya ditujukan bagi investigator terverifikasi, tetapi juga menyediakan portal publik sebagai kanal partisipasi masyarakat dalam pelaporan indikasi judi *online*. Sejauh penelusuran tim, belum terdapat platform investigasi judi *online* berbasis graf yang mengintegrasikan OCR, ekstraksi entitas kontekstual berbahasa Indonesia, *mirror detection*, skor risiko terbobot, dan portal pelaporan publik dalam satu sistem terpadu yang dapat diaudit. Berbeda dengan sistem pelaporan konvensional yang hanya menyimpan daftar URL, HAWKEYE membantu investigator memahami hubungan antarbukti, mendeteksi jaringan *mirror domain*, dan menghitung skor risiko secara terstruktur. Seluruh akses terhadap fitur investigasi dilindungi melalui *role-based access control* dan *audit log* yang tidak dapat dimodifikasi, sehingga setiap proses investigasi tetap dapat dipertanggungjawabkan.

---

## 3. Tujuan dan Manfaat Dikembangkannya Perangkat Lunak

### 3.1 Tujuan

Tujuan utama HAWKEYE adalah mengembangkan platform investigasi digital berbasis graf dan AI yang mengotomasi pengumpulan bukti digital, pemetaan hubungan antarentitas, dan penilaian risiko jaringan judi *online* dari sumber terbuka secara menyeluruh dan terdokumentasi. Secara lebih rinci, tujuan pengembangan HAWKEYE meliputi hal-hal berikut.

1. Membangun modul *evidence collection* otomatis berbasis *crawler* publik, *screenshot*, dan OCR yang dapat mengumpulkan bukti digital dari sumber terbuka secara terstruktur.
2. Membangun *evidence graph* interaktif yang memetakan relasi antardomain, entitas pembayaran, dan kanal promosi secara visual.
3. Mengembangkan sistem skor risiko berbasis *weighted scoring* dan *confidence value* yang dapat diprioritaskan dan diverifikasi oleh investigator.
4. Menyediakan portal pelaporan publik sebagai kanal partisipasi masyarakat dalam pencegahan judi *online*.
5. Menghasilkan laporan PDF terdokumentasi dengan jejak *audit* yang dapat ditinjau dan diverifikasi secara independen.

### 3.2 Manfaat

**Bagi investigator dan analis kepatuhan**, HAWKEYE mempercepat proses investigasi awal melalui otomasi pengumpulan metadata, pemetaan hubungan antarentitas, pengelompokan *mirror domain*, serta penyusunan laporan PDF yang terdokumentasi. Alur kerja yang sebelumnya dilakukan secara manual dan repetitif dapat dialihkan menjadi alur investigasi yang lebih terstruktur, efisien, dan berbasis bukti digital yang terintegrasi.

**Bagi regulator dan lembaga terkait**, HAWKEYE membantu menyediakan basis data kasus yang terorganisasi, jejak *audit* yang jelas, serta visualisasi hubungan antardomain dan entitas pendukung. Hal ini dapat mendukung koordinasi antarlembaga dalam proses verifikasi, penentuan prioritas, dan pengambilan keputusan terhadap jaringan judi *online*.

**Bagi masyarakat umum**, HAWKEYE menyediakan kanal pelaporan tautan mencurigakan dan fitur pemeriksaan risiko tautan yang dapat diakses tanpa perlu mendaftar. Fitur publik dirancang dengan prinsip keamanan informasi sehingga masyarakat dapat berpartisipasi aktif dalam pencegahan penyebaran judi *online* tanpa memperoleh akses terhadap informasi investigasi yang berpotensi disalahgunakan.

---

## 4. Batasan Perangkat Lunak yang Dikembangkan

Perangkat lunak HAWKEYE yang dikembangkan memiliki beberapa batasan sebagai berikut.

1. Perangkat lunak ini hanya memproses data dari sumber terbuka seperti halaman web publik, metadata domain, dan *screenshot* halaman publik, serta tidak mengakses konten privat atau sistem yang memerlukan otorisasi tanpa izin.
2. Perangkat lunak ini hanya berfokus pada deteksi indikasi judi *online* berbasis pola konten, *mirror domain*, relasi promosi, dan kemunculan entitas pembayaran pada materi publik, dan tidak menyatakan status pidana secara final.
3. Perangkat lunak ini tidak melakukan tindakan penegakan seperti pemblokiran konten, pembekuan rekening, atau penghapusan akun. Seluruh *output* merupakan bahan analisis yang perlu diproses sesuai kewenangan lembaga terkait.
4. Perangkat lunak ini hanya dikembangkan untuk platform berbasis web dan belum tersedia dalam bentuk aplikasi *mobile*.
5. Akurasi ekstraksi entitas dan OCR dipengaruhi oleh kualitas *screenshot*, variasi bahasa, teknik manipulasi teks, dan perubahan cepat pada *mirror domain*.
6. Sistem belum mendukung analisis terhadap konten yang dilindungi CAPTCHA atau teknik *anti-bot* tingkat lanjut.
7. Ekstraksi entitas pada tahap pengembangan ini hanya mendukung konten berbahasa Indonesia dan Inggris.
8. *Output* skor risiko dan hasil ekstraksi entitas bersifat indikatif dan tidak dapat digunakan sebagai alat bukti hukum secara langsung tanpa melalui proses verifikasi investigator dan prosedur hukum yang berlaku.

---

## 5. Metodologi Pengembangan Perangkat Lunak

HAWKEYE dikembangkan menggunakan metodologi *Agile Scrum* (Schwaber & Sutherland, 2020). Metodologi ini dipilih karena pola judi *online*, *mirror domain*, bentuk promosi, dan bukti digital dapat berubah dengan cepat sehingga proses pengembangan perlu bersifat adaptif dan iteratif. Dengan pendekatan *Agile Scrum*, tim dapat merespons perubahan kebutuhan secara fleksibel sambil tetap menghasilkan *increment* produk yang terukur pada setiap *sprint*.

Secara umum, metodologi pengembangan HAWKEYE terdiri atas analisis masalah dan kebutuhan, penyusunan *product backlog*, *sprint planning*, *sprint development*, *testing and review*, *prototype increment*, evaluasi, serta perbaikan pada *sprint* berikutnya.

`<image: Gambar 1 — Diagram Metodologi Pengembangan Agile Scrum HAWKEYE>`

Pengembangan HAWKEYE dimulai dari analisis masalah pada proses investigasi judi *online*, terutama pengumpulan bukti yang masih tersebar pada domain, kanal promosi, *screenshot*, metadata publik, dan tautan eksternal. Hasil analisis tersebut kemudian diterjemahkan menjadi kebutuhan sistem dan disusun dalam *product backlog*. *Backlog* berisi daftar fitur yang akan dikembangkan, seperti *evidence collection*, OCR, *entity extraction*, *graph builder*, skor risiko, *human review*, *dashboard*, dan *PDF generator*.

Hasil dari setiap *sprint* berupa *prototype increment*, yaitu peningkatan fungsionalitas perangkat lunak yang sudah dapat ditinjau atau diuji secara terbatas. Setelah dilakukan *testing and review*, hasil evaluasi digunakan untuk memperbaiki *backlog*, menyempurnakan fitur, atau menambahkan kebutuhan baru pada *sprint* berikutnya. Rencana *sprint* pengembangan HAWKEYE ditunjukkan pada Tabel 8.

| Sprint | Durasi | Fokus Pengembangan |
|---|---|---|
| *Sprint* 1 | 2 minggu | Perancangan arsitektur sistem, *setup* lingkungan pengembangan, dan pengembangan modul pengumpulan bukti digital (*crawler*, *screenshot*, validasi *seed*) |
| *Sprint* 2 | 2 minggu | Pengembangan modul OCR, ekstraksi entitas berbasis *regex* dan LLM, serta normalisasi entitas |
| *Sprint* 3 | 2 minggu | Pembangunan *evidence graph*, visualisasi interaktif, dan modul *mirror detection* |
| *Sprint* 4 | 2 minggu | Pengembangan *risk scoring engine*, *human review workflow*, dan *dashboard* investigator |
| *Sprint* 5 | 2 minggu | Pengembangan portal publik, *link checker*, ekspor laporan PDF, RBAC, dan *audit log* |
| *Sprint* 6 | 1 minggu | Pengujian sistem secara menyeluruh, perbaikan, dan penyusunan dokumentasi akhir |

**Tabel 8.** Rencana *Sprint* Pengembangan HAWKEYE

Selain metodologi pengembangan, HAWKEYE memiliki alur kerja investigasi yang dimulai dari *seed* berupa data awal yang dimasukkan pengguna, yaitu URL, domain, atau tautan Telegram publik. Berdasarkan data tersebut, sistem mengumpulkan bukti digital, mengekstraksi entitas penting, membangun *evidence graph*, menghitung skor risiko awal, serta menghasilkan laporan yang harus diverifikasi oleh investigator sebelum digunakan sebagai bahan tindak lanjut.

`<image: Gambar 2 — Flowchart Pipeline Investigasi HAWKEYE>`

HAWKEYE bekerja sebagai sistem pendukung investigasi, bukan sebagai sistem penentu kesalahan secara otomatis. Keputusan akhir tetap berada pada investigator melalui proses *human review* agar risiko *false positive* dapat dikurangi.

### 5.1 Pengumpulan Bukti

Tahap pertama pada *pipeline* HAWKEYE adalah pengumpulan bukti digital dari sumber terbuka. Investigator memasukkan *seed* berupa domain atau URL. *Seed* tersebut divalidasi untuk memastikan bahwa sumber yang diproses merupakan sumber publik dan tidak memerlukan akses ilegal, kredensial pribadi, atau tindakan yang melanggar otorisasi.

`<image: Gambar 3 — Flowchart Pengumpulan Bukti dan Evidence Collection HAWKEYE>`

Proses *evidence collection* dimulai ketika investigator memasukkan *seed* berupa domain atau URL yang diduga berkaitan dengan aktivitas judi *online*. Sistem kemudian melakukan validasi terhadap *seed* untuk memastikan bahwa sumber yang diproses merupakan sumber publik dan tidak memerlukan akses ilegal maupun kredensial pribadi.

Setelah validasi berhasil, sistem membuat *case* investigasi dan memasukkan *seed* ke dalam *job queue* asinkron agar proses *crawling* dapat berjalan di *background* tanpa mengganggu performa *dashboard* investigator. *Worker* mengambil *job* dari *queue* untuk menjalankan *crawler* publik dan modul *screenshot* secara otomatis.

*Crawler* publik bertugas mengambil metadata halaman, judul, teks halaman, tautan keluar, serta struktur HTML yang dapat diakses secara terbuka. Pada saat yang sama, modul *screenshot* menggunakan Playwright untuk menghasilkan tangkapan layar halaman sebagai bukti visual investigasi.

Seluruh bukti digital yang berhasil dikumpulkan kemudian disimpan bersama metadata pendukung seperti *timestamp*, domain, URL, jenis bukti, dan *hash* SHA-256 untuk menjaga integritas data. Setelah proses *crawling* selesai, sistem memperbarui status akhir ke *database* sehingga investigator dapat memantau progres pengumpulan bukti secara *real-time* melalui *monitoring dashboard*. Bukti yang telah terkumpul selanjutnya diteruskan ke tahap OCR dan *entity extraction* untuk proses analisis lebih lanjut.

### 5.2 Pemrosesan OCR dan Ekstraksi Entitas

Setelah bukti digital terkumpul, sistem memproses teks dari dua sumber utama, yaitu teks halaman web dan teks yang terdapat pada gambar. Untuk teks pada gambar, HAWKEYE menggunakan *Optical Character Recognition* (OCR), yaitu teknologi yang mengonversi gambar yang memuat teks menjadi format teks yang dapat dibaca dan diproses oleh mesin (Memon dkk., 2020).

Hasil OCR kemudian digabungkan dengan teks halaman web untuk diproses oleh modul *entity extraction*. Menurut Google Cloud, *entity extraction* adalah proses mengenali dan mengambil informasi tertentu dari teks tidak terstruktur. Modul ini menggunakan kombinasi *regular expression*, *rule-based pattern matching*, dan *LLM-assisted extraction*.

*Regular expression* digunakan untuk mengambil pola yang terstruktur, seperti domain, URL, Telegram, nomor rekening, dompet elektronik, QRIS, dan parameter referral. *Rule-based pattern matching* digunakan untuk mendeteksi kata kunci promosi, pola *deposit*, instruksi pembayaran, serta indikator konten judi *online*. Sementara itu, *LLM-assisted extraction* digunakan secara terbatas untuk membantu menafsirkan konteks yang lebih ambigu, seperti ringkasan halaman, alias promosi, atau hubungan antarbukti yang tidak dapat dikenali hanya dengan pola tetap.

Entitas yang diekstraksi meliputi domain, subdomain, tautan Telegram publik, alias promosi, indikasi pembayaran, kata kunci promosi judi *online*, *referral link*, dan *hash* gambar. Agar hasil ekstraksi lebih konsisten, sistem melakukan normalisasi entitas untuk menyamakan entitas yang sebenarnya sama tetapi ditulis dalam format berbeda, misalnya domain dengan awalan "www", nomor rekening dengan spasi, atau variasi penulisan *username* Telegram. Tahap ini penting untuk mencegah duplikasi data ketika *evidence graph* dibangun.

Hasil ekstraksi dari LLM tidak langsung dianggap sebagai bukti final. Setiap hasil ekstraksi tetap disimpan bersama sumber teks, *screenshot*, *confidence value*, dan status verifikasi.

`<image: Gambar 4 — Pemrosesan OCR dan Ekstraksi Entitas>`

### 5.3 Pembangunan *Evidence Graph*

Setelah entitas berhasil diekstraksi dan dinormalisasi, HAWKEYE membangun *evidence graph*. *Evidence graph* merepresentasikan hubungan antara bukti dan entitas dalam bentuk *node* dan *edge*. *Node* merepresentasikan objek seperti domain, Telegram *handle*, *screenshot*, alias, kata kunci, atau indikasi pembayaran. *Edge* merepresentasikan hubungan antar objek, misalnya "muncul pada", "terhubung ke", "mengarah ke", "memiliki kemiripan", atau "dipromosikan oleh".

Tahap ini membantu investigator memahami pola hubungan yang sulit terlihat apabila data hanya ditampilkan dalam bentuk tabel. Dengan visualisasi graf, investigator dapat menelusuri hubungan tersebut secara lebih cepat, terstruktur, dan sistematis. Modul *mirror detection* digunakan untuk mengelompokkan domain yang diduga merupakan *mirror domain*. Analisis dilakukan berdasarkan kemiripan struktur halaman, teks, pola tautan, *redirect*, serta *fingerprint* visual dari *screenshot* menggunakan pendekatan *perceptual hashing* dan kemiripan struktural HTML. Dengan pendekatan ini, sistem dapat membantu menemukan domain yang tampak berbeda tetapi memiliki pola operasi yang serupa.

### 5.4 Skor Risiko

Skor risiko pada HAWKEYE tidak dimaksudkan sebagai vonis hukum, melainkan sebagai alat bantu prioritisasi investigasi. Sistem memberikan skor risiko awal berdasarkan kumpulan sinyal yang dapat dilacak kembali ke bukti pendukung. Setiap skor harus tetap melalui proses verifikasi manusia sebelum digunakan dalam laporan final.

HAWKEYE menggunakan pendekatan *rule-based weighted scoring*, yaitu perhitungan skor berdasarkan aturan dan bobot sinyal yang ditentukan pada tahap desain sistem. Setiap sinyal memiliki bobot berbeda sesuai tingkat relevansinya terhadap indikasi judi *online*. Selain bobot, sistem juga menghitung *confidence value*, yaitu tingkat keyakinan sistem terhadap hasil ekstraksi. *Confidence value* berada pada rentang 0 sampai 1 dan dipengaruhi oleh kualitas OCR, kecocokan pola, jumlah kemunculan bukti, kualitas sumber data, serta hasil validasi investigator.

Skor risiko dihitung menggunakan rumus berikut:

> **Skor Risiko = Σ (Bobot Sinyal × *Confidence Value*)**

**Keterangan:**
- **Bobot Sinyal** adalah nilai kepentingan setiap indikator risiko.
- ***Confidence Value*** adalah tingkat keyakinan sistem terhadap hasil ekstraksi pada rentang 0 sampai 1.
- **Σ** menunjukkan penjumlahan seluruh kontribusi sinyal risiko yang ditemukan.

Karena total bobot awal dirancang berjumlah 100, skor akhir berada pada rentang 0 sampai 100. Bobot ini dapat disesuaikan berdasarkan hasil pengujian, tetapi setiap perubahan bobot harus terdokumentasi agar proses *scoring* tetap dapat diaudit.

| Sinyal Risiko | Contoh Indikator | Bobot Awal | Keterangan |
|---|---|---|---|
| Konten promosi judi *online* | Kata seperti *slot*, *gacor*, *scatter*, RTP, *deposit*, *bonus*, *maxwin*, dan *jackpot* | 25 | Sinyal awal dari teks halaman atau hasil OCR. |
| *Mirror domain* | Kemiripan konten, struktur, *redirect*, atau visual dengan domain lain | 20 | Menunjukkan kemungkinan replikasi domain atau jaringan yang sama. |
| Kanal promosi publik | Tautan atau *handle* Telegram publik berulang pada beberapa bukti | 15 | Menghubungkan beberapa bukti ke kanal promosi yang sama. |
| Indikasi pembayaran | Rekening, dompet elektronik, QRIS, atau instruksi *deposit* pada konten publik | 20 | Sinyal kuat tetapi wajib diverifikasi manusia. |
| *Affiliate/referral link* | Parameter *referral* atau pola tautan afiliasi | 10 | Menunjukkan pola distribusi atau promosi. |
| Frekuensi kemunculan bukti | Entitas muncul berulang pada banyak bukti atau *timeline* kasus | 10 | Memperkuat prioritas pemeriksaan. |

**Tabel 1.** Rancangan Bobot Sinyal Risiko HAWKEYE

Skor akhir diklasifikasikan ke dalam empat kategori prioritas sebagaimana ditunjukkan pada Tabel 2.

| Rentang Skor | Label Risiko | Makna |
|---|---|---|
| 0–39 | *Low* | Bukti masih lemah atau belum cukup saling terhubung. |
| 40–59 | *Medium* | Terdapat beberapa sinyal yang perlu ditinjau lebih lanjut. |
| 60–79 | *High* | Banyak sinyal relevan dan hubungan antarbukti mulai kuat. |
| 80–100 | *Critical* | Sinyal kuat, berulang, dan memiliki banyak bukti pendukung. |

**Tabel 2.** Kategori Prioritas Risiko HAWKEYE

Untuk mengurangi risiko *false positive*, HAWKEYE menerapkan *human review*. Investigator dapat menerima, menolak, atau memperbaiki hasil ekstraksi dan skor risiko. Status verifikasi dibagi menjadi *Draft*, *Need Review*, *Verified*, dan *Rejected*. Hanya entitas dan bukti yang sudah diverifikasi yang dapat dimasukkan ke dalam laporan final.

### 5.5 Visualisasi Graf dan Ekspor Laporan

Setelah proses *scoring* dan verifikasi, sistem menampilkan hasil analisis dalam *dashboard* dan *evidence graph* interaktif. Investigator dapat memfilter *node* berdasarkan jenis entitas, tingkat risiko, status verifikasi, atau waktu temuan. Panel detail entitas menampilkan ringkasan entitas, daftar bukti terkait, *risk signals*, *confidence value*, dan status verifikasi manusia.

HAWKEYE menyediakan fitur ekspor laporan dalam format PDF. Laporan berisi ringkasan kasus, *timeline* temuan, daftar entitas, visualisasi graf, daftar bukti, skor risiko, status verifikasi, dan metadata bukti. Setiap bukti dilengkapi dengan domain, URL, *timestamp*, *hash* SHA-256, dan catatan verifikasi. Dengan demikian, laporan yang dihasilkan tidak hanya berisi hasil analisis, tetapi juga jejak bukti yang dapat diaudit.

### 5.6 Pengujian dan Evaluasi Sistem

Pengujian HAWKEYE dilakukan untuk memastikan bahwa setiap modul berjalan sesuai kebutuhan. Pengujian fungsional dilakukan pada fitur input *seed*, *crawling* sumber terbuka, *screenshot* otomatis, OCR, ekstraksi entitas, pembangunan graf, skor risiko, *human review*, dan ekspor laporan. Pengujian menggunakan data publik yang aman, data sintetis, atau data yang telah dianonimkan agar proses pengembangan tidak menyebarkan ulang konten berbahaya.

Selain pengujian fungsional, dilakukan evaluasi keamanan informasi yang meliputi *role-based access control*, *audit log*, pembatasan akses terhadap fitur investigator, perlindungan bukti digital, serta validasi bahwa sistem tidak mengambil data dari sumber privat atau sistem yang memerlukan otorisasi.

---

## 6. Analisis Kebutuhan dan Desain Solusi Perangkat Lunak

### 6.1 Kebutuhan Fungsional

| Kode | Kebutuhan Fungsional |
|---|---|
| KF-01 | Sistem dapat menerima input *seed* berupa URL atau domain. |
| KF-02 | Sistem dapat melakukan validasi *seed* untuk memastikan sumber bersifat publik dan tidak memerlukan akses ilegal. |
| KF-03 | Sistem dapat membuat *case* investigasi untuk setiap *seed* atau kelompok *seed*. |
| KF-04 | Sistem dapat mengambil metadata halaman, teks, tautan keluar, struktur HTML, dan *screenshot* dari halaman publik. |
| KF-05 | Sistem dapat melakukan OCR pada *screenshot* untuk mengubah teks gambar menjadi teks digital yang dapat dianalisis. |
| KF-06 | Sistem dapat mengekstraksi entitas seperti domain, subdomain, tautan Telegram publik, indikasi pembayaran, *referral link*, alias promosi, dan kata kunci judi *online*. |
| KF-07 | Sistem dapat membangun *evidence graph* yang menampilkan hubungan antara *seed*, bukti, entitas, dan *mirror domain*. |
| KF-08 | Sistem dapat menghitung skor risiko awal berdasarkan bobot sinyal dan *confidence value*. |
| KF-09 | Sistem menyediakan fitur *human review* agar investigator dapat menerima, memperbaiki, atau menolak hasil ekstraksi dan skor risiko. |
| KF-10 | Sistem dapat menghasilkan laporan PDF berisi ringkasan kasus, *timeline* temuan, daftar bukti, *evidence graph*, skor risiko, dan status verifikasi. |
| KF-11 | Sistem menyediakan portal publik untuk pelaporan tautan atau domain yang diduga judi *online* oleh masyarakat umum tanpa perlu *login*. |
| KF-12 | Sistem menyediakan fitur *link checker* yang dapat diakses publik untuk memeriksa indikasi risiko suatu tautan secara terbatas. |
| KF-13 | Sistem menampilkan ringkasan temuan publik yang sudah diverifikasi sebagai bentuk transparansi informasi digital. |
| KF-14 | Sistem mencatat seluruh aktivitas pengguna terverifikasi dalam *audit log* yang tidak dapat dimodifikasi. |

**Tabel 3.** Kebutuhan Fungsional HAWKEYE

### 6.2 Kebutuhan Non-Fungsional

| Kode | Kategori | Kebutuhan Non-Fungsional |
|---|---|---|
| KNF-01 | Keamanan | Sistem menggunakan *role-based access control* (Sandhu dkk., 1996) agar fitur investigator hanya dapat diakses oleh pengguna terverifikasi. |
| KNF-02 | Auditabilitas | Setiap aktivitas penting, seperti input *seed*, perubahan status bukti, verifikasi, dan ekspor laporan, dicatat dalam *audit log*. |
| KNF-03 | Integritas Bukti | Setiap bukti digital disimpan bersama metadata dan *hash* SHA-256 agar perubahan berkas dapat dideteksi. |
| KNF-04 | Etika Data | Sistem hanya memproses sumber terbuka dan tidak mengakses akun privat, data pribadi tertutup, atau sistem yang memerlukan otorisasi. |
| KNF-05 | Kinerja | Proses *crawling*, *screenshot*, OCR, dan *scoring* dijalankan sebagai *background job* agar tidak mengganggu *dashboard*. |
| KNF-06 | Kemudahan Penggunaan | Antarmuka dibuat dalam bentuk *dashboard* visual agar investigator dapat memahami status *case*, bukti, graf, dan risiko secara cepat. |
| KNF-07 | Keterlacakan | Setiap hasil ekstraksi, relasi graf, dan skor risiko harus dapat ditelusuri kembali ke bukti pendukungnya. |

**Tabel 4.** Kebutuhan Non-Fungsional HAWKEYE

### 6.3 Perbandingan dengan Solusi *Existing*

Berikut adalah perbandingan HAWKEYE dengan solusi investigasi *online* yang sudah ada sebagaimana ditunjukkan pada Tabel 5.

| Fitur | HAWKEYE | Maltego | SpiderFoot | Pelaporan Manual |
|---|---|---|---|---|
| Konteks judi *online* Indonesia | ✅ | ❌ | ❌ | ✅ |
| Deteksi pola pembayaran lokal (QRIS, dompet elektronik) | ✅ | ❌ | ❌ | ✅ |
| OCR dari *screenshot* halaman | ✅ | ❌ | ❌ | ❌ |
| *Evidence graph* otomatis | ✅ | ✅ | ⚠️ | ❌ |
| *Mirror detection* terintegrasi | ✅ | ⚠️ | ⚠️ | ❌ |
| Skor risiko terbobot | ✅ | ⚠️ | ⚠️ | ❌ |
| Portal pelaporan publik | ✅ | ❌ | ❌ | ✅ |
| Laporan PDF dengan *audit trail* | ✅ | ⚠️ | ❌ | ❌ |
| Dukungan bahasa Indonesia | ✅ | ❌ | ❌ | ✅ |
| *Open deployment* tanpa biaya lisensi | ✅ | ❌ | ✅ | ✅ |

**Tabel 5.** Perbandingan HAWKEYE dengan Solusi *Existing*

### 6.4 Arsitektur Sistem

HAWKEYE dirancang dengan arsitektur berlapis yang memisahkan *frontend*, *backend*, *worker*, dan layanan eksternal. Arsitektur ini memungkinkan proses *crawling* dan analisis berjalan secara asinkron di *background* tanpa memengaruhi performa antarmuka pengguna.

`<image: Gambar 5 — Arsitektur Sistem HAWKEYE>`

Komponen utama arsitektur HAWKEYE adalah sebagai berikut.

- **Frontend (Next.js + React + Tailwind CSS):** Menyajikan *dashboard* investigator, *evidence graph* interaktif, panel *human review*, dan portal publik.
- **Backend API (FastAPI):** Menerima permintaan dari *frontend*, melakukan validasi, mengelola *case* dan *seed*, serta mendistribusikan *job* ke *worker*.
- ***Job Queue* (Asinkron):** Mengantrikan pekerjaan *crawling*, *screenshot*, OCR, dan *scoring* agar dapat diproses di *background*.
- ***Worker*:** Menjalankan Playwright untuk *crawling* dan *screenshot*, Tesseract OCR untuk ekstraksi teks, *regex extractor* untuk pola terstruktur, dan OpenRouter API untuk *LLM-assisted extraction*.
- ***Database* (PostgreSQL):** Menyimpan seluruh data sistem meliputi *user*, *case*, *seed*, *evidence*, *entity*, *relation*, *risk signal*, *review log*, dan *audit log*.
- **OpenRouter API (`google/gemini-2.0-flash-lite`):** Digunakan secara terbatas untuk ekstraksi kontekstual, ringkasan kasus, dan narasi laporan.

### 6.5 Teknologi yang Digunakan

| No. | Teknologi | Fungsi |
|---|---|---|
| 1 | Next.js, React, Tailwind CSS | *Frontend dashboard*, portal publik, komponen UI, dan *routing* halaman. |
| 2 | React Flow | Visualisasi *evidence graph* dalam bentuk *node* dan *edge* interaktif. |
| 3 | FastAPI | *Backend* API, validasi *schema*, dan koneksi *database*. |
| 4 | PostgreSQL | Penyimpanan data utama meliputi *user*, *case*, *seed*, *evidence*, *entity*, *relation*, *risk signal*, *review*, dan *audit log*. |
| 5 | Tesseract OCR | Ekstraksi teks dari *screenshot* atau gambar halaman. |
| 6 | Playwright | *Rendering* halaman dan pengambilan *screenshot* secara defensif pada *seed* yang diizinkan. |
| 7 | *Regex rule-based extractor* | Ekstraksi pola terstruktur seperti URL, domain, Telegram *handle*, dompet elektronik/rekening tersamarkan, *referral link*, dan kata kunci promosi. |
| 8 | OpenRouter API (`google/gemini-2.0-flash-lite`) | API LLM untuk ekstraksi entitas kontekstual, ringkasan kasus, dan narasi laporan. |
| 9 | Docker Compose dan Coolify | *Deployment* aplikasi pada VPS, pengelolaan *service*, *environment variable*, domain, SSL, dan *reverse proxy*. |

**Tabel 6.** Teknologi yang Digunakan

### 6.6 Data yang Digunakan

| Jenis Data | Contoh Data | Fungsi |
|---|---|---|
| *Seed* awal | URL atau domain | Titik awal proses investigasi. |
| Data halaman publik | Judul halaman, teks halaman, tautan keluar, struktur HTML, metadata | Bahan awal untuk *crawling*, ekstraksi entitas, dan analisis hubungan. |
| Bukti visual | *Screenshot* halaman publik | Bahan verifikasi visual dan input untuk OCR. |
| Hasil ekstraksi | Domain, subdomain, Telegram publik, kata kunci promosi, *referral link*, indikasi pembayaran, alias promosi | Entitas yang digunakan untuk membangun *evidence graph* dan skor risiko. |
| Data analisis | Relasi antarentitas, *confidence value*, *risk signal*, skor risiko, status *review* | Dasar prioritisasi kasus dan penyusunan laporan. |
| Data laporan | *Timeline* temuan, daftar bukti, *hash* SHA-256, catatan investigator, laporan PDF | Dokumentasi akhir yang dapat ditinjau dan diaudit. |

**Tabel 7.** Data yang Digunakan

---

## 7. Implementasi Perangkat Lunak

### 7.1 Lingkungan Pengembangan

HAWKEYE dikembangkan pada lingkungan berbasis Linux dengan spesifikasi berikut.

- **Bahasa pemrograman:** Python 3.11 (*backend*), TypeScript (*frontend*)
- **Versi *framework* utama:** FastAPI 0.111, Next.js 14, React 18
- ***Deployment*:** Docker Compose untuk orkestrasi layanan lokal dan Coolify untuk pengelolaan *deployment* pada VPS dengan SSL dan *reverse proxy* otomatis
- **Sistem operasi pengembangan:** Ubuntu 22.04 LTS

### 7.2 Implementasi Modul

**Modul *Evidence Collector***

Modul ini dibangun menggunakan Playwright dalam mode *headless* untuk merender halaman secara penuh sebelum mengambil *screenshot* dan mengekstraksi HTML. Setiap *seed* yang dimasukkan investigator divalidasi terlebih dahulu menggunakan pengecekan format URL dan simulasi *request* awal untuk memastikan halaman dapat diakses secara publik. *Job crawling* didistribusikan melalui *queue* asinkron sehingga beberapa *seed* dapat diproses secara paralel.

**Modul OCR**

Tesseract OCR digunakan untuk mengekstraksi teks dari *screenshot* halaman. Sebelum diproses oleh Tesseract, gambar melalui tahap *preprocessing* berupa konversi ke skala abu-abu, peningkatan kontras, dan *binarization* untuk meningkatkan akurasi pembacaan teks pada latar belakang yang kompleks atau gambar promosi bergaya grafis tinggi.

**Modul *Entity Extractor***

Ekstraksi entitas dilakukan dalam tiga lapisan. Lapisan pertama adalah *regex* untuk pola deterministik seperti format rekening bank, nomor dompet elektronik, URL Telegram, dan pola QRIS. Lapisan kedua adalah *rule-based matching* menggunakan kamus kata kunci judi *online* berbahasa Indonesia yang telah dikurasi. Lapisan ketiga adalah *LLM-assisted extraction* melalui OpenRouter API yang digunakan untuk kasus ambigu dengan konteks yang tidak dapat diselesaikan oleh *regex* atau kamus kata kunci. Hasil dari LLM disimpan dengan status *Need Review* dan tidak langsung masuk ke *evidence graph* sebelum diverifikasi investigator.

**Modul *Mirror Detection***

Deteksi *mirror domain* menggunakan dua pendekatan yang digabungkan. Pertama, perbandingan *perceptual hash* dari *screenshot* halaman untuk mendeteksi kemiripan visual. Kedua, penghitungan kemiripan struktural HTML menggunakan rasio perbandingan antara elemen-elemen kunci seperti judul, *meta tag*, dan pola tautan keluar. Domain dengan skor kemiripan di atas ambang batas yang telah ditentukan akan dikelompokkan sebagai kandidat *mirror* dan ditandai untuk diverifikasi investigator.

**Modul *Risk Scoring Engine***

*Engine* skor risiko mengimplementasikan formula *weighted scoring* yang telah dirancang pada tahap desain. Setiap sinyal yang ditemukan dari proses ekstraksi dikalikan dengan *confidence value* masing-masing, kemudian dijumlahkan. *Confidence value* dihitung berdasarkan kombinasi beberapa faktor: nilai kecocokan *regex* (1.0 untuk pola deterministik), skor keyakinan OCR dari Tesseract, dan skor yang diberikan LLM untuk hasil ekstraksi kontekstual. Skor akhir dinormalisasi ke rentang 0–100 dan diklasifikasikan ke dalam empat kategori prioritas.

**Modul *Human Review Workflow***

Setiap entitas dan *risk signal* memiliki status yang mengikuti *state machine* berikut: *Draft* → *Need Review* → *Verified* / *Rejected*. Investigator dapat mengubah status melalui panel *review* di *dashboard*. Setiap perubahan status dicatat secara otomatis ke *audit log* bersama *timestamp* dan identitas investigator. Hanya entitas berstatus *Verified* yang dapat diikutsertakan dalam laporan PDF final.

**Modul *PDF Generator***

Laporan PDF dihasilkan menggunakan *library* WeasyPrint yang merender templat HTML menjadi PDF. Templat laporan mencakup ringkasan kasus, *timeline* temuan, daftar entitas terverifikasi, visualisasi *evidence graph* dalam bentuk gambar statis, daftar bukti beserta metadata lengkap, skor risiko per entitas, status verifikasi, dan catatan investigator. Setiap berkas bukti dilengkapi dengan *hash* SHA-256 untuk memungkinkan verifikasi integritas di luar sistem.

**Portal Publik dan *Link Checker***

Portal publik dapat diakses tanpa autentikasi dan menyediakan dua fitur utama. Pertama, formulir pelaporan tautan atau domain yang memungkinkan masyarakat mengirimkan indikasi judi *online* beserta keterangan singkat. Laporan publik masuk ke antrian khusus yang hanya dapat ditinjau oleh investigator terverifikasi. Kedua, fitur *link checker* yang memungkinkan pengguna memasukkan sebuah URL dan mendapatkan ringkasan indikasi risiko terbatas berdasarkan pencocokan kata kunci dan *database* domain yang telah diverifikasi, tanpa menjalankan proses *crawling* penuh.

**RBAC dan *Audit Log***

*Role-based access control* diimplementasikan pada lapisan *backend* dengan dua peran utama, yaitu *investigator* dan *public*. Seluruh *endpoint* yang bersifat sensitif dilindungi oleh *middleware* autentikasi berbasis JWT. *Audit log* disimpan dalam tabel terpisah di PostgreSQL yang hanya dapat ditulis oleh sistem, tidak dapat diperbarui atau dihapus oleh pengguna manapun.

### 7.3 Hasil Pengujian

Pengujian sistem dilakukan menggunakan data publik yang telah dianonimkan dan data sintetis yang dibuat khusus untuk keperluan pengujian. Pengujian fungsional dilakukan terhadap seluruh 14 kebutuhan fungsional yang telah ditetapkan, dan seluruhnya berhasil diverifikasi sesuai *expected output* yang ditentukan.

Pengujian akurasi OCR pada sampel *screenshot* halaman promosi judi *online* berbahasa Indonesia menunjukkan tingkat akurasi pembacaan karakter sebesar ...% pada kondisi gambar dengan kualitas normal, dan ...% pada kondisi gambar dengan latar belakang kompleks setelah tahap *preprocessing* diterapkan.

Pengujian ekstraksi entitas pada sampel teks halaman publik menghasilkan *precision* sebesar ...% dan *recall* sebesar ...% untuk pola deterministik berbasis *regex*, serta ...% dan ...% untuk ekstraksi berbantuan LLM setelah proses verifikasi *human review*.

---

## 8. *Screenshot Mockup Interface* Perangkat Lunak

### 8.1 Halaman *Login*

`<image: Halaman login HAWKEYE dengan indikator peran investigator>`

### 8.2 *Dashboard* Investigator

`<image: Dashboard investigator menampilkan daftar kasus, status kasus, dan ringkasan skor risiko>`

### 8.3 Input *Seed* dan Validasi

`<image: Formulir input seed dengan proses validasi sumber publik>`

### 8.4 *Monitoring* Progres *Crawling*

`<image: Halaman monitoring status crawling secara real-time>`

### 8.5 *Evidence Graph* Interaktif

`<image: Visualisasi evidence graph interaktif menampilkan node entitas dan edge relasi antarbukti>`

### 8.6 Panel Detail Entitas

`<image: Panel detail entitas menampilkan risk signals, confidence value, daftar bukti terkait, dan status verifikasi>`

### 8.7 Panel *Human Review*

`<image: Panel human review dengan opsi Verified, Need Review, dan Rejected>`

### 8.8 Ekspor Laporan PDF

`<image: Halaman ekspor laporan PDF dengan pratinjau isi laporan>`

### 8.9 Portal Publik

`<image: Tampilan portal publik yang dapat diakses masyarakat tanpa login>`

### 8.10 Fitur *Link Checker*

`<image: Fitur link checker publik dengan tampilan hasil indikasi risiko terbatas>`

---

## 9. Dokumentasi Cara Penggunaan Perangkat Lunak

### 9.1 Untuk Investigator Terverifikasi

**Langkah 1 — *Login* dan Akses *Dashboard***

Investigator mengakses HAWKEYE melalui peramban web dan masuk menggunakan akun yang telah diverifikasi oleh administrator. Setelah berhasil masuk, investigator akan diarahkan ke *dashboard* utama yang menampilkan daftar seluruh kasus investigasi beserta status dan skor risiko masing-masing.

**Langkah 2 — Membuat Kasus Investigasi Baru**

Investigator memilih tombol "Buat Kasus Baru" pada *dashboard*, kemudian mengisi nama kasus, deskripsi singkat, dan tingkat prioritas awal. Sistem akan membuat *case* baru dengan status *Draft* dan mengarahkan investigator ke halaman detail kasus.

**Langkah 3 — Input dan Validasi *Seed***

Pada halaman detail kasus, investigator memasukkan satu atau beberapa *seed* berupa URL atau domain yang diduga berkaitan dengan aktivitas judi *online*. Sistem secara otomatis memvalidasi setiap *seed* untuk memastikan sumber bersifat publik. *Seed* yang berhasil divalidasi akan masuk ke antrian *job* dan proses pengumpulan bukti dimulai secara otomatis di *background*.

**Langkah 4 — Memantau Progres *Evidence Collection***

Investigator dapat memantau progres *crawling* secara *real-time* melalui panel *monitoring* pada halaman detail kasus. Panel ini menampilkan jumlah *seed* yang sedang diproses, jumlah bukti yang berhasil dikumpulkan, status OCR, dan status ekstraksi entitas.

**Langkah 5 — Meninjau Hasil OCR dan Ekstraksi Entitas**

Setelah proses pengumpulan selesai, investigator dapat meninjau seluruh entitas yang berhasil diekstraksi melalui panel entitas. Setiap entitas ditampilkan bersama sumber teks, *screenshot* pendukung, metode ekstraksi, dan *confidence value*.

**Langkah 6 — Navigasi *Evidence Graph***

Investigator mengakses tampilan *evidence graph* interaktif untuk melihat visualisasi hubungan seluruh entitas dalam kasus. *Node* dapat diklik untuk melihat detail entitas, dan *edge* menampilkan jenis relasi antarbukti. Investigator dapat memfilter tampilan berdasarkan jenis entitas, tingkat risiko, atau status verifikasi.

**Langkah 7 — Melakukan *Human Review***

Investigator meninjau setiap entitas dan *risk signal* melalui panel *human review*. Untuk setiap item, investigator dapat memilih status *Verified* jika bukti dianggap valid, *Rejected* jika tidak relevan atau merupakan *false positive*, atau membiarkan status *Need Review* untuk ditinjau kembali. Catatan verifikasi dapat ditambahkan pada setiap item.

**Langkah 8 — Menginterpretasi Skor Risiko**

Setelah proses verifikasi selesai, sistem menghitung ulang skor risiko berdasarkan hanya entitas berstatus *Verified*. Investigator dapat melihat rincian kontribusi setiap sinyal risiko terhadap skor akhir beserta bukti pendukungnya.

**Langkah 9 — Mengekspor Laporan PDF**

Investigator memilih tombol "Ekspor Laporan" pada halaman detail kasus. Sistem menghasilkan laporan PDF yang berisi ringkasan kasus, *timeline* temuan, daftar entitas terverifikasi, visualisasi *evidence graph*, daftar bukti beserta *hash* SHA-256, skor risiko final, dan catatan verifikasi investigator. Laporan tersimpan secara otomatis di *database* dan dapat diunduh kapan saja.

---

### 9.2 Untuk Pengguna Publik

**Langkah 1 — Mengakses Portal Publik**

Pengguna mengakses portal publik HAWKEYE melalui peramban web tanpa perlu membuat akun atau melakukan *login*. Halaman portal menampilkan informasi singkat tentang HAWKEYE, formulir pelaporan, dan fitur *link checker*.

**Langkah 2 — Melaporkan Tautan atau Domain Mencurigakan**

Pengguna mengisi formulir pelaporan dengan memasukkan tautan atau domain yang diduga berkaitan dengan judi *online*, beserta keterangan singkat mengenai alasan pelaporan. Laporan yang dikirimkan akan masuk ke antrian khusus yang hanya dapat ditinjau oleh investigator terverifikasi. Pengguna tidak akan menerima informasi detail hasil investigasi untuk menjaga keamanan informasi.

**Langkah 3 — Menggunakan Fitur *Link Checker***

Pengguna memasukkan sebuah URL atau domain pada kolom *link checker*, kemudian menekan tombol "Periksa". Sistem akan menampilkan hasil indikasi risiko terbatas berdasarkan pencocokan kata kunci dan *database* domain terverifikasi dalam beberapa detik. Hasil yang ditampilkan bersifat indikatif dan bukan merupakan hasil investigasi penuh.

**Langkah 4 — Melihat Ringkasan Temuan Publik**

Pengguna dapat mengakses halaman ringkasan temuan publik yang menampilkan statistik agregat seperti jumlah domain yang telah diverifikasi, jumlah laporan publik yang diterima, dan kategori risiko yang paling umum ditemukan. Informasi yang ditampilkan telah dianonimkan dan tidak mengandung detail investigasi yang berpotensi disalahgunakan.

---

## Daftar Pustaka

APJII. (2025). *Laporan Survei Penetrasi Internet Indonesia 2025*. Asosiasi Penyelenggara Jasa Internet Indonesia.

Glassman, M., & Kang, M. J. (2012). Intelligence in the internet age: The emergence and evolution of Open Source Intelligence (OSINT). *Computers in Human Behavior*, *28*(2), 673–682.

Ihsanudin, M., dkk. (2023). Dampak judi *online* terhadap privasi dan keamanan data pengguna. *Jurnal Teknologi Informasi dan Komunikasi*.

Jadidah, I., dkk. (2023). Definisi dan karakteristik judi *online* di era digital. *Jurnal Hukum dan Masyarakat*.

Memon, J., dkk. (2020). Optical character recognition by open source OCR tool Tesseract: A case study. *PeerJ Computer Science*, *6*, e326.

Nugraha, A. (2026). *Kemkomdigi tangani jutaan konten negatif sepanjang 2024–2026*. Kementerian Komunikasi dan Digital Republik Indonesia.

PPATK. (2026). *Laporan Perputaran Dana Judi Online 2025*. Pusat Pelaporan dan Analisis Transaksi Keuangan.

Sahputra, D., dkk. (2022). Fenomena judi *online* di Indonesia: Analisis dan dampak sosial. *Jurnal Sosial dan Kemasyarakatan*.

Sandhu, R. S., dkk. (1996). Role-based access control models. *Computer*, *29*(2), 38–47.

Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Scrum.org.
