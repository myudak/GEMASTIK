import { CheckSquare, Square } from 'lucide-react'
import type { ScreenshotEvidence } from '../types'
import { cn } from '../lib/utils'
import { Badge } from './ui'
import { motion } from 'motion/react'

export function SyntheticEvidenceCard({
  item,
  selected,
  onSelect,
}: {
  item: ScreenshotEvidence
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      className={cn(
        'rounded-lg border bg-white p-2 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md',
        selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200',
      )}
      onClick={onSelect}
      layout
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type="button"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-950">
        <img
          alt={`Bukti visual sintetis ${item.fileName}`}
          className="h-full w-full object-cover"
          loading="lazy"
          src={item.imageSrc}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 text-white">
          {selected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
        </div>
        <Badge className="absolute bottom-3 right-3 bg-slate-950/70 text-white" tone="outline">
          {item.metadata.fileType}
        </Badge>
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="truncate text-sm font-semibold text-slate-950">
          {item.fileName}
        </p>
        <p className="mt-1 text-xs text-slate-500">{item.uploadedAt}</p>
        <div className="mt-3 flex items-center justify-between">
          <Badge tone={item.status === 'verified' ? 'green' : 'amber'}>
            {item.status === 'verified' ? 'OCR Selesai' : 'Perlu Verifikasi'}
          </Badge>
          <span className="text-xs font-medium text-slate-600">
            OCR {item.ocrScore}%
          </span>
        </div>
      </div>
    </motion.button>
  )
}
