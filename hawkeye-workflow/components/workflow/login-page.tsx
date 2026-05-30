import {
  ArrowRight,
  Camera,
  FilePdf,
  Graph,
  Link as LinkIcon,
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/workflow/theme-toggle";

const featureSteps = [
  { icon: LinkIcon, label: "Seed Validation" },
  { icon: Camera, label: "OCR Extraction" },
  { icon: Graph, label: "Evidence Graph" },
  { icon: FilePdf, label: "Verified Reports" },
];

export function LoginPage() {
  return (
    <div className="grid min-h-svh overflow-hidden bg-background text-foreground lg:grid-cols-[minmax(420px,0.86fr)_1.14fr]">
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_34%)]" />
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3 font-medium" href="/public">
            <Image
              alt="Logo HAWKEYE"
              className="hidden size-11 object-contain dark:block"
              height={44}
              priority
              src="/hawkeye_dark_rounded_bg_transparent_512.png"
              width={44}
            />
            <Image
              alt="Logo HAWKEYE"
              className="size-11 object-contain dark:hidden"
              height={44}
              priority
              src="/hawkeye_light_rounded_bg_transparent_512.png"
              width={44}
            />
            <span>
              <span className="block text-lg font-black leading-none">HAWKEYE</span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-primary">
                Digital Investigation Tool
              </span>
            </span>
          </Link>
          <ThemeToggle compact />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground/60 uppercase">
          Restricted Access &bull; HAWKEYE Systems
        </p>
      </div>
      <div className="relative hidden border-l border-border bg-muted lg:block">
        <Image
          alt="Contoh bukti visual HAWKEYE"
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-[1px] dark:brightness-[0.45]"
          fill
          priority
          sizes="58vw"
          src="/evidence/ocr-promo-evidence.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--background)_96%,transparent)_0%,color-mix(in_oklch,var(--card)_72%,transparent)_55%,color-mix(in_oklch,var(--primary)_20%,transparent)_100%)]" />
        <div className="relative flex min-h-svh flex-col justify-between p-12">
          <div className="flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/public">
                Portal Publik
                <ArrowRight aria-hidden size={18} />
              </Link>
            </Button>
          </div>
          <section className="max-w-3xl">
            <Badge className="mb-5 rounded-full px-4 py-2" variant="outline">
              Portal Investigator
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
              Satu ruang kerja untuk bukti, graph, review, dan laporan.
            </h2>
          </section>
          <div className="grid gap-4 xl:grid-cols-[1fr_0.82fr]">
            <div className="rounded-2xl border border-border bg-card/78 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kasus Aktif</p>
                  <h3 className="mt-1 text-2xl font-black">Operasi Slot Gacor88</h3>
                  <p className="text-sm font-medium text-muted-foreground/80">slot-gacor88.xyz</p>
                </div>
                <Badge className="font-bold shadow-sm" variant="destructive">92/100</Badge>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {featureSteps.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/45 p-3 transition-colors hover:bg-background/60"
                    key={item.label}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon aria-hidden className="text-primary" size={20} weight="duotone" />
                    </div>
                    <p className="font-semibold text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/78 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck aria-hidden size={28} weight="duotone" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-none">Review Gate</p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">4 item pending</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  "OCR Verification",
                  "Graph Review",
                  "Entity Validation",
                ].map((item) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-border bg-background/45 px-4 py-2.5 transition-colors hover:bg-background/60"
                    key={item}
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <MagnifyingGlass aria-hidden className="text-muted-foreground" size={16} weight="bold" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
