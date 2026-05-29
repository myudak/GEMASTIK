"use client";

import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  FilePdf,
  Fingerprint,
  Link as LinkIcon,
  MagnifyingGlass,
  ShieldCheck,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/workflow/app-shell";
import { SectionCard } from "@/components/workflow/section-card";
import { ThemeToggle } from "@/components/workflow/theme-toggle";
import {
  entityDetail,
  investigationCases,
  linkCheckResult,
  publicReportStats,
  reviewActions,
  reviewSummary,
} from "@/lib/workflow-data";

export function LoginPage() {
  return (
    <PublicShell>
      <main className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <div>
          <Badge className="mb-5 rounded-full px-4 py-2" variant="outline">
            Portal Investigator Terverifikasi
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Masuk ke HAWKEYE
          </h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Akses mockup investigator untuk meninjau kasus, evidence graph, human review, dan
            laporan berbasis bukti sintetis.
          </p>
        </div>
        <SectionCard title="Login Investigator">
          <div className="space-y-5">
            <Field label="Email" placeholder="investigator@hawkeye.local" />
            <Field label="Password" placeholder="••••••••" type="password" />
            <div className="rounded-lg border border-border bg-background/45 p-4">
              <p className="text-sm text-muted-foreground">Peran aktif</p>
              <div className="mt-2 flex items-center gap-3 text-lg font-bold text-foreground">
                <ShieldCheck className="text-primary" size={24} weight="duotone" />
                Investigator Terverifikasi
              </div>
            </div>
            <Button asChild className="h-12 w-full text-base font-semibold">
              <Link href="/dashboard">
                Masuk Demo
                <ArrowRight aria-hidden size={20} />
              </Link>
            </Button>
          </div>
        </SectionCard>
      </main>
    </PublicShell>
  );
}

