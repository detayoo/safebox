"use client";

import {
  debounce,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { STATUSES, type AppointmentStatus } from "@/lib/schemas/appointment";
import {
  SORT_FIELDS,
  SORT_ORDERS,
  type AppointmentListParams,
  type SortField,
  type SortOrder,
} from "@/lib/schemas/list-params";

const DEFAULT_PAGE_SIZE = 20;

const filterParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  status: parseAsArrayOf(parseAsStringLiteral(STATUSES)).withDefault([]),
  providerId: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  sortBy: parseAsStringLiteral(SORT_FIELDS).withDefault("startsAt"),
  sortOrder: parseAsStringLiteral(SORT_ORDERS).withDefault("desc"),
};

type Filters = {
  page: number;
  pageSize: number;
  status: AppointmentStatus[];
  providerId: string;
  from: string;
  to: string;
  sortBy: SortField;
  sortOrder: SortOrder;
};

/**
 * The URL is the single source of truth for the table. Filter, sort and page
 * changes push a history entry (so Back works); the search box replaces the
 * current entry and debounces, so typing never floods history.
 */
export function useAppointmentsParams() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "push",
  });

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      limitUrlUpdates: debounce(350),
    }),
  );

  const params: AppointmentListParams = {
    page: filters.page,
    pageSize: filters.pageSize,
    search: search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    providerId: filters.providerId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  function applyFilters(patch: Partial<Filters>) {
    void setFilters({ ...patch, page: 1 });
  }

  function setPage(page: number) {
    void setFilters({ page });
  }

  function setPageSize(pageSize: number) {
    void setFilters({ pageSize, page: 1 });
  }

  function toggleStatus(status: AppointmentStatus) {
    const next = filters.status.includes(status)
      ? filters.status.filter((value) => value !== status)
      : [...filters.status, status];
    applyFilters({ status: next });
  }

  function setProviderId(providerId: string) {
    applyFilters({ providerId });
  }

  function setDateRange(range: { from: string; to: string }) {
    applyFilters(range);
  }

  function setSort(sortBy: SortField, sortOrder: SortOrder) {
    applyFilters({ sortBy, sortOrder });
  }

  function updateSearch(value: string) {
    void setSearch(value);
    if (filters.page !== 1) void setFilters({ page: 1 });
  }

  function clearFilters() {
    void setSearch(null);
    void setFilters({
      page: 1,
      status: [],
      providerId: "",
      from: "",
      to: "",
      sortBy: "startsAt",
      sortOrder: "desc",
    });
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    filters.status.length > 0 ||
    filters.providerId !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  return {
    params,
    filters,
    search,
    updateSearch,
    setPage,
    setPageSize,
    toggleStatus,
    setProviderId,
    setDateRange,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}
