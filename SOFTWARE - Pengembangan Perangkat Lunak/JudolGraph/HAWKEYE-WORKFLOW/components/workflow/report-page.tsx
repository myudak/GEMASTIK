"use client";

import { DownloadSimple, FilePdf, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workflow/app-shell";
import { SectionCard } from "@/components/workflow/section-card";
import { createReportData, useDemoStore } from "@/lib/demo-store";
import type { ReportDocumentData } from "@/lib/workflow-data";

const PdfPreview = dynamic(
  () => import("@/components/workflow/pdf-preview").then((module) => module.PdfPreview),
  {
    loading: () => <PreviewLoading />,
    ssr: false,
  },
);

export function ReportPage() {
  const store = useDemoStore();
  const reportData = useMemo(() => createReportData(store), [store]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function generatePreview() {
      const blob = await createReportBlob(reportData);
      if (cancelled) return;

      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }

    setPreviewUrl(null);
    void generatePreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportData]);

  async function downloadReport() {
    const blob = await createReportBlob(reportData);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = "hawkeye-laporan-sintetis.pdf";
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-2" variant="outline">
              Ekspor Laporan PDF
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Preview Laporan
            </h1>
            <p className="mt-3 max-w-4xl text-xl leading-relaxed text-muted-foreground">
              Laporan final memakai bukti dan entitas yang sudah diverifikasi manusia.
            </p>
          </div>
          <Button className="h-12 px-5 text-base font-semibold" onClick={downloadReport}>
            <DownloadSimple aria-hidden size={21} />
            Export PDF
          </Button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <SectionCard title="Pratinjau PDF">
            <div className="max-h-[720px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
              {previewUrl ? <PdfPreview fileUrl={previewUrl} /> : <PreviewLoading />}
            </div>
          </SectionCard>
          <div className="space-y-6">
            <SectionCard title="Status Laporan">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/35 p-4">
                {reportData.pendingReviewCount > 0 ? (
                  <WarningCircle className="text-amber-500" size={30} weight="duotone" />
                ) : (
                  <ShieldCheck className="text-emerald-500" size={30} weight="duotone" />
                )}
                <div>
                  <p className="font-bold text-foreground">
                    {reportData.pendingReviewCount > 0
                      ? `${reportData.pendingReviewCount} bukti belum verified`
                      : "Laporan siap final"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bukti Need Review dan Rejected tidak masuk lampiran final.
                  </p>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Isi Laporan">
              <ReportItem label={`Ringkasan: ${reportData.case.name}`} />
              <ReportItem label={`Bukti verified: ${reportData.evidence.length}`} />
              <ReportItem label={`Entitas verified: ${reportData.entities.length}`} />
              <ReportItem label={`Risk signal: ${reportData.riskSignals.length}`} />
              <ReportItem label={`Audit event: ${reportData.auditTrail.length}`} />
            </SectionCard>
            <SectionCard title="PDF Generator">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/35 p-4">
                <FilePdf className="text-primary" size={30} weight="duotone" />
                <div>
                  <p className="font-bold text-foreground">PDF dibuat di browser</p>
                  <p className="text-sm text-muted-foreground">
                    Menggunakan data sintetis lokal tanpa backend.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ReportItem({ label }: { label: string }) {
  return (
    <div className="border-t border-border py-3 first:border-t-0">
      <p className="font-medium text-foreground">{label}</p>
    </div>
  );
}

function PreviewLoading() {
  return (
    <div className="grid min-h-[420px] place-items-center text-muted-foreground">
      Menyiapkan preview PDF…
    </div>
  );
}

async function createReportBlob(data: ReportDocumentData) {
  const [{ pdf }, { HawkeyeReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/workflow/report-document"),
  ]);

  return pdf(<HawkeyeReportDocument data={data} />).toBlob();
}
