"use client";

import { Document as PdfPreviewDocument, Page as PdfPreviewPage, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfPreview({ fileUrl }: { fileUrl: string }) {
  return (
    <PdfPreviewDocument file={fileUrl} loading={<PreviewLoading />}>
      <PdfPreviewPage pageNumber={1} renderAnnotationLayer renderTextLayer width={620} />
    </PdfPreviewDocument>
  );
}

function PreviewLoading() {
  return (
    <div className="grid min-h-[420px] place-items-center text-muted-foreground">
      Menyiapkan preview PDF...
    </div>
  );
}
