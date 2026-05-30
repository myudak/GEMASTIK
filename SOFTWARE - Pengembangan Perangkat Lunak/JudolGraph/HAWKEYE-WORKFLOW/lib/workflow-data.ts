export type WorkflowStepId = "seed" | "crawl" | "ocr" | "graph" | "review";

export type WorkflowStep = {
  id: WorkflowStepId;
  number: number;
  label: string;
  title: string;
  subtitle: string;
  href: string;
};

export type VerificationStatus = "Draft" | "Need Review" | "Verified" | "Rejected";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type DemoCase = {
  id: string;
  name: string;
  seed: string;
  status: "Investigasi" | "Need Review" | "Verified" | "Rejected";
  riskLevel: RiskLevel;
  riskScore: number;
  updatedAt: string;
  summary: string;
  evidenceIds: string[];
  entityIds: string[];
  signalIds: string[];
  reviewDecision: VerificationStatus;
};

export type SeedInput = {
  seedType: "url" | "domain";
  seed: string;
  caseName: string;
  note: string;
};

export type EvidenceKind = "metadata" | "html" | "screenshot" | "link" | "payment" | "mirror";

export type EvidenceItem = {
  id: string;
  caseId: string;
  kind: EvidenceKind;
  title: string;
  source: string;
  url: string;
  status: VerificationStatus;
  collectedAt: string;
  progress: number;
  confidence: number;
  hash: string;
  description: string;
  imageSrc?: string;
  ocrText?: string;
  entityIds: string[];
};

export type OcrEvidence = EvidenceItem & {
  imageSrc: string;
  ocrText: string;
};

export type EntityType =
  | "Domain"
  | "Public Channel"
  | "Payment Indicator"
  | "Referral Link"
  | "Promo Keyword"
  | "Mirror Domain"
  | "Alias"
  | "Screenshot"
  | "HTML Pattern";

export type DetectedEntity = {
  id: string;
  caseId: string;
  type: EntityType;
  value: string;
  confidence: number;
  status: VerificationStatus;
  evidenceIds: string[];
  riskSignalIds: string[];
  note: string;
};

export type RiskSignal = {
  id: string;
  label: string;
  weight: number;
  confidence: number;
  status: VerificationStatus;
  description: string;
};

export type GraphNodeType =
  | "domain"
  | "channel"
  | "payment"
  | "referral"
  | "keyword"
  | "mirror"
  | "alias"
  | "screenshot"
  | "html";

export type GraphNode = {
  id: string;
  caseId: string;
  entityId?: string;
  type: GraphNodeType;
  label: string;
  subtitle: string;
  riskLevel: RiskLevel;
  status: VerificationStatus;
  score: number;
  position: { x: number; y: number };
};

export type GraphEdge = {
  id: string;
  caseId: string;
  source: string;
  target: string;
  relation: string;
  evidenceId: string;
  status: VerificationStatus;
};

export type ReviewDecision = VerificationStatus;

