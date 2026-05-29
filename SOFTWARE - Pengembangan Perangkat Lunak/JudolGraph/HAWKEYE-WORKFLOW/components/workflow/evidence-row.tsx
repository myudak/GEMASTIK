"use client";

import { Camera, Code, FileText, Link as LinkIcon, Wallet } from "@phosphor-icons/react";

import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/workflow/evidence-status-badge";
import type { EvidenceItem, EvidenceKind } from "@/lib/workflow-data";

const evidenceIcons: Record<EvidenceKind, typeof FileText> = {
  html: Code,
  link: LinkIcon,
  metadata: FileText,
  mirror: LinkIcon,
  payment: Wallet,
  screenshot: Camera,
};

export function EvidenceRow({
  item,
  onSelect,
  selected = false,
}: {
  item: EvidenceItem;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const Icon = evidenceIcons[item.kind];

  return (
    <>
      <Separator />
      <button
        className="grid w-full gap-5 py-5 text-left transition hover:bg-muted/20 lg:grid-cols-[250px_130px_120px_1fr]"
        onClick={onSelect}
        type="button"
      >
        <div className="flex items-center gap-4 px-1">
          <span
            className={
              selected
                ? "grid size-[52px] shrink-0 place-items-center rounded-lg border border-primary bg-primary/18 text-primary"
                : "grid size-[52px] shrink-0 place-items-center rounded-lg border border-border bg-background/40 text-primary"
            }
          >
            <Icon aria-hidden size={28} />
          </span>
          <span>
            <span className="block font-semibold text-foreground">{item.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{item.source}</span>
          </span>
        </div>
        <StatusBadge status={item.status} />
        <div className="text-sm text-muted-foreground">
          <span className="block">{item.progress}%</span>
          <span className="mt-1 block">{item.collectedAt.split(", ")[1] ?? item.collectedAt}</span>
        </div>
        <div className="space-y-2 pr-2">
          <p className="max-w-2xl leading-relaxed text-muted-foreground">{item.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-2 py-1">
              confidence {item.confidence}%
            </span>
            <span className="rounded-full border border-border px-2 py-1">
              hash {item.hash.slice(0, 10)}...
            </span>
          </div>
        </div>
      </button>
    </>
  );
}
