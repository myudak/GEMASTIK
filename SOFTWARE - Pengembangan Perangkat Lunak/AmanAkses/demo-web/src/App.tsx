import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Accessibility,
  AudioLines,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HandHeart,
  Heart,
  Home,
  Languages,
  LifeBuoy,
  Lock,
  LogOut,
  Menu,
  Mic,
  Moon,
  PencilLine,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Upload,
  UserRoundCheck,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react'
import amanaaksesHero from './assets/amanaakses-hero.png'
import {
  accessibilityProfile as initialAccessibility,
  auditLog,
  consentGrants,
  evidenceFiles,
  journalEntries,
  learningModules,
  reportDraft,
  serviceProviders,
  timelineEvents,
  trustedCompanions,
  userProfile,
} from './data/mockData'
import type { AccessibilityNeed, AccessibilityProfile, EvidenceFile, EvidenceType } from './types'
import { Badge, Button, Card, Dialog, Input, Progress, Switch, Textarea } from './components/ui'
import { cn } from './lib/utils'

type Toast = {
  id: number
  title: string
  description: string
}

type DemoContext = {
  accessibility: AccessibilityProfile
  discreetMode: boolean
  setDiscreetMode: (value: boolean) => void
  toggleAccessibility: (key: keyof Pick<AccessibilityProfile, 'highContrast' | 'easyRead' | 'largeControls' | 'reducedMotion'>) => void
  setTextScale: (value: AccessibilityProfile['textScale']) => void
  showToast: (title: string, description: string) => void
}

const DemoContext = createContext<DemoContext | null>(null)

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

const navItems: Array<{ label: string; to: string; icon: LucideIcon }> = [
  { label: 'Dashboard', to: '/app/dashboard', icon: Home },
  { label: 'Pahami Kekerasan', to: '/app/pahami-kekerasan', icon: BookOpen },
  { label: 'Jurnal Aman', to: '/app/jurnal', icon: PencilLine },
  { label: 'Kronologi Kejadian', to: '/app/kronologi', icon: CalendarClock },
  { label: 'Brankas Bukti', to: '/app/brankas-bukti', icon: Lock },
  { label: 'Pendamping', to: '/app/pendamping', icon: HandHeart },
  { label: 'Laporan Awal', to: '/app/laporan', icon: FileCheck2 },
  { label: 'Pusat Bantuan', to: '/app/pusat-bantuan', icon: LifeBuoy },
  { label: 'Aksesibilitas', to: '/app/aksesibilitas', icon: Accessibility },
  { label: 'Pengaturan', to: '/app/settings', icon: Settings },
]

const evidenceTypeLabels: Record<EvidenceType, string> = {
  foto: 'Foto',
  audio: 'Audio',
  chat: 'Chat',
  dokumen: 'Dokumen',
  'catatan-medis': 'Catatan akses',
}

const accessibilityLabels: Record<AccessibilityNeed, string> = {
  'screen-reader': 'Screen reader',
  'high-contrast': 'Kontras tinggi',
  'large-controls': 'Tombol besar',
  'easy-read': 'Easy read',
  'voice-note': 'Catatan suara',
  'sign-language': 'Bahasa isyarat',
  'reduced-motion': 'Kurangi gerak',
}

function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used inside DemoProvider')
  }
  return context
}

