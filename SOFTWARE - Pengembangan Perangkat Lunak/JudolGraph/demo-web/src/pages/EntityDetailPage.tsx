import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Flag,
  Globe2,
  Network,
  Pencil,
  Send,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { entities, primaryCase, timelineEvents } from '../data/mockData'
import { riskLabel } from '../lib/utils'
import { Badge, Button, Card } from '../components/ui'

const riskSignals = [
  'Promosi agresif',
  'Pembayaran anonim',
  'Deteksi deposit',
  'Banyak mirror domain',
  'Konten judi online terdeteksi',
  'Reputasi berisiko',
]

const connectedEvidence: Array<{
  label: string
  value: number
  icon: LucideIcon
}> = [
  { label: 'Mirror', value: 23, icon: Network },
  { label: 'Telegram', value: 5, icon: Send },
  { label: 'Screenshot', value: 142, icon: Camera },
  { label: 'Pembayaran', value: 8, icon: WalletCards },
]

export function EntityDetailPage() {
  const { id } = useParams()
  const entity = entities.find((item) => item.id === id) ?? entities[0]

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"
        to="/app/evidence-graph"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Evidence Graph
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Globe2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950">{entity.label}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="outline">Tipe: Domain</Badge>
                <Badge tone="red">{riskLabel(entity.riskLevel)}</Badge>
                <Badge tone="green">Status: Aktif</Badge>
                <Badge tone="red">Skor Risiko {entity.riskScore ?? 92}/100</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="danger">
              <Flag className="h-4 w-4" />
              Tandai Risiko
            </Button>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              Ubah Status
            </Button>
            <Link to="/app/evidence-graph">
              <Button variant="secondary">
                <Network className="h-4 w-4" />
                Buka di Graph
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr_0.8fr]">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Ringkasan Domain</h2>
            <p className="mt-3 leading-7 text-slate-600">{primaryCase.summary}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Waktu Pertama Ditemukan', '12 Mei 2025 10:21'],
              ['Terakhir Dilihat', '18 Mei 2025 09:14'],
              ['Lokasi Server', 'Singapura'],
              ['ASN', 'AS13335 Cloudflare, Inc.'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <p className="mt-3 text-sm text-slate-500">Status Review</p>
            <p className="font-bold text-emerald-700">Human-reviewed</p>
            <p className="mt-3 text-sm text-slate-600">Reviewer: Andi Pratama</p>
            <p className="text-sm text-slate-600">18 Mei 2025 09:10</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">Risk Signals</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {riskSignals.map((signal) => (
              <Badge key={signal} tone="red">{signal}</Badge>
            ))}
          </div>
        </Card>
        <Card className="p-5 lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-950">Connected Evidence</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {connectedEvidence.map(({ label, value, icon: Icon }) => (
              <div className="rounded-lg bg-slate-50 p-4 text-center" key={label}>
                <Icon className="mx-auto h-5 w-5 text-blue-600" />
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Timeline Temuan</h2>
          <div className="mt-5 space-y-4">
            {timelineEvents.map((event) => (
              <div className="flex gap-3" key={event.id}>
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                  <p className="text-sm text-slate-500">{event.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Bukti Terhubung</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[
              ['Screenshot', 'sc_slot-gacor88_180525.png', Camera],
              ['Telegram Post', 'tg_promo-tg88_180525.jpg', Send],
              ['Mirror Domain', 'mirror_slot-gacor88-net.png', Globe2],
              ['Pembayaran', 'pay_qris_180525.jpg', WalletCards],
            ].map(([type, title, Icon]) => (
              <div className="rounded-lg border border-slate-200 p-4" key={title as string}>
                <Icon className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{type as string}</p>
                <p className="mt-1 break-words text-xs text-slate-500">{title as string}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
