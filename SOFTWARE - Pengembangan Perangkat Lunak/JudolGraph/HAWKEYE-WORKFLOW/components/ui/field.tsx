import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-5", className)} data-slot="field-group" {...props} />
  );
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} data-slot="field" {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      data-slot="field-description"
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="flex-1" />
      {children ? <span className="shrink-0">{children}</span> : null}
      <Separator className="flex-1" />
    </div>
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator };
