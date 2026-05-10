# JudolGraph Demo Website Context Pack

> Use this document as the main context for an LLM/Codex agent to build the **JudolGraph demo website/web app**. The goal is not to build a production-ready law-enforcement system yet, but a polished, realistic, competition-ready demo that clearly communicates the product idea, workflow, and value.

---

## 1. Product Identity

### Product Name
**JudolGraph**

### One-line Tagline
**AI-powered investigation graph for exposing and documenting online gambling networks.**

### Indonesian Tagline
**Platform investigasi berbasis AI untuk mengubah jejak judi online yang tersebar menjadi bukti terstruktur dan graf hubungan yang dapat ditelusuri.**

### Short Pitch
JudolGraph adalah platform web investigasi digital yang membantu investigator, analis siber, peneliti, atau tim kepatuhan mengumpulkan jejak digital terbuka terkait judi online, mengekstraksi entitas penting, membangun evidence graph, menilai risiko, dan menghasilkan laporan kasus siap ekspor.

JudolGraph tidak bertujuan mempromosikan atau memfasilitasi perjudian. Semua tampilan demo harus memakai data sintetis/fiktif dan diposisikan sebagai alat **investigasi, dokumentasi bukti, dan pencegahan dampak judi online**.

### Core Promise
**Detect → Connect → Document**

1. **Detect**: mengumpulkan seed/domain/tautan/kanal publik dan menemukan jejak terkait.
2. **Connect**: menghubungkan domain, mirror, Telegram, pembayaran, alias, screenshot, dan entitas lain dalam graph.
3. **Document**: menyusun timeline, bukti, risk signals, dan laporan ringkas yang bisa diekspor.

---

## 2. Problem Context

### Problem
Judi online sering menyebar melalui banyak domain, mirror domain, tautan promosi, akun/kanal Telegram, alias operator, konten visual, dan jalur pembayaran. Jejaknya tersebar di banyak tempat sehingga sulit dianalisis secara manual.

Masalah yang ingin diselesaikan:

- Investigator harus membuka banyak domain, screenshot, pesan, dan tautan secara manual.
- Relasi antar-entitas sering tidak terlihat jika hanya disimpan sebagai daftar.
- Konten promosi sering berupa gambar sehingga perlu OCR.
- Mirror domain dan alias operator dapat berubah cepat.
- Bukti perlu disusun rapi agar dapat ditinjau, diverifikasi, dan dilaporkan.
- Tim butuh proses yang cepat, transparan, dan dapat diaudit.

### Product Response
JudolGraph menyediakan demo end-to-end:

1. Input seed kasus.
2. Simulasi crawler dan collector.
3. Ekstraksi entitas dan relasi.
4. Risk scoring.
5. Evidence graph interaktif.
6. Entity detail panel.
7. Screenshot & OCR evidence.
8. Timeline kasus.
9. Report export PDF preview.

---

## 3. Target Users / Personas

### 1. Investigator
Pengguna utama yang membuat kasus, memasukkan seed, melihat graph, memvalidasi temuan, dan mengekspor laporan.

Needs:
- Ringkasan kasus cepat.
- Temuan terbaru.
- Evidence graph.
- Tombol review/validasi.
- Report export.

### 2. Analis Siber
Menganalisis infrastruktur digital, domain, DNS, mirror, dan pola relasi teknis.

Needs:
- Graph detail.
- Metadata domain/IP/ASN.
- Cluster/mirror domain.
- Search dan filter entitas.

### 3. Peneliti / OSINT Analyst
Menganalisis tren dan pola promosi terbuka.

Needs:
- Data publik terstruktur.
- Timeline.
- Evidence table.
- Exportable findings.

### 4. Admin / Supervisor
Mengelola pengguna, status review, dan audit trail.

Needs:
- Role-based access mock.
- Audit log mock.
- Status sistem.

---

## 4. Demo Goal

The demo website must look like a polished SaaS/investigation platform. It should be convincing for a GEMASTIK-style software proposal and product demo.

### What the demo should prove
- JudolGraph can model scattered evidence as connected entities.
- The interface is understandable by non-technical judges.
- The workflow is complete: from input seed to export report.
- AI/crawler/OCR features are represented clearly, even if mocked.
- The project has real social-impact value and implementation direction.

### What the demo does NOT need
- Real crawling of gambling sites.
- Real Telegram API scraping.
- Real banking/payment data access.
- Real law-enforcement integration.
- Actual PDF generation is optional; a fake/export preview is enough unless easy to implement.

---

## 5. Recommended Tech Stack for Demo

Codex can choose another stack, but preferred:

