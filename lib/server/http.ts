import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { ApiError, ApiSuccess } from "@/lib/schemas/envelope";

/** The UI toggle flips this header to exercise the error paths on purpose. */
export const FAILURE_HEADER = "x-simulate-failure";

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 900;
const FAILURE_RATE = 0.3;

export function ok<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, message, data },
    { status },
  );
}

export function fail(
  message: string,
  status = 400,
  errors?: Record<string, string>,
) {
  const body: ApiError = errors ? { success: false, message, errors } : { success: false, message };
  return NextResponse.json(body, { status });
}

/** Every handler pays 300–900 ms so the loading states are real. */
export async function simulateLatency(): Promise<void> {
  const ms =
    MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldSimulateFailure(request: Request): boolean {
  return (
    request.headers.get(FAILURE_HEADER) === "1" && Math.random() < FAILURE_RATE
  );
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !(path in errors)) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