function DemoProvider({ children }: { children: ReactNode }) {
  const [accessibility, setAccessibility] = useState(initialAccessibility)
  const [discreetMode, setDiscreetMode] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (title: string, description: string) => {
    const nextToast = { id: Date.now(), title, description }
    setToast(nextToast)
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current))
    }, 3600)
  }

  const value = useMemo<DemoContext>(
    () => ({
      accessibility,
      discreetMode,
      setDiscreetMode,
      toggleAccessibility: (key) => {
        setAccessibility((current) => ({ ...current, [key]: !current[key] }))
      },
      setTextScale: (textScale) => {
        setAccessibility((current) => ({ ...current, textScale }))
      },
      showToast,
    }),
    [accessibility, discreetMode],
  )

  return (
    <DemoContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-5 right-5 z-[80] max-w-sm rounded-3xl border border-teal-200 bg-white p-4 shadow-2xl shadow-slate-950/15"
            role="status"
          >
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-bold text-slate-950">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{toast.description}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DemoContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/safe-exit" element={<SafeExitPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pahami-kekerasan" element={<LearningPage />} />
            <Route path="jurnal" element={<JournalPage />} />
            <Route path="kronologi" element={<TimelinePage />} />
            <Route path="brankas-bukti" element={<EvidenceVaultPage />} />
            <Route path="pendamping" element={<CompanionsPage />} />
            <Route path="laporan" element={<ReportPage />} />
            <Route path="pusat-bantuan" element={<HelpCenterPage />} />
            <Route path="aksesibilitas" element={<AccessibilityPage />} />
            <Route path="mobile-preview" element={<MobilePreviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  )
}

function LandingPage() {
  const { accessibility } = useDemo()

  return (
    <main className={cn('min-h-screen overflow-hidden bg-[#f4fbf9] text-slate-950', accessibility.highContrast && 'bg-white')}>
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-45" />
      <div className="pointer-events-none absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-teal-100/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-16rem] left-[25%] h-[30rem] w-[30rem] rounded-full bg-violet-100/60 blur-3xl" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-black text-teal-900">
          <span className="grid size-11 place-items-center rounded-[1.1rem] bg-teal-700 text-white shadow-lg shadow-teal-900/20">
            <ShieldCheck className="size-6" />
          </span>
          AmanAkses
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="#fitur">Fitur</a>
          <a href="#akses">Aksesibilitas</a>
          <a href="#alur">Alur Aman</a>
        </nav>
        <Link
          to="/app/dashboard"
          className="hidden h-11 items-center justify-center rounded-2xl bg-teal-700 px-5 text-sm font-bold text-white shadow-lg shadow-teal-900/12 transition hover:bg-teal-800 md:inline-flex"
        >
          Buka Demo
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-86px)] w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <motion.div {...pageMotion} className="max-w-2xl">
          <Badge tone="teal" className="mb-5">
            Data simulasi · Platform aksesibel
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.015em] text-slate-950 md:text-6xl">
            Pahami, catat, dan cari bantuan dengan kendali penuh.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-650">
            AmanAkses adalah ruang digital aksesibel untuk menyimpan jurnal, mengatur bukti, menyusun kronologi, dan berbagi laporan awal hanya dengan izin yang jelas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/app/dashboard"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 text-base font-bold text-white shadow-lg shadow-teal-900/14 transition hover:-translate-y-0.5 hover:bg-teal-800"
            >
              Mulai ruang aman <ChevronRight className="size-5" />
            </Link>
            <Link
              to="/app/mobile-preview"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white/85 px-5 text-base font-bold text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              Lihat mobile preview <Eye className="size-5" />
            </Link>
          </div>
          <div id="fitur" className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ['Pahami', 'Materi easy-read, audio, dan isyarat'],
              ['Catat', 'Jurnal aman dengan autosave'],
              ['Bagikan', 'Izin akses yang bisa dicabut'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.25rem] border border-teal-100 bg-white/78 p-4 shadow-sm shadow-teal-950/5 backdrop-blur">
                <p className="font-black text-teal-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="relative"
        >
          <LandingProductPreview />
        </motion.div>
      </section>
    </main>
  )
}

