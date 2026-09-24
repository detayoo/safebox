"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTable } from "@tanstack/react-table";
import type {
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { AppointmentsPagination } from "@/components/appointments/appointments-pagination";
import { AppointmentsToolbar } from "@/components/appointments/appointments-toolbar";
import { createAppointmentColumns } from "@/components/appointments/appointment-columns";
import { appointmentTableFeatures } from "@/components/appointments/table-features";
import { useAppointmentsParams } from "@/components/appointments/use-appointments-params";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentsListOptions } from "@/lib/queries/appointments";
import { providersQueryOptions } from "@/lib/queries/providers";
import type { Appointment, Provider } from "@/lib/schemas/appointment";

const EMPTY_ROWS: Appointment[] = [];
const EMPTY_PROVIDERS: Provider[] = [];

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="size-3.5" />;
  return <ChevronsUpDown className="size-3.5 opacity-40" />;
}

export function AppointmentsTable() {
  const router = useRouter();
  const controller = useAppointmentsParams();
  const { params, filters } = controller;

  const appointmentsQuery = useQuery(appointmentsListOptions(params));
  const providersQuery = useQuery(providersQueryOptions());

  const providerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const provider of providersQuery.data ?? EMPTY_PROVIDERS) {
      map.set(provider.id, provider.name);
    }
    return map;
  }, [providersQuery.data]);

  const columns = useMemo(
    () => createAppointmentColumns(providerNameById),
    [providerNameById],
  );

  const rows = appointmentsQuery.data?.content ?? EMPTY_ROWS;
  const page = appointmentsQuery.data?.pagination;

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: params.sortBy === "patient" ? "patient" : "startsAt",
        desc: params.sortOrder === "desc",
      },
    ],
    [params.sortBy, params.sortOrder],
  );

  const paginationState = useMemo<PaginationState>(
    () => ({ pageIndex: params.page - 1, pageSize: params.pageSize }),
    [params.page, params.pageSize],
  );

  const handleSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];
    if (!first) return;
    controller.setSort(
      first.id === "patient" ? "patient" : "startsAt",
      first.desc ? "desc" : "asc",
    );
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const next =
      typeof updater === "function" ? updater(paginationState) : updater;
    if (next.pageSize !== paginationState.pageSize) {
      controller.setPageSize(next.pageSize);
    } else if (next.pageIndex !== paginationState.pageIndex) {
      controller.setPage(next.pageIndex + 1);
    }
  };

  const table = useTable({
    features: appointmentTableFeatures,
    columns,
    data: rows,
    rowCount: page?.total ?? 0,
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => row.id,
    state: { sorting, pagination: paginationState },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
  });

  const isInitialLoading = appointmentsQuery.isPending;
  const isRefetching =
    appointmentsQuery.isFetching && !appointmentsQuery.isPending;
  const showInitialError =
    appointmentsQuery.isError && appointmentsQuery.data === undefined;

  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <AppointmentsToolbar
        search={controller.search}
        onSearchChange={controller.updateSearch}
        status={filters.status}
        onToggleStatus={controller.toggleStatus}
        providers={providersQuery.data ?? EMPTY_PROVIDERS}
        providerId={filters.providerId}
        onProviderChange={controller.setProviderId}
        from={filters.from}
        to={filters.to}
        onDateRangeChange={controller.setDateRange}
        hasActiveFilters={controller.hasActiveFilters}
        onClear={controller.clearFilters}
        isFetching={isRefetching}
        total={page?.total ?? 0}
      />

      <div className="border-t">
        {showInitialError ? (
          <ErrorState
            title="Couldn't load appointments"
            description={appointmentsQuery.error.message}
            onRetry={() => {
              void appointmentsQuery.refetch();
            }}
          />
        ) : isInitialLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No appointments match"
            description="Try a different search term or clear the filters."
            action={
              controller.hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={controller.clearFilters}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {appointmentsQuery.isError ? (
              <div className="bg-destructive/5 text-destructive flex items-center justify-between gap-3 px-4 py-2 text-xs">
                <span>That update failed to load. Showing the last results.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void appointmentsQuery.refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {/* Horizontal scroll on small screens, with the patient column pinned. */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={
                            header.column.id === "patient"
                              ? "bg-background sticky left-0 z-10"
                              : undefined
                          }
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="hover:text-foreground inline-flex items-center gap-1.5"
                            >
                              <table.FlexRender header={header} />
                              <SortIndicator
                                sorted={header.column.getIsSorted()}
                              />
                            </button>
                          ) : (
                            <table.FlexRender header={header} />
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="group cursor-pointer"
                      onClick={() =>
                        router.push(`/appointments/${row.original.id}`)
                      }
                    >
                      {row.getAllCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "patient"
                              ? "bg-background group-hover:bg-muted sticky left-0 z-10"
                              : undefined
                          }
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <AppointmentsPagination
        page={params.page}
        pageSize={params.pageSize}
        total={page?.total ?? 0}
        totalPages={page?.totalPages ?? 1}
        onPageChange={controller.setPage}
        onPageSizeChange={controller.setPageSize}
      />
    </div>
  );
}
