import { CLINIC_TIME_ZONE } from "@/lib/domain/schedule";
import type {
  Appointment,
  AppointmentMode,
  VisitType,
} from "@/lib/schemas/appointment";

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  initial: "Initial visit",
  "follow-up": "Follow-up",
  "medication-management": "Medication management",
};

export const MODE_LABELS: Record<AppointmentMode, string> = {
  "in-person": "In person",
  telehealth: "Telehealth",
};

function zoneAbbreviation(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);
  return (
    parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone
  );
}

/** Date + time in the clinic's zone, e.g. "Mon, Sep 28 · 9:00 AM EDT". */
export function formatClinicDateTime(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time} ${zoneAbbreviation(date, CLINIC_TIME_ZONE)}`;
}

export function formatClinicDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatClinicTime(iso: string): string {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${time} ${zoneAbbreviation(date, CLINIC_TIME_ZONE)}`;
}

/** The same instant in the viewer's own zone, e.g. "2:00 PM WAT". */
export function formatInTimeZone(iso: string, timeZone: string): string {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${time} ${zoneAbbreviation(date, timeZone)}`;
}

export function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

/** Today's date in the clinic's zone, as a plain Date for the calendar. */
export function clinicTodayDate(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return new Date(read("year"), read("month") - 1, read("day"));
}

export function patientName(appointment: Appointment): string {
  return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
}
