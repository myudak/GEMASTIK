"use client";

import {
  ArrowLeft,
  ClipboardText,
  Gauge,
  Link as LinkIcon,
  ShieldCheck,
} from "@phosphor-icons/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/workflow/section-card";
import {
  getCaseProgress,
  getCaseReviewSummary,
  getCaseRoute,
  type DemoState,
} from "@/lib/demo-store";
import type { DemoCase } from "@/lib/workflow-data";

export const pipelineStages = [
  "Validasi seed",
  "Ambil metadata",
  "Screenshot publik",
  "OCR",
  "Bentuk graph",
  "Siap review",
];

export function CaseContextBanner({
  selectedCase,
  showBackLink = true,
  store,
}: {
  selectedCase: DemoCase;
  showBackLink?: boolean;
  store: DemoState;
}) {
  const progress = getCaseProgress(store, selectedCase.id);
  const summary = getCaseReviewSummary(store, selectedCase.id);

  return (
    <SectionCard>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Case aktif</Badge>
            <Badge variant={selectedCase.riskLevel === "Critical" ? "destructive" : "secondary"}>
              Risiko {selectedCase.riskScore}/100
            </Badge>
            <Badge variant="outline">{selectedCase.reviewDecision}</Badge>
          </div>
          <h2 className="text-2xl font-black text-foreground">{selectedCase.name}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <LinkIcon aria-hidden size={17} />
              {selectedCase.seed}
            </span>
            <span className="inline-flex items-center gap-2">
              <ClipboardText aria-hidden size={17} />
              {summary.unresolvedTotal} item perlu review
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck aria-hidden size={17} />
              {summary.verified} item verified
            </span>
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Gauge aria-hidden size={17} />
              Progress case
            </span>
            <strong className="text-foreground">{progress}%</strong>
          </div>
          <Progress className="h-2" value={progress} />
          {showBackLink ? (
            <Button asChild className="mt-4 h-10 w-full" variant="secondary">
              <Link href={getCaseRoute(selectedCase.id)}>
                <ArrowLeft aria-hidden size={18} />
                Kembali ke Detail Kasus
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

export function PipelineProgress({ progress }: { progress: number }) {
  const activeIndex = Math.min(pipelineStages.length - 1, Math.floor(progress / 18));

  return (
    <div className="space-y-4">
      <Progress className="h-2" value={progress} />
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {pipelineStages.map((stage, index) => (
          <div
            className={
              index <= activeIndex
                ? "rounded-lg border border-primary bg-primary/10 p-3 text-sm font-semibold text-primary"
                : "rounded-lg border border-border bg-background/35 p-3 text-sm text-muted-foreground"
            }
            key={stage}
          >
            {stage}
          </div>
        ))}
      </div>
    </div>
  );
}
