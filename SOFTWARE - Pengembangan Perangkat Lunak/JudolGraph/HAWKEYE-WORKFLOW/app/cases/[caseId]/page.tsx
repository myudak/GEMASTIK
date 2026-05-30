import { CaseWorkspacePage } from "@/components/workflow/case-workspace-page";

export const metadata = {
  title: "Detail Kasus | HAWKEYE",
};

export default async function Page({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  return <CaseWorkspacePage caseId={caseId} />;
}
