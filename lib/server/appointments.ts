import { clinicDayRange } from "@/lib/domain/schedule";
import { canTransition } from "@/lib/domain/status";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/lib/schemas/appointment";
import type { Paginated } from "@/lib/schemas/envelope";
import type { AppointmentListParams } from "@/lib/schemas/list-params";
import { getStore } from "./store";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Date-only bounds are interpreted as full clinic days, not UTC days. */
function lowerBound(value: string): number {
  return DATE_ONLY.test(value) ? clinicDayRange(value).start : new Date(value).getTime();
}

function upperBound(value: string): number {
  return DATE_ONLY.test(value) ? clinicDayRange(value).end : new Date(value).getTime();
}

function overlaps(a: Appointment, startsAt: number, durationMinutes: number): boolean {
  const end = startsAt + durationMinutes * 60_000;
  const aStart = new Date(a.startsAt).getTime();
  const aEnd = aStart + a.durationMinutes * 60_000;
  return aStart < end && startsAt < aEnd;
}

export function findConflict(
  providerId: string,
  startsAt: string,
  durationMinutes: number,
  ignoreId?: string,
): Appointment | undefined {
  const start = new Date(startsAt).getTime();
  return getStore().appointments.find(
    (appointment) =>
      appointment.providerId === providerId &&
      appointment.status !== "cancelled" &&
      appointment.id !== ignoreId &&
      overlaps(appointment, start, durationMinutes),
  );
}

export function listAppointments(
  params: AppointmentListParams,
): Paginated<Appointment> {
  const { page, pageSize, search, status, providerId, from, to, sortBy, sortOrder } =
    params;
  const term = search?.toLowerCase();
  const min = from ? lowerBound(from) : undefined;
  const max = to ? upperBound(to) : undefined;

  const filtered = getStore().appointments.filter((appointment) => {
    if (term) {
      const haystack = [
        appointment.patient.firstName,
        appointment.patient.lastName,
        appointment.patient.email,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (status?.length && !status.includes(appointment.status)) return false;
    if (providerId && appointment.providerId !== providerId) return false;

    const start = new Date(appointment.startsAt).getTime();
    if (min !== undefined && start < min) return false;
    if (max !== undefined && start > max) return false;

    return true;
  });

  const direction = sortOrder === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    if (sortBy === "patient") {
      const left = `${a.patient.lastName} ${a.patient.firstName}`.toLowerCase();
      const right = `${b.patient.lastName} ${b.patient.firstName}`.toLowerCase();
      const byName = left.localeCompare(right);
      if (byName !== 0) return byName * direction;
    }
    return (
      (new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()) *
      direction
    );
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;

  return {
    content: filtered.slice(startIndex, startIndex + pageSize),
    pagination: { page, pageSize, total, totalPages },
  };
}

export function getAppointment(id: string): Appointment | undefined {
  return getStore().appointments.find((appointment) => appointment.id === id);
}

export type CreateResult =
  | { ok: true; appointment: Appointment; replayed: boolean }
  | { ok: false; kind: "conflict" }
  | { ok: false; kind: "unknown-provider" };

export function createAppointment(
  input: CreateAppointmentInput,
  idempotencyKey?: string,
): CreateResult {
  const store = getStore();

  if (idempotencyKey) {
    const existingId = store.idempotency.get(idempotencyKey);
    const existing = existingId
      ? store.appointments.find((appointment) => appointment.id === existingId)
      : undefined;
    if (existing) return { ok: true, appointment: existing, replayed: true };
  }

  if (!store.providers.some((provider) => provider.id === input.providerId)) {
    return { ok: false, kind: "unknown-provider" };
  }

  if (findConflict(input.providerId, input.startsAt, input.durationMinutes)) {
    return { ok: false, kind: "conflict" };
  }

  const appointment: Appointment = {
    id: `apt_${crypto.randomUUID().slice(0, 8)}`,
    patient: input.patient,
    providerId: input.providerId,
    visitType: input.visitType,
    mode: input.mode,
    startsAt: new Date(input.startsAt).toISOString(),
    durationMinutes: input.durationMinutes,
    status: "scheduled",
    insurance: input.insurance ?? null,
    cancellationReason: null,
    createdAt: new Date().toISOString(),
  };

  store.appointments.push(appointment);
  if (idempotencyKey) store.idempotency.set(idempotencyKey, appointment.id);

  return { ok: true, appointment, replayed: false };
}

export type UpdateResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; kind: "not-found" }
  | { ok: false; kind: "invalid-transition"; from: AppointmentStatus };

export function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): UpdateResult {
  const store = getStore();
  const index = store.appointments.findIndex(
    (appointment) => appointment.id === id,
  );
  if (index === -1) return { ok: false, kind: "not-found" };

  const current = store.appointments[index];
  if (!canTransition(current.status, input.status)) {
    return { ok: false, kind: "invalid-transition", from: current.status };
  }

  const updated: Appointment = {
    ...current,
    status: input.status,
    cancellationReason:
      input.status === "cancelled" ? (input.cancellationReason ?? null) : null,
  };
  store.appointments[index] = updated;

  return { ok: true, appointment: updated };
}
