import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import type { AppointmentListParams } from "@/lib/schemas/list-params";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: AppointmentListParams) =>
    ["appointments", "list", params] as const,
  detail: (id: string) => ["appointments", "detail", id] as const,
};

export function appointmentsListOptions(params: AppointmentListParams) {
  return queryOptions({
    queryKey: appointmentKeys.list(params),
    queryFn: () => api.appointments(params),
    // Keep the current rows on screen while the next page loads.
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function appointmentDetailOptions(id: string) {
  return queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => api.appointment(id),
    staleTime: 15_000,
  });
}
