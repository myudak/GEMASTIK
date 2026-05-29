export type WorkflowStepId = "seed" | "crawl" | "ocr" | "graph" | "review";

export type WorkflowStep = {
  id: WorkflowStepId;
  number: number;
  label: string;
  title: string;
  subtitle: string;
  href: string;
};

export type EvidenceIcon = "metadata" | "screenshot" | "link";

export type EvidenceItem = {
  icon: EvidenceIcon;
  label: string;
  status: "Berhasil";
  time: string;
  description: string;
  preview?: "webpage";
};

export type EntityIcon = "domain" | "channel" | "payment" | "referral" | "keyword";

export type DetectedEntity = {
  icon: EntityIcon;
  category: string;
  value: string;
  confidence: number;
};

export type RiskSignal = {
  label: string;
};

export type ReviewSummary = {
  caseName: string;
  seed: string;
  evidenceCount: number;
  entityCount: number;
  riskScore: number;
  note: string;
};

export type InvestigationCase = {
  id: string;
  name: string;
  seed: string;
  status: "Investigasi" | "Perlu Review" | "Terverifikasi";
  risk: "Tinggi" | "Sedang";
  evidenceCount: number;
  entityCount: number;
  updatedAt: string;
};

export type EntityDetail = {
  id: string;
  type: string;
  value: string;
  confidence: number;
  status: "Need Review" | "Verified" | "Rejected";
  riskSignals: string[];
  relatedEvidence: string[];
};

export type ReviewAction = {
  label: "Verified" | "Need Review" | "Rejected";
  description: string;
};

export type PublicReportSummary = {
  label: string;
  value: string;
};

export type LinkCheckResult = {
  domain: string;
  level: "Indikasi Rendah" | "Indikasi Sedang" | "Indikasi Tinggi";
  description: string;
};

export type ReportDocumentData = {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  evidence: EvidenceItem[];
  riskSignals: RiskSignal[];
  auditTrail: string[];
  summary: ReviewSummary;
};

export const workflowSteps: WorkflowStep[] = [
  {
    id: "seed",
    number: 1,
    label: "Seed",
    title: "Buat Kasus Baru",
    subtitle: "Mulai investigasi digital dari sebuah seed.",
    href: "/cases/new",
  },
  {
    id: "crawl",
    number: 2,
    label: "Crawl",
    title: "Pengumpulan Bukti",
    subtitle:
      "Sistem mengambil bukti digital dari sumber publik berdasarkan seed yang telah divalidasi.",
    href: "/crawler",
  },
  {
    id: "ocr",
    number: 3,
    label: "OCR",
    title: "OCR & Ekstraksi Entitas",
    subtitle: "Bukti visual diproses untuk mengekstraksi teks dan entitas penting.",
    href: "/screenshots",
  },
  {
    id: "graph",
    number: 4,
    label: "Graph",
    title: "Evidence Graph & Penilaian Risiko",
    subtitle: "Sistem memetakan hubungan antarbukti dan menghitung skor risiko awal.",
    href: "/evidence-graph",
  },
  {
    id: "review",
    number: 5,
    label: "Review & Laporan",
    title: "Human Review",
    subtitle: "Investigator meninjau status akhir sebelum laporan dibuat.",
    href: "/review",
  },
];

export const evidenceItems: EvidenceItem[] = [
  {
    icon: "metadata",
    label: "Metadata halaman publik",
    status: "Berhasil",
    time: "20 Mei 2025 14:28:31 WIB",
    description: "Metadata dasar halaman publik, termasuk judul, deskripsi, dan header.",
  },
  {
    icon: "screenshot",
    label: "Screenshot halaman",
    status: "Berhasil",
    time: "20 Mei 2025 14:28:33 WIB",
    description: "Bukti visual sintetis dari halaman publik yang diproses.",
    preview: "webpage",
  },
  {
    icon: "link",
    label: "Tautan keluar",
    status: "Berhasil",
    time: "20 Mei 2025 14:28:35 WIB",
    description: "Daftar tautan keluar yang ditemukan pada halaman publik.",
  },
];

