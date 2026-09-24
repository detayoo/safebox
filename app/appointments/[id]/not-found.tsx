import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppointmentNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        Appointment not found
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        That appointment does not exist, or it is no longer available.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link href="/appointments">Back to appointments</Link>
      </Button>
    </div>
  );
}
