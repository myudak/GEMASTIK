import { WorkflowPage } from "@/components/workflow/workflow-page";

export const metadata = {
  title: "OCR & Ekstraksi Entitas | HAWKEYE",
  description: "Bukti visual, OCR, dan ekstraksi entitas dari data sintetis.",
};

export default function Page() {
  return <WorkflowPage stepId="ocr" />;
}
