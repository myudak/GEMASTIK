"use client";

import {
  CaretRight,
  CheckCircle,
  Copy,
  FileText,
  FloppyDisk,
  Graph,
  Info,
  Link as LinkIcon,
  ListChecks,
  Plus,
  ShieldCheck,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/workflow/app-shell";
import { EntityRow } from "@/components/workflow/entity-row";
import { EvidenceFlow } from "@/components/workflow/evidence-flow";
import { EvidenceRow } from "@/components/workflow/evidence-row";
import { PrimaryButton } from "@/components/workflow/primary-button";
import { SectionCard } from "@/components/workflow/section-card";
import { CompletedProcessPanel, CrawlSummaryPanel } from "@/components/workflow/summary-panel";
import { StepProgress } from "@/components/workflow/step-progress";
import {
  detectedEntities,
  evidenceItems,
  reviewSummary,
  riskSignals,
  type WorkflowStepId,
  workflowSteps,
} from "@/lib/workflow-data";

type WorkflowPageProps = {
  stepId: WorkflowStepId;
};

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
        <StepProgress activeStep={stepId} />
        <div className="mt-7">{renderStep(stepId)}</div>
      </div>
    </AppShell>
  );
}

function renderStep(stepId: WorkflowStepId) {
  if (stepId === "seed") return <SeedStep />;
  if (stepId === "crawl") return <CrawlStep />;
  if (stepId === "ocr") return <OcrStep />;
  if (stepId === "graph") return <GraphStep />;
  return <ReviewStep />;
}

function SeedStep() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
      <div>
        <SectionCard title="Tambah Seed Investigasi">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-lg font-medium text-foreground">Jenis Seed</p>
              <RadioGroup className="grid gap-3 sm:grid-cols-2" defaultValue="url">
                <SeedChoice label="URL" value="url" />
                <SeedChoice label="Domain" value="domain" />
              </RadioGroup>
            </div>
            <Field
              label="URL / Domain"
              placeholder="Contoh: https://example.com atau example.com"
            />
            <Field label="Nama Kasus" placeholder="Contoh: Investigasi Situs Example" />
            <label className="block">
              <span className="mb-3 block text-lg font-medium text-foreground">Catatan Awal</span>
              <Textarea
                className="min-h-[124px] resize-none bg-background/35 px-4 py-4 text-lg"
                placeholder="Tuliskan konteks, tujuan, atau informasi penting terkait kasus ini..."
              />
            </label>
          </div>
        </SectionCard>
        <div className="mt-6 flex flex-wrap gap-5">
          <PrimaryButton href="/crawler">Mulai Investigasi</PrimaryButton>
          <Button className="h-14 gap-3 px-7 text-base font-semibold" variant="secondary">
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
    </div>
  );
}

function CrawlStep() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <SectionCard title="Hasil Crawl">
          <Separator />
          <div className="hidden py-4 text-muted-foreground lg:grid lg:grid-cols-[220px_130px_120px_1fr]">
            <span>Jenis Bukti</span>
            <span>Status</span>
            <span>Waktu</span>
            <span>Deskripsi</span>
          </div>
          {evidenceItems.map((item) => (
            <EvidenceRow item={item} key={item.label} />
          ))}
        </SectionCard>
        <div className="space-y-5">
          <CrawlSummaryPanel />
          <CompletedProcessPanel />
        </div>
      </div>
      <StepActions back="/cases/new" next="/screenshots" nextLabel="Lanjut ke OCR" />
    </>
  );
}

