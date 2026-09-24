"use client";

import { useNow } from "@/hooks/use-now";
import { formatClinicTime } from "@/lib/format";
import { durationForVisitType, type VisitType } from "@/lib/schemas/appointment";
import { slotStartsForDate } from "@/lib/domain/schedule";
import { cn } from "@/lib/utils";

export function SlotPicker({
  date,
  visitType,
  value,
  onChange,
}: {
  date: string;
  visitType: VisitType;
  value: string;
  onChange: (iso: string) => void;
}) {
  const now = useNow();

  if (!date) {
    return (
      <p className="text-muted-foreground text-sm">Choose a date first.</p>
    );
  }

  const duration = durationForVisitType(visitType);
  const slots = slotStartsForDate(date, duration).filter(
    (slot) => new Date(slot).getTime() > now,
  );

  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No times left on this day. Try another date.
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Available times"
      className="grid grid-cols-3 gap-2 sm:grid-cols-4"
    >
      {slots.map((slot) => {
        const selected = slot === value;
        return (
          <button
            key={slot}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(slot)}
            className={cn(
              "focus-visible:ring-ring/50 rounded-md border px-2 py-1.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3",
              selected
                ? "border-foreground bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {formatClinicTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
