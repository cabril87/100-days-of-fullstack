'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoSaveDraftOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
}

interface DraftData {
  data: any;
  timestamp: number;
  version: string;
}

export function useAutoSaveDraft<T extends Record<string, any>>(
  initialData: T,
  options: AutoSaveDraftOptions
) {
  const { key, debounceMs = 1000, enabled = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  // Generate storage key
  const storageKey = `draft_${key}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const draftData: DraftData = JSON.parse(stored);
        
        // Check if draft is not too old (24 hours)
        const isExpired = Date.now() - draftData.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired && draftData.data) {
          setData({ ...initialData, ...draftData.data });
          setHasDraft(true);
          setLastSaved(new Date(draftData.timestamp));
        } else if (isExpired) {
          // Clean up expired draft
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
      localStorage.removeItem(storageKey);
    } finally {
      setIsDraftLoaded(true);
      isInitialLoad.current = false;
    }
  }, [storageKey, enabled]);

  // Auto-save to localStorage with debouncing
  const saveDraft = useCallback(() => {
    if (!enabled || isInitialLoad.current) return;

    try {
      const draftData: DraftData = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setLastSaved(new Date());
      setHasDraft(true);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [data, storageKey, enabled]);

  // Debounced save effect
  useEffect(() => {
    if (!enabled || isInitialLoad.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveDraft, debounceMs, enabled]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey]);

  // Update data
  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  }, []);

  // Reset to initial data
  const resetData = useCallback(() => {
    setData(initialData);
    clearDraft();
  }, [initialData, clearDraft]);

  // Check if current data differs from initial
  const hasChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // Get draft age in minutes
  const getDraftAge = useCallback(() => {
    if (!lastSaved) return null;
    return Math.floor((Date.now() - lastSaved.getTime()) / (1000 * 60));
  }, [lastSaved]);

  // Force save immediately
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  return {
    data,
    updateData,
    resetData,
    clearDraft,
    forceSave,
    isDraftLoaded,
    hasDraft,
    hasChanges: hasChanges(),
    lastSaved,
    draftAge: getDraftAge(),
    isAutoSaving: !!timeoutRef.current
  };
} 