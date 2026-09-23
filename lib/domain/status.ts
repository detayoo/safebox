import type { AppointmentStatus } from "@/lib/schemas/appointment";

/**
 * The only status moves the desk allows. Everything else is hidden in the UI
 * and rejected by the API, so the two can never disagree.
 */
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ["checked-in", "no-show", "cancelled"],
  "checked-in": ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  "no-show": [],
};

export function allowedTransitions(
  from: AppointmentStatus,
): AppointmentStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  "checked-in": "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};
