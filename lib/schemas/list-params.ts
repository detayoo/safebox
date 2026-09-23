import { z } from "zod";
import { STATUSES } from "@/lib/schemas/appointment";

export const SORT_FIELDS = ["startsAt", "patient"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const appointmentListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  status: z.array(z.enum(STATUSES)).optional(),
  providerId: z.string().min(1).optional(),
  from: z.union([z.iso.date(), z.iso.datetime()]).optional(),
  to: z.union([z.iso.date(), z.iso.datetime()]).optional(),
  sortBy: z.enum(SORT_FIELDS).default("startsAt"),
  sortOrder: z.enum(SORT_ORDERS).default("desc"),
});

export type AppointmentListParams = z.infer<typeof appointmentListParamsSchema>;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

function firstOrUndefined(values: string[]): string | undefined {
  return values.find((value) => value.length > 0);
}

function multiValue(values: string[]): string[] | undefined {
  const parts = values.flatMap((value) => value.split(",")).filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

/**
 * Query strings are strings; this reads them into the typed list params the
 * handlers and the table both expect. Repeated and comma-separated `status`
 * values are both accepted.
 */
export function parseAppointmentListParams(
  searchParams: URLSearchParams,
): AppointmentListParams {
  const raw = {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: firstOrUndefined([searchParams.get("search") ?? ""]),
    status: multiValue(searchParams.getAll("status")),
    providerId: firstOrUndefined([searchParams.get("providerId") ?? ""]),
    from: firstOrUndefined([searchParams.get("from") ?? ""]),
    to: firstOrUndefined([searchParams.get("to") ?? ""]),
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  };

  return appointmentListParamsSchema.parse(raw);
}
