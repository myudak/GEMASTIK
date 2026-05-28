"use client";

import {
  CheckCircle,
  Database,
  GlobeHemisphereWest,
  Hash,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/workflow/section-card";
import { reviewSummary } from "@/lib/workflow-data";

export function CrawlSummaryPanel() {
  return (
    <SectionCard title="Ringkasan">
      <div>
        <SummaryRow
          icon={<GlobeHemisphereWest size={26} />}
          label="URL / Domain Seed"
          value={reviewSummary.seed}
        />
        <SummaryRow
          icon={<Database size={26} />}
          label="Jumlah Bukti"
          value={String(reviewSummary.evidenceCount)}
        />
        <SummaryRow
          icon={<Hash size={26} />}
          label="Hash SHA-256 Tersimpan"
          value="a3b7d9f0e2c6...8f1a2b4c7d9e"
        />
        <SummaryRow
          icon={<LinkIcon size={26} />}
          label="Status Pipeline"
          value="Berjalan"
          highlight
        />
      </div>
    </SectionCard>
  );
}

export function CompletedProcessPanel() {
  const items = [
    "Ambil HTML publik",
    "Ekstraksi teks halaman",
    "Simpan screenshot",
    "Simpan hash integritas",
  ];

  return (
    <SectionCard title="Proses yang dilakukan">
      <div className="space-y-5">
        {items.map((item) => (
          <div className="flex items-center gap-4 text-lg text-foreground" key={item}>
            <CheckCircle aria-hidden className="text-primary" size={24} />
            {item}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-[32px_1fr_1.1fr] items-center gap-4 py-4 text-lg">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-foreground">{label}</span>
        {highlight ? (
          <Badge
            className="w-fit rounded-lg border-primary/40 bg-primary/12 px-3 py-2 text-primary"
            variant="outline"
          >
            {value}
          </Badge>
        ) : (
          <span className="text-foreground">{value}</span>
        )}
      </div>
    </>
  );
}
