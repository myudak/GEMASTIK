import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border-border/80 bg-card/85 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_8%,transparent)]",
        className,
      )}
    >
      {title ? (
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={title ? "pt-0" : undefined}>{children}</CardContent>
    </Card>
  );
}
