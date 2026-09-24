import { differenceInYears } from "date-fns";
import { TZDate } from "@date-fns/tz";

/**
 * The clinic runs on New York time. Business hours, the weekday rule and the
 * slot grid are all defined in this zone, never in the viewer's local zone.
 */
export const CLINIC_TIME_ZONE = "America/New_York";

export const SLOT_MINUTES = 30;
const OPEN_MINUTES = 9 * 60;
const CLOSE_MINUTES = 17 * 60;

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function isWeekday(day: number): boolean {
  return day >= 1 && day <= 5;
}

function clinicDate(isoDate: string): TZDate {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new TZDate(year, month - 1, day, 0, 0, 0, CLINIC_TIME_ZONE);
}

export function isAdult(dateOfBirth: string, now = new Date()): boolean {
  return differenceInYears(now, clinicDate(dateOfBirth)) >= 18;
}

/** Start-of-day in clinic time for an ISO datetime, as a UTC timestamp. */
export function clinicDayStart(date: Date): number {
  const local = new TZDate(date, CLINIC_TIME_ZONE);
  return new TZDate(
    local.getFullYear(),
    local.getMonth(),
    local.getDate(),
    0,
    0,
    0,
    CLINIC_TIME_ZONE,
  ).getTime();
}

export function clinicDayOfWeek(date: Date): number {
  return new TZDate(date, CLINIC_TIME_ZONE).getDay();
}

/** [start, end] UTC timestamps covering a clinic day, inclusive. */
export function clinicDayRange(isoDate: string): { start: number; end: number } {
  const day = clinicDate(isoDate);
  const nextDay = new TZDate(
    day.getFullYear(),
    day.getMonth(),
    day.getDate() + 1,
    0,
    0,
    0,
    CLINIC_TIME_ZONE,
  );
  return { start: day.getTime(), end: nextDay.getTime() - 1 };
}

export type SlotCheck = { ok: true } | { ok: false; reason: string };

/**
 * A start time is valid when it lands on the clinic's 30-minute grid, on a
 * weekday, with the whole visit finishing by 17:00, and in the future.
 */
export function checkSlot(
  startsAt: string,
  durationMinutes: number,
  now = new Date(),
): SlotCheck {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, reason: "Choose a valid date and time" };
  }

  if (!isWeekday(clinicDayOfWeek(start))) {
    return { ok: false, reason: "The clinic is closed on weekends" };
  }

  const local = new TZDate(start, CLINIC_TIME_ZONE);
  const minutes = local.getHours() * 60 + local.getMinutes();

  if (minutes < OPEN_MINUTES) {
    return { ok: false, reason: "The clinic opens at 9:00 AM" };
  }

  if (minutes + durationMinutes > CLOSE_MINUTES) {
    const latest = CLOSE_MINUTES - durationMinutes;
    const latestHour = Math.floor(latest / 60);
    const latestMinute = latest % 60;
    const displayHour = latestHour % 12 === 0 ? 12 : latestHour % 12;
    const meridiem = latestHour >= 12 ? "PM" : "AM";
    return {
      ok: false,
      reason: `A ${durationMinutes}-minute visit must start by ${displayHour}:${String(
        latestMinute,
      ).padStart(2, "0")} ${meridiem}`,
    };
  }

  if (minutes % SLOT_MINUTES !== 0 || local.getSeconds() !== 0) {
    return { ok: false, reason: "Appointments start on the half hour" };
  }

  if (start.getTime() <= now.getTime()) {
    return { ok: false, reason: "Choose a time in the future" };
  }

  return { ok: true };
}

/** All valid start times (ISO UTC) for a clinic date and visit duration. */
export function slotStartsForDate(
  isoDate: string,
  durationMinutes: number,
): string[] {
  const starts: string[] = [];
  const day = clinicDate(isoDate);

  if (!isWeekday(day.getDay())) return starts;

  for (
    let minutes = OPEN_MINUTES;
    minutes + durationMinutes <= CLOSE_MINUTES;
    minutes += SLOT_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const slot = new TZDate(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hour,
      minute,
      0,
      CLINIC_TIME_ZONE,
    );
    // Store canonical UTC ("Z") so every consumer sees one format.
    starts.push(new Date(slot.getTime()).toISOString());
  }

  return starts;
}
