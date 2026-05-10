import { Network } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/25">
        <Network className="h-5 w-5" />
      </div>
      {compact ? null : (
        <span className="text-xl font-bold text-slate-950">JudolGraph</span>
      )}
    </div>
  )
}
