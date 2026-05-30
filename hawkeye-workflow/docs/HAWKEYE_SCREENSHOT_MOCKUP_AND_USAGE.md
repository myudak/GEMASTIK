# Screenshot Mockup Interface Perangkat Lunak

Bagian ini menampilkan mockup HAWKEYE sebagai alur sederhana dari akses investigator, pembuatan kasus, pengumpulan bukti, pemrosesan OCR, evidence graph, human review, hingga ekspor laporan. Seluruh data pada screenshot merupakan data sintetis untuk kebutuhan demonstrasi.

| No. | Halaman | File Screenshot | Keterangan |
| --- | --- | --- | --- |
| 1 | Halaman Login | `docs/screenshots/01-login-investigator.png` | Halaman login mock untuk investigator terverifikasi dengan indikator role dan akses demo. |
| 2 | Dashboard Investigator | `docs/screenshots/02-dashboard-investigator.png` | Dashboard sederhana untuk memilih kasus, melihat status, skor risiko, dan ringkasan bukti. |
| 3 | Input Seed dan Validasi | `docs/screenshots/03-input-seed-validasi.png` | Form input URL atau domain publik sebagai seed investigasi dan simulasi validasi pipeline. |
| 4 | Monitoring Progres Crawling | `docs/screenshots/04-monitoring-crawling.png` | Halaman monitoring pengumpulan metadata, tautan publik, screenshot, dan hash bukti. |
| 5 | OCR dan Ekstraksi Entitas | `docs/screenshots/05-ocr-ekstraksi-entitas.png` | Halaman OCR yang menampilkan bukti visual sintetis, teks OCR, entitas, confidence, dan status review. |
| 6 | Evidence Graph Interaktif | `docs/screenshots/06-evidence-graph-interaktif.png` | Visualisasi relasi antarbukti menggunakan graph interaktif dengan detail node terpilih. |
| 7 | Panel Detail Entitas | `docs/screenshots/07-detail-entitas.png` | Panel detail entitas untuk melihat risk signals, confidence value, bukti terkait, dan status verifikasi. |
| 8 | Panel Human Review | `docs/screenshots/08-human-review.png` | Panel review untuk memberi keputusan Verified, Need Review, atau Rejected pada artefak investigasi. |
| 9 | Ekspor Laporan PDF | `docs/screenshots/09-ekspor-laporan-pdf.png` | Halaman pratinjau dan ekspor PDF yang hanya memasukkan bukti dan entitas terverifikasi. |
| 10 | Portal Publik | `docs/screenshots/10-portal-publik.png` | Portal publik untuk pengiriman laporan awal dan akses ringkasan agregat tanpa login. |
| 11 | Fitur Link Checker | `docs/screenshots/11-link-checker-publik.png` | Fitur pemeriksaan URL atau domain dengan hasil indikasi risiko terbatas. |

## 9. Dokumentasi Cara Penggunaan Perangkat Lunak

HAWKEYE dirancang agar alur penggunaan mudah dipahami oleh investigator dan tetap aman untuk pengguna publik. Sistem memisahkan akses investigator terverifikasi dari portal publik sehingga detail bukti, relasi graph, dan laporan investigasi tidak ditampilkan kepada masyarakat umum.

### 9.1 Untuk Investigator Terverifikasi

Investigator terverifikasi menggunakan HAWKEYE untuk membuat kasus, mengumpulkan bukti dari sumber publik, meninjau hasil OCR, memeriksa evidence graph, melakukan human review, dan mengekspor laporan.

a. **Masuk ke halaman login investigator**  
Investigator membuka halaman login HAWKEYE dan masuk menggunakan akun terverifikasi. Pada demo, proses login bersifat visual dan menggunakan data sintetis. Setelah menekan tombol **Masuk ke Dashboard**, pengguna diarahkan ke dashboard investigator. Tampilan login ditunjukkan pada Gambar 1.

b. **Memilih atau membuat kasus investigasi**  
Pada dashboard, investigator melihat daftar kasus aktif, status kasus, jumlah bukti, jumlah entitas, dan skor risiko. Investigator dapat memilih tombol **Detail Kasus** untuk membuka ruang kerja kasus yang sudah ada, atau memilih **Buat Kasus Baru** untuk memulai investigasi dari seed baru. Tampilan dashboard ditunjukkan pada Gambar 2.

c. **Memasukkan seed URL atau domain publik**  
Pada halaman input seed, investigator memilih jenis seed berupa URL atau domain, mengisi alamat sumber publik, menambahkan nama kasus, dan memberikan catatan awal. Sistem kemudian menampilkan simulasi progres validasi seperti validasi seed, pengambilan metadata, screenshot publik, OCR, pembentukan graph, dan status siap review. Tampilan input seed ditunjukkan pada Gambar 3.

d. **Memantau proses pengumpulan bukti**  
Setelah seed divalidasi, investigator dapat membuka halaman crawler untuk melihat daftar proses pengumpulan bukti. Proses yang ditampilkan meliputi metadata halaman, tautan publik, screenshot, OCR, indikasi pembayaran tersamarkan, dan penyimpanan hash integritas. Setiap artefak memiliki status review sehingga investigator dapat segera menandai bukti sebagai Verified, Need Review, atau Rejected. Tampilan crawler ditunjukkan pada Gambar 4.

e. **Meninjau OCR dan ekstraksi entitas**  
Pada halaman Screenshot & OCR, investigator melihat gambar bukti sintetis, teks hasil OCR, confidence value, hash SHA-256, waktu pengumpulan, dan entitas yang diekstraksi. Confidence value pada demo dihitung dari kualitas OCR, kecocokan pola, konsistensi bukti berulang, kualitas sumber, dan status review. Tampilan OCR ditunjukkan pada Gambar 5.

f. **Menganalisis evidence graph**  
Pada halaman Evidence Graph, investigator memeriksa hubungan antara domain, bukti visual, tautan publik, referral, mirror domain, alias, dan indikasi pembayaran. Node pada graph dapat dipilih untuk melihat detail risiko dan status review. Investigator tetap harus melakukan verifikasi manual karena graph hanya memberikan sinyal awal. Tampilan evidence graph ditunjukkan pada Gambar 6.

g. **Memeriksa detail entitas**  
Pada panel detail entitas, investigator melihat tipe entitas, confidence value, risk signals, bukti terkait, serta tombol review. Halaman ini membantu investigator memahami alasan suatu entitas diberi prioritas risiko tertentu sebelum masuk ke laporan. Tampilan detail entitas ditunjukkan pada Gambar 7.

h. **Melakukan human review**  
Pada halaman Human Review, investigator meninjau ringkasan artefak yang sudah Verified, masih Need Review, atau Rejected. Keputusan review dapat diberikan pada level bukti, entitas, node graph, dan kasus. HAWKEYE hanya memasukkan bukti dan entitas terverifikasi ke dalam laporan final. Tampilan human review ditunjukkan pada Gambar 8.

i. **Mengekspor laporan PDF**  
Setelah bukti utama diverifikasi, investigator membuka halaman laporan untuk melihat pratinjau isi laporan, ringkasan eksekutif, daftar bukti, ringkasan graph, risk scoring, dan audit trail. Tombol **Export PDF** menghasilkan file PDF dari data sintetis yang sedang ditampilkan. Tampilan ekspor laporan ditunjukkan pada Gambar 9.

j. **Menggunakan portal publik bila diperlukan**  
Investigator juga dapat meninjau alur publik yang digunakan masyarakat untuk mengirim laporan awal dan menggunakan link checker. Portal publik tidak menampilkan detail investigasi, hanya informasi agregat dan hasil indikasi terbatas agar tidak membocorkan informasi sensitif. Tampilan portal publik dan link checker ditunjukkan pada Gambar 10 dan Gambar 11.
