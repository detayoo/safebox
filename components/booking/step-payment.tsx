"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { FormRow } from "@/components/booking/form-row";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BookingFormValues } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";

const OPTION_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors";

export function StepPayment({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const { control, watch } = form;
  const paymentType = watch("paymentType");

  return (
    <div className="space-y-5">
      <Controller
        control={control}
        name="paymentType"
        render={({ field }) => (
          <FormRow
            label="How will the visit be paid for?"
            htmlFor="paymentType"
          >
            <RadioGroup
              id="paymentType"
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              <label
                htmlFor="pay-self"
                className={cn(
                  OPTION_CLASS,
                  field.value === "self" && "border-foreground",
                )}
              >
                <RadioGroupItem id="pay-self" value="self" />
                Self pay
              </label>
              <label
                htmlFor="pay-insurance"
                className={cn(
                  OPTION_CLASS,
                  field.value === "insurance" && "border-foreground",
                )}
              >
                <RadioGroupItem id="pay-insurance" value="insurance" />
                Insurance
              </label>
            </RadioGroup>
          </FormRow>
        )}
      />

      {paymentType === "insurance" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="insurance.carrier"
            render={({ field, fieldState }) => (
              <FormRow
                label="Carrier"
                htmlFor="carrier"
                error={fieldState.error?.message}
              >
                <Input
                  id="carrier"
                  {...field}
                  aria-invalid={!!fieldState.error}
                  aria-describedby="carrier-message"
                />
              </FormRow>
            )}
          />

          <Controller
            control={control}
            name="insurance.memberId"
            render={({ field, fieldState }) => (
              <FormRow
                label="Member ID"
                htmlFor="memberId"
                error={fieldState.error?.message}
              >
                <Input
                  id="memberId"
                  {...field}
                  aria-invalid={!!fieldState.error}
                  aria-describedby="memberId-message"
                />
              </FormRow>
            )}
          />

          <Controller
            control={control}
            name="insurance.groupNumber"
            render={({ field }) => (
              <FormRow
                label="Group number"
                htmlFor="groupNumber"
                hint="Optional"
                className="sm:col-span-2"
              >
                <Input id="groupNumber" {...field} />
              </FormRow>
            )}
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          You will pay at the front desk when you arrive.
        </p>
      )}
    </div>
  );
}
