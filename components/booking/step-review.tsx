"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useViewerTimeZone } from "@/hooks/use-viewer-time-zone";
import { CLINIC_TIME_ZONE } from "@/lib/domain/schedule";
import {
  MODE_LABELS,
  VISIT_TYPE_LABELS,
  formatClinicDateTime,
  formatDateOnly,
  formatDuration,
  formatInTimeZone,
} from "@/lib/format";
import { durationForVisitType } from "@/lib/schemas/appointment";
import type { BookingFormValues } from "@/lib/schemas/booking";

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
        >
          Edit
        </Button>
      </div>
      <dl className="divide-border border-border divide-y rounded-md border px-4">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

export function StepReview({
  values,
  providerName,
  onEdit,
}: {
  values: BookingFormValues;
  providerName: string;
  onEdit: (step: number) => void;
}) {
  const viewerTimeZone = useViewerTimeZone();
  const localHint =
    viewerTimeZone && viewerTimeZone !== CLINIC_TIME_ZONE && values.time
      ? formatInTimeZone(values.time, viewerTimeZone)
      : null;

  return (
    <div className="space-y-6">
      <Section title="Patient details" step={0} onEdit={onEdit}>
        <Row
          label="Name"
          value={`${values.patient.firstName} ${values.patient.lastName}`}
        />
        <Row
          label="Date of birth"
          value={
            values.patient.dateOfBirth
              ? formatDateOnly(values.patient.dateOfBirth)
              : "—"
          }
        />
        <Row label="Email" value={values.patient.email || "—"} />
        <Row label="Phone" value={values.patient.phone || "—"} />
      </Section>

      <Section title="Visit" step={1} onEdit={onEdit}>
        <Row label="Provider" value={providerName || "—"} />
        <Row label="Type" value={VISIT_TYPE_LABELS[values.visitType]} />
        <Row label="Mode" value={MODE_LABELS[values.mode]} />
        <Row
          label="Date & time"
          value={
            values.time ? (
              <>
                {formatClinicDateTime(values.time)}
                {localHint ? (
                  <span className="text-muted-foreground">
                    {" "}
                    ({localHint} your time)
                  </span>
                ) : null}
              </>
            ) : (
              "—"
            )
          }
        />
        <Row
          label="Duration"
          value={formatDuration(durationForVisitType(values.visitType))}
        />
      </Section>

      <Section title="Payment" step={2} onEdit={onEdit}>
        {values.paymentType === "insurance" ? (
          <>
            <Row label="Coverage" value="Insurance" />
            <Row label="Carrier" value={values.insurance.carrier || "—"} />
            <Row label="Member ID" value={values.insurance.memberId || "—"} />
            <Row
              label="Group number"
              value={values.insurance.groupNumber || "—"}
            />
          </>
        ) : (
          <Row label="Coverage" value="Self pay" />
        )}
      </Section>
    </div>
  );
}
