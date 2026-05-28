"use client";

import { Camera, CheckCircle, FileText, Link as LinkIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { EvidenceItem } from "@/lib/workflow-data";

const evidenceIcons = {
  metadata: FileText,
  screenshot: Camera,
  link: LinkIcon,
};

export function EvidenceRow({ item }: { item: EvidenceItem }) {
  const Icon = evidenceIcons[item.icon];

  return (
    <>
      <Separator />
      <div className="grid gap-5 py-6 lg:grid-cols-[220px_130px_120px_1fr]">
        <div className="flex items-center gap-4">
          <span className="grid size-[52px] shrink-0 place-items-center rounded-lg border border-border bg-primary/10 text-primary">
            <Icon aria-hidden size={28} />
          </span>
          <span className="font-semibold text-foreground">{item.label}</span>
        </div>
        <Badge
          className="h-8 w-fit gap-2 rounded-lg border-emerald-400/28 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300"
          variant="outline"
        >
          <CheckCircle aria-hidden size={18} />
          {item.status}
        </Badge>
        <p className="text-muted-foreground">{item.time}</p>
        <div className="space-y-3">
          {item.preview === "webpage" ? <EvidencePreview /> : null}
          <p className="max-w-80 leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </>
  );
}

function EvidencePreview() {
  return (
    <div className="h-24 w-[272px] overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg">
      <div className="flex h-6 items-center justify-between border-b border-border px-3 text-[7px] font-bold">
        <span>Pemerintah Dorong Transformasi</span>
        <span className="text-muted-foreground">Berita publik</span>
      </div>
      <div className="grid grid-cols-[1fr_80px] gap-2 p-3">
        <div>
          <div className="mb-2 h-3 w-32 rounded bg-foreground" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-muted-foreground/40" />
            <div className="h-1.5 w-4/5 rounded bg-muted-foreground/40" />
            <div className="h-1.5 w-3/5 rounded bg-muted-foreground/40" />
          </div>
        </div>
        <div className="rounded bg-muted" />
      </div>
    </div>
  );
}
