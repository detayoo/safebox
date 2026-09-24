import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";

const providerKeys = {
  all: ["providers"] as const,
};

export function providersQueryOptions() {
  return queryOptions({
    queryKey: providerKeys.all,
    queryFn: api.providers,
    // The provider list is effectively static for a session.
    staleTime: 5 * 60_000,
  });
}