- **Next.js / React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for cards, buttons, tabs, dialogs
- **lucide-react** for icons
- **Recharts** for charts
- **React Flow** or custom SVG/canvas for evidence graph
- Mock data stored in local TypeScript/JSON files
- No backend required for first demo; simulate async crawler states in frontend

### Design Style
- Clean Apple/SaaS-like UI
- White/light gray background
- Blue primary color
- Rounded cards
- Subtle shadows
- Clean typography
- High information density but not cluttered
- Professional, investigative, credible

### Visual Identity
Primary colors:

```css
--primary: #2563eb;
--primary-strong: #1d4ed8;
--primary-soft: #eff6ff;
--success: #16a34a;
--warning: #f59e0b;
--danger: #ef4444;
--purple: #7c3aed;
--muted: #64748b;
--border: #e2e8f0;
--background: #f8fafc;
--card: #ffffff;
```

Logo direction:
- Blue hexagon or rounded square icon
- Connected nodes / graph symbol
- Text: **JudolGraph**

---

## 6. Core Information Architecture

Suggested routes/pages:

```txt
/
  Landing page / product intro

/app/dashboard
  Main dashboard

/app/cases
  Case list

/app/cases/new
  New case input / seed form

/app/evidence-graph
  Interactive evidence graph

/app/entities/:id
  Entity detail panel/page

/app/screenshots
  Screenshot & OCR evidence

/app/reports
  Report export page

/app/mobile-preview
  Optional responsive/mobile showcase page
```

A single-page demo with tab navigation is also acceptable if easier, but it should still feel like a real web app.

---

## 7. Main Demo Flow

### Demo Script

1. User opens JudolGraph landing page.
2. User clicks **Lihat Demo** or **Masuk Dashboard**.
3. Dashboard shows summary:
   - Total Kasus
   - Entitas Ditemukan
   - High Risk
   - Bukti Tersimpan
   - Crawler Aktif
   - Temuan Terbaru
4. User opens an existing case: **Kasus slot-gacor88.xyz**.
5. User opens **Evidence Graph** and sees:
   - Main domain in center
   - Telegram channels
   - Payment trails
   - Operator aliases
   - Mirror domains
   - Screenshots
   - Affiliate links
6. User clicks entity **slot-gacor88.xyz**.
7. Entity detail panel shows:
   - Risk score
   - Summary
   - Related evidence
   - Timeline
   - Human review status
8. User opens **Screenshot & OCR Evidence**:
   - Screenshot grid
   - OCR text result
   - Extracted entities
   - Metadata hash
   - Verification status
9. User opens **Report Export**:
   - Report summary
   - Timeline
   - Evidence table
   - PDF preview
   - Export PDF button
10. Optional: show mobile overview for investigator notifications.

---

## 8. Content Copy for Landing Page

### Hero Section
**Headline:**
AI-Powered Investigation Graph for Exposing Online Gambling Networks

**Subheadline:**
JudolGraph helps investigators transform scattered traces such as domains, Telegram channels, payment trails, aliases, screenshots, and mirror clusters into connected evidence.

**CTA Buttons:**
- Lihat Demo
- Mulai Kasus Baru
- Lihat Evidence Graph

**Trust/Value Chips:**
- Evidence Graph
- Mirror Domain Detection
- Telegram Tracking
- Payment Trail Analysis
- Screenshot & OCR Evidence
- Case Export

### Problem Section
**Title:**
Jejak judi online tersebar, cepat berubah, dan sulit dibuktikan secara manual.

**Body:**
Satu jaringan dapat memakai banyak domain, mirror, kanal promosi, alias operator, konten gambar, dan jalur pembayaran. JudolGraph membantu menyatukan jejak tersebut menjadi peta hubungan yang dapat ditinjau, diverifikasi, dan dilaporkan.

### Solution Section
**Title:**
Detect. Connect. Document.

**Cards:**
1. **Detect**
   AI dan crawler mengumpulkan indikasi dari seed kasus, domain, kanal publik, dan konten visual.
2. **Connect**
   Entitas dan relasi disusun menjadi evidence graph yang mudah ditelusuri.
3. **Document**
   Timeline, bukti, risk signals, dan ringkasan kasus dapat diekspor sebagai laporan.

### Feature Section
Use these cards:

1. **Evidence Graph**
   Visualisasi hubungan antara domain, Telegram, alias, pembayaran, screenshot, dan mirror cluster.
2. **Mirror Domain Detection**
   Mengelompokkan domain serupa untuk melihat pola infrastruktur yang berulang.
3. **Telegram Tracking**
   Melacak kanal atau grup publik yang mempromosikan tautan terkait.
4. **Payment Trail Analysis**
   Menandai rekening/e-wallet yang muncul dalam materi promosi sebagai entitas bukti.
