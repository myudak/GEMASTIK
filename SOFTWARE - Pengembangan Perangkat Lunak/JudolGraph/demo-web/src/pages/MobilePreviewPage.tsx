import {
  Bell,
  Briefcase,
  Camera,
  ChevronRight,
  Globe2,
  Home,
  Network,
  Plus,
  Send,
  Settings,
  User,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, Button } from '../components/ui'
import { mobileNotifications, primaryCase, timelineEvents } from '../data/mockData'

const mobileNavItems: Array<{ label: string; icon: LucideIcon; primary?: boolean }> =
  [
    { label: 'Dashboard', icon: Home },
    { label: 'Kasus', icon: Briefcase },
    { label: '', icon: Plus, primary: true },
    { label: 'Notifikasi', icon: Bell },
    { label: 'Akun', icon: User },
  ]

const caseMetrics: Array<{ label: string; value: number; icon: LucideIcon }> = [
  { label: 'Entitas', value: 186, icon: Users },
  { label: 'Bukti', value: 412, icon: Camera },
  { label: 'Telegram', value: 23, icon: Send },
  { label: 'Pembayaran', value: 12, icon: WalletCards },
]

function PhoneShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[2rem] border-8 border-slate-900 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <span className="text-sm font-bold text-slate-950">9:41</span>
        <span className="text-sm font-bold text-slate-950">{title}</span>
        <Settings className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-h-[680px] px-5 py-4">{children}</div>
      <div className="grid grid-cols-5 border-t border-slate-100 px-3 py-3 text-center text-[11px] text-slate-500">
        {mobileNavItems.map(({ label, icon: Icon, primary }) => (
          <div className="flex flex-col items-center gap-1" key={label || 'primary'}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${primary ? 'bg-blue-600 text-white' : 'text-blue-600'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MobilePreviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Mobile Case Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kasus dan notifikasi temuan baru untuk investigator.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PhoneShell title="JudolGraph">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Globe2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">{primaryCase.seed}</h2>
                  <div className="mt-2 flex gap-2">
                    <Badge tone="outline">Domain</Badge>
                    <Badge tone="red">High Risk</Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Badge tone="red">Skor Risiko: 92 / 100</Badge>
              <Badge tone="green">Status: Aktif</Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {caseMetrics.map(({ label, value, icon: Icon }) => (
              <div className="rounded-lg border border-slate-200 p-3 text-center" key={label}>
                <Icon className="mx-auto h-4 w-4 text-blue-600" />
                <p className="mt-2 font-black text-slate-950">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <h3 className="font-bold text-slate-950">Ringkasan Kasus</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{primaryCase.summary}</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <h3 className="font-bold text-slate-950">Aktivitas Terbaru</h3>
              <span className="text-sm font-semibold text-blue-600">Lihat Semua</span>
            </div>
            {timelineEvents.slice(1, 5).map((event) => (
              <div className="flex gap-3 text-sm" key={event.id}>
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Network className="h-4 w-4" />
              Lihat Graph
            </Button>
            <Button>Review Kasus</Button>
          </div>
        </PhoneShell>

        <PhoneShell title="Notifikasi">
          <div className="mb-4 flex gap-2">
            {['Semua', 'Belum Dibaca', 'Penting'].map((tab, index) => (
              <Badge key={tab} tone={index === 0 ? 'blue' : 'outline'}>{tab}</Badge>
            ))}
          </div>
          <div className="space-y-3">
            {mobileNotifications.map((notification) => (
              <div className="rounded-lg border border-slate-200 p-4" key={notification.title}>
                <div className="flex justify-between gap-3">
                  <h2 className="font-bold text-slate-950">{notification.title}</h2>
                  <span className="text-xs text-slate-500">{notification.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notification.detail}</p>
                <Badge className="mt-3" tone={notification.priority === 'Tinggi' || notification.priority === 'Penting' ? 'red' : 'green'}>
                  {notification.priority}
                </Badge>
              </div>
            ))}
          </div>
        </PhoneShell>

        <PhoneShell title="Ringkasan Bukti">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">{primaryCase.seed}</h2>
                  <Badge className="mt-2" tone="red">High Risk</Badge>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              ['Domain', 23],
              ['Telegram', 23],
              ['Pembayaran', 12],
              ['Bukti', 412],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-slate-200 p-3 text-center" key={label as string}>
                <p className="font-black text-slate-950">{value as number}</p>
                <p className="text-[11px] text-slate-500">{label as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            <h3 className="font-bold text-slate-950">Timeline Bukti Terbaru</h3>
            {timelineEvents.slice(1).map((event) => (
              <div className="flex gap-3" key={event.id}>
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full" variant="outline">Lihat Semua Bukti</Button>
        </PhoneShell>
      </div>
    </div>
  )
}
