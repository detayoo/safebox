import { fail, ok, shouldSimulateFailure, simulateLatency } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";

export async function GET(request: Request) {
  await simulateLatency();

  if (shouldSimulateFailure(request)) {
    return fail("Couldn't load providers", 500);
  }

  return ok(getStore().providers);
}
