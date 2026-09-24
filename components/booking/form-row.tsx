import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label + control + a message line that is always rendered, so errors never
 * shift the layout. The message id matches what controls reference through
 * aria-describedby.
 */
export function FormRow({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p
        id={`${htmlFor}-message`}
        role={error ? "alert" : undefined}
        className={cn(
          "min-h-4 text-xs",
          error ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {error ?? hint ?? ""}
      </p>
    </div>
  );
}
