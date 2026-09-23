import { FAILURE_HEADER } from "@/lib/constants";
import type { ApiError, ApiSuccess } from "@/lib/schemas/envelope";
import { useFailureToggle } from "@/lib/stores/failure-toggle";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Unwraps the API envelope and throws on `success: false`, so TanStack Query
 * and mutation handlers deal in plain data and real errors.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (typeof window !== "undefined" && useFailureToggle.getState().enabled) {
    headers.set(FAILURE_HEADER, "1");
  }

  const response = await fetch(path, { ...init, headers });
  const payload = (await response
    .json()
    .catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !payload || payload.success === false) {
    const error = payload as ApiError | null;
    throw new ApiRequestError(
      error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      error?.errors,
    );
  }

  return payload.data;
}
