"use client";

import { ArrowRight, Fingerprint, GithubLogo, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary md:mx-0">
            <ShieldCheck aria-hidden size={27} weight="duotone" />
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Masuk Investigator</h1>
          <p className="text-balance text-sm leading-relaxed text-muted-foreground">
            Gunakan akun terverifikasi untuk membuka dashboard, evidence graph, human review, dan
            laporan PDF HAWKEYE.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email investigator</FieldLabel>
          <Input
            autoComplete="email"
            className="h-11 bg-background/45"
            defaultValue="andi.pratama@hawkeye.demo"
            id="email"
            placeholder="investigator@instansi.go.id"
            required
            type="email"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              href="#akses-demo"
            >
              Akses demo
            </a>
          </div>
          <Input
            autoComplete="current-password"
            className="h-11 bg-background/45"
            defaultValue="hawkeye-demo"
            id="password"
            required
            type="password"
          />
        </Field>
        <Field>
          <div className="rounded-lg border border-border bg-background/45 p-4">
            <div className="flex items-start gap-3">
              <Fingerprint aria-hidden className="mt-0.5 text-primary" size={24} weight="duotone" />
              <div>
                <p className="font-semibold text-foreground">
                  Role aktif: Investigator Terverifikasi
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Login ini bersifat mock untuk demo GEMASTIK. Tidak ada kredensial yang dikirim ke
                  backend.
                </p>
              </div>
            </div>
          </div>
        </Field>
        <Field>
          <Button className="h-12 text-base font-semibold" type="submit">
            Masuk ke Dashboard
            <ArrowRight aria-hidden size={20} />
          </Button>
        </Field>
        <FieldSeparator>Mode demo</FieldSeparator>
        <Field>
          <Button className="h-11" type="button" variant="outline">
            <GithubLogo aria-hidden size={20} />
            Simulasi SSO Instansi
          </Button>
          <FieldDescription className="text-center">
            Akses publik tersedia di{" "}
            <a className="font-medium text-foreground underline underline-offset-4" href="/public">
              Portal Publik HAWKEYE
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
