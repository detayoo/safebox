import { apiFetch } from "@/lib/api/client";
import type {
  Appointment,
  CreateAppointmentInput,
  Provider,
  UpdateAppointmentInput,
} from "@/lib/schemas/appointment";
import type { Paginated } from "@/lib/schemas/envelope";
import type { AppointmentListParams } from "@/lib/schemas/list-params";

function toAppointmentsQuery(params: AppointmentListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("pageSize", String(params.pageSize));
  if (params.search) search.set("search", params.search);
  for (const status of params.status ?? []) search.append("status", status);
  if (params.providerId) search.set("providerId", params.providerId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  search.set("sortBy", params.sortBy);
  search.set("sortOrder", params.sortOrder);
  return search.toString();
}

export const api = {
  providers: () => apiFetch<Provider[]>("/api/providers"),

  appointments: (params: AppointmentListParams) =>
    apiFetch<Paginated<Appointment>>(
      `/api/appointments?${toAppointmentsQuery(params)}`,
    ),

  appointment: (id: string) =>
    apiFetch<Appointment>(`/api/appointments/${encodeURIComponent(id)}`),

  createAppointment: (input: CreateAppointmentInput, idempotencyKey?: string) =>
    apiFetch<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
      headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : undefined,
    }),

  updateAppointment: (id: string, input: UpdateAppointmentInput) =>
    apiFetch<Appointment>(`/api/appointments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
