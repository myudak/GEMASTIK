import type { ReactNode } from "react";

import { Sidebar } from "@/components/workflow/sidebar";
import { ThemeToggle } from "@/components/workflow/theme-toggle";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_oklch,var(--card)_88%,black)_0%,var(--background)_58%,color-mix(in_oklch,var(--background)_84%,black)_100%)]" />
      <Sidebar />
      <div className="fixed right-5 top-5 z-30 md:hidden">
        <ThemeToggle compact />
      </div>
      <main className="min-h-dvh px-5 py-8 md:ml-[290px] md:px-10 lg:px-14">{children}</main>
    </div>
  );
}