export type AuditEvent = {
  id: string;
  caseId: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type PublicReportSummary = {
  label: string;
  value: string;
};

export type LinkCheckResult = {
  input: string;
  level: "Indikasi Rendah" | "Indikasi Sedang" | "Indikasi Tinggi";
  score: number;
  description: string;
  signals: string[];
};

export type ReportDocumentData = {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  case: DemoCase;
  evidence: EvidenceItem[];
  entities: DetectedEntity[];
  riskSignals: RiskSignal[];
  graphSummary: string;
  auditTrail: AuditEvent[];
  pendingReviewCount: number;
};

export const workflowSteps: WorkflowStep[] = [
  {
    id: "seed",
    number: 1,
    label: "Seed",
    title: "Buat Kasus Baru",
    subtitle: "Validasi URL atau domain publik sebelum masuk ke pipeline investigasi.",
    href: "/cases/new",
  },
  {
    id: "crawl",
    number: 2,
    label: "Crawl",
    title: "Pengumpulan Bukti",
    subtitle: "Demo pipeline mengambil metadata, teks halaman, tautan, screenshot, dan hash bukti.",
    href: "/crawler",
  },
  {
    id: "ocr",
    number: 3,
    label: "OCR",
    title: "OCR & Ekstraksi Entitas",
    subtitle: "Bukti visual sintetis diproses untuk mengekstraksi teks, entitas, dan confidence.",
    href: "/screenshots",
  },
  {
    id: "graph",
    number: 4,
    label: "Graph",
    title: "Evidence Graph & Penilaian Risiko",
    subtitle: "Relasi antarbukti dipetakan sebagai node dan edge untuk mendukung prioritas risiko.",
    href: "/evidence-graph",
  },
  {
    id: "review",
    number: 5,
    label: "Review & Laporan",
    title: "Human Review",
    subtitle: "Investigator memverifikasi bukti sebelum laporan final diekspor.",
    href: "/review",
  },
];

export const initialCases: DemoCase[] = [
  {
    id: "case-slot-gacor88",
    name: "Operasi Slot Gacor88",
    seed: "https://slot-gacor88.xyz",
    status: "Need Review",
    riskLevel: "Critical",
    riskScore: 92,
    updatedAt: "30 Mei 2026, 09:38 WIB",
    summary:
      "Seed publik memperlihatkan konten promosi, referral, mirror cluster, dan indikasi pembayaran tersamarkan.",
    evidenceIds: [
      "ev-meta-root",
      "ev-html-root",
      "ev-text-root",
      "ev-outbound-links",
      "ev-screenshot-promo",
      "ev-ocr-promo",
      "ev-payment-image",
      "ev-payment-hash",
      "ev-mirror-page",
      "ev-referral-map",
      "ev-html-fingerprint",
      "ev-audit-note",
    ],
    entityIds: [
      "ent-domain-root",
      "ent-domain-mirror-a",
      "ent-domain-mirror-b",
      "ent-channel-promo",
      "ent-payment-wallet",
      "ent-referral-param",
      "ent-alias-bang",
      "ent-keyword-slot",
      "ent-keyword-rtp",
      "ent-keyword-bonus",
      "ent-screenshot-promo",
      "ent-screenshot-payment",
      "ent-html-fingerprint",
      "ent-redirect-public",
      "ent-title-pattern",
      "ent-meta-description",
      "ent-public-handle",
      "ent-mirror-cluster",
    ],
    signalIds: [
      "sig-promo-content",
      "sig-payment",
      "sig-mirror",
      "sig-public-channel",
      "sig-referral",
      "sig-keyword-density",
    ],
    reviewDecision: "Need Review",
  },
  {
    id: "case-bonus-aman",
    name: "Laporan Domain Promo",
    seed: "promo-aman.club",
    status: "Investigasi",
    riskLevel: "High",
    riskScore: 74,
    updatedAt: "30 Mei 2026, 08:11 WIB",
    summary: "Domain publik dengan tautan keluar dan beberapa kata kunci promosi.",
    evidenceIds: ["ev-bonus-meta", "ev-bonus-link", "ev-bonus-screenshot"],
    entityIds: ["ent-bonus-domain", "ent-bonus-link", "ent-bonus-keyword"],
    signalIds: ["sig-promo-content", "sig-referral"],
    reviewDecision: "Draft",
  },
  {
    id: "case-mirror-cluster",
    name: "Mirror Cluster Publik",
    seed: "mirror-cluster-a.example",
    status: "Verified",
    riskLevel: "High",
    riskScore: 81,
    updatedAt: "29 Mei 2026, 17:42 WIB",
    summary: "Kemiripan konten dan pola redirect sudah diverifikasi sebagai sinyal prioritas.",
    evidenceIds: ["ev-mirror-meta", "ev-mirror-similarity", "ev-mirror-redirect"],
    entityIds: ["ent-mirror-domain-a", "ent-mirror-domain-b", "ent-mirror-redirect"],
    signalIds: ["sig-mirror", "sig-public-channel"],
    reviewDecision: "Verified",
  },
  {
    id: "case-public-report",
    name: "Laporan Publik Terkurasi",
    seed: "lapor-demo.example",
    status: "Need Review",
    riskLevel: "Medium",
    riskScore: 56,
    updatedAt: "29 Mei 2026, 13:09 WIB",
    summary: "Laporan publik dengan indikasi terbatas, menunggu validasi investigator.",
    evidenceIds: ["ev-public-report", "ev-public-check"],
    entityIds: ["ent-public-domain", "ent-public-keyword"],
    signalIds: ["sig-keyword-density"],
    reviewDecision: "Need Review",
  },
];

export const initialEvidence: EvidenceItem[] = [
  {
    id: "ev-meta-root",
    caseId: "case-slot-gacor88",
    kind: "metadata",
    title: "Metadata halaman utama",
    source: "Crawler publik",
    url: "https://slot-gacor88.xyz",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:10 WIB",
    progress: 100,
    confidence: 88,
    hash: "6f4c9c6e7a7a9f7a8e91b7b8ed2c0e22f2adfb4f4a3e8d7f5b6a9a1c2d3e4f50",
    description: "Judul, meta description, header publik, dan canonical path berhasil dibaca.",
    entityIds: ["ent-domain-root", "ent-title-pattern", "ent-meta-description"],
  },
  {
    id: "ev-html-root",
    caseId: "case-slot-gacor88",
    kind: "html",
    title: "Struktur HTML publik",
    source: "Crawler publik",
    url: "https://slot-gacor88.xyz",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:11 WIB",
    progress: 100,
    confidence: 82,
    hash: "d9a4b0ef7c1a2602ad1f6fd76d7c65bb1c4e9a7d32b112f0c5e99a1223344556",
    description: "Navigasi, section promo, tombol publik, dan struktur heading terdeteksi.",
    entityIds: ["ent-html-fingerprint", "ent-keyword-slot", "ent-keyword-bonus"],
  },
  {
    id: "ev-text-root",
    caseId: "case-slot-gacor88",
    kind: "metadata",
    title: "Teks halaman publik",
    source: "Crawler publik",
    url: "https://slot-gacor88.xyz",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:12 WIB",
    progress: 100,
    confidence: 86,
    hash: "b64ef08ad2e4282cda2ec10be39d41ff071c57273f0db77b917f0c117e64ad2a",
    description: "Teks halaman memuat frasa promosi dan pola CTA publik.",
    entityIds: ["ent-keyword-slot", "ent-keyword-rtp", "ent-public-handle"],
  },
  {
    id: "ev-outbound-links",
    caseId: "case-slot-gacor88",
    kind: "link",
    title: "Tautan keluar dan referral",
    source: "Link parser",
    url: "https://slot-gacor88.xyz/ref?id=synthetic",
    status: "Need Review",
    collectedAt: "30 Mei 2026, 09:13 WIB",
    progress: 100,
    confidence: 79,
    hash: "1ad7ed092f5f1c8d6e0b0c2716b2c452dd6735f9a2210f8b6b577b1a324fac91",
    description: "Parameter referral dan redirect publik ditemukan pada halaman.",
    entityIds: ["ent-referral-param", "ent-redirect-public", "ent-channel-promo"],
  },
  {
    id: "ev-screenshot-promo",
    caseId: "case-slot-gacor88",
    kind: "screenshot",
    title: "Screenshot promosi sintetis",
    source: "Screenshot worker",
    url: "https://slot-gacor88.xyz",
    status: "Need Review",
    collectedAt: "30 Mei 2026, 09:14 WIB",
    progress: 100,
    confidence: 94,
    hash: "2a3b5f0de1a7cd847182a663dbcc11f55ab1f98d6a3de5b6f78c90a12b3c44d5e",
    description: "Bukti visual sintetis berisi promosi, handle publik, dan indikator pembayaran.",
    imageSrc: "/evidence/ocr-promo-evidence.png",
    ocrText:
      "PROMO SPESIAL\nBONUS DEPOSIT 100%\nRTP TINGGI\nHUBUNGI: PROMO-TG88\nPEMBAYARAN VIA DANA",
    entityIds: [
      "ent-screenshot-promo",
      "ent-channel-promo",
      "ent-payment-wallet",
      "ent-keyword-bonus",
      "ent-keyword-rtp",
    ],
  },
  {
    id: "ev-ocr-promo",
    caseId: "case-slot-gacor88",
    kind: "screenshot",
    title: "Hasil OCR banner promosi",
    source: "OCR worker",
    url: "ocr://ev-screenshot-promo",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:15 WIB",
    progress: 100,
    confidence: 91,
    hash: "bb8fe34064ab8d1b3cecd6104f3bcde0e1728438713e7fc98c321046f273222f",
    description: "OCR berhasil membaca kata kunci promosi dari gambar sintetis.",
    entityIds: ["ent-keyword-slot", "ent-keyword-bonus", "ent-keyword-rtp"],
  },
  {
    id: "ev-payment-image",
    caseId: "case-slot-gacor88",
    kind: "payment",
    title: "Instruksi pembayaran tersamarkan",
    source: "Screenshot worker",
    url: "https://slot-gacor88.xyz/deposit",
    status: "Need Review",
    collectedAt: "30 Mei 2026, 09:16 WIB",
    progress: 100,
    confidence: 89,
    hash: "4dc4f81ea7c03ed0db529a56e3f8dd9b24f77e296a8e1505f8f0a64f78c0135a",
    description: "Screenshot sintetis menampilkan instruksi pembayaran demo yang tersamarkan.",
    imageSrc: "/evidence/ocr-payment-evidence.png",
    ocrText:
      "INSTRUKSI PEMBAYARAN\nDEPOSIT PROMO\nDOMPET DIGITAL\nID: PAY-88XX-5678\nSTATUS: MENUNGGU KONFIRMASI\nKODE REF: HAWK-DEMO",
    entityIds: ["ent-payment-wallet", "ent-screenshot-payment", "ent-keyword-bonus"],
  },
  {
    id: "ev-payment-hash",
    caseId: "case-slot-gacor88",
    kind: "payment",
    title: "Hash instruksi pembayaran",
    source: "Integrity panel",
    url: "hash://ev-payment-image",
    status: "Draft",
    collectedAt: "30 Mei 2026, 09:17 WIB",
    progress: 72,
    confidence: 76,
    hash: "5bb718ed2e12179ecbb4c4b15e33c29d5af9e28ff0f71d86a7d7ccda92814321",
    description: "Hash tersimpan, menunggu validasi chain-of-custody investigator.",
    entityIds: ["ent-payment-wallet"],
  },
  {
    id: "ev-mirror-page",
    caseId: "case-slot-gacor88",
    kind: "mirror",
    title: "Mirror dan referral sintetis",
    source: "Screenshot worker",
    url: "https://mirror-cluster-a.example",
    status: "Need Review",
    collectedAt: "30 Mei 2026, 09:18 WIB",
    progress: 100,
    confidence: 86,
    hash: "a10d89b3a8f0f42f5d45e62b4f26af47b31e83f0e2a28f6382f48ad6120fe43c",
    description:
      "Bukti visual sintetis mengaitkan mirror cluster, alias, handle publik, dan referral.",
    imageSrc: "/evidence/ocr-mirror-referral-evidence.png",
    ocrText:
      "MIRROR CLUSTER A\nREFERRAL LINK TERDETEKSI\nalias: BANG-J88\nhandle publik: promo-tg88\nref?id=synthetic\nBUKTI SINTETIS",
    entityIds: [
      "ent-mirror-cluster",
      "ent-domain-mirror-a",
      "ent-alias-bang",
      "ent-public-handle",
      "ent-referral-param",
    ],
  },
  {
    id: "ev-referral-map",
    caseId: "case-slot-gacor88",
    kind: "link",
    title: "Pemetaan referral publik",
    source: "Relation builder",
    url: "relation://referral",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:19 WIB",
    progress: 100,
    confidence: 81,
    hash: "750f18b84eed21e70f1f541a3211d0b43845523aeb09ad6a8054dbf4c19a8e00",
    description: "Relasi referral menghubungkan domain utama, alias, dan handle publik.",
    entityIds: ["ent-referral-param", "ent-alias-bang", "ent-channel-promo"],
  },
  {
    id: "ev-html-fingerprint",
    caseId: "case-slot-gacor88",
    kind: "html",
    title: "Kemiripan struktur HTML",
    source: "Similarity worker",
    url: "fingerprint://mirror-cluster-a",
    status: "Rejected",
    collectedAt: "30 Mei 2026, 09:20 WIB",
    progress: 100,
    confidence: 62,
    hash: "8f945bd09db71e96705d4f0ad6937e2e308651ed73cb80bcc679eb83f4a07e53",
    description: "Sinyal kemiripan terlalu lemah untuk masuk laporan final tanpa bukti tambahan.",
    entityIds: ["ent-html-fingerprint", "ent-domain-mirror-b"],
  },
  {
    id: "ev-audit-note",
    caseId: "case-slot-gacor88",
    kind: "metadata",
    title: "Catatan investigator awal",
    source: "Andi Pratama",
    url: "audit://case-slot-gacor88",
    status: "Verified",
    collectedAt: "30 Mei 2026, 09:21 WIB",
    progress: 100,
    confidence: 92,
    hash: "d27a9bb6a8ed400cb26249a09532b272271cecb3e72ff80f71ac28942fd27353",
    description: "Investigator menandai temuan sebagai prioritas review, bukan putusan otomatis.",
    entityIds: ["ent-domain-root"],
  },
  {
    id: "ev-bonus-meta",
    caseId: "case-bonus-aman",
    kind: "metadata",
    title: "Metadata domain promo",
    source: "Crawler publik",
    url: "https://promo-aman.club",
    status: "Verified",
    collectedAt: "30 Mei 2026, 08:02 WIB",
    progress: 100,
    confidence: 81,
    hash: "b0a518f2c4f74b89d1097cfe182a10b7c8d6f0ad32a4d6e8a2c1b0d9e7f65421",
    description: "Judul dan deskripsi halaman memuat pola promosi yang perlu ditinjau.",
    entityIds: ["ent-bonus-domain", "ent-bonus-keyword"],
  },
  {
    id: "ev-bonus-link",
    caseId: "case-bonus-aman",
    kind: "link",
    title: "Tautan publik terdeteksi",
    source: "Link parser",
    url: "https://promo-aman.club/go/ref-demo",
    status: "Need Review",
    collectedAt: "30 Mei 2026, 08:05 WIB",
    progress: 86,
    confidence: 76,
    hash: "ca7f0a812dee45b0902ad1374c9b0fdef281e4a031d5f4e77210aac8c91f381e",
    description: "Tautan keluar mengarah ke halaman publik dengan parameter referensi demo.",
    entityIds: ["ent-bonus-link"],
  },
  {
    id: "ev-bonus-screenshot",
    caseId: "case-bonus-aman",
    kind: "screenshot",
    title: "Screenshot halaman promosi",
    source: "Screenshot worker",
    url: "https://promo-aman.club",
    status: "Draft",
    collectedAt: "30 Mei 2026, 08:08 WIB",
    progress: 54,
    confidence: 70,
    hash: "pending-bonus-screenshot-hash",
    description: "Bukti visual masih menunggu OCR dan review investigator.",
    imageSrc: "/evidence/ocr-promo-evidence.png",
    ocrText: "PROMO AMAN\nBONUS MEMBER BARU\nTAUTAN PUBLIK",
    entityIds: ["ent-bonus-keyword"],
  },
  {
    id: "ev-mirror-meta",
    caseId: "case-mirror-cluster",
    kind: "metadata",
    title: "Metadata mirror cluster",
    source: "Crawler publik",
    url: "https://mirror-cluster-a.example",
    status: "Verified",
    collectedAt: "29 Mei 2026, 17:21 WIB",
    progress: 100,
    confidence: 84,
    hash: "9a3a779c1e0841d7bd5d9fef91d7e4b54c280e4a1223e3acba843ddb1fcd9411",
    description: "Metadata halaman cocok dengan pola mirror domain sintetis.",
    entityIds: ["ent-mirror-domain-a"],
  },
  {
    id: "ev-mirror-similarity",
    caseId: "case-mirror-cluster",
    kind: "mirror",
    title: "Kemiripan konten mirror",
    source: "Similarity worker",
    url: "fingerprint://mirror-cluster-a",
    status: "Verified",
    collectedAt: "29 Mei 2026, 17:31 WIB",
    progress: 100,
    confidence: 87,
    hash: "db3dcf98a92e41f6b98df01eeb2f78b51799e4ca24de9f7ad3128c7ae02f3390",
    description: "Struktur konten dan CTA publik memiliki kemiripan tinggi.",
    entityIds: ["ent-mirror-domain-a", "ent-mirror-domain-b"],
  },
  {
    id: "ev-mirror-redirect",
    caseId: "case-mirror-cluster",
    kind: "link",
    title: "Redirect publik mirror",
    source: "Link parser",
    url: "https://mirror-cluster-a.example/go/public",
    status: "Verified",
    collectedAt: "29 Mei 2026, 17:37 WIB",
    progress: 100,
    confidence: 82,
    hash: "e531fc1167d747d0bd045616e8fcb472447f052a51d88de834fd0db93ef5ac71",
    description: "Relasi redirect publik sudah diverifikasi untuk kebutuhan laporan demo.",
    entityIds: ["ent-mirror-redirect"],
  },
  {
    id: "ev-public-report",
    caseId: "case-public-report",
    kind: "metadata",
    title: "Laporan publik masuk",
    source: "Portal publik",
    url: "https://lapor-demo.example",
    status: "Need Review",
    collectedAt: "29 Mei 2026, 13:02 WIB",
    progress: 42,
    confidence: 64,
    hash: "public-report-demo-hash",
    description:
      "Laporan publik berisi indikasi terbatas dan belum menjadi hasil investigasi penuh.",
    entityIds: ["ent-public-domain", "ent-public-keyword"],
  },
  {
    id: "ev-public-check",
    caseId: "case-public-report",
    kind: "metadata",
    title: "Hasil link checker publik",
    source: "Link checker",
    url: "checker://lapor-demo.example",
    status: "Draft",
    collectedAt: "29 Mei 2026, 13:04 WIB",
    progress: 36,
    confidence: 58,
    hash: "public-checker-demo-hash",
    description: "Skor indikatif publik perlu diperkaya oleh investigator terverifikasi.",
    entityIds: ["ent-public-domain"],
  },
];

export const initialEntities: DetectedEntity[] = [
  entity("ent-domain-root", "Domain", "slot-gacor88.xyz", 96, "Need Review", [
    "ev-meta-root",
    "ev-html-root",
  ]),
  entity("ent-domain-mirror-a", "Mirror Domain", "mirror-cluster-a.example", 84, "Need Review", [
    "ev-mirror-page",
  ]),
  entity("ent-domain-mirror-b", "Mirror Domain", "bonus-rtpku.example", 62, "Rejected", [
    "ev-html-fingerprint",
  ]),
  entity("ent-channel-promo", "Public Channel", "promo-tg88", 95, "Verified", [
    "ev-screenshot-promo",
    "ev-referral-map",
  ]),
  entity(
    "ent-payment-wallet",
    "Payment Indicator",
    "DOMPET DIGITAL / PAY-88XX-5678",
    89,
    "Need Review",
    ["ev-payment-image"],
  ),
  entity("ent-referral-param", "Referral Link", "ref?id=synthetic", 87, "Verified", [
    "ev-outbound-links",
    "ev-referral-map",
  ]),
  entity("ent-alias-bang", "Alias", "BANG-J88", 88, "Need Review", ["ev-mirror-page"]),
  entity("ent-keyword-slot", "Promo Keyword", "slot", 94, "Verified", ["ev-text-root"]),
  entity("ent-keyword-rtp", "Promo Keyword", "RTP tinggi", 91, "Verified", ["ev-screenshot-promo"]),
  entity("ent-keyword-bonus", "Promo Keyword", "bonus deposit", 93, "Verified", [
    "ev-screenshot-promo",
    "ev-payment-image",
  ]),
  entity("ent-screenshot-promo", "Screenshot", "screenshot_promo_001.png", 94, "Need Review", [
    "ev-screenshot-promo",
  ]),
  entity("ent-screenshot-payment", "Screenshot", "screenshot_payment_002.png", 89, "Need Review", [
    "ev-payment-image",
  ]),
  entity("ent-html-fingerprint", "HTML Pattern", "section-promo-grid", 74, "Rejected", [
    "ev-html-fingerprint",
  ]),
  entity("ent-redirect-public", "Referral Link", "/go/referral-public", 79, "Need Review", [
    "ev-outbound-links",
  ]),
  entity("ent-title-pattern", "Promo Keyword", "Promo Spesial", 86, "Verified", ["ev-meta-root"]),
  entity("ent-meta-description", "Promo Keyword", "menang lebih sering", 80, "Verified", [
    "ev-meta-root",
  ]),
  entity("ent-public-handle", "Public Channel", "handle publik: promo-tg88", 91, "Verified", [
    "ev-mirror-page",
  ]),
  entity("ent-mirror-cluster", "Mirror Domain", "Mirror Cluster A", 86, "Need Review", [
    "ev-mirror-page",
  ]),
  entity(
    "ent-bonus-domain",
    "Domain",
    "promo-aman.club",
    81,
    "Verified",
    ["ev-bonus-meta"],
    ["sig-promo-content"],
    "case-bonus-aman",
  ),
  entity(
    "ent-bonus-link",
    "Referral Link",
    "/go/ref-demo",
    76,
    "Need Review",
    ["ev-bonus-link"],
    ["sig-referral"],
    "case-bonus-aman",
  ),
  entity(
    "ent-bonus-keyword",
    "Promo Keyword",
    "bonus member baru",
    70,
    "Draft",
    ["ev-bonus-screenshot"],
    ["sig-keyword-density"],
    "case-bonus-aman",
  ),
  entity(
    "ent-mirror-domain-a",
    "Mirror Domain",
    "mirror-cluster-a.example",
    87,
    "Verified",
    ["ev-mirror-meta", "ev-mirror-similarity"],
    ["sig-mirror"],
    "case-mirror-cluster",
  ),
  entity(
    "ent-mirror-domain-b",
    "Mirror Domain",
    "mirror-cluster-b.example",
    83,
    "Verified",
    ["ev-mirror-similarity"],
    ["sig-mirror"],
    "case-mirror-cluster",
  ),
  entity(
    "ent-mirror-redirect",
    "Referral Link",
    "/go/public",
    82,
    "Verified",
    ["ev-mirror-redirect"],
    ["sig-referral"],
    "case-mirror-cluster",
  ),
  entity(
    "ent-public-domain",
    "Domain",
    "lapor-demo.example",
    64,
    "Need Review",
    ["ev-public-report", "ev-public-check"],
    ["sig-keyword-density"],
    "case-public-report",
  ),
  entity(
    "ent-public-keyword",
    "Promo Keyword",
    "indikasi promosi",
    58,
    "Draft",
    ["ev-public-report"],
    ["sig-keyword-density"],
    "case-public-report",
  ),
];

export const initialRiskSignals: RiskSignal[] = [
  {
    id: "sig-promo-content",
    label: "Konten promosi judi online",
    weight: 25,
    confidence: 0.94,
    status: "Verified",
    description: "Kata slot, bonus, RTP, deposit, dan pola CTA promosi muncul berulang.",
  },
  {
    id: "sig-payment",
    label: "Indikasi pembayaran",
    weight: 20,
    confidence: 0.89,
    status: "Need Review",
    description: "Instruksi pembayaran tersamarkan ditemukan pada bukti visual sintetis.",
  },
  {
    id: "sig-mirror",
    label: "Mirror domain",
    weight: 20,
    confidence: 0.86,
    status: "Need Review",
    description: "Mirror cluster dan pola referral muncul pada bukti visual dan relasi.",
  },
  {
    id: "sig-public-channel",
    label: "Kanal promosi publik",
    weight: 15,
    confidence: 0.91,
    status: "Verified",
    description: "Handle publik ditemukan pada beberapa bukti dan graph relation.",
  },
  {
    id: "sig-referral",
    label: "Affiliate / referral link",
    weight: 10,
    confidence: 0.87,
    status: "Verified",
    description: "Parameter referral menghubungkan domain utama, alias, dan handle publik.",
  },
  {
    id: "sig-keyword-density",
    label: "Kepadatan kata kunci promosi",
    weight: 10,
    confidence: 0.82,
    status: "Verified",
    description: "Kata kunci promosi muncul pada teks halaman dan OCR visual.",
  },
];

export const initialGraphNodes: GraphNode[] = [
  graphNode(
    "node-domain-root",
    "domain",
    "slot-gacor88.xyz",
    "Domain utama",
    "Critical",
    "Need Review",
    92,
    380,
    230,
    "ent-domain-root",
  ),
  graphNode(
    "node-channel-promo",
    "channel",
    "promo-tg88",
    "Handle publik",
    "High",
    "Verified",
    86,
    20,
    40,
    "ent-channel-promo",
  ),
  graphNode(
    "node-payment",
    "payment",
    "PAY-88XX-5678",
    "Indikasi pembayaran",
    "Critical",
    "Need Review",
    89,
    740,
    40,
    "ent-payment-wallet",
  ),
  graphNode(
    "node-referral",
    "referral",
    "ref?id=synthetic",
    "Referral link",
    "High",
    "Verified",
    81,
    30,
    250,
    "ent-referral-param",
  ),
  graphNode(
    "node-mirror-a",
    "mirror",
    "Mirror Cluster A",
    "Mirror domain",
    "High",
    "Need Review",
    84,
    760,
    250,
    "ent-mirror-cluster",
  ),
  graphNode(
    "node-mirror-b",
    "mirror",
    "bonus-rtpku.example",
    "Sinyal ditolak",
    "Medium",
    "Rejected",
    62,
    720,
    440,
    "ent-domain-mirror-b",
  ),
  graphNode(
    "node-screenshot-promo",
    "screenshot",
    "screenshot_promo_001",
    "Bukti visual",
    "High",
    "Need Review",
    94,
    250,
    440,
    "ent-screenshot-promo",
  ),
  graphNode(
    "node-screenshot-payment",
    "screenshot",
    "screenshot_payment_002",
    "Bukti visual",
    "High",
    "Need Review",
    89,
    510,
    440,
    "ent-screenshot-payment",
  ),
  graphNode(
    "node-keyword-slot",
    "keyword",
    "slot / gacor",
    "Kata kunci",
    "High",
    "Verified",
    94,
    180,
    140,
    "ent-keyword-slot",
  ),
  graphNode(
    "node-keyword-bonus",
    "keyword",
    "bonus deposit",
    "Kata kunci",
    "High",
    "Verified",
    93,
    570,
    140,
    "ent-keyword-bonus",
  ),
  graphNode(
    "node-keyword-rtp",
    "keyword",
    "RTP tinggi",
    "Kata kunci",
    "High",
    "Verified",
    91,
    380,
    30,
    "ent-keyword-rtp",
  ),
  graphNode(
    "node-alias",
    "alias",
    "BANG-J88",
    "Alias operator",
    "High",
    "Need Review",
    88,
    960,
    140,
    "ent-alias-bang",
  ),
  graphNode(
    "node-html",
    "html",
    "section-promo-grid",
    "HTML pattern",
    "Medium",
    "Rejected",
    62,
    980,
    330,
    "ent-html-fingerprint",
  ),
  graphNode(
    "node-public-handle",
    "channel",
    "handle publik",
    "Dari halaman mirror",
    "High",
    "Verified",
    91,
    210,
    610,
    "ent-public-handle",
  ),
  graphNode(
    "node-redirect",
    "referral",
    "/go/referral-public",
    "Redirect publik",
    "Medium",
    "Need Review",
    79,
    610,
    610,
    "ent-redirect-public",
  ),
  graphNode(
    "node-bonus-domain",
    "domain",
    "promo-aman.club",
    "Domain promo",
    "High",
    "Verified",
    74,
    360,
    220,
    "ent-bonus-domain",
    "case-bonus-aman",
  ),
  graphNode(
    "node-bonus-link",
    "referral",
    "/go/ref-demo",
    "Tautan publik",
    "Medium",
    "Need Review",
    76,
    70,
    120,
    "ent-bonus-link",
    "case-bonus-aman",
  ),
  graphNode(
    "node-bonus-keyword",
    "keyword",
    "bonus member baru",
    "Kata kunci",
    "Medium",
    "Draft",
    70,
    650,
    120,
    "ent-bonus-keyword",
    "case-bonus-aman",
  ),
  graphNode(
    "node-bonus-shot",
    "screenshot",
    "screenshot_bonus_draft",
    "OCR draft",
    "Medium",
    "Draft",
    70,
    360,
    420,
    undefined,
    "case-bonus-aman",
  ),
  graphNode(
    "node-mirror-case-a",
    "domain",
    "mirror-cluster-a.example",
    "Mirror utama",
    "High",
    "Verified",
    87,
    310,
    190,
    "ent-mirror-domain-a",
    "case-mirror-cluster",
  ),
  graphNode(
    "node-mirror-case-b",
    "mirror",
    "mirror-cluster-b.example",
    "Mirror terkait",
    "High",
    "Verified",
    83,
    620,
    190,
    "ent-mirror-domain-b",
    "case-mirror-cluster",
  ),
  graphNode(
    "node-mirror-case-redirect",
    "referral",
    "/go/public",
    "Redirect publik",
    "Medium",
    "Verified",
    82,
    460,
    420,
    "ent-mirror-redirect",
    "case-mirror-cluster",
  ),
  graphNode(
    "node-public-domain",
    "domain",
    "lapor-demo.example",
    "Laporan publik",
    "Medium",
    "Need Review",
    64,
    330,
    210,
    "ent-public-domain",
    "case-public-report",
  ),
  graphNode(
    "node-public-keyword",
    "keyword",
    "indikasi promosi",
    "Sinyal terbatas",
    "Medium",
    "Draft",
    58,
    620,
    210,
    "ent-public-keyword",
    "case-public-report",
  ),
  graphNode(
    "node-public-check",
    "html",
    "link checker",
    "Hasil indikatif",
    "Low",
    "Draft",
    56,
    470,
    420,
    undefined,
    "case-public-report",
  ),
];

export const initialGraphEdges: GraphEdge[] = [
  edge(
    "edge-channel-domain",
    "node-channel-promo",
    "node-domain-root",
    "mengarahkan ke",
    "ev-referral-map",
    "Verified",
  ),
  edge(
    "edge-payment-domain",
    "node-payment",
    "node-domain-root",
    "instruksi pada",
    "ev-payment-image",
    "Need Review",
  ),
  edge(
    "edge-referral-domain",
    "node-referral",
    "node-domain-root",
    "parameter dari",
    "ev-outbound-links",
    "Need Review",
  ),
  edge(
    "edge-domain-mirror-a",
    "node-domain-root",
    "node-mirror-a",
    "mirip dengan",
    "ev-mirror-page",
    "Need Review",
  ),
  edge(
    "edge-domain-mirror-b",
    "node-domain-root",
    "node-mirror-b",
    "sinyal lemah",
    "ev-html-fingerprint",
    "Rejected",
  ),
  edge(
    "edge-promo-domain",
    "node-screenshot-promo",
    "node-domain-root",
    "bukti visual",
    "ev-screenshot-promo",
    "Need Review",
  ),
  edge(
    "edge-payment-shot-domain",
    "node-screenshot-payment",
    "node-domain-root",
    "bukti pembayaran",
    "ev-payment-image",
    "Need Review",
  ),
  edge(
    "edge-slot-shot",
    "node-keyword-slot",
    "node-screenshot-promo",
    "terbaca OCR",
    "ev-screenshot-promo",
    "Verified",
  ),
  edge(
    "edge-rtp-shot",
    "node-keyword-rtp",
    "node-screenshot-promo",
    "terbaca OCR",
    "ev-screenshot-promo",
    "Verified",
  ),
  edge(
    "edge-bonus-shot",
    "node-keyword-bonus",
    "node-screenshot-promo",
    "terbaca OCR",
    "ev-screenshot-promo",
    "Verified",
  ),
  edge(
    "edge-bonus-payment",
    "node-keyword-bonus",
    "node-payment",
    "muncul pada",
    "ev-payment-image",
    "Need Review",
  ),
  edge(
    "edge-mirror-alias",
    "node-mirror-a",
    "node-alias",
    "alias dari",
    "ev-mirror-page",
    "Need Review",
  ),
  edge(
    "edge-alias-channel",
    "node-alias",
    "node-channel-promo",
    "dipromosikan oleh",
    "ev-mirror-page",
    "Need Review",
  ),
  edge(
    "edge-html-mirror-b",
    "node-html",
    "node-mirror-b",
    "kemiripan lemah",
    "ev-html-fingerprint",
    "Rejected",
  ),
  edge(
    "edge-public-handle-channel",
    "node-public-handle",
    "node-channel-promo",
    "menyebut",
    "ev-mirror-page",
    "Verified",
  ),
  edge(
    "edge-redirect-referral",
    "node-redirect",
    "node-referral",
    "mengandung",
    "ev-outbound-links",
    "Need Review",
  ),
  edge(
    "edge-redirect-domain",
    "node-redirect",
    "node-domain-root",
    "keluar dari",
    "ev-outbound-links",
    "Need Review",
  ),
  edge(
    "edge-payment-screenshot",
    "node-payment",
    "node-screenshot-payment",
    "terlihat pada",
    "ev-payment-image",
    "Need Review",
  ),
  edge(
    "edge-mirror-screenshot",
    "node-mirror-a",
    "node-public-handle",
    "memuat handle",
    "ev-mirror-page",
    "Verified",
  ),
  edge(
    "edge-bonus-link-domain",
    "node-bonus-link",
    "node-bonus-domain",
    "mengarah ke",
    "ev-bonus-link",
    "Need Review",
    "case-bonus-aman",
  ),
  edge(
    "edge-bonus-keyword-domain",
    "node-bonus-keyword",
    "node-bonus-domain",
    "muncul pada",
    "ev-bonus-meta",
    "Verified",
    "case-bonus-aman",
  ),
  edge(
    "edge-bonus-shot-keyword",
    "node-bonus-shot",
    "node-bonus-keyword",
    "terbaca OCR",
    "ev-bonus-screenshot",
    "Draft",
    "case-bonus-aman",
  ),
  edge(
    "edge-mirror-a-b",
    "node-mirror-case-a",
    "node-mirror-case-b",
    "mirip dengan",
    "ev-mirror-similarity",
    "Verified",
    "case-mirror-cluster",
  ),
  edge(
    "edge-mirror-redirect",
    "node-mirror-case-a",
    "node-mirror-case-redirect",
    "redirect publik",
    "ev-mirror-redirect",
    "Verified",
    "case-mirror-cluster",
  ),
  edge(
    "edge-public-domain-keyword",
    "node-public-keyword",
    "node-public-domain",
    "indikasi dari laporan",
    "ev-public-report",
    "Need Review",
    "case-public-report",
  ),
  edge(
    "edge-public-check-domain",
    "node-public-check",
    "node-public-domain",
    "hasil terbatas",
    "ev-public-check",
    "Draft",
    "case-public-report",
  ),
];

export const initialAuditEvents: AuditEvent[] = [
  audit("audit-seed", "09:10", "Seed divalidasi", "URL publik tidak memerlukan login."),
  audit(
    "audit-crawl",
    "09:12",
    "Bukti dikumpulkan",
    "Metadata, HTML, tautan, dan screenshot tersimpan.",
  ),
  audit(
    "audit-ocr",
    "09:15",
    "OCR selesai",
    "Tiga bukti visual menghasilkan entitas dengan confidence tinggi.",
  ),
  audit(
    "audit-score",
    "09:22",
    "Skor risiko dihitung",
    "Initial heuristic menghasilkan skor 92/100.",
  ),
  audit(
    "audit-review",
    "09:38",
    "Menunggu human review",
    "Beberapa bukti pembayaran dan mirror perlu validasi investigator.",
  ),
];

export const publicReportStats: PublicReportSummary[] = [
  { label: "Domain terverifikasi", value: "18" },
  { label: "Laporan publik diterima", value: "42" },
  { label: "Bukti visual diproses", value: "31" },
  { label: "Kategori umum", value: "Promosi" },
];

export const initialLinkCheckResult: LinkCheckResult = {
  input: "example.com",
  level: "Indikasi Sedang",
  score: 56,
  description:
    "Ditemukan pola kata kunci umum. Hasil publik bersifat indikatif dan bukan hasil investigasi penuh.",
  signals: ["kata kunci promosi", "domain belum diverifikasi investigator"],
};

function entity(
  id: string,
  type: EntityType,
  value: string,
  confidence: number,
  status: VerificationStatus,
  evidenceIds: string[],
  riskSignalIds: string[] = [],
  caseId = "case-slot-gacor88",
): DetectedEntity {
  return {
    id,
    caseId,
    type,
    value,
    confidence,
    status,
    evidenceIds,
    riskSignalIds,
    note: "Confidence dipengaruhi kualitas OCR, kecocokan pola, bukti berulang, dan status review.",
  };
}

function graphNode(
  id: string,
  type: GraphNodeType,
  label: string,
  subtitle: string,
  riskLevel: RiskLevel,
  status: VerificationStatus,
  score: number,
  x: number,
  y: number,
  entityId?: string,
  caseId = "case-slot-gacor88",
): GraphNode {
  return {
    id,
    caseId,
    entityId,
    type,
    label,
    subtitle,
    riskLevel,
    status,
    score,
    position: { x, y },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  relation: string,
  evidenceId: string,
  status: VerificationStatus,
  caseId = "case-slot-gacor88",
): GraphEdge {
  return { id, caseId, source, target, relation, evidenceId, status };
}

function audit(id: string, at: string, action: string, detail: string): AuditEvent {
  return {
    id,
    caseId: "case-slot-gacor88",
    at: `30 Mei 2026, ${at} WIB`,
    actor: "Andi Pratama",
    action,
    detail,
  };
}
