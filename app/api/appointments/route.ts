import type { NextRequest } from "next/server";
import { createAppointmentSchema } from "@/lib/schemas/appointment";
import { parseAppointmentListParams } from "@/lib/schemas/list-params";
import { createAppointment, listAppointments } from "@/lib/server/appointments";
import {
  fail,
  ok,
  shouldSimulateFailure,
  simulateLatency,
  zodFieldErrors,
} from "@/lib/server/http";

export async function GET(request: NextRequest) {
  await simulateLatency();

  if (shouldSimulateFailure(request)) {
    return fail("Couldn't load appointments", 500);
  }

  try {
    const params = parseAppointmentListParams(request.nextUrl.searchParams);
    return ok(listAppointments(params));
  } catch {
    return fail("Some filters were not valid", 400);
  }
}

export async function POST(request: NextRequest) {
  await simulateLatency();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body", 400);
  }

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "Please fix the highlighted fields",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;
  const result = createAppointment(parsed.data, idempotencyKey);

  if (!result.ok) {
    if (result.kind === "unknown-provider") {
      return fail("That provider does not exist", 422, {
        providerId: "Choose a valid provider",
      });
    }
    return fail("That provider is already booked at this time", 409);
  }

  // A simulated failure here happens *after* the write, so the appointment
  // exists even though the client sees a 500. Retrying is safe via the key.
  if (shouldSimulateFailure(request)) {
    return fail("We couldn't confirm your booking. Try submitting again.", 500);
  }

  return ok(result.appointment, "Appointment booked", 201);
}