5. **Screenshot & OCR Evidence**
   Mengubah bukti visual menjadi teks dan entitas terstruktur.
6. **Case Export**
   Membuat ringkasan kasus, timeline, dan tabel bukti yang siap ditinjau.

### Closing CTA
**Title:**
Stronger Evidence. Safer Communities.

**Body:**
JudolGraph membantu tim investigasi memahami jaringan judi online dengan lebih cepat, transparan, dan berbasis bukti.

---

## 9. App Shell Layout

### Sidebar Navigation
Use Indonesian labels:

- Dashboard
- Kasus
- Evidence Graph
- Crawler
- Screenshot & OCR
- Entitas
- Laporan
- Pengaturan

### Top Bar
Elements:
- Search input: `Cari domain, alias, Telegram, nomor rekening, atau kata kunci...`
- Keyboard hint: `⌘K`
- Filter button
- Date range dropdown: `7 hari terakhir`
- Primary button: `+ Kasus Baru`
- Notification bell
- User avatar: `AP` or `AD`

### Sidebar Footer
System status:
- `Status Sistem`
- `Semua sistem operasional`
- green dot

User card:
- `Andi Pratama`
- `Penyidik` or `Investigator`
- initials: `AP`

---

## 10. Dashboard Page Spec

### Page Title
**Dashboard**

### Subtitle
Ringkasan aktivitas investigasi dan temuan terbaru.

### Summary Cards
Use these mock values:

```json
{
  "totalCases": 48,
  "totalEntities": 2354,
  "highRisk": 128,
  "storedEvidence": 8732
}
```

Cards:
- Total Kasus: 48, `+16% dari minggu lalu`
- Entitas Ditemukan: 2.354, `+23% dari minggu lalu`
- High Risk: 128, `+24% dari minggu lalu`
- Bukti Tersimpan: 8.732, `+27% dari minggu lalu`

### Status Kasus Widget
Donut chart:
- Dibuka: 18
- Investigasi: 16
- Ditinjau: 8
- Ditutup: 4
- Arsip: 2

### Crawler Aktif Table
Rows:
1. Telegram Channel, Aktif, 78%, 1.254 ditemukan, 2 menit lalu
2. Domain & Website, Aktif, 62%, 842 ditemukan, 3 menit lalu
3. Pembayaran, Aktif, 45%, 258 ditemukan, 5 menit lalu
4. Screenshot & OCR, Menunggu, 0%, 0 ditemukan

### Trend Chart
Title: `Tren Temuan (7 Hari Terakhir)`

Data:
```json
[
  { "date": "12 Mei", "entities": 120 },
  { "date": "13 Mei", "entities": 320 },
  { "date": "14 Mei", "entities": 580 },
  { "date": "15 Mei", "entities": 590 },
  { "date": "16 Mei", "entities": 680 },
  { "date": "17 Mei", "entities": 840 },
  { "date": "18 Mei", "entities": 690 }
]
```

### Temuan Terbaru
Rows:
- `slot-gacor88.xyz` — Domain baru terdeteksi terhubung ke infrastruktur berisiko tinggi — 2 menit lalu
- `promo-tg88` — Grup promosi aktif dengan 12.8K member — 5 menit lalu
- `DANA 0812-xxxx-5678` — Akun e-wallet terhubung dengan 34 transaksi mencurigakan — 12 menit lalu
- `screenshot_18052025_001.png` — Promosi bonus deposit 100% — 18 menit lalu

### Quick Actions
- Kasus Baru
- Ekspor Ringkasan
- Jalankan Crawler
- Tambah Entitas

---

## 11. Evidence Graph Page Spec

### Page Title
**Evidence Graph**

### Subtitle
Telusuri dan analisis hubungan antar entitas dalam jaringan judi online.

### Controls
- Search input: `Cari domain, alias, Telegram, rekening, e-wallet, atau hash...`
- Chips:
  - Semua Tipe
  - Domain
  - Telegram
  - Pembayaran
  - Alias
  - Screenshot
  - Affiliate
  - Mirror Cluster
- Date range
- Filter
- Reset
- Zoom controls

### Graph Summary
- Entitas: 186
- Relasi: 412
- Cluster: 12
- Risiko Tinggi: 27
- Tingkat Keyakinan Rata-rata: 87%

### Graph Nodes

Central node:
```json
{
  "id": "domain-main",
  "label": "slot-gacor88.xyz",
  "type": "Domain",
  "subtitle": "Domain Utama",
  "risk": "Risiko Tinggi"
}
```

Telegram nodes:
- `promo-tg88` — 12.8K anggota
- `situs-resmi-gacor` — 9.4K anggota
- `info-slot-hoki` — 7.1K anggota
- `gacor88channel` — 15.2K anggota

