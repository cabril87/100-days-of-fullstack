import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFormPersistenceOptions {
  key: string;
  debounceMs?: number;
  encryption?: boolean;
  version?: string;
}

interface PersistedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

export const useFormPersistence = <T extends Record<string, unknown>>(
  initialData: T,
  options: UseFormPersistenceOptions
) => {
  const {
    key,
    debounceMs = 1000,
    encryption = false,
    version = '1.0'
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const storageKey = `form_${key}`;

  // Simple encryption/decryption (in production, use proper encryption)
  const encrypt = useCallback((text: string): string => {
    if (!encryption) return text;
    return btoa(text); // Basic base64 encoding
  }, [encryption]);

  const decrypt = useCallback((text: string): string => {
    if (!encryption) return text;
    try {
      return atob(text); // Basic base64 decoding
    } catch {
      return text; // Fallback if decryption fails
    }
  }, [encryption]);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const decrypted = decrypt(stored);
        const parsed: PersistedData<T> = JSON.parse(decrypted);
        
        // Check version compatibility
        if (parsed.version === version) {
          setData({ ...initialData, ...parsed.data });
          setLastSaved(new Date(parsed.timestamp));
        } else {
          // Version mismatch, clear old data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      setError(`Failed to load saved form data: ${error}`);
      localStorage.removeItem(storageKey); // Clear corrupted data
    }
  }, [storageKey, version, encryption, initialData, decrypt]);

  // Save data to localStorage
  const saveData = useCallback(async (dataToSave: T) => {
    try {
      setIsSaving(true);
      setError(null);

      const persistedData: PersistedData<T> = {
        data: dataToSave,
        timestamp: Date.now(),
        version
      };

      const serialized = JSON.stringify(persistedData);
      const encrypted = encrypt(serialized);
      
      localStorage.setItem(storageKey, encrypted);
      setLastSaved(new Date());
    } catch (error) {
      setError('Failed to save form data');
      console.error('Form persistence error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, version, encrypt]);

  // Update data with debounced auto-save
  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setData(prevData => {
      const newData = typeof updates === 'function' 
        ? updates(prevData)
        : { ...prevData, ...updates };

      // Debounced save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        saveData(newData);
      }, debounceMs);

      return newData;
    });
  }, [saveData, debounceMs]);

  // Manual save (immediate)
  const saveNow = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    saveData(data);
  }, [saveData, data]);

  // Clear persisted data
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setError(null);
    } catch {
      setError('Failed to clear saved data');
    }
  }, [storageKey]);

  // Reset to initial data
  const reset = useCallback(() => {
    setData(initialData);
    clearSaved();
  }, [initialData, clearSaved]);

  // Get specific field value
  const getField = useCallback(<K extends keyof T>(field: K): T[K] => {
    return data[field];
  }, [data]);

  // Update specific field
  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    updateData(prev => ({ ...prev, [field]: value }));
  }, [updateData]);

  // Check if data has been modified since last save
  const isDirty = useCallback(() => {
    if (!lastSaved) return true;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return true;
      
      const decrypted = decrypt(stored);
      const parsed: PersistedData<T> = JSON.parse(decrypted);
      
      return JSON.stringify(data) !== JSON.stringify(parsed.data);
    } catch {
      return true;
    }
  }, [data, lastSaved, storageKey, decrypt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    data,
    updateData,
    saveNow,
    clearSaved,
    reset,
    getField,
    setField,
    lastSaved,
    isSaving,
    error,
    isDirty: isDirty(),
    
    // Convenience methods
    hasUnsavedChanges: isDirty(),
    isAutoSaveEnabled: debounceMs > 0,
    
    // Form integration helpers
    register: <K extends keyof T>(field: K) => ({
      value: data[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setField(field, e.target.value as T[K]);
      }
    }),
    
    // For checkbox inputs
    registerCheckbox: <K extends keyof T>(field: K) => ({
      checked: Boolean(data[field]),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setField(field, e.target.checked as T[K]);
      }
    })
  };
};

export default useFormPersistence; 