function OcrStep() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_600px]">
        <SectionCard title="Bukti Visual (Screenshot)">
          <PromoEvidence />
          <h3 className="mb-3 mt-6 text-lg font-medium text-foreground">Teks Hasil OCR</h3>
          <div className="relative rounded-lg border border-border bg-background/35 p-4 font-mono text-base leading-7 text-foreground">
            <Button
              aria-label="Salin teks OCR"
              className="absolute right-3 top-3"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Copy aria-hidden size={22} />
            </Button>
            PROMO SPESIAL
            <br />
            BONUS DEPOSIT 100%
            <br />
            RTP TINGGI - MENANG LEBIH SERING
            <br />
            HUBUNGI: PROMO-TG88
            <br />
            PEMBAYARAN VIA DANA
          </div>
        </SectionCard>
        <div className="space-y-5">
          <SectionCard title="Entitas Terdeteksi">
            <div className="space-y-3">
              {detectedEntities.map((entity) => (
                <EntityRow entity={entity} key={entity.category} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Catatan Sistem">
            <Checklist
              items={["OCR confidence 94%", "1 entitas perlu review", "5 entitas tersimpan"]}
            />
          </SectionCard>
        </div>
      </div>
      <StepActions back="/crawler" next="/evidence-graph" nextLabel="Lanjut ke Graph" />
    </>
  );
}

function GraphStep() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div>
          <SectionCard>
            <EvidenceFlow />
          </SectionCard>
          <div className="mt-5 rounded-lg border border-primary/28 bg-primary/10 px-7 py-5 text-lg text-foreground">
            <Info aria-hidden className="mr-4 inline text-primary" size={28} />
            Hubungan ini adalah sinyal awal dan tetap memerlukan verifikasi manusia.
          </div>
        </div>
        <SectionCard title="Skor Risiko">
          <div className="mx-auto grid size-44 place-items-center rounded-full border-[9px] border-destructive/80 text-center">
            <div>
              <span className="text-6xl font-black text-destructive">
                {reviewSummary.riskScore}
              </span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
          </div>
          <Badge
            className="mx-auto mt-4 flex h-10 w-fit rounded-full border-destructive/30 bg-destructive/14 px-8 text-xl font-bold text-destructive"
            variant="outline"
          >
            Kritis
          </Badge>
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-5 text-lg font-bold text-foreground">Alasan Skor Risiko Tinggi</h3>
            <div className="space-y-4">
              {riskSignals.map((signal) => (
                <div
                  className="flex items-center gap-4 text-lg text-muted-foreground"
                  key={signal.label}
                >
                  <WarningCircle aria-hidden className="text-destructive" size={25} />
                  {signal.label}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
      <StepActions back="/screenshots" next="/review" nextLabel="Lanjut ke Review" />
    </>
  );
}

function ReviewStep() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
      <div className="space-y-5">
        <SectionCard title="Ringkasan Kasus">
          <ReviewLine
            icon={<ShieldCheck size={28} />}
            label="Nama Kasus"
            value={reviewSummary.caseName}
          />
          <ReviewLine
            icon={<LinkIcon size={28} />}
            label="Seed Utama"
            value={reviewSummary.seed}
            accent
          />
          <ReviewLine
            icon={<FileText size={28} />}
            label="Jumlah Bukti"
            value={String(reviewSummary.evidenceCount)}
          />
          <ReviewLine
            icon={<ListChecks size={28} />}
            label="Jumlah Entitas"
            value={String(reviewSummary.entityCount)}
          />
          <ReviewLine
            icon={<ShieldCheck size={28} />}
            label="Skor Risiko"
            value={`${reviewSummary.riskScore} / 100`}
            pill
          />
          <ReviewLine
            icon={<Info size={28} />}
            label="Catatan Investigator"
            value={reviewSummary.note}
          />
        </SectionCard>
        <SectionCard title="Bukti Terverifikasi">
          <Checklist
            items={[
              "Metadata halaman publik",
              "Screenshot promosi sintetis",
              "Tautan keluar dan referral",
            ]}
          />
        </SectionCard>
      </div>
      <div className="space-y-5">
        <SectionCard title="Aksi Review">
          <div className="space-y-4">
            <ReviewAction icon={<ShieldCheck size={30} />} label="Verifikasi Kasus" active />
            <ReviewAction icon={<Plus size={30} />} label="Minta Bukti Tambahan" />
            <ReviewAction icon={<XCircle size={30} />} label="Tandai Ditolak" />
          </div>
        </SectionCard>
        <SectionCard title="Struktur Laporan">
          <ReportItem icon={<FileText size={27} />} label="Ringkasan Eksekutif" />
          <ReportItem icon={<Graph size={27} />} label="Evidence Graph" />
          <ReportItem icon={<LinkIcon size={27} />} label="Lampiran Bukti" />
          <ReportItem icon={<Info size={27} />} label="Audit Trail" />
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

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium text-foreground">{label}</span>
      <Input className="h-[52px] bg-background/35 px-4 text-lg" placeholder={placeholder} />
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

function PromoEvidence() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background/35">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <strong className="text-2xl text-foreground">
          TG<span className="text-primary">88</span>
        </strong>
        <div className="hidden gap-6 text-xs font-bold text-muted-foreground sm:flex">
          <span>BERANDA</span>
          <span>PROMO</span>
          <span>PERMAINAN</span>
          <span>BANTUAN</span>
        </div>
      </div>
      <div className="grid min-h-[248px] gap-5 p-9 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-bold text-primary">PROMO SPESIAL</p>
          <p className="mt-3 text-3xl font-black text-foreground">
            BONUS DEPOSIT <span className="text-primary">100%</span>
          </p>
          <p className="mt-2 text-xl font-bold text-foreground">RTP TINGGI - MENANG LEBIH SERING</p>
          <Badge className="mt-6 rounded-lg px-5 py-3 text-lg font-black" variant="default">
            HUBUNGI: PROMO-TG88
          </Badge>
          <p className="mt-6 text-lg font-semibold text-foreground">PEMBAYARAN VIA DANA</p>
        </div>
        <div className="grid place-items-center">
          <div className="grid size-[152px] place-items-center rounded-lg border border-primary/40 bg-primary/10 text-center text-3xl font-black text-primary shadow-[0_0_42px_color-mix(in_oklch,var(--primary)_28%,transparent)]">
            BONUS
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewLine({
  icon,
  label,
  value,
  accent,
  pill,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  pill?: boolean;
}) {
  return (
    <div className="grid grid-cols-[34px_1fr_1.1fr] items-center gap-5 border-t border-border py-4 text-lg first:border-t-0">
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
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      className="h-16 w-full justify-start gap-5 px-6 text-left text-xl font-semibold"
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
