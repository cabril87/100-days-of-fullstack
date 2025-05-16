'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/hooks/useToast';
import { Family } from '@/lib/types/family';

interface FamilyContextType {
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await familyService.getCurrentFamily();
      if (response.error) {
        if (response.status === 404) {
          // If no current family is found, clear the state
          setCurrentFamily(null);
          setError('No family found for the current user');
        } else {
          setError(response.error);
          showToast(response.error, 'error');
        }
      } else if (response.data) {
        setCurrentFamily(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch family data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear family data when component unmounts
  useEffect(() => {
    return () => {
      setCurrentFamily(null);
      setError(null);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFamilyData();
  }, []);

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        setCurrentFamily,
        isLoading,
        error,
        refreshFamily: fetchFamilyData,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
} 