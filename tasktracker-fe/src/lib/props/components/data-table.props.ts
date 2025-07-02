/*
 * Data Table Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All data table component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { ReactNode } from 'react';

// ================================
// DATA TABLE PROPS
// ================================

export interface DataTableProps<T = unknown> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: unknown, row: T) => ReactNode;
  }>;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy?: keyof T;
    sortOrder?: 'asc' | 'desc';
    onSort: (key: keyof T, order: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, unknown>;
    onFilterChange: (filters: Record<string, unknown>) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
    bulkActions?: Array<{ label: string; onClick: (selectedRows: string[]) => void }>;
  };
  className?: string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
}

// ================================
// TABLE COLUMN PROPS
// ================================

export interface TableColumnProps<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => ReactNode;
  headerRender?: () => ReactNode;
  className?: string;
  headerClassName?: string;
}

// ================================
// TABLE PAGINATION PROPS
// ================================

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  showPageInfo?: boolean;
  className?: string;
}

// ================================
// TABLE SORTING PROPS
// ================================

export interface TableSortingProps<T> {
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort: (key: keyof T, order: 'asc' | 'desc') => void;
  sortableColumns?: (keyof T)[];
}

// ================================
// TABLE FILTERING PROPS
// ================================

export interface TableFilteringProps {
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
  filterableColumns?: string[];
  showFilterRow?: boolean;
  showFilterBar?: boolean;
}

// ================================
// TABLE SELECTION PROPS
// ================================

export interface TableSelectionProps {
  selectedRows: string[];
  onSelectionChange: (selectedRows: string[]) => void;
  selectableRows?: boolean;
  selectAllRows?: boolean;
  onSelectAll?: (selected: boolean) => void;
  bulkActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: (selectedRows: string[]) => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

// ================================
// TABLE STATE PROPS
// ================================

export interface TableStateProps {
  isLoading?: boolean;
  error?: string | null;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  errorState?: ReactNode;
  onRetry?: () => void;
  onRefresh?: () => void;
} 