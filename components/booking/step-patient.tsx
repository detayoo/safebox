"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { PhoneInput } from "@/components/booking/phone-input";
import { FormRow } from "@/components/booking/form-row";
import { Input } from "@/components/ui/input";
import type { BookingFormValues } from "@/lib/schemas/booking";

export function StepPatient({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const { control } = form;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name="patient.firstName"
        render={({ field, fieldState }) => (
          <FormRow
            label="First name"
            htmlFor="firstName"
            error={fieldState.error?.message}
          >
            <Input
              id="firstName"
              autoComplete="given-name"
              {...field}
              aria-invalid={!!fieldState.error}
              aria-describedby="firstName-message"
            />
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="patient.lastName"
        render={({ field, fieldState }) => (
          <FormRow
            label="Last name"
            htmlFor="lastName"
            error={fieldState.error?.message}
          >
            <Input
              id="lastName"
              autoComplete="family-name"
              {...field}
              aria-invalid={!!fieldState.error}
              aria-describedby="lastName-message"
            />
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="patient.dateOfBirth"
        render={({ field, fieldState }) => (
          <FormRow
            label="Date of birth"
            htmlFor="dateOfBirth"
            error={fieldState.error?.message}
            hint="Patients must be 18 or older"
          >
            <Input
              id="dateOfBirth"
              type="date"
              {...field}
              aria-invalid={!!fieldState.error}
              aria-describedby="dateOfBirth-message"
            />
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="patient.phone"
        render={({ field, fieldState }) => (
          <FormRow
            label="Phone"
            htmlFor="phone"
            error={fieldState.error?.message}
            hint="US number"
          >
            <PhoneInput
              id="phone"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!fieldState.error}
              describedBy="phone-message"
            />
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="patient.email"
        render={({ field, fieldState }) => (
          <FormRow
            label="Email"
            htmlFor="email"
            error={fieldState.error?.message}
            className="sm:col-span-2"
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...field}
              aria-invalid={!!fieldState.error}
              aria-describedby="email-message"
            />
          </FormRow>
        )}
      />
    </div>
  );
}
