import {
  Download,
  ExternalLink,
  FileText,
  Lock,
  Share2,
  ShieldAlert,
} from 'lucide-react'
import { useToast } from '../components/toast-context'
import { Badge, Button, Card } from '../components/ui'
import { evidenceRows, primaryCase, timelineEvents } from '../data/mockData'

function statusTone(status: string) {
  if (status === 'verified') return 'green'
  if (status === 'partial') return 'amber'
  if (status === 'processing') return 'blue'
  return 'red'
}

function statusLabel(status: string) {
  if (status === 'verified') return 'Terverifikasi'
  if (status === 'partial') return 'Verifikasi Parsial'
  if (status === 'processing') return 'Dalam Proses'
  return 'Ditolak'
}

export function ReportPage() {
  const showToast = useToast()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Report Export</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kasus, timeline, evidence table, dan tombol ekspor PDF.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-950">
                  {primaryCase.title}
                </h2>
                <Badge tone="red">Risiko Tinggi</Badge>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                <span>Tipe Kasus: Perjudian Online</span>
                <span>Status: Aktif</span>
                <span>Dibuat oleh: {primaryCase.investigator}</span>
                <span>Diperbarui: {primaryCase.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total Entitas', '48'],
          ['Total Bukti', '186'],
          ['Skor Risiko', '92 / 100'],
          ['Terakhir Diperbarui', '18 Mei 2025 09:14'],
        ].map(([label, value], index) => (
          <Card className="p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-black ${index === 2 ? 'text-red-600' : 'text-slate-950'}`}>
              {value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.35fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-slate-950">
            Timeline Aktivitas Kasus
          </h2>
          <div className="mt-5 space-y-4">
            {timelineEvents.map((event) => (
              <div className="flex gap-3" key={event.id}>
                <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">
                    {event.title}
                  </p>
                  <p className="text-sm text-slate-500">{event.description}</p>
                </div>
                <span className="text-right text-xs text-slate-400">
                  {event.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">Tabel Evidence (Bukti)</h2>
            <Badge tone="blue">186 bukti</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Jenis Bukti</th>
                  <th className="px-4 py-3">Deskripsi / Sumber</th>
                  <th className="px-4 py-3">Status Verifikasi</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {evidenceRows.map((row) => (
                  <tr className="border-t border-slate-100" key={row.id}>
                    <td className="px-4 py-3 font-semibold capitalize text-slate-700">
                      {row.type}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{row.title}</p>
                      <p className="text-xs text-slate-500">{row.source}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(row.status)}>
                        {statusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Pratinjau Laporan (PDF)
            </h2>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-inner">
              <div className="border-b border-slate-200 pb-4">
                <p className="text-xs font-semibold text-slate-500">Laporan Investigasi</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">
                  {primaryCase.title}
                </h3>
                <Badge className="mt-2" tone="red">Risiko Tinggi</Badge>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  Ringkasan eksekutif memuat struktur jaringan, timeline,
                  risk signals, dan bukti terverifikasi.
                </p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-bold text-slate-950">Ringkasan Temuan</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Total 48 entitas teridentifikasi</li>
                    <li>Skor risiko: 92 / 100</li>
                    <li>96% bukti telah terverifikasi</li>
                  </ul>
                </div>
                <div className="graph-grid h-24 rounded-lg border border-slate-200" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Halaman 1 dari 24</span>
                <Button size="sm" variant="secondary">
                  Buka di Tab Baru
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Ekspor & Bagikan Laporan
            </h2>
            <div className="mt-4 space-y-3">
              <Button
                className="w-full"
                onClick={() => showToast('Laporan PDF berhasil disiapkan untuk demo.')}
              >
                <FileText className="h-4 w-4" />
                Ekspor PDF
              </Button>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary">
                  <Download className="h-4 w-4" />
                  Unduh Ringkasan (CSV)
                </Button>
                <Button variant="secondary">
                  <Share2 className="h-4 w-4" />
                  Bagikan Laporan
                </Button>
              </div>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Laporan ini hanya dapat diakses oleh tim yang berwenang.
              </p>
            </div>
          </Card>
          <Card className="p-5">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <p className="mt-3 text-sm text-slate-600">
              Data laporan merupakan simulasi untuk kebutuhan presentasi dan
              pengujian antarmuka.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
