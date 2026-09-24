import { BOOKING_STEPS } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";

export function BookingProgress({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {BOOKING_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                active && "border-foreground bg-foreground text-background",
                done && "border-foreground/30 bg-muted text-foreground",
                !active && !done && "text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:inline",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.title}
            </span>
            {index < BOOKING_STEPS.length - 1 ? (
              <span className="bg-border hidden h-px flex-1 sm:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
