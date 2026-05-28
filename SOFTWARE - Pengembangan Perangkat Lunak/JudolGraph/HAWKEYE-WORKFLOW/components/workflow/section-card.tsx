import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[8px] border border-white/14 bg-slate-950/38 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        className,
      )}
    >
      {title ? <h2 className="mb-5 text-xl font-bold text-white">{title}</h2> : null}
      {children}
    </section>
  );
}
