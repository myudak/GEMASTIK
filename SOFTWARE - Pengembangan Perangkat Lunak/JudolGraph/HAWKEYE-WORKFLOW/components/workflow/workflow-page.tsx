"use client";

import {
  ArrowRight,
  CaretRight,
  CheckCircle,
  Copy,
  FileText,
  FloppyDisk,
  Graph,
  Hash,
  Info,
  Link as LinkIcon,
  ListChecks,
  Plus,
  ShieldCheck,
  XCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducer, useState, type FormEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/workflow/app-shell";
import { EntityRow } from "@/components/workflow/entity-row";
import { EvidenceFlow } from "@/components/workflow/evidence-flow";
import { EvidenceAction } from "@/components/workflow/evidence-action";
import { EvidenceRow } from "@/components/workflow/evidence-row";
import { StatusBadge } from "@/components/workflow/evidence-status-badge";
import { PrimaryButton } from "@/components/workflow/primary-button";
import { SectionCard } from "@/components/workflow/section-card";
import { CompletedProcessPanel, CrawlSummaryPanel } from "@/components/workflow/summary-panel";
import {
  getCaseEntities,
  getCaseEvidence,
  getSelectedCase,
  getSelectedEvidence,
  getSelectedGraphNode,
  useDemoStore,
} from "@/lib/demo-store";
import type {
  GraphNodeType,
  OcrEvidence,
  SeedInput,
  VerificationStatus,
  WorkflowStepId,
} from "@/lib/workflow-data";
import { workflowSteps } from "@/lib/workflow-data";

type WorkflowPageProps = {
  stepId: WorkflowStepId;
};

type SeedFormState = SeedInput;

const graphTypeFilters: Array<"all" | GraphNodeType> = [
  "all",
  "domain",
  "channel",
  "payment",
  "referral",
  "mirror",
  "screenshot",
  "keyword",
];
const graphStatusFilters: Array<"all" | VerificationStatus> = [
  "all",
  "Verified",
  "Need Review",
  "Rejected",
];

export function WorkflowPage({ stepId }: WorkflowPageProps) {
  const step = workflowSteps.find((item) => item.id === stepId) ?? workflowSteps[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1320px]">
        <header>
          <h1 className="text-4xl font-black text-foreground md:text-5xl">{step.title}</h1>
          <p className="mt-3 max-w-5xl text-xl leading-relaxed text-muted-foreground">
            {step.subtitle}
          </p>
        </header>
        <StepProgressShell activeStep={stepId} />
        <div className="mt-7">
          <StepContent stepId={stepId} />
        </div>
      </div>
    </AppShell>
  );
}

function StepContent({ stepId }: { stepId: WorkflowStepId }) {
  if (stepId === "seed") return <SeedStep />;
  if (stepId === "crawl") return <CrawlStep />;
  if (stepId === "ocr") return <OcrStep />;
  if (stepId === "graph") return <GraphStep />;
  return <ReviewStep />;
}

function StepProgressShell({ activeStep }: { activeStep: WorkflowStepId }) {
  return (
    <div className="mt-9">
      {/* imported component kept in page shell via route state */}
      <StepProgressInline activeStep={activeStep} />
    </div>
  );
}

