import type {
  AccessibilityProfile,
  AuditLogEntry,
  ConsentGrant,
  EvidenceFile,
  JournalEntry,
  LearningModule,
  ReportDraft,
  ServiceProvider,
  TimelineEvent,
  TrustedCompanion,
  UserProfile,
} from '../types'

export const userProfile: UserProfile = {
  alias: 'Siti',
  pronoun: 'Kamu',
  safetyPhrase: 'Ruangmu aman dan pribadi',
  lastSavedAt: '10:24 WIB',
  accessibilityNeeds: ['easy-read', 'voice-note', 'sign-language', 'large-controls'],
}

export const accessibilityProfile: AccessibilityProfile = {
  textScale: 'besar',
  highContrast: false,
  easyRead: true,
  largeControls: true,
  reducedMotion: false,
  enabledNeeds: ['screen-reader', 'easy-read', 'voice-note', 'sign-language'],
}

export const learningModules: LearningModule[] = [
  {
    id: 'batas-aman',
    title: 'Mengenali batas aman',
    summary: 'Penjelasan sederhana tentang persetujuan, rasa tidak nyaman, dan hak untuk berkata tidak.',
    duration: '6 menit',
    format: ['teks', 'audio', 'easy-read'],
    status: 'dibaca',
  },
  {
    id: 'mencari-bantuan',
    title: 'Mencari bantuan tanpa terburu-buru',
    summary: 'Langkah kecil untuk memilih orang tepercaya dan layanan yang sesuai kebutuhanmu.',
    duration: '8 menit',
    format: ['teks', 'video-isyarat', 'easy-read'],
    status: 'disimpan',
  },
  {
    id: 'menyimpan-bukti',
    title: 'Menyimpan bukti dengan aman',
    summary: 'Cara memberi label, menyimpan konteks, dan memilih bukti yang ingin dibagikan.',
    duration: '7 menit',
    format: ['teks', 'audio'],
    status: 'belum',
  },
  {
    id: 'hak-akses',
    title: 'Hak dan akomodasi aksesibel',
    summary: 'Daftar hak dasar, kebutuhan akses, dan contoh kalimat untuk meminta pendampingan.',
    duration: '5 menit',
    format: ['teks', 'video-isyarat', 'easy-read'],
    status: 'belum',
  },
]

export const journalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    date: '20 Mei 2026',
    mood: 'Biasa saja',
    title: 'Catatan setelah kegiatan kampus',
    summary: 'Ringkasan netral tentang situasi yang ingin diingat, tanpa detail grafis.',
    tags: ['kampus', 'perlu-ditinjau'],
    hasVoiceNote: true,
    linkedEvidenceIds: ['ev-chat-1', 'ev-doc-1'],
  },
  {
    id: 'journal-2',
    date: '21 Mei 2026',
    mood: 'Sedih',
    title: 'Percakapan dengan pendamping',
    summary: 'Mencatat pertanyaan yang ingin dibawa saat berbicara dengan pendamping tepercaya.',
    tags: ['pendamping', 'draft'],
    hasVoiceNote: false,
    linkedEvidenceIds: ['ev-audio-1'],
  },
  {
    id: 'journal-3',
    date: '22 Mei 2026',
    mood: 'Lebih tenang',
    title: 'Menyusun langkah berikutnya',
    summary: 'Memilih bukti yang relevan dan menyiapkan kebutuhan akses untuk laporan awal.',
    tags: ['laporan-awal', 'aksesibilitas'],
    hasVoiceNote: true,
    linkedEvidenceIds: ['ev-photo-1', 'ev-doc-2'],
  },
]

export const evidenceFiles: EvidenceFile[] = [
  {
    id: 'ev-photo-1',
    type: 'foto',
    title: 'foto_lokasi_netral_01.jpg',
    capturedAt: '20 Mei 2026, 14:32',
    size: '1.7 MB',
    hash: 'SHA-256 9F2A...7C1B',
    tags: ['lokasi', 'terpilih'],
    note: 'Foto konteks tempat umum, tanpa wajah atau data pribadi.',
  },
  {
    id: 'ev-audio-1',
    type: 'audio',
    title: 'rekaman_catatan_suara.m4a',
    capturedAt: '21 Mei 2026, 16:10',
    size: '2:34',
    hash: 'SHA-256 18AC...B92E',
    tags: ['catatan-suara'],
    note: 'Catatan suara pribadi yang hanya tersimpan di perangkat demo.',
  },
  {
    id: 'ev-chat-1',
    type: 'chat',
    title: 'ringkasan_percakapan.txt',
    capturedAt: '20 Mei 2026, 13:47',
    size: '28 KB',
    hash: 'SHA-256 A11D...82EF',
    tags: ['chat', 'perlu-redaksi'],
    note: 'Ringkasan sintetis, bukan percakapan nyata.',
  },
  {
    id: 'ev-doc-1',
    type: 'dokumen',
    title: 'surat_keterangan_simulasi.pdf',
    capturedAt: '22 Mei 2026, 17:20',
    size: '1.2 MB',
    hash: 'SHA-256 E0B4...9C20',
    tags: ['dokumen'],
    note: 'Dokumen dummy untuk memperlihatkan metadata dan status enkripsi.',
  },
  {
    id: 'ev-doc-2',
    type: 'catatan-medis',
    title: 'catatan_kondisi_umum.pdf',
    capturedAt: '22 Mei 2026, 18:10',
    size: '0.8 MB',
    hash: 'SHA-256 52BD...01AA',
    tags: ['kebutuhan-akses'],
    note: 'Catatan sintetis tentang kebutuhan akses, bukan data medis nyata.',
  },
]

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'tl-1',
    date: '20 Mei 2026',
    time: '13:30',
    title: 'Situasi dicatat',
    location: 'Area publik kampus',
    summary: 'Pengguna mencatat situasi yang terasa tidak aman dan menyimpan konteks dasar.',
    evidenceIds: ['ev-chat-1'],
    included: true,
  },
  {
    id: 'tl-2',
    date: '20 Mei 2026',
    time: '14:32',
    title: 'Bukti konteks ditambahkan',
    location: 'Lokasi umum',
    summary: 'Foto lokasi netral disimpan untuk membantu mengingat urutan kejadian.',
    evidenceIds: ['ev-photo-1'],
    included: true,
  },
  {
    id: 'tl-3',
    date: '21 Mei 2026',
    time: '16:10',
    title: 'Catatan suara pribadi',
    location: 'Ruang pribadi',
    summary: 'Pengguna menambahkan catatan suara untuk diri sendiri dan belum membagikannya.',
    evidenceIds: ['ev-audio-1'],
    included: false,
  },
  {
    id: 'tl-4',
    date: '22 Mei 2026',
    time: '18:10',
    title: 'Kebutuhan akses disiapkan',
    location: 'Aplikasi AmanAkses',
    summary: 'Kebutuhan akses dicatat agar pendamping memahami cara komunikasi yang nyaman.',
    evidenceIds: ['ev-doc-2'],
    included: true,
  },
]

