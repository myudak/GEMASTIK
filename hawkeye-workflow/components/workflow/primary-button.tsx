"use client";

import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  direction?: "next" | "back";
  variant?: "default" | "secondary" | "outline";
};

export function PrimaryButton({
  href,
  children,
  direction = "next",
  variant = "default",
}: PrimaryButtonProps) {
  const Icon = direction === "back" ? ArrowLeft : PaperPlaneRight;

  return (
    <Button asChild className="h-14 px-7 text-base font-semibold" variant={variant}>
      <Link href={href}>
        <Icon aria-hidden size={24} weight={direction === "back" ? "regular" : "fill"} />
        {children}
      </Link>
    </Button>
  );
}
