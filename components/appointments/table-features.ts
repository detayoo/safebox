import {
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * Only the features this table actually uses. Sorting and pagination are done
 * by the server, so no client-side row models are registered.
 */
export const appointmentTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
});
