import type { Metadata } from "next";
import { AppointmentDetail } from "@/components/appointments/appointment-detail";

export const metadata: Metadata = {
  title: "Appointment",
};

export default async function AppointmentDetailPage({
  params,
}: PageProps<"/appointments/[id]">) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <AppointmentDetail id={id} />
    </div>
  );
}
