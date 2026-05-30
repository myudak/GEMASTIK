import { WorkflowPage } from "@/components/workflow/workflow-page";

export const metadata = {
  title: "Input Seed | HAWKEYE",
  description: "Form input seed dan validasi sumber publik HAWKEYE.",
};

export default function Page() {
  return <WorkflowPage stepId="seed" />;
}
