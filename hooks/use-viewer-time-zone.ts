"use client";

import { useMounted } from "@/hooks/use-mounted";

/**
 * The viewer's IANA zone, or null until mounted. Null on the server and the
 * first render so the local-time hint can't cause a hydration mismatch.
 */
export function useViewerTimeZone(): string | null {
  const mounted = useMounted();
  if (!mounted) return null;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
