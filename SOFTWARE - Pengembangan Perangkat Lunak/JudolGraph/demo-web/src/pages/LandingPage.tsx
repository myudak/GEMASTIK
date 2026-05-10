import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  FileText,
  GitBranch,
  Globe2,
  Network,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '../components/ui'
import { Logo } from '../components/Logo'
import { MotionItem, MotionPage, Stagger } from '../components/Motion'

const valueChips = [
  'Evidence Graph',
  'Mirror Domain Detection',
  'Telegram Tracking',
  'Payment Trail Analysis',
  'Screenshot & OCR Evidence',
  'Case Export',
]

const featureCards = [
  {
    title: 'Detect',
    body: 'AI dan crawler mengumpulkan indikasi dari seed kasus, domain, kanal publik, dan konten visual.',
    icon: Globe2,
  },
  {
    title: 'Connect',
    body: 'Entitas dan relasi disusun menjadi evidence graph yang mudah ditelusuri.',
    icon: Network,
  },
  {
    title: 'Document',
    body: 'Timeline, bukti, risk signals, dan ringkasan kasus siap ditinjau sebagai laporan.',
    icon: FileText,
  },
]

const sceneNodes = [
  { label: 'slot-gacor88.test', className: 'left-[48%] top-[42%] border-blue-300 bg-white' },
  { label: 'Telegram', className: 'left-[18%] top-[14%] border-violet-200 bg-violet-50' },
  { label: 'Mirror Cluster', className: 'left-[20%] top-[62%] border-blue-200 bg-blue-50' },
  { label: 'E-wallet', className: 'left-[68%] top-[16%] border-emerald-200 bg-emerald-50' },
  { label: 'Screenshot OCR', className: 'left-[66%] top-[62%] border-red-200 bg-red-50' },
]

const capabilityCards: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Evidence Graph', icon: Network },
  { label: 'Screenshot & OCR Evidence', icon: Camera },
  { label: 'Payment Trail Analysis', icon: WalletCards },
  { label: 'Mirror Domain Detection', icon: Globe2 },
  { label: 'Traceable Evidence', icon: ShieldCheck },
  { label: 'Case Export', icon: FileText },
]

function HeroScene() {
  return (
    <div className="graph-grid relative mt-8 h-[300px] overflow-hidden rounded-lg border border-blue-100 bg-white/70 shadow-sm md:h-[340px]">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 720"
      >
        <path
          d="M250 190 C420 250 470 280 585 305"
          fill="none"
          stroke="#7c3aed"
          strokeDasharray="7 8"
          strokeWidth="2"
        />
        <path
          d="M285 465 C420 410 455 360 585 330"
          fill="none"
          stroke="#2563eb"
          strokeDasharray="7 8"
          strokeWidth="2"
        />
        <path
          d="M815 190 C720 240 680 280 620 305"
          fill="none"
          stroke="#16a34a"
          strokeDasharray="7 8"
          strokeWidth="2"
        />
        <path
          d="M810 465 C710 420 675 365 620 330"
          fill="none"
          stroke="#ef4444"
          strokeDasharray="7 8"
          strokeWidth="2"
        />
      </svg>
      {sceneNodes.map((node) => (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          className={`absolute -translate-x-1/2 rounded-lg border px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm ${node.className}`}
          key={node.label}
          transition={{ duration: 3 + node.label.length * 0.06, repeat: Infinity }}
        >
          {node.label}
        </motion.div>
      ))}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden">
        <div className="graph-grid absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/75 via-slate-50/90 to-slate-50" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#workflow">Workflow</a>
            <a href="#features">Fitur</a>
            <Link to="/app/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-14 md:pt-20">
          <MotionPage className="max-w-4xl">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
            >
              <Badge tone="blue">Data simulasi · Anti-judi online</Badge>
            </motion.div>
            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] text-slate-950 md:text-6xl"
              initial={{ opacity: 0, y: 22 }}
              transition={{ delay: 0.08, duration: 0.5 }}
            >
              AI-powered investigation graph for exposing online gambling networks
            </motion.h1>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.16, duration: 0.45 }}
            >
              JudolGraph membantu investigator mengubah jejak digital tersebar
              seperti domain, kanal publik, pembayaran fiktif, alias, screenshot,
              dan mirror cluster menjadi bukti terstruktur.
            </motion.p>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.22, duration: 0.45 }}
            >
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-5 text-base font-medium text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                to="/app/dashboard"
              >
                Lihat Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-base font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                to="/app/evidence-graph"
              >
                <GitBranch className="h-4 w-4" />
                Lihat Evidence Graph
              </Link>
            </motion.div>
            <Stagger className="mt-8 flex flex-wrap gap-2">
              {valueChips.map((chip) => (
                <MotionItem key={chip}>
                  <Badge tone="outline">{chip}</Badge>
                </MotionItem>
              ))}
            </Stagger>
          </MotionPage>
          <HeroScene />
        </main>
      </section>

      <section
        className="border-y border-slate-200 bg-white px-6 py-12"
        id="workflow"
      >
        <Stagger className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon
            return (
              <MotionItem key={card.title}>
                <article className="rounded-lg border border-slate-200 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950">
                    {card.title}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">{card.body}</p>
                </article>
              </MotionItem>
            )
          })}
        </Stagger>
      </section>

      <section className="bg-slate-50 px-6 py-16" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black text-slate-950">
              Jejak judi online tersebar, cepat berubah, dan sulit dibuktikan
              secara manual.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Demo ini memvisualisasikan proses investigasi, validasi manusia,
              dan export laporan tanpa melakukan crawling nyata.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {capabilityCards.map(({ label, icon: Icon }) => (
              <div className="rounded-lg border border-slate-200 bg-white p-5" key={label}>
                <Icon className="h-5 w-5 text-blue-600" />
                <p className="mt-4 font-semibold text-slate-950">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
