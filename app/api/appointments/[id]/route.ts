import type { NextRequest } from "next/server";
import { updateAppointmentSchema } from "@/lib/schemas/appointment";
import {
  getAppointment,
  updateAppointment,
} from "@/lib/server/appointments";
import {
  fail,
  ok,
  shouldSimulateFailure,
  simulateLatency,
  zodFieldErrors,
} from "@/lib/server/http";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">,
) {
  await simulateLatency();

  if (shouldSimulateFailure(request)) {
    return fail("Couldn't load this appointment", 500);
  }

  const { id } = await ctx.params;
  const appointment = getAppointment(id);

  if (!appointment) {
    return fail("Appointment not found", 404);
  }

  return ok(appointment);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">,
) {
  await simulateLatency();

  const { id } = await ctx.params;
  const existing = getAppointment(id);
  if (!existing) {
    return fail("Appointment not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body", 400);
  }

  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "Please fix the highlighted fields",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const result = updateAppointment(id, parsed.data);

  if (!result.ok) {
    if (result.kind === "not-found") {
      return fail("Appointment not found", 404);
    }
    return fail(
      `This appointment is ${result.from} and can't be moved to ${parsed.data.status}`,
      409,
    );
  }

  // As with booking, a simulated failure after the write leaves the change
  // saved while the client sees an error.
  if (shouldSimulateFailure(request)) {
    return fail("We couldn't confirm that update. Try again.", 500);
  }

  return ok(result.appointment, "Appointment updated");
}
