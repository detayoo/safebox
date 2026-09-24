import { faker } from "@faker-js/faker";
import { TZDate } from "@date-fns/tz";
import {
  durationForVisitType,
  type Appointment,
  type AppointmentStatus,
  type Provider,
} from "@/lib/schemas/appointment";
import { CLINIC_TIME_ZONE, slotStartsForDate } from "@/lib/domain/schedule";

export type Store = {
  providers: Provider[];
  appointments: Appointment[];
  /** idempotency key → appointment id, so a retried write can't double-book. */
  idempotency: Map<string, string>;
};

const PROVIDERS: Provider[] = [
  { id: "prv_01", name: "Dr. Amara Okafor", specialty: "Family Medicine" },
  { id: "prv_02", name: "Dr. Daniel Reyes", specialty: "Internal Medicine" },
  { id: "prv_03", name: "Dr. Priya Nair", specialty: "Pediatrics" },
  { id: "prv_04", name: "Dr. Marcus Lindqvist", specialty: "Cardiology" },
  { id: "prv_05", name: "Dr. Grace Whitfield", specialty: "Dermatology" },
  { id: "prv_06", name: "Dr. Tobias Berg", specialty: "Endocrinology" },
];

// A mix of Nigerian and other names. Nigerian names are written the way they
// are used day to day, without tone marks.
const NIGERIAN_FIRST_NAMES = [
  "Tayo", "Bola", "Yemi", "Sade", "Tunde", "Seyi", "Funke", "Kemi", "Dapo",
  "Nike", "Chidi", "Ngozi", "Emeka", "Amaka", "Chinedu", "Adaeze", "Kelechi",
  "Ifeoma", "Obi", "Uche", "Aisha", "Musa", "Ibrahim", "Fatima", "Zainab",
  "Yusuf", "Halima", "Bello", "Amina", "Efe", "Oghenekaro", "Ese", "Onome",
  "Tega", "Osaze", "Idia",
];
const NIGERIAN_LAST_NAMES = [
  "Adedigba", "Adeyemi", "Adebayo", "Okafor", "Ogundipe", "Balogun",
  "Ogunleye", "Nwosu", "Eze", "Achebe", "Okonkwo", "Adeleke", "Olawale",
  "Abiodun", "Chukwu", "Uzoma", "Okeke", "Oyelaran", "Fashola", "Danjuma",
  "Aliyu", "Nwachukwu", "Afolabi", "Ojukwu", "Akinyemi",
];

const CARRIERS = ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"];
const CANCEL_REASONS = [
  "Patient rescheduled for a later date",
  "Provider had an emergency",
  "Patient no longer needs the visit",
  "Insurance could not be verified in time",
];

function clinicDateString(date: Date): string {
  const local = new TZDate(date, CLINIC_TIME_ZONE);
  const year = local.getFullYear();
  const month = `${local.getMonth() + 1}`.padStart(2, "0");
  const day = `${local.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomPatientName(): { firstName: string; lastName: string } {
  if (faker.datatype.boolean(0.5)) {
    return {
      firstName: faker.helpers.arrayElement(NIGERIAN_FIRST_NAMES),
      lastName: faker.helpers.arrayElement(NIGERIAN_LAST_NAMES),
    };
  }
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
}

function usPhone(): string {
  return `(${faker.number.int({ min: 200, max: 989 })}) ${faker.number.int({
    min: 200,
    max: 989,
  })}-${faker.number.int({ min: 1000, max: 9999 })}`;
}

function adultDob(now: Date): string {
  return clinicDateString(
    faker.date.birthdate({ min: 18, max: 88, mode: "age", refDate: now }),
  );
}

function statusFor(start: number, now: number): AppointmentStatus {
  if (start < now) {
    return faker.helpers.weightedArrayElement([
      { value: "completed", weight: 6 },
      { value: "no-show", weight: 2 },
      { value: "cancelled", weight: 2 },
    ]);
  }
  return faker.helpers.weightedArrayElement([
    { value: "scheduled", weight: 8 },
    { value: "checked-in", weight: 1 },
    { value: "cancelled", weight: 1 },
  ]);
}

function seed(): Store {
  // Deterministic seed so every instance and every reload sees the same data.
  faker.seed(20260923);

  const now = Date.now();
  const appointments: Appointment[] = [];
  const taken = new Set<string>();
  let attempts = 0;

  while (appointments.length < 160 && attempts < 8000) {
    attempts += 1;

    const offsetDays = faker.number.int({ min: -14, max: 21 });
    const day = new Date(now + offsetDays * 24 * 60 * 60 * 1000);
    const isoDate = clinicDateString(day);

    const provider = faker.helpers.arrayElement(PROVIDERS);
    const visitType = faker.helpers.arrayElement([
      "initial",
      "follow-up",
      "medication-management",
    ] as const);
    const durationMinutes = durationForVisitType(visitType);

    const slots = slotStartsForDate(isoDate, durationMinutes);
    if (slots.length === 0) continue;

    const startsAt = faker.helpers.arrayElement(slots);
    const bookingKey = `${provider.id}:${startsAt}:${durationMinutes}`;
    if (taken.has(bookingKey)) continue;
    taken.add(bookingKey);

    const startTime = new Date(startsAt).getTime();
    const status = statusFor(startTime, now);
    const insured = faker.datatype.boolean(0.45);
    const name = randomPatientName();

    appointments.push({
      id: `apt_${appointments.length.toString().padStart(4, "0")}`,
      patient: {
        firstName: name.firstName,
        lastName: name.lastName,
        dateOfBirth: adultDob(new Date(now)),
        email: faker.internet
          .email({ firstName: name.firstName, lastName: name.lastName })
          .toLowerCase(),
        phone: usPhone(),
      },
      providerId: provider.id,
      visitType,
      mode: faker.helpers.arrayElement(["in-person", "telehealth"] as const),
      startsAt,
      durationMinutes,
      status,
      insurance: insured
        ? {
            carrier: faker.helpers.arrayElement(CARRIERS),
            memberId: faker.string.alphanumeric({ length: 9, casing: "upper" }),
          }
        : null,
      cancellationReason:
        status === "cancelled"
          ? faker.helpers.arrayElement(CANCEL_REASONS)
          : null,
      createdAt: new Date(
        startTime - faker.number.int({ min: 1, max: 20 }) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  appointments.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );

  return { providers: PROVIDERS, appointments, idempotency: new Map() };
}

/**
 * One store per server instance. Attached to globalThis so dev hot reloads
 * reuse it instead of wiping the appointments on every edit.
 */
const globalForStore = globalThis as unknown as { __clinicStore?: Store };

export function getStore(): Store {
  globalForStore.__clinicStore ??= seed();
  return globalForStore.__clinicStore;
}
