"use client";

import {
  Camera,
  ClipboardText,
  FilePdf,
  GlobeHemisphereWest,
  Graph,
  ListChecks,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workflow/app-shell";
import { CaseContextBanner, PipelineProgress } from "@/components/workflow/case-context";
import { EntityRow } from "@/components/workflow/entity-row";
import { EvidenceRow } from "@/components/workflow/evidence-row";
import { ReviewControls } from "@/components/workflow/review-controls";
import { SectionCard } from "@/components/workflow/section-card";
import {
  getCaseById,
  getCaseEntities,
  getCaseEvidence,
  getCaseProgress,
  getCaseReviewSummary,
  useDemoStore,
} from "@/lib/demo-store";

type CaseTab = "summary" | "crawl" | "ocr" | "graph" | "review" | "report";

const tabs: Array<{ href: string; icon: typeof ListChecks; id: CaseTab; label: string }> = [
  { href: "#summary", icon: ListChecks, id: "summary", label: "Ringkasan" },
  { href: "/crawler", icon: GlobeHemisphereWest, id: "crawl", label: "Crawl" },
  { href: "/screenshots", icon: Camera, id: "ocr", label: "OCR" },
  { href: "/evidence-graph", icon: Graph, id: "graph", label: "Graph" },
  { href: "/review", icon: ClipboardText, id: "review", label: "Review" },
  { href: "/reports", icon: FilePdf, id: "report", label: "Laporan" },
];

export function CaseWorkspacePage({ caseId }: { caseId: string }) {
  const store = useDemoStore();
  const [activeTab, setActiveTab] = useState<CaseTab>("summary");
  const selectedCase = getCaseById(store, caseId);
  const evidence = getCaseEvidence(store, selectedCase.id);
  const entities = getCaseEntities(store, selectedCase.id);
  const graphNodes = store.graphNodes.filter((item) => item.caseId === selectedCase.id);
  const graphEdges = store.graphEdges.filter((item) => item.caseId === selectedCase.id);
  const progress = getCaseProgress(store, selectedCase.id);
  const reviewSummary = getCaseReviewSummary(store, selectedCase.id);
  const auditTrail = useMemo(
    () => store.auditTrail.filter((item) => item.caseId === selectedCase.id).slice(0, 5),
    [selectedCase.id, store.auditTrail],
  );

  useEffect(() => {
    store.actions.selectCase(selectedCase.id);
  }, [selectedCase.id, store.actions]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1320px] space-y-7">
        <header>
          <Badge className="mb-4 rounded-full px-4 py-2" variant="outline">
            Detail Kasus
          </Badge>
          <h1 className="text-4xl font-black text-foreground md:text-5xl">{selectedCase.name}</h1>
          <p className="mt-3 max-w-4xl text-xl leading-relaxed text-muted-foreground">
            Workspace tunggal untuk melihat crawl, OCR, graph, human review, dan laporan case ini.
          </p>
        </header>

        <CaseContextBanner selectedCase={selectedCase} showBackLink={false} store={store} />

        <div className="grid gap-3 lg:grid-cols-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            if (tab.id !== "summary") {
              return (
                <Button asChild className="h-12 justify-start" key={tab.id} variant="secondary">
                  <Link href={tab.href}>
                    <Icon aria-hidden size={20} />
                    {tab.label}
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                className="h-12 justify-start"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                variant={active ? "default" : "secondary"}
              >
                <Icon aria-hidden size={20} />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <SectionCard title="Progress Pipeline">
              <PipelineProgress progress={progress} />
            </SectionCard>
            <SectionCard title="Bukti Case">
              <div className="hidden py-2 text-muted-foreground lg:grid lg:grid-cols-[250px_130px_120px_1fr_220px]">
                <span>Jenis Bukti</span>
                <span>Status</span>
                <span>Progress</span>
                <span>Deskripsi</span>
                <span>Human Review</span>
              </div>
              {evidence.map((item) => (
                <EvidenceRow
                  item={item}
                  key={item.id}
                  onReview={(decision) => store.actions.setEvidenceReview(item.id, decision)}
                  onSelect={() => store.actions.selectEvidence(item.id)}
                />
              ))}
            </SectionCard>
            <SectionCard title="Entitas Terdeteksi">
              <div className="space-y-3">
                {entities.map((entity) => (
                  <EntityRow
                    entity={entity}
                    key={entity.id}
                    onReview={(decision) => store.actions.setEntityReview(entity.id, decision)}
                  />
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Ringkasan Review">
              <Metric label="Verified" value={reviewSummary.verified} />
              <Metric label="Perlu review" value={reviewSummary.unresolvedTotal} />
              <Metric label="Draft" value={reviewSummary.draft} />
              <Metric label="Rejected" value={reviewSummary.rejected} />
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Keputusan final case
                </p>
                <ReviewControls
                  current={selectedCase.reviewDecision}
                  onDecision={store.actions.setReviewDecision}
                  size="default"
                />
              </div>
            </SectionCard>
            <SectionCard title="Graph Case">
              <Metric label="Node" value={graphNodes.length} />
              <Metric label="Relasi" value={graphEdges.length} />
              <Button asChild className="mt-5 h-11 w-full" variant="secondary">
                <Link href="/evidence-graph">Buka Evidence Graph</Link>
              </Button>
            </SectionCard>
            <SectionCard title="Audit Terakhir">
              <div className="space-y-3">
                {auditTrail.map((event) => (
                  <div
                    className="rounded-lg border border-border bg-background/35 p-3"
                    key={event.id}
                  >
                    <p className="font-medium text-foreground">{event.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{event.at}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-t border-border py-3 first:border-t-0">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-foreground">{value}</strong>
    </div>
  );
}