Payment nodes:
- `BCA - 1234 5678 9010` — Andi Setiawan
- `DANA - 0812 3456 7890` — Andi Setiawan
- `OVO - 0821 2345 6789` — Andi Setiawan
- `GoPay - 0896 7654 3210` — Andi Setiawan

Alias nodes:
- `BANG-J88`
- `JOKER88`
- `MASTER88`

Mirror nodes:
- `slot-gacor88.net`
- `slot-gacor88.win`
- `sg88-slot.net`
- `gacor88slot.com`
- `sg88vip.org`
- `slotgacor88.top`

Screenshot nodes:
- `Screenshot #142`
- `Screenshot #143`
- `Screenshot #144`

Affiliate link nodes:
- `aff-gacor88.net`
- `bit.ly/promogacor88`
- `tiny.cc/join88`

Infrastructure/domain related nodes:
- `cdn-gacor88.com`
- `api-gacor88.xyz`
- `assets-gacor88.com`

### Edge Labels
Use labels:
- `promosi`
- `menautkan ke`
- `menerima pembayaran`
- `dikendalikan oleh`
- `mempromosikan`
- `memiliki mirror`
- `bukti visual`
- `infrastruktur terkait`

### Right Detail Panel
When selected entity is `slot-gacor88.xyz`, show:

- Type: Domain
- Status: Aktif
- Pertama ditemukan: 12 Mei 2025 10:21
- Terakhir dilihat: 18 Mei 2025 09:14
- ASN: AS13335 Cloudflare, Inc.
- Lokasi Server: Singapura
- Tingkat keyakinan: 92%
- Skor Risiko Keseluruhan: 85/100 or 92/100
- Keterkaitan:
  - Telegram Channel: 4
  - Pembayaran: 4
  - Alias Operator: 3
  - Affiliate Link: 3
  - Screenshot: 3
  - Mirror Domain: 8
  - Domain Terkait: 3

Actions:
- Lihat Timeline
- Export Subgraph
- Tambah ke Kasus

---

## 12. Entity Detail Page Spec

### Page Title
**Entity Detail Panel**

### Entity
`slot-gacor88.xyz`

### Header
- Entity icon: globe
- Name: slot-gacor88.xyz
- Tipe: Domain
- Kategori: High Risk
- Skor Risiko: 92/100
- Status: Aktif

Buttons:
- Tandai Risiko
- Ubah Status
- Buka di Graph

### Ringkasan Domain
Text:
Domain ini terdeteksi sebagai situs perjudian online dengan pola promosi agresif melalui jaringan Telegram dan penggunaan beberapa mirror domain. Terdapat aktivitas transaksi mencurigakan yang terkait dengan deposit game.

### Metadata
- Waktu Pertama Ditemukan: 12 Mei 2025 10:21
- Terakhir Dilihat: 18 Mei 2025 09:14
- Lokasi Server: Singapura
- ASN: AS13335 Cloudflare, Inc.
- Status Review: Human-reviewed
- Reviewer: Andi Pratama
- Waktu Review: 18 Mei 2025 09:10

### Cards
Risk Signals:
- Promosi agresif
- Pembayaran anonim
- Deteksi deposit
- Banyak mirror domain
- Konten judi online terdeteksi
- Reputasi berisiko

Connected Evidence counts:
- 23 Mirror
- 5 Telegram
- 142 Screenshot
- 8 Pembayaran

Aliases:
- slot88-gacor.com
- s88win.xyz
- gacor88slot.net
- s88bet.co

Related Telegram:
- promo-tg88, 12.8K anggota
- slotgacor88_official, 15.3K anggota
- gacor88_promo, 9.1K anggota

Mirror Domain:
- slot-gacor88.net
- slotgacor88.online
- slot88gacor.info
- sg88play.com
- slot88win.top

### Timeline
- 18 Mei 09:14 — Screenshot baru ditemukan
- 18 Mei 08:02 — Promo Telegram terdeteksi
- 17 Mei 21:33 — Mirror domain aktif
- 17 Mei 19:11 — Transaksi deposit terdeteksi
- 12 Mei 10:21 — Pertama kali ditemukan oleh crawler

### Evidence Cards
- Screenshot: `sc_slot-gacor88_180525.png`
- Telegram Post: `tg_promo-tg88_180525.jpg`
- Mirror Domain: `mirror_slot-gacor88.net.png`
- Pembayaran: `pay_qris_180525.jpg`

---

## 13. Screenshot & OCR Evidence Page Spec

### Page Title
**Screenshot & OCR Evidence**

### Subtitle
Kelola bukti visual dan ekstraksi teks dari konten perjudian online.

### Tabs
- Semua Bukti
- Perlu Verifikasi
- Terverifikasi

