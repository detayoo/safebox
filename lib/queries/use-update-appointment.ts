"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import { appointmentKeys } from "@/lib/queries/appointments";
import type {
  Appointment,
  UpdateAppointmentInput,
} from "@/lib/schemas/appointment";
import type { Paginated } from "@/lib/schemas/envelope";

/**
 * Updates one appointment and writes the result straight into the caches that
 * hold it — the detail entry and any loaded list page — so neither view needs
 * a full refetch.
 */
export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) =>
      api.updateAppointment(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(appointmentKeys.detail(id), updated);

      queryClient.setQueriesData<Paginated<Appointment>>(
        { queryKey: [...appointmentKeys.all, "list"] },
        (current) =>
          current
            ? {
                ...current,
                content: current.content.map((appointment) =>
                  appointment.id === updated.id ? updated : appointment,
                ),
              }
            : current,
      );
    },
  });
}