export function DashboardPage() {
  return (
    <AppShell>
      <PageIntro
        eyebrow="Investigator Workspace"
        title="Dashboard"
        description="Ringkasan sederhana untuk memantau kasus, bukti, entitas, dan status review."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <Metric label="Kasus aktif" value="3" />
        <Metric label="Bukti terkumpul" value="9" />
        <Metric label="Entitas ditemukan" value="15" />
        <Metric label="Perlu review" value="2" tone="warn" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <SectionCard title="Daftar Kasus">
          <div className="space-y-3">
            {investigationCases.map((item) => (
              <div className="rounded-lg border border-border bg-background/35 p-4" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.seed}</p>
                  </div>
                  <Badge variant={item.risk === "Tinggi" ? "destructive" : "outline"}>
                    Risiko {item.risk}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
                  <span>{item.status}</span>
                  <span>{item.evidenceCount} bukti</span>
                  <span>{item.entityCount} entitas</span>
                  <span>{item.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Prioritas">
          <div className="space-y-4">
            <ScoreCard />
            <Button asChild className="h-12 w-full">
              <Link href="/cases/new">
                Buat Kasus Baru
                <ArrowRight aria-hidden size={19} />
              </Link>
            </Button>
            <Button asChild className="h-12 w-full" variant="secondary">
              <Link href="/entities/slot-gacor88">Lihat Detail Entitas</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

export function EntityDetailPage() {
  return (
    <AppShell>
      <PageIntro
        eyebrow="Panel Detail Entitas"
        title={entityDetail.value}
        description="Detail entitas sintetis untuk meninjau risk signals, confidence value, bukti terkait, dan status verifikasi."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            <Metric label="Tipe entitas" value={entityDetail.type} />
            <Metric label="Confidence" value={`${entityDetail.confidence}%`} />
            <Metric label="Status" value={entityDetail.status} tone="warn" />
          </div>
          <SectionCard title="Bukti Terkait">
            <div className="space-y-3">
              {entityDetail.relatedEvidence.map((item) => (
                <InfoRow icon={<Fingerprint size={24} />} key={item} label={item} />
              ))}
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Risk Signals">
          <div className="space-y-3">
            {entityDetail.riskSignals.map((item) => (
              <InfoRow icon={<WarningCircle size={24} />} key={item} label={item} tone="danger" />
            ))}
          </div>
          <Button asChild className="mt-6 h-12 w-full" variant="secondary">
            <Link href="/review">Lanjut Human Review</Link>
          </Button>
        </SectionCard>
      </div>
    </AppShell>
  );
}

export function HumanReviewPage() {
  return (
    <AppShell>
      <PageIntro
        eyebrow="Panel Human Review"
        title="Review Investigator"
        description="Keputusan akhir tetap berada pada investigator sebelum laporan dibuat."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <SectionCard title="Ringkasan Review">
          <div className="grid gap-4">
            <InfoRow icon={<LinkIcon size={24} />} label={reviewSummary.seed} />
            <InfoRow icon={<ClipboardText size={24} />} label={reviewSummary.note} />
            <InfoRow
              icon={<ShieldCheck size={24} />}
              label={`Skor risiko ${reviewSummary.riskScore}/100`}
            />
          </div>
        </SectionCard>
        <SectionCard title="Keputusan">
          <div className="space-y-4">
            {reviewActions.map((action) => (
              <button
                className="flex w-full items-start gap-4 rounded-lg border border-border bg-background/35 p-4 text-left transition hover:border-primary"
                key={action.label}
                type="button"
              >
                <ReviewIcon label={action.label} />
                <span>
                  <span className="block text-lg font-bold text-foreground">{action.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <Button asChild className="mt-6 h-12 w-full">
            <Link href="/reports">
              Buka Ekspor Laporan
              <FilePdf aria-hidden size={19} />
            </Link>
          </Button>
        </SectionCard>
      </div>
    </AppShell>
  );
}

export function PublicPortalPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <PublicHero
          title="Portal Publik HAWKEYE"
          description="Masyarakat dapat mengirim laporan awal dan memeriksa indikasi terbatas tanpa login."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <SectionCard title="Formulir Pelaporan">
            <div className="space-y-5">
              <Field label="URL atau Domain" placeholder="https://example.com" />
              <label className="block" htmlFor="public-report-note">
                <span className="mb-3 block text-base font-medium text-foreground">
                  Keterangan singkat
                </span>
                <Textarea
                  className="min-h-28 bg-background/35"
                  id="public-report-note"
                  placeholder="Tuliskan alasan pelaporan secara ringkas…"
                />
              </label>
              <Button className="h-12 w-full" type="button">
                Kirim Laporan Sintetis
              </Button>
            </div>
          </SectionCard>
          <div className="space-y-6">
            <SectionCard title="Link Checker">
              <p className="text-muted-foreground">
                Periksa indikasi risiko terbatas berdasarkan data terverifikasi dan pola kata kunci.
              </p>
              <Button asChild className="mt-5 h-12 w-full" variant="secondary">
                <Link href="/public/link-checker">Buka Link Checker</Link>
              </Button>
            </SectionCard>
            <SectionCard title="Ringkasan Publik">
              <div className="space-y-3">
                {publicReportStats.map((item) => (
                  <div className="flex items-center justify-between gap-4" key={item.label}>
                    <span className="text-muted-foreground">{item.label}</span>
                    <strong className="text-foreground">{item.value}</strong>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}

export function LinkCheckerPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <PublicHero
          title="Link Checker Publik"
          description="Hasil bersifat indikatif dan bukan hasil investigasi penuh."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <SectionCard title="Periksa URL / Domain">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                className="h-12 bg-background/35 text-base"
                defaultValue={linkCheckResult.domain}
              />
              <Button className="h-12" type="button">
                <MagnifyingGlass aria-hidden size={20} />
                Periksa
              </Button>
            </div>
            <div className="mt-6 rounded-lg border border-border bg-background/35 p-5">
              <Badge className="mb-3 rounded-full" variant="outline">
                {linkCheckResult.level}
              </Badge>
              <p className="text-muted-foreground">{linkCheckResult.description}</p>
            </div>
          </SectionCard>
          <SectionCard title="Batasan Informasi">
            <div className="space-y-3 text-muted-foreground">
              <p>Detail bukti dan relasi antarbukti hanya tersedia untuk investigator.</p>
              <p>
                Hasil publik tidak memuat data personal atau teknis yang berisiko disalahgunakan.
              </p>
            </div>
          </SectionCard>
        </div>
      </main>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_34%),linear-gradient(135deg,var(--background)_0%,color-mix(in_oklch,var(--card)_82%,black)_100%)]" />
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <Link className="flex items-center gap-3" href="/public">
          <Image
            alt="HAWKEYE"
            className="hidden size-12 object-contain dark:block"
            height={48}
            src="/hawkeye_dark_rounded_bg_transparent_512.png"
            width={48}
          />
          <Image
            alt="HAWKEYE"
            className="size-12 object-contain dark:hidden"
            height={48}
            src="/hawkeye_light_rounded_bg_transparent_512.png"
            width={48}
          />
          <div>
            <p className="text-lg font-black leading-none">HAWKEYE</p>
            <p className="mt-1 text-xs font-bold text-primary">PUBLIC PORTAL</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/login">Investigator</Link>
          </Button>
          <ThemeToggle compact />
        </div>
      </header>
      {children}
    </div>
  );
}

function PageIntro({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="mx-auto max-w-[1320px]">
      <Badge className="mb-4 rounded-full px-4 py-2" variant="outline">
        {eyebrow}
      </Badge>
      <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-4xl text-xl leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}

function PublicHero({ description, title }: { description: string; title: string }) {
  return (
    <section>
      <Badge className="mb-4 rounded-full px-4 py-2" variant="outline">
        Data sintetis untuk demo
      </Badge>
      <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}

function Metric({ label, tone, value }: { label: string; value: string; tone?: "warn" }) {
  return (
    <SectionCard>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={
          tone === "warn"
            ? "mt-2 text-3xl font-black text-destructive"
            : "mt-2 text-3xl font-black text-foreground"
        }
      >
        {value}
      </p>
    </SectionCard>
  );
}

function ScoreCard() {
  return (
    <div className="rounded-lg border border-border bg-background/35 p-5">
      <p className="text-sm text-muted-foreground">Skor risiko prioritas</p>
      <div className="mt-3 flex items-end gap-2">
        <strong className="text-5xl font-black text-destructive">{reviewSummary.riskScore}</strong>
        <span className="pb-1 text-lg text-muted-foreground">/100</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{reviewSummary.note}</p>
    </div>
  );
}

function InfoRow({ icon, label, tone }: { icon: ReactNode; label: string; tone?: "danger" }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/35 p-4">
      <span className={tone === "danger" ? "text-destructive" : "text-primary"}>{icon}</span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}

function ReviewIcon({ label }: { label: string }) {
  if (label === "Verified") return <CheckCircle className="text-emerald-400" size={30} />;
  if (label === "Rejected") return <XCircle className="text-destructive" size={30} />;

  return <WarningCircle className="text-primary" size={30} />;
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-base font-medium text-foreground">{label}</span>
      <Input className="h-12 bg-background/35 text-base" placeholder={placeholder} type={type} />
    </label>
  );
}
