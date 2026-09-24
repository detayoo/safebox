"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingFormValues } from "@/lib/schemas/booking";

type BookingDraftState = {
  values: BookingFormValues | null;
  step: number;
  /**
   * The idempotency key for the current booking attempt. Kept with the draft so
   * a retry after a failed-but-saved write cannot create a second appointment.
   */
  attemptKey: string | null;
  setValues: (values: BookingFormValues) => void;
  setStep: (step: number) => void;
  setAttemptKey: (attemptKey: string) => void;
  clear: () => void;
};

export const useBookingDraft = create<BookingDraftState>()(
  persist(
    (set) => ({
      values: null,
      step: 0,
      attemptKey: null,
      setValues: (values) => set({ values }),
      setStep: (step) => set({ step }),
      setAttemptKey: (attemptKey) => set({ attemptKey }),
      clear: () => set({ values: null, step: 0, attemptKey: null }),
    }),
    { name: "safebox.booking-draft" },
  ),
);