### Grid Items
Use generic/fake promotional screenshots. Do not use real brand names or real gambling operator names.

Items:
1. `promo_100_bonus.jpg`
   - OCR Selesai
   - Skor OCR: 96%
   - text: BONUS NEW MEMBER, 100%, SLOT - CASINO - SPORTSBOOK
2. `event_scatter.jpg`
   - OCR Selesai
   - Skor OCR: 93%
3. `deposit_cepat.png`
   - OCR Selesai
   - Skor OCR: 95%
4. `promo_cashback10.jpg`
   - OCR Selesai
   - Skor OCR: 94%
5. `free_spin_50x.jpg`
   - OCR Selesai
   - Skor OCR: 92%
6. `cs_telegram_24jam.png`
   - OCR Selesai
   - Skor OCR: 95%

### Detail Panel
Selected file: `promo_100_bonus.jpg`

Metadata:
- Jenis File: JPG
- Ukuran: 245 KB
- Resolusi: 1280 x 720
- Diunggah: 18 Mei 2025 09:01:12
- Sumber: `https://promo-gacor88.xyz`
- Domain: `promo-gacor88.xyz`
- Hash SHA-256: `7f3c2a8b...9d4e6f1a`

OCR text:
- BONUS NEW MEMBER
- 100%
- SLOT - CASINO - SPORTSBOOK

Extracted entities:
- Rekening: BCA 1234 5678 9010, Confidence 94%
- Keyword Promo: BONUS, NEW MEMBER, 100%, Confidence 96%
- Kontak / Telegram: @cs_24jam, Confidence 93%

Verification:
- Terverifikasi
- Bukti telah diverifikasi oleh penyidik
- Oleh: Andi Pratama
- 18 Mei 2025 09:15

Actions:
- Simpan Bukti
- Lihat di Graph
- Tambahkan ke Kasus

---

## 14. Report Export Page Spec

### Page Title
**Report Export**

### Figure Title for Proposal
`Gambar 7. Report Export: ringkasan kasus, timeline, evidence table, dan tombol ekspor PDF`

### Main Content
Case: `Kasus slot-gacor88.xyz`
Badge: `Risiko Tinggi`

Metadata:
- Tipe Kasus: Perjudian Online
- Status: Aktif
- Dibuat oleh: Andi Pratama
- Dibuat pada: 12 Mei 2025 10:21
- Terakhir diperbarui: 18 Mei 2025 09:14

Summary cards:
- Total Entitas: 48
- Total Bukti: 186
- Skor Risiko: 92/100
- Terakhir Diperbarui: 18 Mei 2025 09:14

### Timeline Aktivitas Kasus
- Domain slot-gacor88.xyz ditemukan — 12 Mei 10:21
- Mirror domain slot-gacor88.net terdeteksi — 12 Mei 11:05
- Promo deposit terdeteksi — 12 Mei 13:42
- Pembayaran ke BCA 1234 5678 9010 — 13 Mei 08:12
- Alias operator MASTER88 terhubung — 14 Mei 14:33
- Screenshot visual diekstraksi — 17 Mei 21:33
- Laporan diperbarui — 18 Mei 09:14

### Evidence Table
Columns:
- Jenis Bukti
- Deskripsi / Sumber
- Status Verifikasi
- Waktu

Rows:
- Domain — slot-gacor88.xyz — Terverifikasi — 12 Mei 2025 10:21
- Telegram Channel — promo-tg88 — Terverifikasi — 12 Mei 2025 10:21
- Pembayaran — BCA 1234 5678 9010 — Terverifikasi — 13 Mei 2025 08:12
- Screenshot — screenshot_#142.png — Terverifikasi — 18 Mei 2025 09:02
- Alias — MASTER88 — Verifikasi Parsial — 14 Mei 2025 14:33
- Mirror Domain — slot-gacor88.net — Terverifikasi — 17 Mei 2025 21:33
- Affiliate Link — affiliate-link.net — Dalam Proses — 15 Mei 2025 16:20
- E-wallet — OVO 0821 2345 6789 — Verifikasi Parsial — 13 Mei 2025 08:12

### PDF Preview
Show a mock report page preview containing:
- Laporan Investigasi
- Kasus slot-gacor88.xyz
- Ringkasan Eksekutif
- Ringkasan Temuan
- Struktur Hubungan (Graph)
- Halaman 1 dari 24

### Export Actions
- Primary button: `Ekspor PDF`
- Secondary button: `Unduh Ringkasan (CSV)`
- Secondary button: `Bagikan Laporan`
- Note: `Laporan ini hanya dapat diakses oleh tim yang berwenang.`

---

## 15. Mobile Case Overview Spec

