/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { SavedFilter, FilterCriteria } from '@/lib/types/analytics';
import { savedFiltersService } from '@/lib/services/analytics';

interface UseSavedFiltersProps {
  autoLoad?: boolean;
}

interface UseSavedFiltersReturn {
  // Filters
  savedFilters: SavedFilter[];
  activeFilter: SavedFilter | null;
  currentCriteria: FilterCriteria;
  
  // Actions
  saveFilter: (name: string, criteria: FilterCriteria, isPublic?: boolean) => Promise<void>;
  loadFilter: (filterId: number) => Promise<void>;
  deleteFilter: (filterId: number) => Promise<void>;
  updateFilter: (filterId: number, updates: Partial<SavedFilter>) => Promise<void>;
  duplicateFilter: (filterId: number, newName: string) => Promise<void>;
  
  // Criteria management
  setCriteria: (criteria: FilterCriteria) => void;
  clearCriteria: () => void;
  applyCriteria: (criteria: FilterCriteria) => void;
  
  // Quick filters
  applyQuickFilter: (filterType: 'today' | 'week' | 'month' | 'overdue' | 'priority') => void;
  
  // Validation
  validateCriteria: (criteria: FilterCriteria) => string[];
  
  // State
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;
}

export function useSavedFilters({
  autoLoad = true
}: UseSavedFiltersProps = {}): UseSavedFiltersReturn {
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<SavedFilter | null>(null);
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved filters
  const loadSavedFilters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = await savedFiltersService.getSavedFilters();
      setSavedFilters(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load saved filters';
      setError(errorMessage);
      console.error('Load saved filters error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadSavedFilters();
    }
  }, [autoLoad, loadSavedFilters]);

  // Save filter
  const saveFilter = useCallback(async (
    name: string,
    criteria: FilterCriteria,
    isPublic = false
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const savedFilter = await savedFiltersService.createSavedFilter({
        name,
        filterCriteria: criteria,
        queryType: 'analytics',
        isPublic
      });

      setSavedFilters(prev => [...prev, savedFilter]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save filter';
      setError(errorMessage);
      console.error('Save filter error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load filter
  const loadFilter = useCallback(async (filterId: number) => {
    setIsApplying(true);
    setError(null);

    try {
      const filter = savedFilters.find(f => f.id === filterId);
      if (!filter) {
        throw new Error('Filter not found');
      }

      setActiveFilter(filter);
      setCurrentCriteria(filter.filterCriteria);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load filter';
      setError(errorMessage);
      console.error('Load filter error:', err);
    } finally {
      setIsApplying(false);
    }
  }, [savedFilters]);

  // Delete filter
  const deleteFilter = useCallback(async (filterId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await savedFiltersService.deleteSavedFilter(filterId);
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
      
      if (activeFilter?.id === filterId) {
        setActiveFilter(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete filter';
      setError(errorMessage);
      console.error('Delete filter error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  // Update filter
  const updateFilter = useCallback(async (
    filterId: number,
    updates: Partial<SavedFilter>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedFilter = await savedFiltersService.updateSavedFilter(filterId, updates);
      setSavedFilters(prev => prev.map(f => f.id === filterId ? updatedFilter : f));
      
      if (activeFilter?.id === filterId) {
        setActiveFilter(updatedFilter);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update filter';
      setError(errorMessage);
      console.error('Update filter error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  // Duplicate filter
  const duplicateFilter = useCallback(async (filterId: number, newName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const originalFilter = savedFilters.find(f => f.id === filterId);
      if (!originalFilter) {
        throw new Error('Filter not found');
      }

      const duplicatedFilter = await savedFiltersService.createSavedFilter({
        name: newName,
        filterCriteria: originalFilter.filterCriteria,
        queryType: originalFilter.queryType,
        isPublic: false
      });

      setSavedFilters(prev => [...prev, duplicatedFilter]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate filter';
      setError(errorMessage);
      console.error('Duplicate filter error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [savedFilters]);

  // Set criteria
  const setCriteria = useCallback((criteria: FilterCriteria) => {
    setCurrentCriteria(criteria);
    setActiveFilter(null); // Clear active filter when manually setting criteria
  }, []);

  // Clear criteria
  const clearCriteria = useCallback(() => {
    setCurrentCriteria({});
    setActiveFilter(null);
  }, []);

  // Apply criteria
  const applyCriteria = useCallback((criteria: FilterCriteria) => {
    setIsApplying(true);
    setCurrentCriteria(criteria);
    setActiveFilter(null);
    
    // Simulate application delay
    setTimeout(() => {
      setIsApplying(false);
    }, 500);
  }, []);

  // Apply quick filter
  const applyQuickFilter = useCallback((filterType: 'today' | 'week' | 'month' | 'overdue' | 'priority') => {
    const now = new Date();
    let criteria: FilterCriteria = {};

    switch (filterType) {
      case 'today':
        criteria = {
          dateRange: {
            startDate: now.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0]
          }
        };
        break;

      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(now.setDate(weekStart.getDate() + 6));
        criteria = {
          dateRange: {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0]
          }
        };
        break;

      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        criteria = {
          dateRange: {
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0]
          }
        };
        break;

      case 'overdue':
        criteria = {
          dateRange: {
            startDate: '2020-01-01',
            endDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday
          },
          status: ['pending', 'in-progress']
        };
        break;

      case 'priority':
        criteria = {
          priority: [4, 5] // High and urgent priority
        };
        break;
    }

    applyCriteria(criteria);
  }, [applyCriteria]);

  // Validate criteria
  const validateCriteria = useCallback((criteria: FilterCriteria): string[] => {
    const errors: string[] = [];

    if (criteria.dateRange) {
      const { startDate, endDate } = criteria.dateRange;
      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          errors.push('Start date must be before end date');
        }
      }
    }

    if (criteria.priority && criteria.priority.some(p => p < 1 || p > 5)) {
      errors.push('Priority must be between 1 and 5');
    }

    return errors;
  }, []);

  return {
    savedFilters,
    activeFilter,
    currentCriteria,
    saveFilter,
    loadFilter,
    deleteFilter,
    updateFilter,
    duplicateFilter,
    setCriteria,
    clearCriteria,
    applyCriteria,
    applyQuickFilter,
    validateCriteria,
    isLoading,
    isApplying,
    error
  };
} 