"use client";

import {
  CaretRight,
  CheckCircle,
  Copy,
  Desktop,
  FileText,
  FloppyDisk,
  GlobeHemisphereWest,
  Graph,
  ImageSquare,
  Info,
  Link as LinkIcon,
  ListChecks,
  PaperPlaneTilt,
  Plus,
  ShieldCheck,
  WarningCircle,
  Wallet,
  XCircle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EntityRow } from "@/components/workflow/entity-row";
import { EvidenceRow } from "@/components/workflow/evidence-row";
import { AppShell } from "@/components/workflow/app-shell";
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
          <h1 className="text-4xl font-black text-white md:text-5xl">{step.title}</h1>
          <p className="mt-3 max-w-5xl text-xl leading-relaxed text-slate-300">{step.subtitle}</p>
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
              <p className="mb-3 text-lg font-medium text-white">Jenis Seed</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <SeedChoice active label="URL" />
                <SeedChoice label="Domain" />
              </div>
            </div>
            <Field
              label="URL / Domain"
              placeholder="Contoh: https://example.com atau example.com"
            />
            <Field label="Nama Kasus" placeholder="Contoh: Investigasi Situs Example" />
            <label className="block">
              <span className="mb-3 block text-lg font-medium text-white">Catatan Awal</span>
              <textarea
                className="min-h-[124px] w-full resize-none rounded-[8px] border border-white/16 bg-slate-950/25 px-4 py-4 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                placeholder="Tuliskan konteks, tujuan, atau informasi penting terkait kasus ini..."
              />
            </label>
          </div>
        </SectionCard>
        <div className="mt-6 flex flex-wrap gap-5">
          <PrimaryButton href="/crawler">Mulai Investigasi</PrimaryButton>
          <Button variant="secondary">
            <FloppyDisk aria-hidden size={24} />
            Simpan Draft
          </Button>
        </div>
      </div>
      <div className="space-y-5">
        <SectionCard title="Validasi Seed">
          <Checklist
            items={["Sumber publik", "Tidak memerlukan login", "Tidak melanggar otorisasi"]}
            icon="shield"
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
          <div className="hidden border-t border-white/10 py-4 text-slate-200 lg:grid lg:grid-cols-[220px_130px_120px_1fr]">
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
          <h3 className="mb-3 mt-6 text-lg font-medium text-white">Teks Hasil OCR</h3>
          <div className="relative rounded-[8px] border border-white/14 bg-slate-950/36 p-4 font-mono text-base leading-7 text-slate-100">
            <button className="absolute right-4 top-4 text-slate-300" aria-label="Salin teks OCR">
              <Copy aria-hidden size={24} />
            </button>
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
            <div className="relative h-[420px]">
              <GraphNode
                className="left-[3%] top-[10%]"
                icon="channel"
                title="promo-tg88"
                subtitle="kanal publik"
              />
              <GraphNode
                className="right-[4%] top-[10%]"
                icon="payment"
                title="DANA 0812-xxxx-5678"
                subtitle="indikasi pembayaran"
              />
              <GraphNode
                className="left-[30%] top-[42%] border-blue-500 bg-blue-600/18"
                icon="domain"
                title="slot-gacor88.xyz"
                subtitle="Domain Utama"
                large
              />
              <GraphNode
                className="bottom-[5%] left-[3%]"
                icon="mirror"
                title="Mirror Cluster A"
                subtitle="mirror"
              />
              <GraphNode
                className="bottom-[5%] right-[6%]"
                icon="image"
                title="screenshot_001"
                subtitle="bukti visual"
              />
              <GraphLine className="left-[25%] top-[29%] h-24 w-[23%] rotate-[38deg]" />
              <GraphLine className="right-[27%] top-[29%] h-24 w-[22%] rotate-[-38deg]" />
              <GraphLine className="bottom-[26%] left-[24%] h-24 w-[23%] rotate-[-38deg]" />
              <GraphLine className="bottom-[26%] right-[28%] h-24 w-[21%] rotate-[38deg]" />
            </div>
          </SectionCard>
          <div className="mt-5 rounded-[8px] border border-blue-400/28 bg-blue-500/10 px-7 py-5 text-lg text-slate-100">
            <Info aria-hidden className="mr-4 inline text-blue-400" size={28} />
            Hubungan ini adalah sinyal awal dan tetap memerlukan verifikasi manusia.
          </div>
        </div>
        <SectionCard title="Skor Risiko">
          <div className="mx-auto grid size-44 place-items-center rounded-full border-[9px] border-rose-400/80 text-center">
            <div>
              <span className="text-6xl font-black text-rose-400">{reviewSummary.riskScore}</span>
              <span className="text-xl text-slate-200">/100</span>
            </div>
          </div>
          <div className="mx-auto mt-4 w-fit rounded-full border border-rose-400/30 bg-rose-500/14 px-8 py-2 text-xl font-bold text-rose-300">
            Kritis
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="mb-5 text-lg font-bold text-white">Alasan Skor Risiko Tinggi</h3>
            <div className="space-y-4">
              {riskSignals.map((signal) => (
                <div className="flex items-center gap-4 text-lg text-slate-300" key={signal.label}>
                  <WarningCircle aria-hidden className="text-rose-400" size={25} />
                  {signal.label}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
      <StepActions back="/screenshots" next="/reports" nextLabel="Lanjut ke Review" />
    </>
  );
}

function ReviewStep() {
  return (
    <>
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
    </>
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

function SeedChoice({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`flex h-[52px] items-center gap-4 rounded-[8px] border px-4 text-lg ${
        active ? "border-blue-400 bg-blue-500/10 text-white" : "border-white/16 text-slate-300"
      }`}
      type="button"
    >
      <span
        className={`grid size-6 place-items-center rounded-full border-2 ${
          active ? "border-blue-400" : "border-slate-500"
        }`}
      >
        {active ? <span className="size-3 rounded-full bg-blue-500" /> : null}
      </span>
      {label}
    </button>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-medium text-white">{label}</span>
      <input
        className="h-[52px] w-full rounded-[8px] border border-white/16 bg-slate-950/25 px-4 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
        placeholder={placeholder}
      />
    </label>
  );
}

function Checklist({ items }: { items: string[]; icon?: "shield" }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div className="flex items-center gap-4 text-lg text-slate-100" key={item}>
          <CheckCircle aria-hidden className="text-blue-400" size={25} />
          {item}
        </div>
      ))}
    </div>
  );
}

