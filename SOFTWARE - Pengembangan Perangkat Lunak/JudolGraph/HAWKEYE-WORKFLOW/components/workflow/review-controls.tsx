"use client";

import { CheckCircle, PlusCircle, XCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import type { ReviewDecision } from "@/lib/workflow-data";

const decisions: Array<{ label: ReviewDecision; shortLabel: string }> = [
  { label: "Verified", shortLabel: "Verify" },
  { label: "Need Review", shortLabel: "Review" },
  { label: "Rejected", shortLabel: "Reject" },
];

export function ReviewControls({
  current,
  onDecision,
  size = "sm",
}: {
  current: ReviewDecision;
  onDecision: (decision: ReviewDecision) => void;
  size?: "sm" | "default";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {decisions.map((decision) => (
        <Button
          className={size === "sm" ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm"}
          key={decision.label}
          onClick={() => onDecision(decision.label)}
          size="sm"
          type="button"
          variant={current === decision.label ? "default" : "outline"}
        >
          <DecisionIcon decision={decision.label} />
          {decision.shortLabel}
        </Button>
      ))}
    </div>
  );
}

function DecisionIcon({ decision }: { decision: ReviewDecision }) {
  if (decision === "Verified") return <CheckCircle aria-hidden size={15} />;
  if (decision === "Rejected") return <XCircle aria-hidden size={15} />;

  return <PlusCircle aria-hidden size={15} />;
}
