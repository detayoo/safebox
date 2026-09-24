"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import { appointmentKeys } from "@/lib/queries/appointments";
import type { CreateAppointmentInput } from "@/lib/schemas/appointment";

/**
 * Books an appointment, then marks the appointments list stale so a new booking
 * shows up on the desk side without a page reload.
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: CreateAppointmentInput;
      idempotencyKey: string;
    }) => api.createAppointment(input, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
