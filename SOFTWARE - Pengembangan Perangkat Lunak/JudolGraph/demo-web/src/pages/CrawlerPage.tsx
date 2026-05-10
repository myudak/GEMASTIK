import {
  Activity,
  Camera,
  Globe2,
  Play,
  Send,
  WalletCards,
} from 'lucide-react'
import { Badge, Button, Card, Progress } from '../components/ui'
import { crawlerJobs } from '../data/mockData'

const crawlerIcons = [Send, Globe2, WalletCards, Camera]

export function CrawlerPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Crawler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Simulasi collector untuk domain, kanal publik, screenshot, OCR, dan pembayaran fiktif.
          </p>
        </div>
        <Button>
          <Play className="h-4 w-4" />
          Jalankan Crawler
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {crawlerJobs.map((job, index) => {
          const Icon = crawlerIcons[index]
          return (
            <Card className="p-5" key={job.name}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge tone={job.status === 'Aktif' ? 'green' : 'amber'}>
                  {job.status}
                </Badge>
              </div>
              <h2 className="mt-5 font-bold text-slate-950">{job.name}</h2>
              <div className="mt-4 flex items-center gap-3">
                <Progress value={job.progress} />
                <span className="text-sm font-bold text-slate-700">{job.progress}%</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {job.found} temuan · diperbarui {job.updatedAt}
              </p>
            </Card>
          )
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-950">Log Simulasi</h2>
        </div>
        <div className="mt-5 space-y-3">
          {[
            '09:14 · Entity extraction selesai untuk 31 domain sintetis.',
            '09:12 · OCR ingestion memproses 6 screenshot bukti.',
            '09:10 · Mirror detection menemukan 8 domain terkait.',
            '09:05 · Collector Telegram menerima 4 kanal publik simulasi.',
          ].map((entry) => (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600" key={entry}>
              {entry}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
