/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

export interface CacheEntry<T> {
  data: Promise<T>;
  timestamp: number;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface ApiErrorDetails {
  url?: string;
  statusCode?: number;
  status?: number;
  message?: string;
}

export interface HttpErrorDetails {
  statusCode?: number;
  status?: number;
  message?: string;
  url?: string;
}

export interface ValidationErrorDetails {
  message?: string;
  statusCode?: number;
  status?: number;
}

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} 