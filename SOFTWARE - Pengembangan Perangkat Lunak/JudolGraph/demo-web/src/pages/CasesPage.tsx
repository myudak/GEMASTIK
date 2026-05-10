import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  FolderOpen,
  Plus,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { Badge, Button, Card, Input } from '../components/ui'
import { cases } from '../data/mockData'
import { riskLabel } from '../lib/utils'

function statusLabel(status: string) {
  if (status === 'investigating') return 'Investigasi'
  if (status === 'review') return 'Ditinjau'
  if (status === 'open') return 'Dibuka'
  if (status === 'closed') return 'Ditutup'
  return 'Arsip'
}

export function CasesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Kasus</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola seed investigasi, status review, dan progres bukti.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Kasus Baru
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Cari kasus, seed, investigator..." />
          </div>
          <Button variant="secondary">
            <CalendarDays className="h-4 w-4" />
            12 Mei - 18 Mei 2025
          </Button>
          <Button variant="secondary">Semua Status</Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {cases.map((item) => (
          <Card className="p-5" key={item.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FolderOpen className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
                    <Badge tone={item.riskLevel === 'high' ? 'red' : 'amber'}>
                      {riskLabel(item.riskLevel)}
                    </Badge>
                    <Badge tone="blue">{statusLabel(item.status)}</Badge>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {item.summary}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-4">
                    <span>Seed: {item.seed}</span>
                    <span>Entitas: {item.entityCount}</span>
                    <span>Bukti: {item.evidenceCount}</span>
                    <span>Investigator: {item.investigator}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary">
                  <ShieldAlert className="h-4 w-4" />
                  Review
                </Button>
                <Link to="/app/evidence-graph">
                  <Button>
                    Buka Graph
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
