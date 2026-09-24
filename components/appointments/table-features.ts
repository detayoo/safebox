import { rowPaginationFeature, tableFeatures } from "@tanstack/react-table";

/**
 * Only the feature this table uses. Paging is done by the server, and sorting
 * is just a URL parameter, so neither needs a client-side row model.
 */
export const appointmentTableFeatures = tableFeatures({
  rowPaginationFeature,
});