export const detectedEntities: DetectedEntity[] = [
  {
    icon: "domain",
    category: "Domain",
    value: "tg88.com",
    confidence: 96,
  },
  {
    icon: "channel",
    category: "Kanal Publik",
    value: "t.me/promo-tg88",
    confidence: 95,
  },
  {
    icon: "payment",
    category: "Indikasi Pembayaran",
    value: "DANA",
    confidence: 98,
  },
  {
    icon: "referral",
    category: "Referral Link",
    value: "t.me/promo-tg88",
    confidence: 95,
  },
  {
    icon: "keyword",
    category: "Kata Kunci Promosi",
    value: "bonus deposit, RTP tinggi",
    confidence: 94,
  },
];

export const riskSignals: RiskSignal[] = [
  { label: "konten promosi judi online" },
  { label: "mirror domain" },
  { label: "kanal publik berulang" },
  { label: "indikasi pembayaran" },
];

export const reviewSummary: ReviewSummary = {
  caseName: "Investigasi Situs Example",
  seed: "https://example.com",
  evidenceCount: 3,
  entityCount: 5,
  riskScore: 92,
  note: "Indikasi kuat aktivitas promosi sintetis dan pola pengalihan trafik.",
};

export const investigationCases: InvestigationCase[] = [
  {
    id: "case-slot-gacor88",
    name: "Investigasi Situs Example",
    seed: "https://example.com",
    status: "Perlu Review",
    risk: "Tinggi",
    evidenceCount: 3,
    entityCount: 5,
    updatedAt: "20 Mei 2025, 14:35 WIB",
  },
  {
    id: "case-bonus-aman",
    name: "Laporan Domain Promo",
    seed: "promo-example.test",
    status: "Investigasi",
    risk: "Sedang",
    evidenceCount: 2,
    entityCount: 4,
    updatedAt: "20 Mei 2025, 13:10 WIB",
  },
  {
    id: "case-publik-01",
    name: "Laporan Publik Terkurasi",
    seed: "https://lapor.example.net",
    status: "Terverifikasi",
    risk: "Sedang",
    evidenceCount: 4,
    entityCount: 6,
    updatedAt: "19 Mei 2025, 17:42 WIB",
  },
];

export const entityDetail: EntityDetail = {
  id: "slot-gacor88",
  type: "Domain",
  value: "slot-gacor88.xyz",
  confidence: 94,
  status: "Need Review",
  riskSignals: riskSignals.map((signal) => signal.label),
  relatedEvidence: [
    "Metadata halaman publik",
    "Screenshot promosi sintetis",
    "Tautan keluar dan referral",
  ],
};

export const reviewActions: ReviewAction[] = [
  {
    label: "Verified",
    description: "Bukti cukup dan dapat masuk paket laporan.",
  },
  {
    label: "Need Review",
    description: "Perlu pemeriksaan investigator sebelum diputuskan.",
  },
  {
    label: "Rejected",
    description: "Tidak cukup bukti atau tidak sesuai ruang lingkup.",
  },
];

export const publicReportStats: PublicReportSummary[] = [
  { label: "Domain terverifikasi", value: "12" },
  { label: "Laporan publik diterima", value: "28" },
  { label: "Kategori risiko umum", value: "Promosi" },
];

export const linkCheckResult: LinkCheckResult = {
  domain: "example.com",
  level: "Indikasi Sedang",
  description:
    "Ditemukan pola kata kunci dan tautan publik yang memerlukan verifikasi lebih lanjut.",
};

export const reportDocumentData: ReportDocumentData = {
  title: "Laporan Investigasi HAWKEYE",
  generatedAt: "20 Mei 2025, 15:00 WIB",
  executiveSummary:
    "Laporan sintetis ini merangkum bukti publik, entitas terdeteksi, sinyal risiko, dan catatan human review untuk kebutuhan demonstrasi.",
  evidence: evidenceItems,
  riskSignals,
  auditTrail: [
    "Seed divalidasi sebagai sumber publik.",
    "Metadata, screenshot, dan tautan publik dikumpulkan.",
    "OCR dan ekstraksi entitas menghasilkan 5 entitas.",
    "Investigator menandai kasus sebagai Need Review.",
  ],
  summary: reviewSummary,
};
