"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FailureToggleState = {
  /** When true, requests carry the failure header and the API fails ~30%. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const useFailureToggle = create<FailureToggleState>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "safebox.failure-toggle" },
  ),
);
