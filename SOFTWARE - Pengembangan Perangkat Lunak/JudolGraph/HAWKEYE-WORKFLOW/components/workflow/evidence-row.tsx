"use client";

import { Camera, CheckCircle, FileText, Link as LinkIcon } from "@phosphor-icons/react";

import type { EvidenceItem } from "@/lib/workflow-data";

const evidenceIcons = {
  metadata: FileText,
  screenshot: Camera,
  link: LinkIcon,
};

export function EvidenceRow({ item }: { item: EvidenceItem }) {
  const Icon = evidenceIcons[item.icon];

  return (
    <div className="grid gap-5 border-t border-white/10 py-6 lg:grid-cols-[220px_130px_120px_1fr]">
      <div className="flex items-center gap-4">
        <span className="grid size-[52px] shrink-0 place-items-center rounded-[8px] border border-white/12 bg-blue-500/10 text-blue-400">
          <Icon aria-hidden size={28} />
        </span>
        <span className="font-semibold text-white">{item.label}</span>
      </div>
      <span className="inline-flex h-8 w-fit items-center gap-2 rounded-[8px] border border-emerald-400/28 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300">
        <CheckCircle aria-hidden size={18} />
        {item.status}
      </span>
      <p className="text-slate-300">{item.time}</p>
      <div className="space-y-3">
        {item.preview === "webpage" ? <EvidencePreview /> : null}
        <p className="max-w-80 leading-relaxed text-slate-300">{item.description}</p>
      </div>
    </div>
  );
}

function EvidencePreview() {
  return (
    <div className="h-24 w-[272px] overflow-hidden rounded-[8px] border border-white/16 bg-white text-slate-950 shadow-lg">
      <div className="flex h-6 items-center justify-between border-b border-slate-200 px-3 text-[7px] font-bold">
        <span>Pemerintah Dorong Transformasi</span>
        <span className="text-slate-400">Berita publik</span>
      </div>
      <div className="grid grid-cols-[1fr_80px] gap-2 p-3">
        <div>
          <div className="mb-2 h-3 w-32 rounded bg-slate-900" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-slate-300" />
            <div className="h-1.5 w-4/5 rounded bg-slate-300" />
            <div className="h-1.5 w-3/5 rounded bg-slate-300" />
          </div>
        </div>
        <div className="rounded bg-slate-800" />
      </div>
    </div>
  );
}
