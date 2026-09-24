"use client";

import { Button } from "@/components/ui/button";
import { allowedTransitions, STATUS_LABELS } from "@/lib/domain/status";
import type { AppointmentStatus } from "@/lib/schemas/appointment";

const ACTION_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Reopen",
  "checked-in": "Check in",
  completed: "Mark completed",
  "no-show": "Mark no-show",
  cancelled: "Cancel appointment",
};

export function StatusActions({
  status,
  pending,
  onTransition,
  onCancel,
}: {
  status: AppointmentStatus;
  pending: boolean;
  onTransition: (status: AppointmentStatus) => void;
  onCancel: () => void;
}) {
  const transitions = allowedTransitions(status);

  if (transitions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        This appointment is {STATUS_LABELS[status].toLowerCase()}. There are no
        further actions.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transitions
        .filter((next) => next !== "cancelled")
        .map((next) => (
          <Button
            key={next}
            size="sm"
            variant={next === "completed" ? "default" : "outline"}
            disabled={pending}
            onClick={() => onTransition(next)}
          >
            {ACTION_LABELS[next]}
          </Button>
        ))}

      {transitions.includes("cancelled") ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={onCancel}
        >
          {ACTION_LABELS.cancelled}
        </Button>
      ) : null}
    </div>
  );
}
