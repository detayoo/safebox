"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingProgress } from "@/components/booking/booking-progress";
import { StepPatient } from "@/components/booking/step-patient";
import { StepPayment } from "@/components/booking/step-payment";
import { StepReview } from "@/components/booking/step-review";
import { StepVisit } from "@/components/booking/step-visit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ApiRequestError } from "@/lib/api/client";
import { providersQueryOptions } from "@/lib/queries/providers";
import { useCreateAppointment } from "@/lib/queries/use-create-appointment";
import {
  BOOKING_STEPS,
  STEP_FIELDS,
  bookingFormSchema,
  defaultBookingValues,
  toCreateAppointmentInput,
  type BookingFormValues,
} from "@/lib/schemas/booking";
import type { Appointment, Provider } from "@/lib/schemas/appointment";
import { useBookingDraft } from "@/lib/stores/booking-draft";

export function BookingWizard() {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultBookingValues(),
    mode: "onTouched",
  });
  const [step, setStep] = useState(0);
  const [confirmation, setConfirmation] = useState<Appointment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const providersQuery = useQuery(providersQueryOptions());
  const createMutation = useCreateAppointment();

  // Restore a saved draft once, after mount.
  useEffect(() => {
    const draft = useBookingDraft.getState();
    if (draft.values) form.reset(draft.values);
    if (draft.step > 0 && draft.step < BOOKING_STEPS.length) {
      setStep(draft.step);
    }
  }, [form]);

  // Keep the draft in sync as the patient types.
  useEffect(() => {
    const subscription = form.watch((values) => {
      useBookingDraft.getState().setValues(values as BookingFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    useBookingDraft.getState().setStep(step);
  }, [step]);

  const values = form.watch();
  const providers: Provider[] = providersQuery.data ?? [];
  const providerName =
    providers.find((provider) => provider.id === values.providerId)?.name ?? "";

  async function goNext() {
    setFormError(null);
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) {
      setStep((current) => Math.min(current + 1, BOOKING_STEPS.length - 1));
    }
  }

  function goBack() {
    setFormError(null);
    setStep((current) => Math.max(0, current - 1));
  }

  function goTo(target: number) {
    setFormError(null);
    setStep(target);
  }

  async function handleSubmit() {
    setFormError(null);
    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) {
      setFormError("Some details still need fixing. Check the highlighted fields.");
      return;
    }

    const input = toCreateAppointmentInput(form.getValues());

    // One key per attempt, reused on retry, so a write that saved but came back
    // as an error cannot create a second appointment.
    let key = useBookingDraft.getState().attemptKey;
    if (!key) {
      key = crypto.randomUUID();
      useBookingDraft.getState().setAttemptKey(key);
    }

    try {
      const appointment = await createMutation.mutateAsync({
        input,
        idempotencyKey: key,
      });
      useBookingDraft.getState().clear();
      setConfirmation(appointment);
      toast.success("Appointment booked");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        setStep(1);
        form.setError("time", {
          type: "server",
          message: "That time was just taken. Please pick another slot.",
        });
        toast.error("That time was just taken. Please pick another slot.");
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
    }
  }

  function bookAnother() {
    setConfirmation(null);
    form.reset(defaultBookingValues());
    setStep(0);
    setFormError(null);
  }

  if (confirmation) {
    return (
      <BookingConfirmation
        appointment={confirmation}
        providerName={providerName}
        onBookAnother={bookAnother}
      />
    );
  }

  const isSubmitting = createMutation.isPending;

  return (
    <div className="space-y-6">
      <BookingProgress current={step} />

      <Card>
        <CardContent className="pt-6">
          {step === 0 ? <StepPatient form={form} /> : null}
          {step === 1 ? (
            <StepVisit form={form} providers={providers} />
          ) : null}
          {step === 2 ? <StepPayment form={form} /> : null}
          {step === 3 ? (
            <StepReview values={values} providerName={providerName} onEdit={goTo} />
          ) : null}

          {formError ? (
            <p role="alert" className="text-destructive mt-4 text-sm">
              {formError}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={step === 0 || isSubmitting}
          >
            Back
          </Button>

          {step < BOOKING_STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                void goNext();
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking…" : "Confirm booking"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
