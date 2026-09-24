"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { DetailRow } from "@/components/common/detail-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useViewerTimeZone } from "@/hooks/use-viewer-time-zone";
import { CLINIC_TIME_ZONE } from "@/lib/domain/schedule";
import {
  MODE_LABELS,
  VISIT_TYPE_LABELS,
  formatClinicDateTime,
  formatInTimeZone,
  patientName,
} from "@/lib/format";
import type { Appointment } from "@/lib/schemas/appointment";

export function BookingConfirmation({
  appointment,
  providerName,
  onBookAnother,
}: {
  appointment: Appointment;
  providerName: string;
  onBookAnother: () => void;
}) {
  const viewerTimeZone = useViewerTimeZone();
  const localHint =
    viewerTimeZone && viewerTimeZone !== CLINIC_TIME_ZONE
      ? formatInTimeZone(appointment.startsAt, viewerTimeZone)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="bg-foreground text-background mt-0.5 flex size-7 items-center justify-center rounded-full">
          <Check className="size-4" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Appointment booked
          </h1>
          <p className="text-muted-foreground text-sm">
            Your appointment is saved. Please arrive ten minutes early.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your appointment</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <DetailRow label="Patient">{patientName(appointment)}</DetailRow>
          <DetailRow label="Provider">{providerName || "—"}</DetailRow>
          <DetailRow label="Type">
            {VISIT_TYPE_LABELS[appointment.visitType]}
          </DetailRow>
          <DetailRow label="Mode">{MODE_LABELS[appointment.mode]}</DetailRow>
          <DetailRow label="When">
            {formatClinicDateTime(appointment.startsAt)}
            {localHint ? (
              <span className="text-muted-foreground"> ({localHint} your time)</span>
            ) : null}
          </DetailRow>
          <DetailRow label="Status">
            <AppointmentStatusBadge status={appointment.status} />
          </DetailRow>
          <DetailRow label="Reference">
            <span className="font-mono text-xs">{appointment.id}</span>
          </DetailRow>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/appointments">View in appointments</Link>
        </Button>
        <Button variant="outline" onClick={onBookAnother}>
          Book another
        </Button>
      </div>
    </div>
  );
}
