import { useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import { motion } from 'motion/react'
import {
  Download,
  Filter,
  Globe2,
  Maximize2,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import {
  entities,
  entityFilters,
  graphPositions,
  graphSummary,
  relations,
} from '../data/mockData'
import type { Entity, EntityType } from '../types'
import { riskLabel } from '../lib/utils'
import { Badge, Button, Card, Input } from '../components/ui'
import { MotionItem, MotionPage, Stagger } from '../components/Motion'

const entityColors: Record<
  EntityType,
  { border: string; background: string; color: string }
> = {
  domain: { border: '#93c5fd', background: '#eff6ff', color: '#1d4ed8' },
  telegram: { border: '#ddd6fe', background: '#f5f3ff', color: '#6d28d9' },
  payment: { border: '#bbf7d0', background: '#f0fdf4', color: '#15803d' },
  alias: { border: '#fed7aa', background: '#fff7ed', color: '#c2410c' },
  screenshot: { border: '#fecaca', background: '#fef2f2', color: '#dc2626' },
  affiliate: { border: '#fde68a', background: '#fffbeb', color: '#b45309' },
  mirror: { border: '#bfdbfe', background: '#f8fbff', color: '#2563eb' },
  infrastructure: { border: '#cbd5e1', background: '#f8fafc', color: '#475569' },
}

const relationColors = ['#2563eb', '#7c3aed', '#16a34a', '#f59e0b', '#ef4444']

function nodeStyle(entity: Entity, selected: boolean): CSSProperties {
  const color = entityColors[entity.type]
  return {
    width: entity.id === 'domain-main' ? 190 : 160,
    borderRadius: 8,
    border: `1.5px solid ${selected ? '#2563eb' : color.border}`,
    background: color.background,
    color: color.color,
    boxShadow: selected ? '0 0 0 4px rgba(37, 99, 235, 0.12)' : 'none',
    fontSize: 12,
    fontWeight: 700,
    padding: 12,
  }
}

function DetailPanel({ entity }: { entity: Entity }) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="h-full"
      initial={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.38 }}
    >
      <Card className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Globe2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">{entity.label}</h2>
            <Badge tone={entity.riskLevel === 'high' ? 'red' : 'amber'}>
              {riskLabel(entity.riskLevel)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        {[
          ['Tipe', entity.type],
          ['Status', entity.status ?? 'Aktif'],
          ['Pertama Ditemukan', entity.metadata?.['Pertama ditemukan'] ?? '12 Mei 2025 10:21'],
          ['Terakhir Dilihat', entity.metadata?.['Terakhir dilihat'] ?? '18 Mei 2025 09:14'],
          ['ASN', entity.metadata?.ASN ?? 'AS13335 Cloudflare, Inc.'],
          ['Lokasi Server', entity.metadata?.['Lokasi Server'] ?? 'Singapura'],
          ['Tingkat Keyakinan', `${entity.confidence ?? 87}%`],
        ].map(([label, value]) => (
          <div className="flex justify-between gap-4" key={label}>
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-bold text-slate-950">Keterkaitan</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            ['Telegram Channel', 4],
            ['Pembayaran', 4],
            ['Alias Operator', 3],
            ['Affiliate Link', 3],
            ['Screenshot', 3],
            ['Mirror Domain', 8],
          ].map(([label, value]) => (
            <div className="rounded-lg bg-slate-50 p-3" key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-bold text-slate-950">Indikator Risiko</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Sebaran Promosi</span>
            <Badge tone="red">Sangat Luas</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Umur Domain</span>
            <span className="font-semibold">7 hari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Skor Risiko Keseluruhan</span>
            <Badge tone="red">{entity.riskScore ?? 85}/100</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Button className="w-full" variant="secondary">Lihat Timeline</Button>
        <Button className="w-full" variant="secondary">
          <Download className="h-4 w-4" />
          Export Subgraph
        </Button>
        <Button className="w-full">
          <Plus className="h-4 w-4" />
          Tambah ke Kasus
        </Button>
      </div>
      </Card>
    </motion.div>
  )
}

export function EvidenceGraphPage() {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<EntityType | 'all'>('all')
  const [selectedId, setSelectedId] = useState('domain-main')

  const filteredEntities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return entities.filter((entity) => {
      const matchesType = activeType === 'all' || entity.type === activeType
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entity.label.toLowerCase().includes(normalizedQuery) ||
        entity.subtitle?.toLowerCase().includes(normalizedQuery)
      return matchesType && matchesQuery
    })
  }, [activeType, query])

  const visibleIds = useMemo(
    () => new Set(filteredEntities.map((entity) => entity.id)),
    [filteredEntities],
  )

  const nodes = useMemo<Node[]>(() => {
    return filteredEntities.map((entity) => ({
      id: entity.id,
      position: graphPositions[entity.id] ?? { x: 0, y: 0 },
      data: {
        label: `${entity.label}${entity.subtitle ? `\n${entity.subtitle}` : ''}`,
      },
      style: nodeStyle(entity, entity.id === selectedId),
    }))
  }, [filteredEntities, selectedId])

  const edges = useMemo<Edge[]>(() => {
    return relations
      .filter((relation) => visibleIds.has(relation.source) && visibleIds.has(relation.target))
      .map((relation, index) => ({
        id: relation.id,
        source: relation.source,
        target: relation.target,
        label: relation.label,
        animated: true,
        type: 'smoothstep',
        style: { stroke: relationColors[index % relationColors.length] },
        labelStyle: { fill: '#334155', fontSize: 11, fontWeight: 600 },
      }))
  }, [visibleIds])

  const selectedEntity =
    entities.find((entity) => entity.id === selectedId) ?? entities[0]

  return (
    <MotionPage className="space-y-5">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-3"
        initial={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Evidence Graph</h1>
          <p className="mt-1 text-sm text-slate-500">
            Telusuri dan analisis hubungan antar entitas dalam jaringan judi online.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Kasus Baru
          </Button>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: 0.08, duration: 0.36 }}
      >
        <Card className="p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari domain, alias, Telegram, rekening, e-wallet, atau hash..."
              value={query}
            />
          </div>
          <Button
            onClick={() => {
              setQuery('')
              setActiveType('all')
            }}
            variant="ghost"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {entityFilters.map((filter) => (
            <button
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                activeType === filter.value
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
              }`}
              key={filter.value}
              onClick={() => setActiveType(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {graphSummary.map((item) => (
              <MotionItem key={item.label}>
                <Card className="p-4">
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                  <p className={`mt-1 text-2xl font-black ${item.tone === 'red' ? 'text-red-600' : item.tone === 'green' ? 'text-emerald-600' : 'text-slate-950'}`}>
                    {item.value}
                  </p>
                </Card>
              </MotionItem>
            ))}
          </Stagger>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.985 }}
            transition={{ delay: 0.14, duration: 0.45 }}
          >
            <Card className="relative h-[720px] overflow-hidden">
            <ReactFlow
              edges={edges}
              fitView
              nodes={nodes}
              onNodeClick={(_, node) => setSelectedId(node.id)}
            >
              <Background color="#dbeafe" gap={28} />
              <MiniMap pannable zoomable />
              <Controls />
            </ReactFlow>
            <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
              <Maximize2 className="h-4 w-4" />
              Scroll dan zoom untuk menelusuri graph
            </div>
            </Card>
          </motion.div>
        </div>
        <DetailPanel entity={selectedEntity} />
      </div>
    </MotionPage>
  )
}