function LandingProductPreview() {
  const previewCards = [
    { icon: BookOpen, title: 'Pahami', copy: 'Hak, batas aman, dan opsi bantuan.' },
    { icon: PencilLine, title: 'Jurnal', copy: 'Catatan bertahap dengan autosave.' },
    { icon: Lock, title: 'Brankas', copy: 'Bukti terpilih dan metadata aman.' },
  ]

  return (
    <div className="relative mx-auto w-full max-w-[690px]">
      <div className="absolute -left-5 top-16 hidden w-44 rounded-[1.25rem] border border-violet-100 bg-white/92 p-4 shadow-xl shadow-slate-900/10 backdrop-blur md:block">
        <Badge tone="purple">Easy Read</Badge>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">Kalimat pendek, tombol jelas, dan alur bisa dijeda.</p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white/88 p-3 shadow-2xl shadow-teal-950/12 backdrop-blur">
        <div className="overflow-hidden rounded-[1.55rem] border border-slate-100 bg-[#fbfffd]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-teal-700 text-white">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-black text-teal-900">AmanAkses</p>
                <p className="text-xs font-semibold text-slate-500">Ruang pribadi terkunci</p>
              </div>
            </div>
            <Badge tone="green">
              <Lock className="size-3.5" /> Terkunci
            </Badge>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[1fr_230px]">
            <div>
              <div className="rounded-[1.35rem] bg-gradient-to-br from-teal-50 via-white to-violet-50 p-5">
                <img
                  src={amanaaksesHero}
                  alt="Ilustrasi AmanAkses dengan pengguna disabilitas, brankas digital, jurnal, dan izin berbagi"
                  className="h-64 w-full rounded-[1.2rem] object-cover object-center shadow-sm"
                />
                <p className="mt-5 text-sm font-black text-teal-900">Dashboard AmanAkses</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">Ruang aman untuk langkah kecil.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Semua tindakan penting meminta konfirmasi dan menampilkan ringkasan sebelum berbagi.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {previewCards.map((item) => (
                    <div key={item.title} className="rounded-[1.15rem] border border-slate-200 bg-white p-3 shadow-sm">
                      <item.icon className="size-5 text-teal-700" />
                      <p className="mt-3 font-black">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="alur" className="mt-4 grid gap-3 sm:grid-cols-3">
                {['Catatan tersimpan', 'Bukti dipilih', 'Izin ditinjau'].map((item, index) => (
                  <div key={item} className="rounded-[1.15rem] border border-teal-100 bg-teal-50/70 p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-black text-white">{index + 1}</span>
                      <p className="text-sm font-black text-teal-950">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <div id="akses" className="rounded-[1.35rem] border border-violet-100 bg-violet-50/80 p-4">
                <p className="font-black text-violet-950">Aksesibilitas</p>
                <div className="mt-3 space-y-2">
                  {[
                    [Volume2, 'Screen reader'],
                    [Mic, 'Voice note'],
                    [Languages, 'Bahasa isyarat'],
                  ].map(([Icon, label]) => (
                    <div key={String(label)} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
                      <Icon className="size-4 text-violet-700" />
                      {label as string}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50 p-4">
                <p className="flex items-center gap-2 font-black text-rose-800">
                  <LogOut className="size-4" /> Keluar Cepat
                </p>
                <p className="mt-2 text-sm leading-6 text-rose-700">Kunci sesi dan buka halaman netral.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const { accessibility, discreetMode, setDiscreetMode, showToast } = useDemo()
  const [mobileOpen, setMobileOpen] = useState(false)

  const textScaleClass = accessibility.textScale === 'sangat-besar' ? 'text-[18px]' : accessibility.textScale === 'besar' ? 'text-[16px]' : 'text-[15px]'

  return (
    <div
      className={cn(
        'min-h-screen bg-[#f6fbfa] text-slate-950',
        textScaleClass,
        accessibility.highContrast && 'bg-white high-contrast',
        accessibility.easyRead && 'easy-read',
      )}
    >
      <div className="pointer-events-none fixed inset-0 soft-grid opacity-50" />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/92 p-4 backdrop-blur-xl transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <Link to="/app/dashboard" className="flex items-center gap-3 text-lg font-black text-teal-900">
              <span className="grid size-11 place-items-center rounded-2xl bg-teal-700 text-white">
                <ShieldCheck className="size-6" />
              </span>
              AmanAkses
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
              <X className="size-5" />
            </Button>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-650 transition hover:bg-teal-50 hover:text-teal-900',
                    isActive && 'bg-teal-700 text-white shadow-lg shadow-teal-900/14 hover:bg-teal-700 hover:text-white',
                  )
                }
              >
                <item.icon className="size-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <Card className="bg-teal-50/70 p-4">
              <div className="flex gap-3">
                <Lock className="mt-1 size-5 shrink-0 text-teal-700" />
                <div>
                  <p className="text-sm font-bold text-teal-950">Privasi terjaga</p>
                  <p className="mt-1 text-xs leading-5 text-teal-800">Data simulasi hanya untuk demo lokal.</p>
                </div>
              </div>
            </Card>
            <Button variant="danger" className="w-full" onClick={() => navigate('/safe-exit')}>
              <LogOut className="size-4" /> Keluar Cepat
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen ? <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/82 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-3 px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu className="size-5" />
            </Button>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-inner shadow-slate-100 md:flex">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Cari catatan, bukti, pendamping..." />
            </div>
            <Badge tone={discreetMode ? 'slate' : 'green'} className="hidden sm:inline-flex">
              <Shield className="size-3.5" />
              {discreetMode ? 'Mode tersembunyi' : userProfile.safetyPhrase}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDiscreetMode(!discreetMode)
                showToast('Mode tampilan diperbarui', !discreetMode ? 'Label sensitif disamarkan dalam demo.' : 'Tampilan normal kembali aktif.')
              }}
            >
              <Moon className="size-4" /> Discreet
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifikasi">
              <Bell className="size-5" />
            </Button>
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-teal-100 text-sm font-black text-teal-800">S</span>
              <div className="text-sm">
                <p className="font-bold">Hai, {userProfile.alias}</p>
                <p className="text-xs text-slate-500">Tersimpan {userProfile.lastSavedAt}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { showToast } = useDemo()
  const quickActions = [
    { title: 'Pahami Kekerasan', copy: 'Pelajari hak dan bentuk kekerasan secara sederhana.', icon: BookOpen, to: '/app/pahami-kekerasan', cta: 'Pelajari' },
    { title: 'Jurnal Aman', copy: 'Tulis catatan bertahap dengan autosave.', icon: PencilLine, to: '/app/jurnal', cta: 'Tulis sekarang' },
    { title: 'Kronologi Kejadian', copy: 'Susun urutan dari catatan dan bukti.', icon: CalendarClock, to: '/app/kronologi', cta: 'Buat kronologi' },
    { title: 'Brankas Bukti', copy: 'Simpan file dummy dengan metadata terenkripsi.', icon: Lock, to: '/app/brankas-bukti', cta: 'Kelola bukti' },
    { title: 'Pendamping', copy: 'Atur siapa yang boleh melihat informasi.', icon: HandHeart, to: '/app/pendamping', cta: 'Lihat dukungan' },
    { title: 'Laporan Awal', copy: 'Siapkan laporan awal yang bisa ditinjau manusia.', icon: FileCheck2, to: '/app/laporan', cta: 'Mulai laporan' },
  ]

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Data simulasi"
        title="Dashboard AmanAkses"
        description="Kamu tidak sendirian. Semua fitur demo ini dibuat untuk memperlihatkan alur aman, aksesibel, dan berbasis persetujuan."
        action={
          <Button onClick={() => showToast('Catatan cepat dibuat', 'Demo menyiapkan draft jurnal baru tanpa mengirim data ke mana pun.')}>
            <Plus className="size-4" /> Catatan Baru
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-4 bg-gradient-to-br from-teal-50 via-white to-violet-50 p-6 md:grid-cols-[1fr_360px]">
              <div>
                <Badge tone="green">Ruang pribadi terkunci</Badge>
                <h2 className="mt-4 text-3xl font-black text-slate-950">Pahami. Catat. Lindungi. Bagikan dengan izin.</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Mulai dari langkah kecil. Kamu bisa menyimpan draft, berhenti kapan saja, dan memilih sendiri data yang boleh dibagikan.
                </p>
              </div>
              <img
                src={amanaaksesHero}
                alt="Ilustrasi AmanAkses dengan pengguna disabilitas dan simbol keamanan digital"
                className="h-48 w-full rounded-[1.35rem] object-cover object-center shadow-sm"
              />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Link to={item.to}>
                  <Card className="group h-full transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/8">
                    <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white">
                      <item.icon className="size-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.copy}</p>
                    <p className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-800">
                      {item.cta} <ChevronRight className="size-4" />
                    </p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black">Fitur aksesibilitas aktif</h3>
                <p className="mt-1 text-sm text-slate-600">Disesuaikan untuk pengalaman yang nyaman dan mudah diakses.</p>
              </div>
              <Link to="/app/aksesibilitas" className="text-sm font-bold text-teal-800">
                Atur preferensi
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {[
                [Volume2, 'Screen reader'],
                [Mic, 'Catatan suara'],
                [Languages, 'Bahasa isyarat'],
                [BookOpen, 'Easy Read'],
                [LogOut, 'Keluar Cepat'],
              ].map(([Icon, label]) => (
                <div key={String(label)} className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3 text-sm font-bold text-teal-900">
                  <Icon className="mb-2 size-5" />
                  {label as string}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="bg-violet-50/70">
            <div className="flex items-start gap-3">
              <Heart className="mt-1 size-5 text-violet-700" />
              <div>
                <h3 className="font-black text-violet-950">Untukmu hari ini</h3>
                <p className="mt-2 text-sm leading-6 text-violet-900">
                  Setiap langkah kecil yang kamu pilih tetap berarti. Kamu boleh jeda kapan saja.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50/70">
            <h3 className="flex items-center gap-2 font-black text-rose-800">
              <LifeBuoy className="size-5" /> Butuh bantuan segera?
            </h3>
            <p className="mt-2 text-sm leading-6 text-rose-700">
              Demo ini tidak menghubungi layanan sungguhan. Jika dalam bahaya, hubungi orang tepercaya atau layanan darurat setempat.
            </p>
            <Button variant="danger" className="mt-4 w-full" onClick={() => showToast('Pusat bantuan simulasi', 'Daftar layanan dummy dibuka di halaman Pusat Bantuan.')}>
              Lihat opsi bantuan
            </Button>
          </Card>
          <Card>
            <h3 className="font-black">Progress ruang aman</h3>
            <div className="mt-4 space-y-4">
              {[
                ['Jurnal tersimpan', 72],
                ['Bukti diberi label', 64],
                ['Laporan awal', 58],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between text-sm font-semibold">
                    <span>{label as string}</span>
                    <span>{value as number}%</span>
                  </div>
                  <Progress value={value as number} />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function LearningPage() {
  const [active, setActive] = useState(learningModules[0].id)
  const module = learningModules.find((item) => item.id === active) ?? learningModules[0]
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Pahami dengan aman"
        title="Pahami Kekerasan"
        description="Materi singkat, non-grafis, dan bisa dibaca perlahan. Kamu bisa memilih teks sederhana, audio, atau video bahasa isyarat simulasi."
      />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="space-y-3">
          {learningModules.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={cn(
                'w-full rounded-2xl border p-4 text-left transition',
                active === item.id ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{item.title}</h3>
                <Badge tone={item.status === 'dibaca' ? 'green' : item.status === 'disimpan' ? 'purple' : 'slate'}>{item.status}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
            </button>
          ))}
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-teal-50 via-white to-violet-50 p-6">
              <Badge tone="teal">{module.duration}</Badge>
              <h2 className="mt-4 text-3xl font-black">{module.title}</h2>
              <p className="mt-3 max-w-3xl leading-8 text-slate-650">{module.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {module.format.map((format) => (
                  <Badge key={format} tone="purple">{format}</Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              {[
                [BookOpen, 'Teks sederhana', 'Poin dibuat pendek dan bisa dibaca ulang.'],
                [AudioLines, 'Audio panduan', 'Kontrol audio simulasi tanpa suara otomatis.'],
                [Languages, 'Bahasa isyarat', 'Panel video simulasi untuk kebutuhan presentasi.'],
              ].map(([Icon, title, copy]) => (
                <div key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-4">
                  <Icon className="size-6 text-teal-700" />
                  <h3 className="mt-3 font-black">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-black">Kalimat bantu</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                'Aku berhak berhenti dan mengambil jeda.',
                'Aku boleh meminta bantuan dengan cara komunikasi yang nyaman.',
                'Aku yang memilih data apa yang ingin dibagikan.',
                'Catatan ini milikku dan bisa diubah kapan saja.',
              ].map((text) => (
                <div key={text} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                  {text}
                </div>
              ))}
            </div>
            <Button className="mt-5" onClick={() => showToast('Materi disimpan', 'Modul disimpan ke daftar baca demo.')}>
              Simpan modul
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function JournalPage() {
  const [mood, setMood] = useState('Biasa saja')
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Tersimpan otomatis"
        title="Jurnal Aman"
        description="Ruang pribadi untuk menulis, menyimpan suara, dan menandai hal yang ingin kamu ingat. Semua contoh di sini sintetis."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Buat Catatan Baru</h2>
            <Badge tone="green">
              <Lock className="size-3.5" /> Terenkripsi end-to-end
            </Badge>
          </div>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Tanggal
              <Input value="22 Mei 2026" readOnly />
            </label>
            <div>
              <p className="text-sm font-bold text-slate-700">Perasaan hari ini</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {['Sangat baik', 'Baik', 'Biasa saja', 'Sedih', 'Sangat sedih'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMood(item)}
                    className={cn(
                      'rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                      mood === item ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Apa yang ingin dicatat?
              <Textarea placeholder="Tuliskan dengan bahasamu sendiri. Kamu bisa berhenti kapan saja." />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Siapa yang terlibat? <span className="font-normal text-slate-500">Opsional dan bisa dikosongkan.</span>
              <Input placeholder="Gunakan alias jika lebih nyaman." />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Hal yang ingin diingat
              <Textarea placeholder="Catatan penting untuk dirimu di masa depan." />
            </label>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid size-10 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                  <Mic className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-2 rounded-full bg-white">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-teal-600 to-violet-500" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">00:00 / 03:00 · Catatan suara simulasi</p>
                </div>
                <Button variant="secondary">Rekam</Button>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => showToast('Draft tersimpan', 'Catatan tersimpan sebagai draft lokal demo.')}>
                Simpan sebagai draft
              </Button>
              <Button onClick={() => showToast('Catatan tersimpan', 'Jurnal aman diperbarui. Tidak ada data dikirim.')}>
                Simpan Catatan
              </Button>
            </div>
          </div>
        </Card>
        <aside className="space-y-5">
          <Card className="bg-violet-50/70">
            <h3 className="flex items-center gap-2 font-black text-violet-950">
              <Heart className="size-5" /> Tips untukmu hari ini
            </h3>
            <p className="mt-3 text-sm leading-6 text-violet-900">
              Menulis sedikit saja sudah cukup. Kamu tidak perlu mengingat semuanya sekaligus.
            </p>
          </Card>
          <Card>
            <h3 className="font-black">Catatan sebelumnya</h3>
            <div className="mt-4 space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-bold">{entry.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.date} · {entry.mood}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{entry.summary}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-black">Status penyimpanan</h3>
            <p className="mt-2 text-sm font-semibold text-teal-800">Tersimpan otomatis · Draft terakhir 10:24 WIB</p>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function EvidenceVaultPage() {
  const [filter, setFilter] = useState<EvidenceType | 'semua'>('semua')
  const [selectedId, setSelectedId] = useState(evidenceFiles[0].id)
  const { showToast } = useDemo()
  const filteredEvidence = useMemo(() => (filter === 'semua' ? evidenceFiles : evidenceFiles.filter((item) => item.type === filter)), [filter])
  const selected = evidenceFiles.find((item) => item.id === selectedId) ?? evidenceFiles[0]

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Brankas pribadi"
        title="Brankas Bukti"
        description="Simpan dan pilih bukti sintetis untuk laporan awal. Setiap item menampilkan metadata, hash simulasi, dan konteks aman."
        action={
          <Button onClick={() => showToast('Unggah bukti simulasi', 'Panel demo menambahkan contoh metadata tanpa file sungguhan.')}>
            <Upload className="size-4" /> Unggah Bukti
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={filter === 'semua' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('semua')}>Semua</Button>
            {Object.entries(evidenceTypeLabels).map(([key, label]) => (
              <Button key={key} variant={filter === key ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(key as EvidenceType)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvidence.map((item) => (
              <EvidenceCard key={item.id} item={item} selected={selected.id === item.id} onSelect={() => setSelectedId(item.id)} />
            ))}
          </div>
        </Card>
        <aside className="space-y-5">
          <Card className="bg-gradient-to-br from-teal-50 to-white">
            <div className="mx-auto grid size-28 place-items-center rounded-[2rem] bg-teal-700 text-white shadow-xl shadow-teal-900/20">
              <Lock className="size-12" />
            </div>
            <h3 className="mt-5 text-center text-xl font-black">Keamanan Brankas Bukti</h3>
            <div className="mt-5 space-y-4">
              {['Terenkripsi dalam demo lokal', 'Dilindungi PIN simulasi', 'Kontrol akses penuh'].map((item) => (
                <div key={item} className="flex gap-3 text-sm font-semibold text-slate-700">
                  <Check className="size-5 text-teal-700" /> {item}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-black">Detail terpilih</h3>
            <p className="mt-3 font-bold text-teal-900">{selected.title}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Jenis" value={evidenceTypeLabels[selected.type]} />
              <Detail label="Waktu" value={selected.capturedAt} />
              <Detail label="Ukuran" value={selected.size} />
              <Detail label="Hash" value={selected.hash} />
            </dl>
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{selected.note}</p>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function TimelinePage() {
  const [included, setIncluded] = useState(() => new Set(timelineEvents.filter((item) => item.included).map((item) => item.id)))
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Susun bertahap"
        title="Kronologi Kejadian"
        description="Pilih peristiwa yang ingin dimasukkan ke laporan awal. Semua teks bisa diedit sebelum dibagikan."
        action={<Button onClick={() => showToast('Kronologi disarankan', 'AI demo hanya membantu menyusun urutan, bukan menentukan kebenaran.')}>Susun otomatis</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="relative space-y-4 before:absolute before:left-5 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-teal-200">
            {timelineEvents.map((event, index) => {
              const isIncluded = included.has(event.id)
              return (
                <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="relative flex gap-4">
                  <span className={cn('z-10 grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-black', isIncluded ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600')}>
                    {index + 1}
                  </span>
                  <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">{event.date} · {event.time}</p>
                        <h3 className="mt-1 text-lg font-black">{event.title}</h3>
                      </div>
                      <Button
                        variant={isIncluded ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          setIncluded((current) => {
                            const next = new Set(current)
                            if (next.has(event.id)) next.delete(event.id)
                            else next.add(event.id)
                            return next
                          })
                        }}
                      >
                        {isIncluded ? 'Masuk laporan' : 'Simpan pribadi'}
                      </Button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{event.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="slate">{event.location}</Badge>
                      <Badge tone="purple">{event.evidenceIds.length} bukti terkait</Badge>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
        <Card>
          <h3 className="font-black">Ringkasan laporan</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {included.size} dari {timelineEvents.length} peristiwa dipilih. Peristiwa yang tidak dipilih tetap tersimpan pribadi.
          </p>
          <Progress value={(included.size / timelineEvents.length) * 100} className="mt-4" />
          <div className="mt-5 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-900">
            Gunakan bahasa netral. Hindari kesimpulan hukum otomatis. Laporan awal selalu untuk ditinjau manusia.
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function CompanionsPage() {
  const [consentOpen, setConsentOpen] = useState(false)
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Kamu yang menentukan"
        title="Pendamping Tepercaya"
        description="Atur siapa yang boleh mendampingi dan informasi apa saja yang dapat dilihat. Izin bisa dicabut kapan saja."
        action={<Button onClick={() => setConsentOpen(true)}><Plus className="size-4" /> Tambah Pendamping</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustedCompanions.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <span className="grid size-14 place-items-center rounded-3xl bg-violet-100 text-violet-800">
                <UserRoundCheck className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black">{item.name}</h3>
              <p className="text-sm font-semibold text-slate-500">{item.role}</p>
              <Badge className="mt-4 w-fit" tone={item.status === 'aktif' ? 'green' : item.status === 'tersedia' ? 'teal' : 'slate'}>{item.status}</Badge>
              <div className="mt-4 min-h-16 space-y-1 text-sm text-slate-600">
                <p>{item.channel}</p>
                <p>{item.contact}</p>
                <p>{item.scopes.length ? item.scopes.join(', ') : 'Belum ada akses'}</p>
              </div>
              <Button className="mt-auto w-full" variant="secondary" onClick={() => setConsentOpen(true)}>Atur izin</Button>
            </Card>
          ))}
        </div>
        <aside className="space-y-5">
          <Card>
            <h3 className="font-black">Izin aktif dan draft</h3>
            <div className="mt-4 space-y-3">
              {consentGrants.map((grant) => (
                <div key={grant.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{grant.recipient}</p>
                    <Badge tone={grant.status === 'aktif' ? 'green' : 'slate'}>{grant.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{grant.scopes.join(', ')} · {grant.expiresAt}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-teal-50/70">
            <h3 className="font-black text-teal-950">Prinsip berbagi</h3>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              Berbagi dilakukan setelah ringkasan data ditampilkan. Demo tidak mengirimkan apa pun ke pihak luar.
            </p>
          </Card>
        </aside>
      </div>
      <Dialog open={consentOpen} title="Atur izin akses" onClose={() => setConsentOpen(false)}>
        <div className="space-y-4">
          <p className="leading-7 text-slate-600">Pilih informasi yang boleh dilihat pendamping. Ini hanya simulasi persetujuan.</p>
          {['Ringkasan situasi', 'Kronologi terpilih', 'Bukti yang dipilih', 'Kebutuhan aksesibilitas'].map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 font-semibold">
              <input type="checkbox" defaultChecked className="size-5 accent-teal-700" />
              {item}
            </label>
          ))}
          <Button
            className="w-full"
            onClick={() => {
              setConsentOpen(false)
              showToast('Izin akses disiapkan', 'Ringkasan izin demo siap ditinjau sebelum dibagikan.')
            }}
          >
            Simpan izin simulasi
          </Button>
        </div>
      </Dialog>
    </motion.div>
  )
}

function ReportPage() {
  const { showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Ditinjau sebelum dibagikan"
        title="Laporan Awal"
        description="Preview laporan awal yang berisi ringkasan, kronologi, bukti terpilih, kebutuhan akses, dan catatan persetujuan."
        action={<Button onClick={() => showToast('Ekspor laporan simulasi', 'PDF/DOCX demo siap. Tidak ada file atau data yang dikirim ke luar aplikasi.')}>Ekspor Demo</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-0">
          <div className="border-b border-slate-200 bg-white p-6">
            <Badge tone="teal">{reportDraft.updatedAt}</Badge>
            <h2 className="mt-4 text-3xl font-black">{reportDraft.title}</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Dokumen pendukung awal untuk ditinjau pendamping manusia. Bukan putusan hukum, diagnosis, atau penentu kebenaran.
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {reportDraft.sections.map((section) => (
              <div key={section.title} className="grid gap-4 p-6 md:grid-cols-[220px_1fr_auto] md:items-center">
                <h3 className="font-black">{section.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{section.summary}</p>
                <Badge tone={section.status === 'siap' ? 'green' : 'purple'}>{section.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <aside className="space-y-5">
          <Card>
            <h3 className="font-black">Daftar bukti terpilih</h3>
            <div className="mt-4 space-y-3">
              {evidenceFiles.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <FileText className="size-5 text-teal-700" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-slate-500">{evidenceTypeLabels[item.type]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-violet-100 bg-violet-50/70">
            <h3 className="font-black text-violet-950">Catatan etis</h3>
            <p className="mt-2 text-sm leading-6 text-violet-900">
              AI demo hanya membantu menyusun bahasa. Pengguna tetap memegang kendali penuh atas isi dan berbagi data.
            </p>
          </Card>
          <Card>
            <h3 className="font-black">Audit terakhir</h3>
            <div className="mt-4 space-y-3">
              {auditLog.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
                  <p className="font-bold">{item.action}</p>
                  <p className="mt-1 text-slate-500">{item.at} · {item.actor}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </motion.div>
  )
}

function HelpCenterPage() {
  const [category, setCategory] = useState('Semua')
  const categories = ['Semua', ...Array.from(new Set(serviceProviders.map((item) => item.category)))]
  const filteredServices = useMemo(() => (category === 'Semua' ? serviceProviders : serviceProviders.filter((item) => item.category === category)), [category])

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Direktori simulasi"
        title="Pusat Bantuan"
        description="Filter layanan dummy berdasarkan jenis bantuan, kanal komunikasi, dan dukungan aksesibilitas."
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="size-5 text-teal-700" />
          {categories.map((item) => (
            <Button key={item} variant={category === item ? 'primary' : 'secondary'} size="sm" onClick={() => setCategory(item)}>
              {item}
            </Button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="border-slate-200 bg-slate-50/50 shadow-none">
              <Badge tone="teal">{service.category}</Badge>
              <h3 className="mt-4 text-lg font-black">{service.name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{service.city}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.availability}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.channels.map((channel) => <Badge key={channel} tone="slate">{channel}</Badge>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {service.accessibility.map((need) => <Badge key={need} tone="purple">{accessibilityLabels[need]}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function AccessibilityPage() {
  const { accessibility, toggleAccessibility, setTextScale, showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Atur pengalamanmu"
        title="Aksesibilitas"
        description="Pengaturan demo ini mengubah ukuran teks, kontras, gerak, dan cara UI menyajikan informasi."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-xl font-black">Preferensi tampilan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Switch checked={accessibility.highContrast} onChange={() => toggleAccessibility('highContrast')} label="Kontras tinggi" />
            <Switch checked={accessibility.easyRead} onChange={() => toggleAccessibility('easyRead')} label="Easy Read" />
            <Switch checked={accessibility.largeControls} onChange={() => toggleAccessibility('largeControls')} label="Tombol besar" />
            <Switch checked={accessibility.reducedMotion} onChange={() => toggleAccessibility('reducedMotion')} label="Kurangi gerak" />
          </div>
          <h3 className="mt-8 font-black">Ukuran teks</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {(['normal', 'besar', 'sangat-besar'] as const).map((scale) => (
              <Button key={scale} variant={accessibility.textScale === scale ? 'primary' : 'secondary'} onClick={() => setTextScale(scale)}>
                {scale}
              </Button>
            ))}
          </div>
          <Button className="mt-8" onClick={() => showToast('Preferensi disimpan', 'Pengaturan aksesibilitas tersimpan di state demo lokal.')}>
            Simpan preferensi
          </Button>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <h3 className="font-black">Preview aksesibel</h3>
          <p className="mt-3 rounded-3xl bg-white p-4 leading-8 text-slate-700">
            Ini contoh teks sederhana. Kamu bisa memperbesar huruf, mengurangi gerak, dan membuat tombol lebih mudah dipilih.
          </p>
          <div className="mt-4 grid gap-3">
            {accessibility.enabledNeeds.map((need) => (
              <Badge key={need} tone="teal">{accessibilityLabels[need]}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function MobilePreviewPage() {
  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="PWA mobile-first"
        title="Mobile Safe Access"
        description="Preview layar kecil untuk akses cepat: catatan suara, safe exit, brankas, dan pendamping."
      />
      <div className="grid place-items-center">
        <div className="w-full max-w-sm rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-950/20">
          <div className="rounded-[1.8rem] bg-[#f7fbfa] p-4">
            <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800">AmanAkses</p>
                <h2 className="text-xl font-black">Ruang aman</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-teal-700 text-white">
                <Shield className="size-5" />
              </span>
            </div>
            <div className="mt-5 rounded-3xl bg-gradient-to-br from-teal-100 to-violet-100 p-4">
              <p className="font-black">Tarik napas pelan.</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Kamu bisa menulis sedikit, merekam suara, atau keluar cepat.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                [Mic, 'Rekam'],
                [PencilLine, 'Jurnal'],
                [Lock, 'Bukti'],
                [HandHeart, 'Bantuan'],
              ].map(([Icon, label]) => (
                <button key={String(label)} type="button" className="rounded-3xl border border-slate-200 bg-white p-4 text-left font-bold">
                  <Icon className="mb-3 size-5 text-teal-700" />
                  {label as string}
                </button>
              ))}
            </div>
            <Button variant="danger" className="mt-4 w-full">
              <LogOut className="size-4" /> Keluar Cepat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SettingsPage() {
  const { discreetMode, setDiscreetMode, showToast } = useDemo()

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeading
        eyebrow="Pengaturan demo"
        title="Settings"
        description="Kontrol privasi, penyimpanan, sesi, dan status simulasi tanpa backend."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Privasi dan sesi</h2>
          <div className="mt-5 space-y-4">
            <Switch checked={discreetMode} onChange={() => setDiscreetMode(!discreetMode)} label="Mode tersembunyi" />
            <Switch checked label="Kunci setelah idle" onChange={() => showToast('Simulasi kunci sesi', 'Dalam produk nyata, sesi akan terkunci setelah waktu idle.')} />
            <Switch checked label="Audit berbagi aktif" onChange={() => showToast('Audit tetap aktif', 'Audit demo membantu memperlihatkan jejak izin berbagi.')} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Status sistem</h2>
          <div className="mt-5 space-y-3">
            <Detail label="Mode data" value="Data simulasi lokal" />
            <Detail label="Backend" value="Tidak ada API eksternal" />
            <Detail label="Ekspor" value="Preview dan toast demo" />
            <Detail label="Safe exit" value="/safe-exit" />
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function SafeExitPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black">Catatan Belajar</h1>
          <Link to="/app/dashboard" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold">
            Kembali
          </Link>
        </div>
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold">Halaman netral</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Ini adalah halaman keluar cepat untuk demo AmanAkses. Pada produk nyata, halaman ini dapat menyamarkan layar dan mengunci sesi.
          </p>
        </div>
      </div>
    </main>
  )
}

function EvidenceCard({ item, selected, onSelect }: { item: EvidenceFile; selected: boolean; onSelect: () => void }) {
  const Icon = item.type === 'audio' ? AudioLines : item.type === 'foto' ? Eye : FileText

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-3xl border bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-lg',
        selected ? 'border-teal-300 ring-4 ring-teal-100' : 'border-slate-200',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-teal-100 text-teal-800">
          <Icon className="size-5" />
        </span>
        <Badge tone="green">
          <Lock className="size-3.5" /> aman
        </Badge>
      </div>
      <h3 className="mt-4 truncate font-black">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{item.capturedAt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => <Badge key={tag} tone="slate">{tag}</Badge>)}
      </div>
    </button>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <Badge tone="teal">{eyebrow}</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.01em] text-slate-950 md:text-4xl">{title}</h1>
        <p className="mt-2 leading-7 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

export default App
