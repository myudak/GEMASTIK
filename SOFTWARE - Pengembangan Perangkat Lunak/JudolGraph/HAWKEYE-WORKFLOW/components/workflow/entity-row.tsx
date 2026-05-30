"use client";

import {
  Camera,
  Code,
  GlobeHemisphereWest,
  Link as LinkIcon,
  PaperPlaneTilt,
  Tag,
  UserCircle,
  Wallet,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/workflow/evidence-status-badge";
import { ReviewControls } from "@/components/workflow/review-controls";
import type { DetectedEntity, EntityType, ReviewDecision } from "@/lib/workflow-data";

const entityIcons: Record<EntityType, typeof GlobeHemisphereWest> = {
  Alias: UserCircle,
  Domain: GlobeHemisphereWest,
  "HTML Pattern": Code,
  "Mirror Domain": GlobeHemisphereWest,
  "Payment Indicator": Wallet,
  "Promo Keyword": Tag,
  "Public Channel": PaperPlaneTilt,
  "Referral Link": LinkIcon,
  Screenshot: Camera,
};

export function EntityRow({
  entity,
  onReview,
}: {
  entity: DetectedEntity;
  onReview?: (decision: ReviewDecision) => void;
}) {
  const Icon = entityIcons[entity.type];

  return (
    <div className="grid min-h-14 gap-3 rounded-lg border border-border bg-background/25 p-4 xl:grid-cols-[210px_1fr_auto_auto] xl:items-center">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="text-primary" size={28} />
        <span className="text-base text-foreground">{entity.type}</span>
      </div>
      <span className="rounded-lg border border-border bg-muted/35 px-4 py-2 text-base text-foreground">
        {entity.value}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className="h-8 rounded-full bg-primary/16 px-4 text-sm font-bold text-primary"
          variant="secondary"
        >
          {entity.confidence}%
        </Badge>
        <StatusBadge status={entity.status} />
      </div>
      {onReview ? <ReviewControls current={entity.status} onDecision={onReview} /> : null}
    </div>
  );
}
