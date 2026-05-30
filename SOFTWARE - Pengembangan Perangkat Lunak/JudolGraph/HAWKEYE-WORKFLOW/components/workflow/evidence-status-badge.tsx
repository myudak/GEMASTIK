"use client";

import { CheckCircle, Hourglass, ShieldWarning, XCircle } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import type { EvidenceItem } from "@/lib/workflow-data";

export function StatusBadge({ status }: { status: EvidenceItem["status"] }) {
  const Icon =
    status === "Verified"
      ? CheckCircle
      : status === "Rejected"
        ? XCircle
        : status === "Need Review"
          ? ShieldWarning
          : Hourglass;
  const className =
    status === "Verified"
      ? "border-emerald-400/28 bg-emerald-500/10 text-emerald-500"
      : status === "Rejected"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : status === "Need Review"
          ? "border-amber-400/30 bg-amber-500/10 text-amber-500"
          : "border-border bg-muted/35 text-muted-foreground";

  return (
    <Badge
      className={`h-8 w-fit gap-2 rounded-lg px-3 text-sm font-semibold ${className}`}
      variant="outline"
    >
      <Icon aria-hidden size={17} />
      {status}
    </Badge>
  );
}