### Figure Title
`Gambar 8. Mobile Case Overview: ringkasan kasus dan notifikasi temuan baru untuk investigator`

Use a 2–3 phone mockup layout or make actual responsive mobile page.

### Phone 1: Case Overview
Header:
- JudolGraph logo
- Bell icon
- Avatar AP

Case card:
- slot-gacor88.xyz
- Domain
- High Risk
- Skor Risiko: 92/100
- Status: Aktif

Metric cards:
- Entitas: 186
- Bukti: 412
- Telegram: 23
- Pembayaran: 12

Ringkasan Kasus:
Domain ini terdeteksi sebagai situs perjudian online dengan pola promosi agresif melalui jaringan Telegram dan penggunaan beberapa mirror domain.

Aktivitas Terbaru:
- Promo Telegram terdeteksi — 09:14
- Screenshot baru ditambahkan — 09:02
- Pembayaran baru terdeteksi — 08:55
- Mirror domain aktif — 08:37

Buttons:
- Lihat Graph
- Review Kasus

Bottom nav:
- Dashboard
- Kasus
- Plus action
- Notifikasi
- Akun

### Phone 2: Notifications
Tabs:
- Semua
- Belum Dibaca
- Penting

Notification cards:
- Temuan Baru — Entitas baru terdeteksi: 3 domain, 2 rekening, 1 alias operator — Menengah
- Screenshot Baru — Screenshot #143 ditambahkan ke kasus slot-gacor88.xyz — Rendah
- Mirror Domain Aktif — slot-gacor88.win terdeteksi aktif dan terhubung — Tinggi
- Promo Telegram Terdeteksi — Channel @promo-tg88 mempromosikan link slot-gacor88.xyz — Tinggi
- Skor Risiko Meningkat — dari 85 menjadi 92 — Penting
- Transaksi Baru Terdeteksi — Transfer dari BCA ke DANA sebesar Rp 5.000.000 — Menengah

### Phone 3: Evidence Summary
Title:
Ringkasan Bukti

Metric row:
- Domain: 23
- Telegram: 23
- Pembayaran: 12
- Bukti: 412

Timeline:
- Screenshot #143
- Promo Telegram terdeteksi
- Transaksi baru terdeteksi
- Mirror domain aktif
- Entitas baru ditambahkan

Button:
- Lihat Semua Bukti

---

## 16. Architecture Content

Use this in any architecture/technical section.

### Architecture Layers
1. **Sumber Data**
   - Domain & DNS
   - Website/Screenshot
   - Kanal Telegram
   - Rekening & E-wallet
   - Alias/Username
   - Data OSINT publik

2. **Akuisisi Data**
   - Web Crawler
   - Collector API
   - Screenshot Capture
   - OCR Ingestion
   - Seed Input Kasus

3. **Pemrosesan AI**
   - OCR
   - Entity Extraction
   - Relation Extraction
   - Deduplication
   - Risk Scoring
   - Clustering
   - Timeline Builder

4. **Penyimpanan & Analitik**
   - Graph Database
   - Evidence Store
   - Case Database
   - Search Index
   - Audit Log

5. **Layanan Aplikasi**
   - Dashboard Investigasi
   - Evidence Graph
   - Manajemen Kasus
   - Review Entitas
   - Export Laporan PDF
   - Notifikasi

6. **Pengguna**
   - Investigator
   - Analis Siber
   - Peneliti
   - Admin

### Cross-cutting Concerns
- Keamanan & Privasi
- Human-in-the-loop Review
- Traceable Evidence
- Audit Trail
- Role-based Access Control
- Evidence provenance

---

## 17. Data Model for Mock Implementation

### TypeScript Interfaces

```ts
type RiskLevel = "low" | "medium" | "high" | "critical";
type EntityType =
  | "domain"
  | "telegram"
  | "payment"
  | "alias"
  | "screenshot"
  | "affiliate"
  | "mirror"
  | "infrastructure";

interface Case {
  id: string;
  title: string;
  seed: string;
  status: "open" | "investigating" | "review" | "closed" | "archived";
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  investigator: string;
  summary: string;
  entityCount: number;
  evidenceCount: number;
}

interface Entity {
  id: string;
  type: EntityType;
  label: string;
  subtitle?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  confidence?: number;
  status?: string;
  metadata?: Record<string, string | number>;
}

interface Relation {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence: number;
}

interface Evidence {
  id: string;
  type: "domain" | "telegram" | "payment" | "screenshot" | "alias" | "mirror" | "affiliate";
  title: string;
  source: string;
  status: "verified" | "partial" | "processing" | "rejected";
  timestamp: string;
  hash?: string;
  confidence?: number;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: EntityType | "system" | "review";
  severity?: RiskLevel;
}
```

---

