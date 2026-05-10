import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Camera,
  Database,
  Download,
  FolderPlus,
  Globe2,
  Landmark,
  Network,
  Plus,
  Send,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  crawlerJobs,
  dashboardStats,
  recentFindings,
  statusBreakdown,
  trendData,
} from '../data/mockData'
import { Badge, Button, Card, Progress } from '../components/ui'
import { CountUp, MotionItem, MotionPage, Stagger } from '../components/Motion'

const statIcons = [FolderPlus, Users, ShieldAlert, Database]
const quickActions: Array<{
  title: string
  detail: string
  icon: LucideIcon
}> = [
  { title: 'Kasus Baru', detail: 'Buat kasus investigasi baru', icon: Plus },
  { title: 'Ekspor Ringkasan', detail: 'Ekspor ringkasan kasus ke PDF', icon: Download },
  { title: 'Jalankan Crawler', detail: 'Mulai crawler baru', icon: Globe2 },
  { title: 'Tambah Entitas', detail: 'Tambah entitas secara manual', icon: Users },
]
const findingIcons = [Globe2, Send, Landmark, Camera]
const statusTotal = statusBreakdown.reduce((total, item) => total + item.value, 0)
const statusDonut =
  'conic-gradient(#2563eb 0 37.5%, #16a34a 37.5% 70.8%, #f59e0b 70.8% 87.5%, #ef4444 87.5% 95.8%, #8b5cf6 95.8% 100%)'

function statNumber(value: string) {
  return Number(value.replaceAll('.', ''))
}

export function DashboardPage() {
  return (
    <MotionPage className="space-y-6">
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan aktivitas investigasi dan temuan terbaru.
        </p>
      </motion.div>

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = statIcons[index]
          return (
            <MotionItem key={stat.label}>
              <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-black text-slate-950 tabular-nums">
                    <CountUp value={statNumber(stat.value)} />
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    {stat.delta}
                  </p>
                </div>
              </div>
              </Card>
            </MotionItem>
          )
        })}
      </Stagger>

      <Stagger className="grid gap-4 xl:grid-cols-[1fr_1.45fr_1.25fr]">
        <MotionItem>
          <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Status Kasus</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="flex h-44 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                className="relative h-36 w-36 rounded-full"
                initial={{ rotate: -45, scale: 0.9 }}
                style={{ background: statusDonut }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-3xl font-black text-slate-950">
                    <CountUp value={statusTotal} />
                  </span>
                  <span className="text-xs text-slate-500">Total Kasus</span>
                </div>
              </motion.div>
            </div>
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div className="flex items-center justify-between gap-3 text-sm" key={item.name}>
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-950">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <Button className="mt-4 w-full" variant="secondary">
            Lihat Semua Kasus
            <ArrowRight className="h-4 w-4" />
          </Button>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Crawler Aktif</h2>
            <Badge tone="green">3 Aktif</Badge>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[1.3fr_0.7fr_1fr_0.7fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Crawler</span>
              <span>Status</span>
              <span>Progres</span>
              <span>Ditemukan</span>
              <span>Terakhir</span>
            </div>
            {crawlerJobs.map((job, index) => (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-[1.3fr_0.7fr_1fr_0.7fr_1fr] items-center border-t border-slate-100 px-4 py-4 text-sm"
                initial={{ opacity: 0, x: -10 }}
                key={job.name}
                transition={{ delay: 0.12 + index * 0.06, duration: 0.35 }}
              >
                <span className="font-medium text-slate-800">{job.name}</span>
                <Badge tone={job.status === 'Aktif' ? 'green' : 'amber'}>
                  {job.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <Progress value={job.progress} />
                  <span className="w-8 text-xs font-semibold text-slate-600">
                    {job.progress}%
                  </span>
                </div>
                <span className="font-semibold text-slate-950">{job.found}</span>
                <span className="text-slate-500">{job.updatedAt}</span>
              </motion.div>
            ))}
          </div>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">
            Tren Temuan <span className="text-sm font-medium text-slate-500">(7 Hari Terakhir)</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <AreaChart data={trendData} height={270} width={360}>
              <defs>
                <linearGradient id="entities" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} />
              <Tooltip />
              <Area
                dataKey="entities"
                fill="url(#entities)"
                animationDuration={900}
                animationEasing="ease-out"
                stroke="#2563eb"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </div>
          </Card>
        </MotionItem>
      </Stagger>

      <Stagger className="grid gap-4 xl:grid-cols-[1.1fr_1.45fr_1.05fr]">
        <MotionItem>
          <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Temuan Terbaru</h2>
          <div className="mt-4 space-y-4">
            {recentFindings.map((finding, index) => {
              const Icon = findingIcons[index]
              return (
                <div className="flex gap-3" key={finding.title}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {finding.title}
                      </p>
                      <Badge tone="outline">{finding.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{finding.detail}</p>
                  </div>
                  <span className="text-xs text-slate-500">{finding.time}</span>
                </div>
              )
            })}
          </div>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Preview Evidence Graph</h2>
          <div className="graph-grid relative mt-4 h-72 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(37,99,235,0)', '0 0 0 10px rgba(37,99,235,0.10)', '0 0 0 0 rgba(37,99,235,0)'] }}
              className="absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-blue-300 bg-white p-3 text-center shadow-sm"
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <Network className="mx-auto h-6 w-6 text-blue-600" />
              <p className="mt-2 font-bold text-slate-950">slot-gacor88.test</p>
              <p className="text-xs text-slate-500">Domain Utama</p>
            </motion.div>
            <motion.div animate={{ y: [0, -5, 0] }} className="absolute left-10 top-8 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800" transition={{ duration: 3, repeat: Infinity }}>
              promo-tg88
            </motion.div>
            <motion.div animate={{ y: [0, 5, 0] }} className="absolute right-10 top-12 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" transition={{ duration: 3.4, repeat: Infinity }}>
              Rekening Bank
            </motion.div>
            <motion.div animate={{ y: [0, 4, 0] }} className="absolute bottom-12 left-16 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800" transition={{ duration: 3.2, repeat: Infinity }}>
              Mirror Cluster
            </motion.div>
            <motion.div animate={{ y: [0, -4, 0] }} className="absolute bottom-10 right-16 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" transition={{ duration: 2.8, repeat: Infinity }}>
              Screenshot
            </motion.div>
          </div>
          <Button className="mt-4 w-full" variant="secondary">
            Buka Evidence Graph
            <ArrowRight className="h-4 w-4" />
          </Button>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">Aksi Cepat</h2>
          <div className="mt-4 space-y-3">
            {quickActions.map(({ title, detail, icon: Icon }) => (
              <motion.button
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                key={title}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    {title}
                  </span>
                  <span className="text-sm text-slate-500">{detail}</span>
                </span>
              </motion.button>
            ))}
          </div>
          </Card>
        </MotionItem>
      </Stagger>
    </MotionPage>
  )
}
