"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import { DateRangeFilter } from "@/components/appointments/date-range-filter";
import { ProviderFilter } from "@/components/appointments/provider-filter";
import { StatusFilter } from "@/components/appointments/status-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AppointmentStatus,
  Provider,
} from "@/lib/schemas/appointment";

export function AppointmentsToolbar({
  search,
  onSearchChange,
  status,
  onToggleStatus,
  providers,
  providerId,
  onProviderChange,
  from,
  to,
  onDateRangeChange,
  hasActiveFilters,
  onClear,
  isFetching,
  total,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: AppointmentStatus[];
  onToggleStatus: (status: AppointmentStatus) => void;
  providers: Provider[];
  providerId: string;
  onProviderChange: (providerId: string) => void;
  from: string;
  to: string;
  onDateRangeChange: (range: { from: string; to: string }) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  isFetching: boolean;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by patient name or email"
            aria-label="Search appointments"
            className="h-8 pl-8"
          />
        </div>

        <StatusFilter selected={status} onToggle={onToggleStatus} />
        <ProviderFilter
          providers={providers}
          value={providerId}
          onChange={onProviderChange}
        />
        <DateRangeFilter from={from} to={to} onChange={onDateRangeChange} />

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5"
            onClick={onClear}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="text-muted-foreground flex h-4 items-center gap-1.5 text-xs">
        <span>
          {total} appointment{total === 1 ? "" : "s"}
        </span>
        <span
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5"
        >
          {isFetching ? (
            <>
              <span aria-hidden>·</span>
              <LoaderCircle className="size-3.5 animate-spin" />
              <span>Updating…</span>
            </>
          ) : null}
        </span>
      </div>
    </div>
  );
}
