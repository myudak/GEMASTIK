"use client";

import {
  GlobeHemisphereWest,
  Link as LinkIcon,
  PaperPlaneTilt,
  Tag,
  Wallet,
} from "@phosphor-icons/react";

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
    <div className="grid min-h-14 grid-cols-[210px_1fr_auto] items-center gap-4 rounded-[8px] border border-white/10 bg-slate-950/28 px-4">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="text-blue-400" size={28} />
        <span className="text-lg text-white">{entity.category}</span>
      </div>
      <span className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-2 text-lg text-slate-100">
        {entity.value}
      </span>
      <span className="rounded-full bg-blue-500/16 px-4 py-2 text-sm font-bold text-blue-300">
        {entity.confidence}%
      </span>
    </div>
  );
}
