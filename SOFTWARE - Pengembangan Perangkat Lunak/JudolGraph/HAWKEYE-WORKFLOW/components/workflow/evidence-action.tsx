"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function EvidenceAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button className="h-9" onClick={onClick} type="button" variant="secondary">
      {children}
    </Button>
  );
}