function StepProgressInline({ activeStep }: { activeStep: WorkflowStepId }) {
  const activeIndex = workflowSteps.findIndex((item) => item.id === activeStep);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {workflowSteps.map((step, index) => {
        const active = step.id === activeStep;
        const done = index < activeIndex;

        return (
          <Link
            className="group flex items-center gap-3 rounded-lg border border-border bg-card/65 p-3 transition hover:border-primary"
            href={step.href}
            key={step.id}
          >
            <span
              className={
                active || done
                  ? "grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
                  : "grid size-9 place-items-center rounded-full border border-border text-muted-foreground"
              }
            >
              {done ? <CheckCircle aria-hidden size={19} /> : step.number}
            </span>
            <span>
              <span
                className={
                  active
                    ? "block font-bold text-foreground"
                    : "block font-medium text-muted-foreground"
                }
              >
                {step.label}
              </span>
              <span className="text-xs text-muted-foreground">{step.title}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function SeedStep() {
  const { actions } = useDemoStore();
  const { push } = useRouter();
  const [formState, updateFormState] = useReducer(
    (state: SeedFormState, patch: Partial<SeedFormState>) => ({ ...state, ...patch }),
    {
      caseName: "Operasi Demo HAWKEYE",
      note: "Validasi sumber publik, tidak membutuhkan login.",
      seed: "https://slot-gacor88.xyz",
      seedType: "url",
    },
  );
  const [message, setMessage] = useState<string | null>(null);

  function submitCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = actions.createCase(formState);

    setMessage(result.message);
    if (result.ok) push("/crawler");
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_430px]" onSubmit={submitCase}>
      <div>
        <SectionCard title="Tambah Seed Investigasi">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-lg font-medium text-foreground">Jenis Seed</p>
              <RadioGroup
                className="grid gap-3 sm:grid-cols-2"
                onValueChange={(value) =>
                  updateFormState({ seedType: value === "domain" ? "domain" : "url" })
                }
                value={formState.seedType}
              >
                <SeedChoice label="URL" value="url" />
                <SeedChoice label="Domain" value="domain" />
              </RadioGroup>
            </div>
            <Field
              label="URL / Domain"
              onChange={(seed) => updateFormState({ seed })}
              placeholder="Contoh: https://example.com atau example.com"
              value={formState.seed}
            />
            <Field
              label="Nama Kasus"
              onChange={(caseName) => updateFormState({ caseName })}
              placeholder="Contoh: Investigasi Situs Example"
              value={formState.caseName}
            />
            <label className="block" htmlFor="case-note">
              <span className="mb-3 block text-lg font-medium text-foreground">Catatan Awal</span>
              <Textarea
                className="min-h-[124px] resize-none bg-background/35 p-4 text-lg"
                id="case-note"
                onChange={(event) => updateFormState({ note: event.target.value })}
                placeholder="Tuliskan konteks, tujuan, atau informasi penting terkait kasus ini..."
                value={formState.note}
              />
            </label>
            {message ? (
              <p className="rounded-lg border border-border bg-background/35 p-3 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
          </div>
        </SectionCard>
        <div className="mt-6 flex flex-wrap gap-5">
          <Button className="h-14 gap-3 px-7 text-base font-semibold" type="submit">
            <ArrowRight aria-hidden size={24} />
            Mulai Investigasi
          </Button>
          <Button
            className="h-14 gap-3 px-7 text-base font-semibold"
            type="button"
            variant="secondary"
          >
            <FloppyDisk aria-hidden size={24} />
            Simpan Draft
          </Button>
        </div>
      </div>
      <div className="space-y-5">
        <SectionCard title="Validasi Seed">
          <Checklist
            items={["Sumber publik", "Tidak memerlukan login", "Tidak melanggar otorisasi"]}
          />
        </SectionCard>
        <SectionCard title="Yang akan dilakukan sistem">
          <Checklist
            items={[
              "Ambil metadata halaman",
              "Ambil screenshot publik",
              "Ekstraksi tautan publik",
              "Siapkan antrean OCR",
            ]}
          />
        </SectionCard>
      </div>
    </form>
  );
}

function CrawlStep() {
  const store = useDemoStore();
  const selectedCase = getSelectedCase(store);
  const evidence = getCaseEvidence(store);
  const selectedEvidence = getSelectedEvidence(store);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <SectionCard title="Hasil Crawl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground">{selectedCase.name}</p>
            <StatusBadge status={selectedCase.reviewDecision} />
          </div>
          <Separator />
          <div className="hidden py-4 text-muted-foreground lg:grid lg:grid-cols-[250px_130px_120px_1fr]">
            <span>Jenis Bukti</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Deskripsi</span>
          </div>
          {evidence.map((item) => (
            <EvidenceRow
              item={item}
              key={item.id}
              onSelect={() => store.actions.selectEvidence(item.id)}
              selected={item.id === selectedEvidence.id}
            />
          ))}
        </SectionCard>
        <div className="space-y-5">
          <CrawlSummaryPanel evidence={evidence} selectedCase={selectedCase} />
          <SectionCard title="Detail Bukti Dipilih">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">{selectedEvidence.title}</h3>
              <p className="text-muted-foreground">{selectedEvidence.description}</p>
              <InfoGrid
                items={[
                  ["Status", selectedEvidence.status],
                  ["Confidence", `${selectedEvidence.confidence}%`],
                  ["Hash", selectedEvidence.hash.slice(0, 24) + "..."],
                  ["Sumber", selectedEvidence.source],
                ]}
              />
            </div>
          </SectionCard>
          <CompletedProcessPanel />
        </div>
      </div>
      <StepActions back="/cases/new" next="/screenshots" nextLabel="Lanjut ke OCR" />
    </>
  );
}

function OcrStep() {
  const store = useDemoStore();
  const evidence = getCaseEvidence(store);
  const ocrEvidence = evidence.filter(isOcrEvidence);
  const selectedEvidence = getSelectedEvidence(store);
  const selectedOcr = isOcrEvidence(selectedEvidence) ? selectedEvidence : ocrEvidence[0];
  const relatedEntityIds = new Set(selectedOcr?.entityIds ?? []);
  const relatedEntities = getCaseEntities(store).filter((entity) =>
    relatedEntityIds.has(entity.id),
  );
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function copyOcrText() {
    if (!selectedOcr?.ocrText) return;
    await navigator.clipboard.writeText(selectedOcr.ocrText);
    setCopyMessage("Teks OCR disalin untuk demo.");
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_560px]">
        <SectionCard title="Bukti Visual (Screenshot)">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {ocrEvidence.map((item) => (
              <button
                className={
                  item.id === selectedOcr?.id
                    ? "rounded-lg border border-primary bg-primary/12 p-3 text-left"
                    : "rounded-lg border border-border bg-background/35 p-3 text-left transition hover:border-primary"
                }
                key={item.id}
                onClick={() => store.actions.selectEvidence(item.id)}
                type="button"
              >
                <span className="block text-sm font-bold text-foreground">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.confidence}% · {item.status}
                </span>
              </button>
            ))}
          </div>
          {selectedOcr ? <OcrEvidencePreview item={selectedOcr} /> : null}
          <div className="mb-3 mt-6 flex items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-foreground">Teks Hasil OCR</h3>
            <EvidenceAction onClick={copyOcrText}>
              <Copy aria-hidden size={18} />
              Salin OCR
            </EvidenceAction>
          </div>
          <div className="relative whitespace-pre-wrap rounded-lg border border-border bg-background/35 p-4 font-mono text-base leading-7 text-foreground">
            {selectedOcr?.ocrText}
          </div>
          {copyMessage ? <p className="mt-3 text-sm text-primary">{copyMessage}</p> : null}
        </SectionCard>
        <div className="space-y-5">
          <SectionCard title="Entitas dari Bukti Dipilih">
            <div className="space-y-3">
              {relatedEntities.map((entity) => (
                <EntityRow entity={entity} key={entity.id} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Catatan Sistem">
            <Checklist
              items={[
                `OCR confidence ${selectedOcr?.confidence ?? 0}%`,
                `${relatedEntities.filter((item) => item.status === "Need Review").length} entitas perlu review`,
                `${relatedEntities.length} entitas tersimpan`,
              ]}
            />
          </SectionCard>
        </div>
      </div>
      <StepActions back="/crawler" next="/evidence-graph" nextLabel="Lanjut ke Graph" />
    </>
  );
}

function GraphStep() {
  const store = useDemoStore();
  const selectedCase = getSelectedCase(store);
  const [typeFilter, setTypeFilter] = useState<"all" | GraphNodeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | VerificationStatus>("all");
  const selectedNode = getSelectedGraphNode(store);
  const nodes = store.graphNodes.filter(
    (node) =>
      node.caseId === selectedCase.id &&
      (typeFilter === "all" || node.type === typeFilter) &&
      (statusFilter === "all" || node.status === statusFilter),
  );
  const edges = store.graphEdges.filter((edge) => edge.caseId === selectedCase.id);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div>
          <SectionCard>
            <div className="mb-5 flex flex-wrap gap-2">
              {graphTypeFilters.map((filter) => (
                <FilterButton
                  active={typeFilter === filter}
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                >
                  {filter === "all" ? "Semua tipe" : filter}
                </FilterButton>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {graphStatusFilters.map((filter) => (
                <FilterButton
                  active={statusFilter === filter}
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === "all" ? "Semua status" : filter}
                </FilterButton>
              ))}
            </div>
            <EvidenceFlow
              edges={edges}
              nodes={nodes}
              onSelectNode={store.actions.selectGraphNode}
              selectedNodeId={selectedNode.id}
            />
          </SectionCard>
          <div className="mt-5 rounded-lg border border-primary/28 bg-primary/10 px-7 py-5 text-lg text-foreground">
            <Info aria-hidden className="mr-4 inline text-primary" size={28} />
            Hubungan ini adalah sinyal awal dan tetap memerlukan verifikasi manusia.
          </div>
        </div>
        <SectionCard title="Detail Node">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase text-muted-foreground">{selectedNode.type}</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{selectedNode.label}</h3>
              <p className="mt-2 text-muted-foreground">{selectedNode.subtitle}</p>
            </div>
            <InfoGrid
              items={[
                ["Status", selectedNode.status],
                ["Risk", selectedNode.riskLevel],
                ["Skor", String(selectedNode.score)],
                [
                  "Relasi",
                  String(
                    edges.filter(
                      (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
                    ).length,
                  ),
                ],
              ]}
            />
            <div className="border-t border-border pt-5">
              <h3 className="mb-4 text-lg font-bold text-foreground">Sinyal Risiko</h3>
              <div className="space-y-3">
                {store.riskSignals.map((signal) => (
                  <div
                    className="rounded-lg border border-border bg-background/35 p-3"
                    key={signal.id}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-foreground">{signal.label}</span>
                      <Badge variant="outline">+{signal.weight}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      confidence {Math.round(signal.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
      <StepActions back="/screenshots" next="/review" nextLabel="Lanjut ke Review" />
    </>
  );
}

function ReviewStep() {
  const store = useDemoStore();
  const selectedCase = getSelectedCase(store);
  const evidence = getCaseEvidence(store);
  const entities = getCaseEntities(store);
  const verifiedEvidence = evidence.filter((item) => item.status === "Verified");
  const pendingEvidence = evidence.filter((item) => item.status === "Need Review");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
      <div className="space-y-5">
        <SectionCard title="Ringkasan Kasus">
          <ReviewLine
            icon={<ShieldCheck size={28} />}
            label="Nama Kasus"
            value={selectedCase.name}
          />
          <ReviewLine
            icon={<LinkIcon size={28} />}
            label="Seed Utama"
            value={selectedCase.seed}
            accent
          />
          <ReviewLine
            icon={<FileText size={28} />}
            label="Bukti Verified"
            value={`${verifiedEvidence.length} / ${evidence.length}`}
          />
          <ReviewLine
            icon={<ListChecks size={28} />}
            label="Jumlah Entitas"
            value={String(entities.length)}
          />
          <ReviewLine
            icon={<ShieldCheck size={28} />}
            label="Skor Risiko"
            value={`${selectedCase.riskScore} / 100`}
            pill
          />
          <ReviewLine
            icon={<Info size={28} />}
            label="Catatan Investigator"
            value={selectedCase.summary}
          />
        </SectionCard>
        <SectionCard title="Bukti Terverifikasi">
          <div className="space-y-3">
            {verifiedEvidence.map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/35 p-4"
                key={item.id}
              >
                <span className="text-foreground">{item.title}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="space-y-5">
        <SectionCard title="Aksi Review">
          <div className="space-y-4">
            <ReviewAction
              active={selectedCase.reviewDecision === "Verified"}
              icon={<ShieldCheck size={30} />}
              label="Verified"
              onClick={() => store.actions.setReviewDecision("Verified")}
            />
            <ReviewAction
              active={selectedCase.reviewDecision === "Need Review"}
              icon={<Plus size={30} />}
              label="Need Review"
              onClick={() => store.actions.setReviewDecision("Need Review")}
            />
            <ReviewAction
              active={selectedCase.reviewDecision === "Rejected"}
              icon={<XCircle size={30} />}
              label="Rejected"
              onClick={() => store.actions.setReviewDecision("Rejected")}
            />
          </div>
          <p className="mt-4 rounded-lg border border-border bg-background/35 p-3 text-sm text-muted-foreground">
            {pendingEvidence.length > 0
              ? `${pendingEvidence.length} bukti masih Need Review. Laporan final hanya memuat bukti Verified.`
              : "Semua bukti prioritas sudah melalui human review."}
          </p>
        </SectionCard>
        <SectionCard title="Struktur Laporan">
          <ReportItem icon={<FileText size={27} />} label="Ringkasan Eksekutif" />
          <ReportItem icon={<Graph size={27} />} label="Evidence Graph" />
          <ReportItem icon={<LinkIcon size={27} />} label="Lampiran Bukti Verified" />
          <ReportItem icon={<Hash size={27} />} label="Audit Trail & Hash" />
        </SectionCard>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
          <PrimaryButton href="/evidence-graph" direction="back" variant="secondary">
            Kembali
          </PrimaryButton>
          <PrimaryButton href="/reports">Ekspor Preview Laporan</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function StepActions({ back, next, nextLabel }: { back: string; next: string; nextLabel: string }) {
  return (
    <div className="mt-6 flex flex-wrap gap-5">
      <PrimaryButton href={next}>{nextLabel}</PrimaryButton>
      <PrimaryButton href={back} direction="back" variant="secondary">
        Kembali
      </PrimaryButton>
    </div>
  );
}

function SeedChoice({ label, value }: { label: string; value: string }) {
  return (
    <label
      className="flex h-[52px] items-center gap-4 rounded-lg border border-border bg-background/35 px-4 text-lg text-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
      htmlFor={`seed-${value}`}
    >
      <RadioGroupItem id={`seed-${value}`} value={value} />
      {label}
    </label>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium text-foreground">{label}</span>
      <Input
        className="h-[52px] bg-background/35 px-4 text-lg"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div className="flex items-center gap-4 text-lg text-foreground" key={item}>
          <CheckCircle aria-hidden className="text-primary" size={25} />
          {item}
        </div>
      ))}
    </div>
  );
}

function OcrEvidencePreview({ item }: { item: OcrEvidence }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-background/35">
      <div className="relative aspect-[16/9] w-full">
        <Image
          alt={`${item.title} untuk bukti OCR sintetis.`}
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          src={item.imageSrc}
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>{item.title}</span>
        <span>{item.hash.slice(0, 16)}...</span>
      </figcaption>
    </figure>
  );
}

function ReviewLine({
  accent,
  icon,
  label,
  pill,
  value,
}: {
  accent?: boolean;
  icon: ReactNode;
  label: string;
  pill?: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-3 border-t border-border py-4 text-lg first:border-t-0 md:grid-cols-[34px_180px_1fr] md:items-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          pill
            ? "w-fit rounded-full bg-primary/18 px-4 py-1 font-bold text-primary"
            : accent
              ? "text-primary"
              : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ReviewAction({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-16 w-full justify-start gap-5 px-6 text-left text-xl font-semibold"
      onClick={onClick}
      type="button"
      variant={active ? "outline" : "secondary"}
    >
      {icon}
      {label}
    </Button>
  );
}

function ReportItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border py-4 first:border-t-0">
      <div className="flex items-center gap-4 text-lg text-foreground">
        {icon}
        {label}
      </div>
      <CaretRight aria-hidden className="text-muted-foreground" size={24} />
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3">
      {items.map(([label, value]) => (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/35 p-3"
          key={label}
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="text-right font-medium text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-9 capitalize"
      onClick={onClick}
      size="sm"
      type="button"
      variant={active ? "default" : "outline"}
    >
      {children}
    </Button>
  );
}

function isOcrEvidence(item: unknown): item is OcrEvidence {
  return Boolean(
    item &&
    typeof item === "object" &&
    "imageSrc" in item &&
    "ocrText" in item &&
    (item as { imageSrc?: string }).imageSrc &&
    (item as { ocrText?: string }).ocrText,
  );
}
