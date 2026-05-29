"use client";

import { Document as PdfPreviewDocument, Page as PdfPreviewPage, pdfjs } from "react-pdf";

export function PdfPreview({ fileUrl }: { fileUrl: string }) {
  return (
    <PdfPreviewDocument file={fileUrl} loading={PREVIEW_LOADING}>
      <PdfPreviewPage pageNumber={1} renderAnnotationLayer renderTextLayer width={620} />
    </PdfPreviewDocument>
  );
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function PreviewLoading() {
  return (
    <div className="grid min-h-[420px] place-items-center text-muted-foreground">
      Menyiapkan preview PDF…
    </div>
  );
}

const PREVIEW_LOADING = <PreviewLoading />;
