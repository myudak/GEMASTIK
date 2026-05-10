import { LockKeyhole, ShieldCheck, UserCog } from 'lucide-react'
import { Badge, Button, Card } from '../components/ui'

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Pengaturan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mock pengaturan akses, audit trail, dan keamanan demo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Role-based Access Control', 'Investigator, Analis Siber, Peneliti, Admin', UserCog],
          ['Evidence Provenance', 'Hash, timestamp, reviewer, dan sumber bukti', ShieldCheck],
          ['Keamanan & Privasi', 'Enkripsi, audit log, dan pembatasan akses', LockKeyhole],
        ].map(([title, detail, Icon]) => (
          <Card className="p-5" key={title as string}>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-bold text-slate-950">{title as string}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{detail as string}</p>
            <Badge className="mt-4" tone="green">Aktif di demo</Badge>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-bold text-slate-950">Audit Trail</h2>
        <div className="mt-4 space-y-3">
          {[
            'Andi Pratama menandai slot-gacor88.test sebagai high risk.',
            'Sistem membuat hash bukti untuk promo_100_bonus.jpg.',
            'Dewi Anggraini memvalidasi relasi mirror cluster.',
            'Report export disiapkan untuk presentasi demo.',
          ].map((item) => (
            <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600" key={item}>
              {item}
            </div>
          ))}
        </div>
        <Button className="mt-5" variant="secondary">Unduh Audit Log</Button>
      </Card>
    </div>
  )
}
