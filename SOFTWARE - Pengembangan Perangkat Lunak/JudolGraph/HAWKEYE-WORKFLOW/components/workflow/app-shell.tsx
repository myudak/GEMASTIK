import type { ReactNode } from "react";

import { Sidebar } from "@/components/workflow/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#031224] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#04182f_0%,#061b35_42%,#03101f_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(37,99,235,0.16),transparent_30%,rgba(15,23,42,0.52))]" />
      <Sidebar />
      <main className="min-h-dvh px-5 py-8 md:ml-[290px] md:px-10 lg:px-14">{children}</main>
    </div>
  );
}
