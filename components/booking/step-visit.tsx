"use client";

import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { FormRow } from "@/components/booking/form-row";
import { SlotPicker } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MODE_LABELS,
  VISIT_TYPE_LABELS,
  clinicTodayDate,
  formatDateOnly,
} from "@/lib/format";
import { durationForVisitType } from "@/lib/schemas/appointment";
import type { Provider } from "@/lib/schemas/appointment";
import type { BookingFormValues } from "@/lib/schemas/booking";
import { MODES, VISIT_TYPES } from "@/lib/schemas/appointment";
import { cn } from "@/lib/utils";

const OPTION_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors";

export function StepVisit({
  form,
  providers,
}: {
  form: UseFormReturn<BookingFormValues>;
  providers: Provider[];
}) {
  const { control, watch, setValue } = form;
  const date = watch("date");
  const visitType = watch("visitType");

  // Changing the date or visit type changes which slots exist, so the previous
  // choice no longer applies. Only clear on a real user change.
  function clearTime() {
    setValue("time", "", { shouldValidate: false });
  }

  return (
    <div className="space-y-5">
      <Controller
        control={control}
        name="visitType"
        render={({ field, fieldState }) => (
          <FormRow
            label="Visit type"
            htmlFor="visitType"
            error={fieldState.error?.message}
          >
            <RadioGroup
              id="visitType"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                clearTime();
              }}
              className="grid gap-2 sm:grid-cols-3"
            >
              {VISIT_TYPES.map((type) => (
                <label
                  key={type}
                  htmlFor={`visit-${type}`}
                  className={cn(
                    OPTION_CLASS,
                    field.value === type && "border-foreground",
                  )}
                >
                  <RadioGroupItem id={`visit-${type}`} value={type} />
                  <span>
                    {VISIT_TYPE_LABELS[type]}
                    <span className="text-muted-foreground block text-xs">
                      {durationForVisitType(type)} min
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="mode"
        render={({ field, fieldState }) => (
          <FormRow
            label="Mode"
            htmlFor="mode"
            error={fieldState.error?.message}
          >
            <RadioGroup
              id="mode"
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              {MODES.map((mode) => (
                <label
                  key={mode}
                  htmlFor={`mode-${mode}`}
                  className={cn(
                    OPTION_CLASS,
                    field.value === mode && "border-foreground",
                  )}
                >
                  <RadioGroupItem id={`mode-${mode}`} value={mode} />
                  {MODE_LABELS[mode]}
                </label>
              ))}
            </RadioGroup>
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="providerId"
        render={({ field, fieldState }) => (
          <FormRow
            label="Provider"
            htmlFor="providerId"
            error={fieldState.error?.message}
          >
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="providerId"
                className="w-full"
                aria-invalid={!!fieldState.error}
                aria-describedby="providerId-message"
              >
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} — {provider.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <FormRow
            label="Date"
            htmlFor="date"
            error={fieldState.error?.message}
            hint="Weekdays only, clinic time"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  type="button"
                  variant="outline"
                  aria-invalid={!!fieldState.error}
                  aria-describedby="date-message"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarIcon className="size-4 opacity-60" />
                  {field.value ? formatDateOnly(field.value) : "Choose a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  autoFocus
                  selected={field.value ? parseISO(field.value) : undefined}
                  onSelect={(selected) => {
                    field.onChange(
                      selected ? format(selected, "yyyy-MM-dd") : "",
                    );
                    clearTime();
                  }}
                  disabled={[
                    { before: clinicTodayDate() },
                    { dayOfWeek: [0, 6] },
                  ]}
                />
              </PopoverContent>
            </Popover>
          </FormRow>
        )}
      />

      <Controller
        control={control}
        name="time"
        render={({ field, fieldState }) => (
          <FormRow
            label="Time"
            htmlFor="time"
            error={fieldState.error?.message}
            hint={`${durationForVisitType(visitType)} minute visit`}
          >
            <SlotPicker
              date={date}
              visitType={visitType}
              value={field.value}
              onChange={field.onChange}
            />
          </FormRow>
        )}
      />
    </div>
  );
}
