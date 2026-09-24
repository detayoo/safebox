"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { CancelAppointmentDialog } from "@/components/appointments/cancel-appointment-dialog";
import { StatusActions } from "@/components/appointments/status-actions";
import { DetailRow } from "@/components/common/detail-row";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiRequestError } from "@/lib/api/client";
import { CLINIC_TIME_ZONE } from "@/lib/domain/schedule";
import {
  MODE_LABELS,
  VISIT_TYPE_LABELS,
  formatClinicDate,
  formatClinicDateTime,
  formatClinicTime,
  formatDateOnly,
  formatDuration,
  formatInTimeZone,
  patientName,
} from "@/lib/format";
import { appointmentDetailOptions } from "@/lib/queries/appointments";
import { providersQueryOptions } from "@/lib/queries/providers";
import { useUpdateAppointment } from "@/lib/queries/use-update-appointment";
import type { AppointmentStatus } from "@/lib/schemas/appointment";
import { useViewerTimeZone } from "@/hooks/use-viewer-time-zone";

const DONE_MESSAGE: Record<AppointmentStatus, string> = {
  scheduled: "Appointment reopened",
  "checked-in": "Patient checked in",
  completed: "Appointment marked completed",
  cancelled: "Appointment cancelled",
  "no-show": "Appointment marked no-show",
};

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function AppointmentDetail({ id }: { id: string }) {
  const [cancelOpen, setCancelOpen] = useState(false);

  const appointmentQuery = useQuery(appointmentDetailOptions(id));
  const providersQuery = useQuery(providersQueryOptions());
  const update = useUpdateAppointment(id);
  const viewerTimeZone = useViewerTimeZone();

  if (
    appointmentQuery.error instanceof ApiRequestError &&
    appointmentQuery.error.status === 404
  ) {
    notFound();
  }

  if (appointmentQuery.isPending) {
    return <DetailSkeleton />;
  }

  if (appointmentQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load this appointment"
        description={appointmentQuery.error.message}
        onRetry={() => {
          void appointmentQuery.refetch();
        }}
      />
    );
  }

  const appointment = appointmentQuery.data;
  const providerName =
    providersQuery.data?.find(
      (provider) => provider.id === appointment.providerId,
    )?.name ?? appointment.providerId;

  const localHint =
    viewerTimeZone && viewerTimeZone !== CLINIC_TIME_ZONE
      ? formatInTimeZone(appointment.startsAt, viewerTimeZone)
      : null;

  // A write can succeed on the server but come back as a 500. Re-read the
  // appointment to see whether the change actually landed before reporting.
  async function reconcile(intended: AppointmentStatus): Promise<boolean> {
    const result = await appointmentQuery.refetch();
    return result.data?.status === intended;
  }

  async function handleTransition(next: AppointmentStatus) {
    try {
      await update.mutateAsync({ status: next });
      toast.success(DONE_MESSAGE[next]);
    } catch (error) {
      if (await reconcile(next)) {
        toast.success(DONE_MESSAGE[next]);
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "Couldn't update the appointment",
      );
    }
  }

  async function handleCancel(reason: string) {
    try {
      await update.mutateAsync({
        status: "cancelled",
        cancellationReason: reason,
      });
      setCancelOpen(false);
      toast.success(DONE_MESSAGE.cancelled);
    } catch (error) {
      if (await reconcile("cancelled")) {
        setCancelOpen(false);
        toast.success(DONE_MESSAGE.cancelled);
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "Couldn't cancel the appointment",
      );
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/appointments"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Back to appointments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {patientName(appointment)}
            </h1>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatClinicDate(appointment.startsAt)} ·{" "}
            {formatClinicTime(appointment.startsAt)}
            {localHint ? ` (${localHint} your time)` : ""}
          </p>
        </div>

        <StatusActions
          status={appointment.status}
          pending={update.isPending}
          onTransition={(next) => {
            void handleTransition(next);
          }}
          onCancel={() => setCancelOpen(true)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Patient</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow label="First name">
              {appointment.patient.firstName}
            </DetailRow>
            <DetailRow label="Last name">
              {appointment.patient.lastName}
            </DetailRow>
            <DetailRow label="Date of birth">
              {formatDateOnly(appointment.patient.dateOfBirth)}
            </DetailRow>
            <DetailRow label="Email">
              <a
                className="hover:underline"
                href={`mailto:${appointment.patient.email}`}
              >
                {appointment.patient.email}
              </a>
            </DetailRow>
            <DetailRow label="Phone">{appointment.patient.phone}</DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visit</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow label="Provider">{providerName}</DetailRow>
            <DetailRow label="Type">
              {VISIT_TYPE_LABELS[appointment.visitType]}
            </DetailRow>
            <DetailRow label="Mode">{MODE_LABELS[appointment.mode]}</DetailRow>
            <DetailRow label="Starts">
              {formatClinicDateTime(appointment.startsAt)}
              {localHint ? (
                <span className="text-muted-foreground"> ({localHint})</span>
              ) : null}
            </DetailRow>
            <DetailRow label="Duration">
              {formatDuration(appointment.durationMinutes)}
            </DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {appointment.insurance ? (
              <>
                <DetailRow label="Coverage">Insurance</DetailRow>
                <DetailRow label="Carrier">
                  {appointment.insurance.carrier}
                </DetailRow>
                <DetailRow label="Member ID">
                  {appointment.insurance.memberId}
                </DetailRow>
                <DetailRow label="Group number">
                  {appointment.insurance.groupNumber || "—"}
                </DetailRow>
              </>
            ) : (
              <DetailRow label="Coverage">Self pay</DetailRow>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Record</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow label="Reference">
              <span className="font-mono text-xs">{appointment.id}</span>
            </DetailRow>
            <DetailRow label="Booked">
              {formatClinicDateTime(appointment.createdAt)}
            </DetailRow>
            {appointment.cancellationReason ? (
              <DetailRow label="Cancel reason">
                {appointment.cancellationReason}
              </DetailRow>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-xs">
        All times shown in clinic time ({CLINIC_TIME_ZONE}).
      </p>

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        pending={update.isPending}
        onConfirm={(reason) => {
          void handleCancel(reason);
        }}
      />

      {update.isPending ? (
        <p className="text-muted-foreground text-xs" role="status">
          Saving…
        </p>
      ) : null}
    </div>
  );
}
