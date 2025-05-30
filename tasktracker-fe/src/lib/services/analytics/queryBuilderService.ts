/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiClient } from '@/lib/services/apiClient';

export interface QueryField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  category: string;
  operators: QueryOperator[];
  enumValues?: { value: string; label: string }[];
}

export interface QueryOperator {
  value: string;
  label: string;
  requiresValue: boolean;
  valueType?: 'single' | 'multiple' | 'range';
}

export interface QueryCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface QuerySchema {
  availableFields: QueryField[];
  defaultFilters: QueryCondition[];
  maxConditions: number;
  supportedGrouping: boolean;
}

export interface QueryRequest {
  conditions: QueryCondition[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  data: any[];
  totalCount: number;
  executionTime: number;
  queryId: string;
}

export interface QueryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Service for query builder operations
 */
export class QueryBuilderService {
  private readonly baseUrl = '/api/v1/query-builder';

  /**
   * Get query schema with available fields and operators
   */
  async getQuerySchema(): Promise<QuerySchema> {
    const response = await apiClient.get<QuerySchema>(`${this.baseUrl}/schema`);
    if (!response.data) {
      throw new Error('Failed to fetch query schema');
    }
    return response.data;
  }

  /**
   * Execute a custom query
   */
  async executeQuery(query: QueryRequest): Promise<QueryResult> {
    const response = await apiClient.post<QueryResult>(
      `${this.baseUrl}/execute`,
      query
    );
    if (!response.data) {
      throw new Error('Failed to execute query');
    }
    return response.data;
  }

  /**
   * Validate a query before execution
   */
  async validateQuery(query: QueryRequest): Promise<QueryValidationResult> {
    const response = await apiClient.post<QueryValidationResult>(
      `${this.baseUrl}/validate`,
      query
    );
    if (!response.data) {
      throw new Error('Failed to validate query');
    }
    return response.data;
  }

  /**
   * Get predefined query templates
   */
  async getQueryTemplates(): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/templates`);
    return response.data || [];
  }

  /**
   * Save a custom query as template
   */
  async saveQueryTemplate(name: string, query: QueryRequest, description?: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/templates`, {
      name,
      query,
      description
    });
    return response.data;
  }

  /**
   * Get query execution history
   */
  async getQueryHistory(limit = 50): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/history?limit=${limit}`);
    return response.data || [];
  }

  /**
   * Export query results
   */
  async exportQueryResults(
    queryId: string,
    format: 'json' | 'csv' | 'excel'
  ): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseUrl}/export/${queryId}?format=${format}`,
      { /* responseType: 'blob' */ } // Note: responseType removed as not supported by apiClient
    );
    return response.data;
  }

  /**
   * Get available fields for a specific entity type
   */
  async getFieldsForEntity(entityType: string): Promise<QueryField[]> {
    const response = await apiClient.get<QueryField[]>(
      `${this.baseUrl}/fields/${entityType}`
    );
    if (!response.data) {
      throw new Error('Failed to fetch entity fields');
    }
    return response.data;
  }

  /**
   * Build query from natural language
   */
  async buildQueryFromText(naturalLanguageQuery: string): Promise<QueryRequest> {
    const response = await apiClient.post<QueryRequest>(
      `${this.baseUrl}/build-from-text`,
      { query: naturalLanguageQuery }
    );
    if (!response.data) {
      throw new Error('Failed to build query from text');
    }
    return response.data;
  }

  /**
   * Get query suggestions based on current conditions
   */
  async getQuerySuggestions(currentQuery: QueryRequest): Promise<QueryCondition[]> {
    const response = await apiClient.post<QueryCondition[]>(
      `${this.baseUrl}/suggestions`,
      currentQuery
    );
    if (!response.data) {
      throw new Error('Failed to get query suggestions');
    }
    return response.data;
  }
}

// Create and export singleton instance
export const queryBuilderService = new QueryBuilderService(); 