## 18. Mock Dataset

### Case
```json
{
  "id": "case-001",
  "title": "Kasus slot-gacor88.xyz",
  "seed": "slot-gacor88.xyz",
  "status": "investigating",
  "riskScore": 92,
  "riskLevel": "high",
  "createdAt": "12 Mei 2025 10:21",
  "updatedAt": "18 Mei 2025 09:14",
  "investigator": "Andi Pratama",
  "summary": "Domain ini terdeteksi sebagai situs perjudian online dengan pola promosi agresif melalui jaringan Telegram dan penggunaan beberapa mirror domain.",
  "entityCount": 186,
  "evidenceCount": 412
}
```

### Entities
```json
[
  {
    "id": "domain-main",
    "type": "domain",
    "label": "slot-gacor88.xyz",
    "subtitle": "Domain Utama",
    "riskScore": 92,
    "riskLevel": "high",
    "confidence": 92
  },
  {
    "id": "telegram-1",
    "type": "telegram",
    "label": "promo-tg88",
    "subtitle": "Telegram Channel · 12.8K anggota",
    "riskLevel": "high",
    "confidence": 89
  },
  {
    "id": "telegram-2",
    "type": "telegram",
    "label": "slotgacor88_official",
    "subtitle": "Telegram Channel · 15.3K anggota",
    "riskLevel": "high",
    "confidence": 86
  },
  {
    "id": "payment-1",
    "type": "payment",
    "label": "BCA 1234 5678 9010",
    "subtitle": "Andi Setiawan",
    "riskLevel": "high",
    "confidence": 94
  },
  {
    "id": "payment-2",
    "type": "payment",
    "label": "DANA 0812 3456 7890",
    "subtitle": "E-wallet",
    "riskLevel": "medium",
    "confidence": 88
  },
  {
    "id": "alias-1",
    "type": "alias",
    "label": "BANG-J88",
    "subtitle": "Operator Alias",
    "riskLevel": "high",
    "confidence": 81
  },
  {
    "id": "alias-2",
    "type": "alias",
    "label": "MASTER88",
    "subtitle": "Operator Alias",
    "riskLevel": "medium",
    "confidence": 76
  },
  {
    "id": "mirror-cluster",
    "type": "mirror",
    "label": "Mirror Cluster",
    "subtitle": "8 domain",
    "riskLevel": "high",
    "confidence": 90
  },
  {
    "id": "screenshot-142",
    "type": "screenshot",
    "label": "Screenshot #142",
    "subtitle": "Bonus New Member 100%",
    "riskLevel": "medium",
    "confidence": 96
  }
]
```

### Relations
```json
[
  { "id": "r1", "source": "telegram-1", "target": "domain-main", "label": "menautkan ke", "confidence": 91 },
  { "id": "r2", "source": "telegram-2", "target": "domain-main", "label": "promosi", "confidence": 87 },
  { "id": "r3", "source": "domain-main", "target": "payment-1", "label": "menerima pembayaran", "confidence": 86 },
  { "id": "r4", "source": "domain-main", "target": "payment-2", "label": "menerima pembayaran", "confidence": 82 },
  { "id": "r5", "source": "alias-1", "target": "domain-main", "label": "dikendalikan oleh", "confidence": 79 },
  { "id": "r6", "source": "alias-2", "target": "domain-main", "label": "terkait alias", "confidence": 74 },
  { "id": "r7", "source": "domain-main", "target": "mirror-cluster", "label": "memiliki mirror", "confidence": 90 },
  { "id": "r8", "source": "screenshot-142", "target": "domain-main", "label": "bukti visual", "confidence": 96 }
]
```

### Timeline Events
```json
[
  {
    "id": "t1",
    "timestamp": "12 Mei 2025 10:21",
    "title": "Domain slot-gacor88.xyz ditemukan",
    "description": "Hasil crawling dari Telegram Channel",
    "type": "domain"
  },
  {
    "id": "t2",
    "timestamp": "12 Mei 2025 11:05",
    "title": "Mirror domain slot-gacor88.net terdeteksi",
    "description": "Sistem mirror detection aktif",
    "type": "mirror"
  },
  {
    "id": "t3",
    "timestamp": "12 Mei 2025 13:42",
    "title": "Promo deposit terdeteksi",
    "description": "Dari channel Telegram promo-tg88",
    "type": "telegram"
  },
  {
    "id": "t4",
    "timestamp": "13 Mei 2025 08:12",
    "title": "Pembayaran ke BCA 1234 5678 9010",
    "description": "Bukti transaksi dari e-wallet",
    "type": "payment"
  },
  {
    "id": "t5",
    "timestamp": "18 Mei 2025 09:14",
    "title": "Laporan diperbarui",
    "description": "Sinkronisasi data dan verifikasi bukti",
    "type": "review"
  }
]
```

