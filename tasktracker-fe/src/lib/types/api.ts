export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status?: number;
  details?: Record<string, unknown>; 
  headers?: Headers;
  cached?: boolean;
  originalError?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: string;
  path: string;
} 