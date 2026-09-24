import { z } from "zod";
import type { FieldPath } from "react-hook-form";
import { checkSlot, isAdult } from "@/lib/domain/schedule";
import {
  durationForVisitType,
  modeSchema,
  patientSchema,
  visitTypeSchema,
  type CreateAppointmentInput,
} from "@/lib/schemas/appointment";

export const BOOKING_STEPS = [
  { id: "patient", title: "Patient details" },
  { id: "visit", title: "Visit" },
  { id: "payment", title: "Payment" },
  { id: "review", title: "Review" },
] as const;

export const paymentTypeSchema = z.enum(["self", "insurance"]);
export type PaymentType = z.infer<typeof paymentTypeSchema>;

/**
 * The wizard's own shape: date and time are separate fields, and payment is a
 * choice that only requires insurance details when it is selected. It is turned
 * into the API's create payload at submit time.
 */
export const bookingFormSchema = z
  .object({
    patient: patientSchema,
    visitType: visitTypeSchema,
    mode: modeSchema,
    providerId: z.string().min(1, "Choose a provider"),
    date: z.string().min(1, "Choose a date"),
    time: z.string().min(1, "Choose a time"),
    paymentType: paymentTypeSchema,
    insurance: z.object({
      carrier: z.string().trim().max(80),
      memberId: z.string().trim().max(50),
      groupNumber: z.string().trim().max(50),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.patient.dateOfBirth && !isAdult(value.patient.dateOfBirth)) {
      ctx.addIssue({
        code: "custom",
        path: ["patient", "dateOfBirth"],
        message: "Patients must be 18 or older",
      });
    }

    if (value.paymentType === "insurance") {
      if (!value.insurance.carrier) {
        ctx.addIssue({
          code: "custom",
          path: ["insurance", "carrier"],
          message: "Carrier is required",
        });
      }
      if (!value.insurance.memberId) {
        ctx.addIssue({
          code: "custom",
          path: ["insurance", "memberId"],
          message: "Member ID is required",
        });
      }
    }

    if (value.time) {
      const slot = checkSlot(value.time, durationForVisitType(value.visitType));
      if (!slot.ok) {
        ctx.addIssue({ code: "custom", path: ["time"], message: slot.reason });
      }
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const STEP_FIELDS: FieldPath<BookingFormValues>[][] = [
  [
    "patient.firstName",
    "patient.lastName",
    "patient.dateOfBirth",
    "patient.email",
    "patient.phone",
  ],
  ["visitType", "mode", "providerId", "date", "time"],
  [
    "paymentType",
    "insurance.carrier",
    "insurance.memberId",
    "insurance.groupNumber",
  ],
  [],
];

export function defaultBookingValues(): BookingFormValues {
  return {
    patient: { firstName: "", lastName: "", dateOfBirth: "", email: "", phone: "" },
    visitType: "initial",
    mode: "in-person",
    providerId: "",
    date: "",
    time: "",
    paymentType: "self",
    insurance: { carrier: "", memberId: "", groupNumber: "" },
  };
}

export function toCreateAppointmentInput(
  values: BookingFormValues,
): CreateAppointmentInput {
  const groupNumber = values.insurance.groupNumber.trim();

  return {
    patient: values.patient,
    providerId: values.providerId,
    visitType: values.visitType,
    mode: values.mode,
    startsAt: values.time,
    durationMinutes: durationForVisitType(values.visitType),
    insurance:
      values.paymentType === "insurance"
        ? {
            carrier: values.insurance.carrier.trim(),
            memberId: values.insurance.memberId.trim(),
            ...(groupNumber ? { groupNumber } : {}),
          }
        : null,
  };
}
