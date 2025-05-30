/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiRequest } from '../apiClient';
import type {
  SavedFilter,
  FilterCriteria,
  QueryBuilder
} from '../../types/analytics';

/**
 * Service for saved filters operations
 */
export class SavedFiltersService {
  private readonly baseUrl = '/api/v1/saved-filters';

  /**
   * Get all saved filters for the current user
   */
  async getUserFilters(): Promise<SavedFilter[]> {
    const response = await apiRequest<SavedFilter[]>(
      this.baseUrl,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get a specific saved filter by ID
   */
  async getFilterById(id: number): Promise<SavedFilter> {
    const response = await apiRequest<SavedFilter>(
      `${this.baseUrl}/${id}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Save a new filter
   */
  async saveFilter(filter: CreateSavedFilterRequest): Promise<SavedFilter> {
    const response = await apiRequest<SavedFilter>(
      this.baseUrl,
      'POST',
      filter,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Update an existing saved filter
   */
  async updateFilter(id: number, filter: UpdateSavedFilterRequest): Promise<SavedFilter> {
    const response = await apiRequest<SavedFilter>(
      `${this.baseUrl}/${id}`,
      'PUT',
      filter,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Delete a saved filter
   */
  async deleteFilter(id: number): Promise<void> {
    const response = await apiRequest(
      `${this.baseUrl}/${id}`,
      'DELETE',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Apply a saved filter to get filtered results
   */
  async applyFilter(id: number, dataType?: string): Promise<any> {
    const body = dataType ? { dataType } : {};
    
    const response = await apiRequest(
      `${this.baseUrl}/${id}/apply`,
      'POST',
      body,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get public filters available to the user
   */
  async getPublicFilters(): Promise<SavedFilter[]> {
    const response = await apiRequest<SavedFilter[]>(
      `${this.baseUrl}/public`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Duplicate an existing filter
   */
  async duplicateFilter(id: number, newName?: string): Promise<SavedFilter> {
    const body = newName ? { name: newName } : {};
    
    const response = await apiRequest<SavedFilter>(
      `${this.baseUrl}/${id}/duplicate`,
      'POST',
      body,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Share a filter (make it public)
   */
  async shareFilter(id: number): Promise<SavedFilter> {
    const response = await apiRequest<SavedFilter>(
      `${this.baseUrl}/${id}/share`,
      'POST',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Unshare a filter (make it private)
   */
  async unshareFilter(id: number): Promise<SavedFilter> {
    const response = await apiRequest<SavedFilter>(
      `${this.baseUrl}/${id}/unshare`,
      'POST',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get filter history/usage statistics
   */
  async getFilterHistory(id: number): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/${id}/history`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Search filters by name or criteria
   */
  async searchFilters(query: string): Promise<SavedFilter[]> {
    const response = await apiRequest<SavedFilter[]>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get filter suggestions based on current context
   */
  async getFilterSuggestions(context?: any): Promise<SavedFilter[]> {
    const response = await apiRequest<SavedFilter[]>(
      `${this.baseUrl}/suggestions`,
      'POST',
      context || {},
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Validate filter criteria
   */
  validateFilter(criteria: FilterCriteria): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate date range
    if (criteria.dateRange) {
      const startDate = new Date(criteria.dateRange.startDate);
      const endDate = new Date(criteria.dateRange.endDate);
      
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date');
      }
      
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date');
      }
      
      if (startDate > endDate) {
        errors.push('Start date must be before end date');
      }
    }

    // Validate arrays are not empty if provided
    if (criteria.status && criteria.status.length === 0) {
      errors.push('Status filter cannot be empty');
    }
    
    if (criteria.priority && criteria.priority.length === 0) {
      errors.push('Priority filter cannot be empty');
    }
    
    if (criteria.categories && criteria.categories.length === 0) {
      errors.push('Categories filter cannot be empty');
    }
    
    if (criteria.assignedTo && criteria.assignedTo.length === 0) {
      errors.push('Assigned to filter cannot be empty');
    }
    
    if (criteria.tags && criteria.tags.length === 0) {
      errors.push('Tags filter cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Build filter criteria from form data
   */
  buildFilterCriteria(formData: any): FilterCriteria {
    const criteria: FilterCriteria = {};

    if (formData.startDate && formData.endDate) {
      criteria.dateRange = {
        startDate: formData.startDate,
        endDate: formData.endDate
      };
    }

    if (formData.status && formData.status.length > 0) {
      criteria.status = formData.status;
    }

    if (formData.priority && formData.priority.length > 0) {
      criteria.priority = formData.priority;
    }

    if (formData.categories && formData.categories.length > 0) {
      criteria.categories = formData.categories;
    }

    if (formData.assignedTo && formData.assignedTo.length > 0) {
      criteria.assignedTo = formData.assignedTo;
    }

    if (formData.tags && formData.tags.length > 0) {
      criteria.tags = formData.tags;
    }

    return criteria;
  }

  /**
   * Convert filter criteria to query string
   */
  filterCriteriaToQueryString(criteria: FilterCriteria): string {
    const params = new URLSearchParams();

    if (criteria.dateRange) {
      params.append('startDate', criteria.dateRange.startDate);
      params.append('endDate', criteria.dateRange.endDate);
    }

    if (criteria.status) {
      criteria.status.forEach(status => params.append('status', status));
    }

    if (criteria.priority) {
      criteria.priority.forEach(priority => params.append('priority', priority.toString()));
    }

    if (criteria.categories) {
      criteria.categories.forEach(category => params.append('categories', category));
    }

    if (criteria.assignedTo) {
      criteria.assignedTo.forEach(userId => params.append('assignedTo', userId.toString()));
    }

    if (criteria.tags) {
      criteria.tags.forEach(tag => params.append('tags', tag));
    }

    return params.toString();
  }
}

// Request types
export interface CreateSavedFilterRequest {
  name: string;
  filterCriteria: FilterCriteria;
  queryType: string;
  isPublic?: boolean;
}

export interface UpdateSavedFilterRequest {
  name?: string;
  filterCriteria?: FilterCriteria;
  queryType?: string;
  isPublic?: boolean;
}

// Create and export singleton instance
export const savedFiltersService = new SavedFiltersService(); 