"use client";

import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import type { WorkflowStepId } from "@/lib/workflow-data";
import { workflowSteps } from "@/lib/workflow-data";
import { cn } from "@/lib/utils";

type StepProgressProps = {
  activeStep: WorkflowStepId;
};

export function StepProgress({ activeStep }: StepProgressProps) {
  const activeIndex = workflowSteps.findIndex((step) => step.id === activeStep);

  return (
    <div className="mt-8 overflow-x-auto pb-2">
      <div className="relative mx-auto grid min-w-[760px] max-w-[1120px] grid-cols-5">
        <Progress
          aria-hidden
          className="absolute left-[10%] right-[10%] top-6 h-px w-auto bg-border"
          value={Math.max(activeIndex, 0) * 25}
        />
        {workflowSteps.map((step, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <Link
              href={step.href}
              key={step.id}
              className="group relative flex flex-col items-center"
            >
              <span
                className={cn(
                  "relative z-10 grid size-12 place-items-center rounded-full border text-xl font-semibold transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_26px_color-mix(in_oklch,var(--primary)_45%,transparent)]"
                    : complete
                      ? "border-primary bg-primary/18 text-foreground"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  "mt-4 text-lg transition",
                  active
                    ? "font-bold text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
