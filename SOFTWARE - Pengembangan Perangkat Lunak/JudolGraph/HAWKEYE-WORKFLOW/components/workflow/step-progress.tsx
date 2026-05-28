"use client";

import Link from "next/link";

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
        <div className="absolute left-[10%] right-[10%] top-6 h-px bg-white/22" />
        <div
          className="absolute left-[10%] top-6 h-px bg-blue-500 transition-all"
          style={{ width: `${Math.max(activeIndex, 0) * 20}%` }}
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
                    ? "border-blue-400 bg-blue-600 text-white shadow-[0_0_26px_rgba(37,99,235,0.54)]"
                    : complete
                      ? "border-blue-400 bg-blue-500/22 text-blue-100"
                      : "border-slate-500 bg-slate-950 text-slate-300",
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  "mt-4 text-lg transition",
                  active ? "font-bold text-blue-400" : "text-slate-300 group-hover:text-white",
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
