import { z } from "zod";
import { checkSlot, isAdult } from "@/lib/domain/schedule";

export const VISIT_TYPES = [
  "initial",
  "follow-up",
  "medication-management",
] as const;
export const MODES = ["in-person", "telehealth"] as const;
export const STATUSES = [
  "scheduled",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
] as const;
export const visitTypeSchema = z.enum(VISIT_TYPES);
export const modeSchema = z.enum(MODES);
export const statusSchema = z.enum(STATUSES);
export const durationSchema = z.union([z.literal(30), z.literal(60)]);

export type VisitType = z.infer<typeof visitTypeSchema>;
export type AppointmentMode = z.infer<typeof modeSchema>;
export type AppointmentStatus = z.infer<typeof statusSchema>;

/** medication-management is a short visit; everything else is an hour. */
export function durationForVisitType(visitType: VisitType): 30 | 60 {
  return visitType === "medication-management" ? 30 : 60;
}

const PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;

export const patientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  dateOfBirth: z.iso.date("Enter a date of birth"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .regex(PHONE_PATTERN, "Enter a 10-digit US phone number"),
});

export const insuranceSchema = z.object({
  carrier: z.string().trim().min(1, "Carrier is required").max(80),
  memberId: z.string().trim().min(1, "Member ID is required").max(50),
  groupNumber: z.string().trim().max(50).optional(),
});

export type Patient = z.infer<typeof patientSchema>;
export type Insurance = z.infer<typeof insuranceSchema>;

export const createAppointmentSchema = z
  .object({
    patient: patientSchema,
    providerId: z.string().min(1, "Choose a provider"),
    visitType: visitTypeSchema,
    mode: modeSchema,
    // Accept an explicit offset (the picker is timezone-aware) but normalise
    // to UTC before storing.
    startsAt: z.iso.datetime({
      offset: true,
      error: "Choose a date and time",
    }),
    durationMinutes: durationSchema,
    insurance: insuranceSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (!isAdult(value.patient.dateOfBirth)) {
      ctx.addIssue({
        code: "custom",
        path: ["patient", "dateOfBirth"],
        message: "Patients must be 18 or older",
      });
    }

    const expected = durationForVisitType(value.visitType);
    if (value.durationMinutes !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["durationMinutes"],
        message: `${value.visitType} visits are ${expected} minutes`,
      });
    }

    const slot = checkSlot(value.startsAt, value.durationMinutes);
    if (!slot.ok) {
      ctx.addIssue({ code: "custom", path: ["startsAt"], message: slot.reason });
    }
  });

export const updateAppointmentSchema = z
  .object({
    status: statusSchema,
    cancellationReason: z.string().trim().max(280).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "cancelled") {
      const reason = value.cancellationReason ?? "";
      if (reason.length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["cancellationReason"],
          message: "Give a reason of at least 10 characters",
        });
      }
    }
  });

export const appointmentSchema = z.object({
  id: z.string(),
  patient: patientSchema,
  providerId: z.string(),
  visitType: visitTypeSchema,
  mode: modeSchema,
  startsAt: z.iso.datetime(),
  durationMinutes: durationSchema,
  status: statusSchema,
  insurance: insuranceSchema.nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

export const providerSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type Provider = z.infer<typeof providerSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
