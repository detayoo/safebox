"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { appointmentTableFeatures } from "@/components/appointments/table-features";
import {
  MODE_LABELS,
  VISIT_TYPE_LABELS,
  formatClinicDateTime,
  patientName,
} from "@/lib/format";
import type { Appointment } from "@/lib/schemas/appointment";

const helper = createColumnHelper<typeof appointmentTableFeatures, Appointment>();

/**
 * Column ids double as the server's sort keys for the two sortable columns:
 * `patient` and `startsAt`.
 */
export function createAppointmentColumns(
  providerNameById: Map<string, string>,
) {
  return helper.columns([
    helper.display({
      id: "patient",
      header: "Patient",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="max-w-[220px] min-w-0">
          <Link
            href={`/appointments/${row.original.id}`}
            className="font-medium hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {patientName(row.original)}
          </Link>
          <p className="text-muted-foreground truncate text-xs">
            {row.original.patient.email}
          </p>
        </div>
      ),
    }),
    helper.display({
      id: "provider",
      header: "Provider",
      enableSorting: false,
      cell: ({ row }) =>
        providerNameById.get(row.original.providerId) ??
        row.original.providerId,
    }),
    helper.accessor("visitType", {
      header: "Visit",
      enableSorting: false,
      cell: ({ getValue }) => VISIT_TYPE_LABELS[getValue()],
    }),
    helper.accessor("mode", {
      header: "Mode",
      enableSorting: false,
      cell: ({ getValue }) => MODE_LABELS[getValue()],
    }),
    helper.accessor("startsAt", {
      header: "Date & time",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">
          {formatClinicDateTime(getValue())}
        </span>
      ),
    }),
    helper.accessor("status", {
      header: "Status",
      enableSorting: false,
      cell: ({ getValue }) => <AppointmentStatusBadge status={getValue()} />,
    }),
  ]);
}
