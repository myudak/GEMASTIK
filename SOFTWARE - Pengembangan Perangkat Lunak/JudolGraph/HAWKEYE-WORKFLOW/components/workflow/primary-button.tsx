"use client";

import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  direction?: "next" | "back";
  variant?: "primary" | "secondary" | "outline";
};

export function PrimaryButton({
  href,
  children,
  direction = "next",
  variant = "primary",
}: PrimaryButtonProps) {
  const Icon = direction === "back" ? ArrowLeft : PaperPlaneRight;

  return (
    <ButtonLink href={href} variant={variant}>
      <Icon aria-hidden size={24} weight={direction === "back" ? "regular" : "fill"} />
      {children}
    </ButtonLink>
  );
}