---

## 19. Interactions to Implement

### Required
- Sidebar navigation changes active page.
- Dashboard cards and charts render from mock data.
- Evidence graph nodes are visible and clickable.
- Clicking central node opens/updates detail panel.
- Search input can filter mock entities by label.
- Filter chips can visually toggle.
- Screenshot grid selection updates OCR detail panel.
- Report page has an export button that shows a toast or modal:
  - `Laporan PDF berhasil disiapkan untuk demo.`
- New case button opens a modal/form.

### Nice to Have
- Simulated crawler progress bars.
- Animated graph edges.
- Toast notifications.
- Dark mode toggle.
- Responsive/mobile layout.
- Fake PDF preview panel.
- Command palette on `Cmd/Ctrl + K`.

### New Case Modal Fields
- Nama Kasus
- Seed URL / Domain
- Kanal Telegram
- Catatan awal
- Prioritas
- Button: `Mulai Crawling`

On submit:
- Show toast: `Kasus baru dibuat dan crawler mulai berjalan.`
- Optionally insert a temporary crawler job.

---

## 20. Safety / Ethics Requirements

The demo must avoid enabling harmful behavior.

Do:
- Use synthetic domains and mock data.
- Present everything as investigation/evidence documentation.
- Avoid real gambling brands or active URLs.
- Use safe, generic screenshots/graphics.
- Include labels like `Data simulasi`.
- Avoid instructions on how to access, promote, or operate gambling.

Do not:
- Link to real gambling websites.
- Scrape real Telegram channels.
- Provide operational guidance for gambling operators.
- Use real bank account numbers or personal data.
- Use real people’s identities.

Suggested footer note:
**Seluruh data pada demo ini adalah data sintetis untuk kebutuhan presentasi dan pengujian antarmuka.**

---

## 21. Image/Figure Context From Proposal

The proposal uses these planned figures:

1. **Gambar 1. Rancangan Arsitektur JudolGraph**
   Architecture diagram for data sources, acquisition, AI processing, storage, app services, users, security, review, and traceable evidence.

2. **Gambar 2. Flowchart Alur Pengguna JudolGraph**
   User flow from case creation to PDF export.

3. **Gambar 3. Dashboard JudolGraph**
   Main dashboard showing status kasus, statistik entitas, and crawler aktif.

4. **Gambar 4. Evidence Graph**
   Interactive relationship graph connecting domain, Telegram, payment, alias, screenshot, and mirror cluster.

5. **Gambar 5. Entity Detail Panel**
   Detailed entity profile and evidence context for one domain.

6. **Gambar 6. Screenshot & OCR Evidence**
   Screenshot evidence gallery and OCR extraction panel.

7. **Gambar 7. Report Export**
   Case report page with summary, timeline, evidence table, PDF preview, and export button.

8. **Gambar 8. Mobile Case Overview**
   Mobile case overview and notification screens for investigators.

For demo website generation, implement pages matching these figures as closely as possible.

---

## 22. Acceptance Criteria

A good JudolGraph demo website should satisfy:

- Looks like a professional SaaS dashboard, not a generic template.
- Clearly communicates the anti-online-gambling investigation purpose.
- Has a coherent product story from dashboard to report export.
- Includes realistic mock data and Indonesian labels.
- Has an interactive evidence graph or at least a convincing graph visualization.
- Has screenshot/OCR evidence view.
- Has report export page with PDF preview and action buttons.
- Has safe synthetic data only.
- Is responsive enough to present on laptop/projector.
- Can be run locally with simple commands.

### Suggested README Commands
```bash
npm install
npm run dev
```

### Demo Presentation Order
1. Landing page
2. Dashboard
3. Evidence Graph
4. Entity Detail
5. Screenshot & OCR
6. Report Export
7. Mobile Preview / responsive view
8. Explain architecture and impact

---

## 23. Quick Build Prompt for Codex

Use this prompt to start implementation:

```txt
Build a polished Next.js + TypeScript + Tailwind demo web app for JudolGraph, an AI-powered investigation graph platform for exposing and documenting online gambling networks. Use synthetic data only. Implement a modern SaaS dashboard with routes for landing page, dashboard, evidence graph, entity detail, screenshot & OCR evidence, report export, and mobile preview. Use Indonesian UI labels, blue/white visual identity, rounded cards, lucide icons, recharts, and React Flow or custom graph visualization. The app should demonstrate the workflow Detect → Connect → Document: input/monitor investigation data, connect entities in an evidence graph, inspect evidence, and export a case report. Follow the context pack in JUDOLGRAPH_DEMO_WEBSITE_CONTEXT.md.
```