export const trustedCompanions: TrustedCompanion[] = [
  {
    id: 'cmp-1',
    name: 'Siti Rahma',
    role: 'Sahabat',
    status: 'aktif',
    channel: 'WhatsApp',
    contact: 'Kontak simulasi',
    scopes: ['ringkasan', 'kebutuhan-akses'],
  },
  {
    id: 'cmp-2',
    name: 'Universitas Aman',
    role: 'Satgas PPKS',
    status: 'tersedia',
    channel: 'Telepon',
    contact: 'Layanan kampus simulasi',
    scopes: ['ringkasan', 'kronologi', 'bukti-terpilih'],
  },
  {
    id: 'cmp-3',
    name: 'LBH Perempuan',
    role: 'Bantuan hukum',
    status: 'tersedia',
    channel: 'Online',
    contact: 'Form konsultasi simulasi',
    scopes: ['ringkasan'],
  },
  {
    id: 'cmp-4',
    name: 'RuangPulih',
    role: 'Psikolog',
    status: 'belum-diizinkan',
    channel: 'Tatap muka',
    contact: 'Janji temu simulasi',
    scopes: [],
  },
]

export const consentGrants: ConsentGrant[] = [
  {
    id: 'consent-1',
    recipient: 'Siti Rahma',
    scopes: ['ringkasan', 'kebutuhan-akses'],
    expiresAt: '7 hari',
    status: 'aktif',
  },
  {
    id: 'consent-2',
    recipient: 'Universitas Aman',
    scopes: ['ringkasan', 'kronologi', 'bukti-terpilih'],
    expiresAt: '24 jam setelah dibuka',
    status: 'draft',
  },
]

export const serviceProviders: ServiceProvider[] = [
  {
    id: 'svc-1',
    name: 'Pusat Bantuan Kampus Aman',
    category: 'Satgas PPKS',
    city: 'Jakarta',
    channels: ['WhatsApp', 'Tatap muka'],
    accessibility: ['screen-reader', 'sign-language', 'large-controls'],
    availability: 'Senin-Jumat, 09.00-16.00',
  },
  {
    id: 'svc-2',
    name: 'Konseling RuangPulih',
    category: 'Konseling',
    city: 'Bandung',
    channels: ['Online', 'Telepon'],
    accessibility: ['easy-read', 'voice-note'],
    availability: 'Setiap hari, 10.00-20.00',
  },
  {
    id: 'svc-3',
    name: 'Akses Bantuan Hukum',
    category: 'Bantuan hukum',
    city: 'Yogyakarta',
    channels: ['Online', 'Tatap muka'],
    accessibility: ['screen-reader', 'high-contrast'],
    availability: 'Selasa-Kamis, 13.00-17.00',
  },
  {
    id: 'svc-4',
    name: 'Komunitas Dengar Aman',
    category: 'Komunitas dukungan',
    city: 'Surabaya',
    channels: ['WhatsApp', 'Online'],
    accessibility: ['sign-language', 'easy-read'],
    availability: 'Respons bertahap',
  },
]

export const reportDraft: ReportDraft = {
  id: 'report-1',
  title: 'Laporan awal AmanAkses',
  updatedAt: '22 Mei 2026, 20:16 WIB',
  sections: [
    {
      title: 'Ringkasan pengguna',
      status: 'siap',
      summary: 'Alias, kebutuhan akses, dan status persetujuan dibaca ulang sebelum dibagikan.',
    },
    {
      title: 'Kronologi terpilih',
      status: 'siap',
      summary: '3 dari 4 peristiwa dipilih untuk laporan awal.',
    },
    {
      title: 'Daftar bukti',
      status: 'perlu-cek',
      summary: '2 bukti siap dibagikan, 1 bukti menunggu redaksi data sensitif.',
    },
    {
      title: 'Kebutuhan bantuan',
      status: 'siap',
      summary: 'Pendamping, komunikasi teks, dan waktu jeda konfirmasi dicatat.',
    },
  ],
}

export const auditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    at: '22 Mei 2026, 20:16',
    action: 'Draft laporan diperbarui',
    actor: 'Siti',
  },
  {
    id: 'audit-2',
    at: '22 Mei 2026, 19:42',
    action: 'Izin berbagi disiapkan',
    actor: 'Siti',
  },
  {
    id: 'audit-3',
    at: '22 Mei 2026, 18:10',
    action: 'Catatan kebutuhan akses ditambahkan',
    actor: 'Siti',
  },
]
