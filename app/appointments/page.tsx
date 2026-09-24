import { Suspense } from "react";
import type { Metadata } from "next";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { TableSkeleton } from "@/components/common/table-skeleton";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function AppointmentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Search, filter and manage the clinic schedule.
        </p>
      </div>
      {/* The table reads filters from the URL, so it opts out of the static shell. */}
      <Suspense
        fallback={
          <div className="bg-card overflow-hidden rounded-md border">
            <TableSkeleton />
          </div>
        }
      >
        <AppointmentsTable />
      </Suspense>
    </div>
  );
}
