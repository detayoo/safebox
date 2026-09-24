"use client";

import { useSyncExternalStore } from "react";

/**
 * The current time, refreshed on an interval and delivered from outside the
 * render — so components never read the clock during render. Returns 0 before
 * the first subscription (i.e. nothing is considered "past" yet).
 */
const TICK_MS = 30_000;
let snapshot = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
  if (timer !== null) return;
  snapshot = Date.now();
  timer = setInterval(() => {
    snapshot = Date.now();
    for (const listener of listeners) listener();
  }, TICK_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => 0,
  );
}