function PromoEvidence() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-white/18 bg-[#061735]">
      <div className="flex h-10 items-center justify-between border-b border-white/12 px-4">
        <strong className="text-2xl text-white">
          TG<span className="text-amber-300">88</span>
        </strong>
        <div className="hidden gap-6 text-xs font-bold text-slate-300 sm:flex">
          <span>BERANDA</span>
          <span>PROMO</span>
          <span>PERMAINAN</span>
          <span>BANTUAN</span>
        </div>
      </div>
      <div className="grid min-h-[248px] gap-5 p-9 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-bold text-amber-300">PROMO SPESIAL</p>
          <p className="mt-3 text-3xl font-black text-white">
            BONUS DEPOSIT <span className="text-amber-300">100%</span>
          </p>
          <p className="mt-2 text-xl font-bold text-white">RTP TINGGI - MENANG LEBIH SERING</p>
          <div className="mt-6 w-fit rounded-[8px] bg-amber-300 px-5 py-3 text-lg font-black text-slate-950">
            HUBUNGI: PROMO-TG88
          </div>
          <p className="mt-6 text-lg font-semibold text-white">PEMBAYARAN VIA DANA</p>
        </div>
        <div className="grid place-items-center">
          <div className="grid size-[152px] place-items-center rounded-[8px] border border-amber-300/40 bg-blue-950 text-center text-3xl font-black text-amber-300 shadow-[0_0_42px_rgba(245,158,11,0.22)]">
            BONUS
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphNode({
  className,
  icon,
  title,
  subtitle,
  large,
}: {
  className: string;
  icon: "channel" | "payment" | "domain" | "mirror" | "image";
  title: string;
  subtitle: string;
  large?: boolean;
}) {
  const icons = {
    channel: PaperPlaneTilt,
    payment: Wallet,
    domain: GlobeHemisphereWest,
    mirror: Desktop,
    image: ImageSquare,
  };
  const Icon = icons[icon];

  return (
    <div
      className={`absolute z-10 flex items-center gap-4 rounded-[8px] border border-white/16 bg-slate-950/40 p-5 shadow-xl ${large ? "w-[336px] border-blue-500" : "w-72"} ${className}`}
    >
      <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-blue-500/20 text-3xl text-blue-300">
        <Icon aria-hidden size={34} weight="duotone" />
      </span>
      <div>
        <p className="text-xl font-bold text-white">{title}</p>
        <p className="mt-1 text-lg text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}

function GraphLine({ className }: { className: string }) {
  return <div className={`absolute border-t-2 border-blue-200/60 ${className}`} />;
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
    <div className="grid grid-cols-[34px_1fr_1.1fr] items-center gap-5 border-t border-white/10 py-4 text-lg first:border-t-0">
      <span className="text-slate-300">{icon}</span>
      <span className="text-slate-300">{label}</span>
      <span
        className={
          pill
            ? "w-fit rounded-full bg-blue-500/18 px-4 py-1 font-bold text-blue-300"
            : accent
              ? "text-blue-300"
              : "text-white"
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
    <button
      className={`flex h-16 w-full items-center gap-5 rounded-[8px] border px-6 text-left text-xl font-semibold text-white ${
        active ? "border-blue-400 bg-blue-500/10" : "border-white/16 bg-white/[0.03]"
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function ReportItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-4 first:border-t-0">
      <div className="flex items-center gap-4 text-lg text-slate-200">
        {icon}
        {label}
      </div>
      <CaretRight aria-hidden className="text-slate-300" size={24} />
    </div>
  );
}
