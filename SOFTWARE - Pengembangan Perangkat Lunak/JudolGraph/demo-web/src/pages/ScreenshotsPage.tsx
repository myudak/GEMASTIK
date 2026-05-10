import { useMemo, useState } from 'react'
import { Copy, Eye, Network, Save, Upload } from 'lucide-react'
import { motion } from 'motion/react'
import { SyntheticEvidenceCard } from '../components/SyntheticEvidenceCard'
import { Badge, Button, Card } from '../components/ui'
import { screenshots } from '../data/mockData'
import { MotionItem, MotionPage, Stagger } from '../components/Motion'

export function ScreenshotsPage() {
  const [selectedId, setSelectedId] = useState(screenshots[0].id)
  const selected = useMemo(
    () => screenshots.find((item) => item.id === selectedId) ?? screenshots[0],
    [selectedId],
  )

  return (
    <MotionPage className="space-y-5">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-3"
        initial={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Screenshot & OCR Evidence</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola bukti visual dan ekstraksi teks dari konten perjudian online.
          </p>
        </div>
        <Button variant="secondary">
          <Upload className="h-4 w-4" />
          Unggah Screenshot
        </Button>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">23 Bukti Ditemukan</h2>
              <p className="mt-1 text-sm text-slate-500">
                Diunggah: 18 Mei 2025 09:10
              </p>
            </div>
            <div className="flex gap-2">
              {['Semua Bukti', 'Perlu Verifikasi', 'Terverifikasi'].map((tab) => (
                <button
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition first:border-blue-300 first:bg-blue-50 first:text-blue-700"
                  key={tab}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Stagger className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {screenshots.map((item) => (
              <MotionItem key={item.id}>
                <SyntheticEvidenceCard
                  item={item}
                  onSelect={() => setSelectedId(item.id)}
                  selected={item.id === selectedId}
                />
              </MotionItem>
            ))}
          </Stagger>
        </Card>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">{selected.fileName}</h2>
              <Badge className="mt-2" tone={selected.status === 'verified' ? 'green' : 'amber'}>
                {selected.status === 'verified' ? 'OCR Selesai' : 'Perlu Verifikasi'}
              </Badge>
            </div>
            <Badge tone="green">Terverifikasi</Badge>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <img
                alt={`Pratinjau bukti visual sintetis ${selected.fileName}`}
                className="h-full min-h-44 w-full object-cover"
                src={selected.imageSrc}
              />
            </div>
            <div className="grid gap-3 text-sm">
              {[
                ['Jenis File', selected.metadata.fileType],
                ['Ukuran', selected.metadata.size],
                ['Resolusi', selected.metadata.resolution],
                ['Diunggah', selected.uploadedAt],
                ['Sumber', selected.metadata.source],
                ['Domain', selected.metadata.domain],
                ['Hash SHA-256', selected.metadata.hash],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-4" key={label}>
                  <span className="text-slate-500">{label}</span>
                  <span className="flex items-center gap-2 text-right font-semibold text-slate-800">
                    {value}
                    {label === 'Hash SHA-256' ? <Copy className="h-3.5 w-3.5 text-slate-400" /> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950">Teks Hasil OCR</h3>
              <Badge tone="green">Skor OCR: {selected.ocrScore}%</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.ocrText.map((text, index) => (
                <span
                  className={`rounded px-2 py-1 font-mono text-sm ${
                    index === 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : index === 1
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                  }`}
                  key={text}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <h3 className="font-bold text-slate-950">Entitas yang Diekstraksi</h3>
            <div className="mt-3 space-y-2">
              {selected.extractedEntities.map((entity) => (
                <div
                  className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm md:grid-cols-[0.8fr_1fr_0.8fr_0.5fr]"
                  key={`${entity.label}-${entity.value}`}
                >
                  <span className="font-semibold text-slate-700">{entity.label}</span>
                  <span className="text-slate-950">{entity.value}</span>
                  <span className="text-slate-500">Tipe: {entity.type}</span>
                  <span className="font-bold text-emerald-600">{entity.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="font-bold text-emerald-700">Terverifikasi</p>
            <p className="mt-1 text-sm text-slate-600">
              Bukti telah diverifikasi oleh penyidik. Oleh: {selected.verifiedBy} · {selected.verifiedAt}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Button variant="secondary">
              <Save className="h-4 w-4" />
              Simpan Bukti
            </Button>
            <Button variant="secondary">
              <Network className="h-4 w-4" />
              Lihat di Graph
            </Button>
            <Button>
              <Eye className="h-4 w-4" />
              Tambahkan ke Kasus
            </Button>
          </div>
          </Card>
        </motion.div>
      </div>
    </MotionPage>
  )
}
