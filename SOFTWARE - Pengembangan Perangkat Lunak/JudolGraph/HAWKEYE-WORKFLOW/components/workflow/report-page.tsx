"use client";

import { DownloadSimple, FilePdf } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workflow/app-shell";
import { SectionCard } from "@/components/workflow/section-card";
import { reportDocumentData } from "@/lib/workflow-data";

const PdfPreview = dynamic(
  () => import("@/components/workflow/pdf-preview").then((module) => module.PdfPreview),
  {
    loading: () => <PreviewLoading />,
    ssr: false,
  },
);

export function ReportPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function generatePreview() {
      const blob = await createReportBlob();
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }

    void generatePreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  async function downloadReport() {
    const blob = await createReportBlob();
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
              Laporan dibuat dari data sintetis lokal dan dapat diunduh sebagai PDF.
            </p>
          </div>
          <Button className="h-12 px-5 text-base font-semibold" onClick={downloadReport}>
            <DownloadSimple aria-hidden size={21} />
            Export PDF
          </Button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <SectionCard title="Pratinjau PDF">
            <div className="max-h-[720px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
              {previewUrl ? <PdfPreview fileUrl={previewUrl} /> : <PreviewLoading />}
            </div>
          </SectionCard>
          <div className="space-y-6">
            <SectionCard title="Isi Laporan">
              <ReportItem label="Ringkasan Eksekutif" />
              <ReportItem label="Evidence Graph" />
              <ReportItem label="Lampiran Bukti" />
              <ReportItem label="Risk Scoring" />
              <ReportItem label="Audit Trail" />
            </SectionCard>
            <SectionCard title="Status">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/35 p-4">
                <FilePdf className="text-primary" size={30} weight="duotone" />
                <div>
                  <p className="font-bold text-foreground">PDF siap diekspor</p>
                  <p className="text-sm text-muted-foreground">
                    Dibuat langsung di browser tanpa backend.
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

async function createReportBlob() {
  const [{ pdf }, { HawkeyeReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/workflow/report-document"),
  ]);

  return pdf(<HawkeyeReportDocument data={reportDocumentData} />).toBlob();
}
