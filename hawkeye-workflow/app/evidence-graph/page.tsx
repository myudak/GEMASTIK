import { WorkflowPage } from "@/components/workflow/workflow-page";

export const metadata = {
  title: "Evidence Graph | HAWKEYE",
  description: "Visualisasi hubungan bukti dan entitas investigasi.",
};

export default function Page() {
  return <WorkflowPage stepId="graph" />;
}
