"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true on the client afterwards.
 * Uses useSyncExternalStore instead of a setState-in-effect so there is no
 * cascading render and no hydration mismatch.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
