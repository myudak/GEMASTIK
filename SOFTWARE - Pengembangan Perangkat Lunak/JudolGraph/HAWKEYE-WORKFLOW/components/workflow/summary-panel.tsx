"use client";

import {
  CheckCircle,
  Database,
  GlobeHemisphereWest,
  Hash,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { SectionCard } from "@/components/workflow/section-card";
import { reviewSummary } from "@/lib/workflow-data";

export function CrawlSummaryPanel() {
  return (
    <SectionCard title="Ringkasan">
      <div className="divide-y divide-white/10">
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
          <div className="flex items-center gap-4 text-lg text-slate-100" key={item}>
            <CheckCircle aria-hidden className="text-blue-400" size={24} />
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
    <div className="grid grid-cols-[32px_1fr_1.1fr] items-center gap-4 py-4 text-lg">
      <span className="text-slate-300">{icon}</span>
      <span className="text-slate-100">{label}</span>
      <span
        className={
          highlight
            ? "w-fit rounded-[8px] border border-blue-400/40 bg-blue-500/12 px-3 py-2 text-blue-300"
            : "text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}
