import { WorkflowPage } from "@/components/workflow/workflow-page";

export const metadata = {
  title: "Pengumpulan Bukti | HAWKEYE",
  description: "Monitoring pengumpulan bukti digital dari sumber publik.",
};

export default function Page() {
  return <WorkflowPage stepId="crawl" />;
}
