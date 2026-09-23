/** The single response shape every route handler returns. */
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  content: T[];
  pagination: Pagination;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  /** Field-path keyed messages, e.g. `{ "patient.email": "..." }`. */
  errors?: Record<string, string>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
