import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-14 items-center justify-center gap-3 rounded-[8px] border px-7 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-blue-400 bg-blue-600 text-white shadow-[0_0_32px_rgba(37,99,235,0.34)] hover:bg-blue-500",
        secondary:
          "border-white/18 bg-white/[0.04] text-slate-100 hover:border-blue-300/70 hover:bg-blue-400/10",
        outline: "border-blue-400/70 bg-blue-500/10 text-blue-100 hover:bg-blue-500/18",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
  };

export function ButtonLink({ className, variant, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant }), className)} {...props}>
      {children}
    </Link>
  );
}
