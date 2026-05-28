"use client";

import {
  GlobeHemisphereWest,
  Link as LinkIcon,
  PaperPlaneTilt,
  Tag,
  Wallet,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import type { DetectedEntity } from "@/lib/workflow-data";

const entityIcons = {
  domain: GlobeHemisphereWest,
  channel: PaperPlaneTilt,
  payment: Wallet,
  referral: LinkIcon,
  keyword: Tag,
};

export function EntityRow({ entity }: { entity: DetectedEntity }) {
  const Icon = entityIcons[entity.icon];

  return (
    <div className="grid min-h-14 grid-cols-[210px_1fr_auto] items-center gap-4 rounded-lg border border-border bg-background/25 px-4">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="text-primary" size={28} />
        <span className="text-lg text-foreground">{entity.category}</span>
      </div>
      <span className="rounded-lg border border-border bg-muted/35 px-4 py-2 text-lg text-foreground">
        {entity.value}
      </span>
      <Badge
        className="h-8 rounded-full bg-primary/16 px-4 text-sm font-bold text-primary"
        variant="secondary"
      >
        {entity.confidence}%
      </Badge>
    </div>
  );
}
