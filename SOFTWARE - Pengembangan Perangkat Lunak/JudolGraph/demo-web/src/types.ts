export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type EntityType =
  | 'domain'
  | 'telegram'
  | 'payment'
  | 'alias'
  | 'screenshot'
  | 'affiliate'
  | 'mirror'
  | 'infrastructure'

export interface Case {
  id: string
  title: string
  seed: string
  status: 'open' | 'investigating' | 'review' | 'closed' | 'archived'
  riskScore: number
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
  investigator: string
  summary: string
  entityCount: number
  evidenceCount: number
}

export interface Entity {
  id: string
  type: EntityType
  label: string
  subtitle?: string
  riskScore?: number
  riskLevel?: RiskLevel
  confidence?: number
  status?: string
  metadata?: Record<string, string | number>
}

export interface Relation {
  id: string
  source: string
  target: string
  label: string
  confidence: number
}

export interface Evidence {
  id: string
  type:
    | 'domain'
    | 'telegram'
    | 'payment'
    | 'screenshot'
    | 'alias'
    | 'mirror'
    | 'affiliate'
  title: string
  source: string
  status: 'verified' | 'partial' | 'processing' | 'rejected'
  timestamp: string
  hash?: string
  confidence?: number
}

export interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description: string
  type: EntityType | 'system' | 'review'
  severity?: RiskLevel
}

export interface ScreenshotEvidence {
  id: string
  fileName: string
  imageSrc: string
  uploadedAt: string
  status: 'verified' | 'needs-review' | 'processing'
  ocrScore: number
  imageTitle: string
  imageSubtitle: string
  imageAccent: 'amber' | 'orange' | 'blue' | 'violet'
  metadata: {
    fileType: string
    size: string
    resolution: string
    source: string
    domain: string
    hash: string
  }
  ocrText: string[]
  extractedEntities: Array<{
    label: string
    value: string
    type: string
    confidence: number
  }>
  verifiedBy: string
  verifiedAt: string
}
