import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/domain/status";
import type { AppointmentStatus } from "@/lib/schemas/appointment";
import { cn } from "@/lib/utils";

const STYLES: Record<AppointmentStatus, string> = {
  scheduled: "border-transparent bg-muted text-foreground",
  "checked-in": "border-transparent bg-foreground/10 text-foreground",
  completed: "border-transparent bg-foreground text-background",
  cancelled: "border-transparent bg-muted text-muted-foreground",
  "no-show": "border-dashed border-border bg-transparent text-muted-foreground",
};

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
