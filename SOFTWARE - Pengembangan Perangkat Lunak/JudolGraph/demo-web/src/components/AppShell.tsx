import { useState, type FormEvent } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  Camera,
  FileText,
  Filter,
  FolderOpen,
  Globe2,
  LayoutDashboard,
  Network,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Badge, Button, Dialog, Input } from './ui'
import { useToast } from './toast-context'
import { Logo } from './Logo'

const navItems: Array<{
  label: string
  to: string
  match: string
  icon: LucideIcon
}> = [
  {
    label: 'Dashboard',
    to: '/app/dashboard',
    match: '/app/dashboard',
    icon: LayoutDashboard,
  },
  { label: 'Kasus', to: '/app/cases', match: '/app/cases', icon: FolderOpen },
  {
    label: 'Evidence Graph',
    to: '/app/evidence-graph',
    match: '/app/evidence-graph',
    icon: Network,
  },
  { label: 'Crawler', to: '/app/crawler', match: '/app/crawler', icon: Globe2 },
  {
    label: 'Screenshot & OCR',
    to: '/app/screenshots',
    match: '/app/screenshots',
    icon: Camera,
  },
  { label: 'Entitas', to: '/app/entities/domain-main', match: '/app/entities', icon: Users },
  { label: 'Laporan', to: '/app/reports', match: '/app/reports', icon: FileText },
  { label: 'Pengaturan', to: '/app/settings', match: '/app/settings', icon: Settings },
]

function NewCaseDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const showToast = useToast()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onClose()
    showToast(
      'Kasus baru dibuat dan crawler mulai berjalan.',
      'Data demo tetap sintetis dan siap ditinjau di dashboard.',
    )
  }

  return (
    <Dialog onClose={onClose} open={open} title="Kasus Baru">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Nama Kasus
          <Input className="mt-2" defaultValue="Kasus investigasi baru" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Seed URL / Domain
          <Input className="mt-2" defaultValue="domain-simulasi.test" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Kanal Telegram
          <Input className="mt-2" placeholder="@channel_sintetis" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Catatan awal
          <textarea
            className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            defaultValue="Pantau domain, mirror, bukti visual, dan pembayaran fiktif yang muncul dari seed kasus."
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Prioritas
          <select className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
            <option>Tinggi</option>
            <option>Menengah</option>
            <option>Rendah</option>
          </select>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onClose} variant="secondary">
            Batal
          </Button>
          <Button type="submit">
            <Zap className="h-4 w-4" />
            Mulai Crawling
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export function AppShell() {
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="px-6 py-6">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.match)
            const Icon = item.icon
            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                )}
                key={item.to}
                to={item.to}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Status Sistem
            </div>
            <p className="mt-2 text-xs text-slate-500">Semua sistem operasional</p>
            <p className="mt-2 text-xs text-slate-500">Sinkronisasi terakhir 18 Mei 2025 09:10</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-800">
                AP
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Andi Pratama</p>
                <p className="text-xs text-slate-500">Penyidik</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
            <Link className="lg:hidden" to="/">
              <Logo compact />
            </Link>
            <div className="relative hidden max-w-xl flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 pr-14"
                placeholder="Cari domain, alias, Telegram, nomor rekening, atau kata kunci..."
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                Ctrl K
              </kbd>
            </div>
            <Button className="hidden md:inline-flex" variant="secondary">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="hidden md:inline-flex" variant="secondary">
              <CalendarDays className="h-4 w-4" />7 hari terakhir
            </Button>
            <Button onClick={() => setIsNewCaseOpen(true)}>
              <Plus className="h-4 w-4" />
              Kasus Baru
            </Button>
            <Button aria-label="Notifikasi" size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
              AP
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {navItems.map((item) => (
              <Link
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium',
                  location.pathname.startsWith(item.match)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600',
                )}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="px-4 py-6 lg:px-6">
          <Outlet />
        </main>
        <footer className="mx-4 mb-6 rounded-lg border border-slate-200 bg-white p-4 lg:mx-6">
          <div className="grid gap-4 md:grid-cols-4 md:items-center">
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Aman. Terpercaya. Berbasis Bukti.
                </p>
                <p className="text-xs text-slate-500">
                  Seluruh data pada demo ini adalah data sintetis.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Status</p>
              <Badge className="mt-1" tone="green">
                Sistem Aktif & Sehat
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Waktu Sistem</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                18 Mei 2025 09:14 WIB
              </p>
            </div>
          </div>
        </footer>
      </div>
      <NewCaseDialog
        onClose={() => setIsNewCaseOpen(false)}
        open={isNewCaseOpen}
      />
    </div>
  )
}
