"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function toIsoDate(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  const [open, setOpen] = useState(false);

  const selected: DateRange | undefined =
    from || to
      ? { from: from ? parseISO(from) : undefined, to: to ? parseISO(to) : undefined }
      : undefined;

  const label =
    from || to
      ? `${from ? format(parseISO(from), "MMM d") : "Start"} – ${
          to ? format(parseISO(to), "MMM d") : "End"
        }`
      : "Any date";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <CalendarIcon className="size-3.5 opacity-60" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          autoFocus
          selected={selected}
          onSelect={(range) =>
            onChange({ from: toIsoDate(range?.from), to: toIsoDate(range?.to) })
          }
        />
        {from || to ? (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange({ from: "", to: "" })}
            >
              Clear dates
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
