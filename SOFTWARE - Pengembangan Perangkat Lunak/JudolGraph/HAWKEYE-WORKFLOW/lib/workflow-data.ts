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
    title: "Review & Laporan",
    subtitle: "Investigator meninjau hasil akhir sebelum menyiapkan laporan.",
    href: "/reports",
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
