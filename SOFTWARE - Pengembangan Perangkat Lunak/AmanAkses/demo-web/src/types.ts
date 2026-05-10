export type AccessibilityNeed =
  | 'screen-reader'
  | 'high-contrast'
  | 'large-controls'
  | 'easy-read'
  | 'voice-note'
  | 'sign-language'
  | 'reduced-motion'

export type EvidenceType = 'foto' | 'audio' | 'chat' | 'dokumen' | 'catatan-medis'
export type ConsentScope = 'ringkasan' | 'kronologi' | 'bukti-terpilih' | 'kebutuhan-akses' | 'kontak'
export type HelpChannel = 'WhatsApp' | 'Telepon' | 'Tatap muka' | 'Online'

export interface AccessibilityProfile {
  textScale: 'normal' | 'besar' | 'sangat-besar'
  highContrast: boolean
  easyRead: boolean
  largeControls: boolean
  reducedMotion: boolean
  enabledNeeds: AccessibilityNeed[]
}

export interface UserProfile {
  alias: string
  pronoun: string
  safetyPhrase: string
  lastSavedAt: string
  accessibilityNeeds: AccessibilityNeed[]
}

export interface LearningModule {
  id: string
  title: string
  summary: string
  duration: string
  format: Array<'teks' | 'audio' | 'video-isyarat' | 'easy-read'>
  status: 'belum' | 'dibaca' | 'disimpan'
}

export interface JournalEntry {
  id: string
  date: string
  mood: string
  title: string
  summary: string
  tags: string[]
  hasVoiceNote: boolean
  linkedEvidenceIds: string[]
}

export interface EvidenceFile {
  id: string
  type: EvidenceType
  title: string
  capturedAt: string
  size: string
  hash: string
  tags: string[]
  note: string
}

export interface TimelineEvent {
  id: string
  date: string
  time: string
  title: string
  location: string
  summary: string
  evidenceIds: string[]
  included: boolean
}

export interface TrustedCompanion {
  id: string
  name: string
  role: string
  status: 'aktif' | 'tersedia' | 'belum-diizinkan'
  channel: HelpChannel
  contact: string
  scopes: ConsentScope[]
}

export interface ConsentGrant {
  id: string
  recipient: string
  scopes: ConsentScope[]
  expiresAt: string
  status: 'aktif' | 'dicabut' | 'draft'
}

export interface ServiceProvider {
  id: string
  name: string
  category: string
  city: string
  channels: HelpChannel[]
  accessibility: AccessibilityNeed[]
  availability: string
}

export interface ReportDraft {
  id: string
  title: string
  updatedAt: string
  sections: Array<{
    title: string
    status: 'siap' | 'perlu-cek'
    summary: string
  }>
}

export interface AuditLogEntry {
  id: string
  at: string
  action: string
  actor: string
}
