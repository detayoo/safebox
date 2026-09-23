import type { Metadata } from "next";

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
    </div>
  );
}
