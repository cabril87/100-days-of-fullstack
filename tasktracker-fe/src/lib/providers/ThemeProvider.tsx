/*
 * Enhanced Theme Provider with Marketplace Support
 * Copyright (c) 2025 Carlos Abril Jr
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { 
  ThemeConfig, 
  DEFAULT_THEMES, 
  MARKETPLACE_THEMES, 
  getThemeById, 
  applyThemeColors,
  getAllThemes 
} from '@/lib/config/themes';

// ================================
// TYPES & INTERFACES
// ================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  // Basic theme controls
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
  
  // Custom theme controls
  customTheme: ThemeConfig | null;
  setCustomTheme: (theme: ThemeConfig | null) => void;
  
  // Available themes
  availableThemes: ThemeConfig[];
  defaultThemes: ThemeConfig[];
  marketplaceThemes: ThemeConfig[];
  
  // Owned themes (for marketplace)
  ownedThemes: string[];
  purchaseTheme: (themeId: string) => Promise<boolean>;
  
  // Utilities
  isThemeOwned: (themeId: string) => boolean;
  applyTheme: (themeId: string) => void;
  resetToDefault: () => void;
  
  // Settings
  saveThemePreference: boolean;
  setSaveThemePreference: (save: boolean) => void;
  
  // Modal state
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  
  // Loading state
  isLoading: boolean;
  
  // Authentication integration
  isAuthenticated: boolean;
}

// ================================
// CONTEXT CREATION
// ================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ================================
// COOKIE UTILITIES
// ================================

const COOKIE_NAMES = {
  CUSTOM_THEME: 'tasktracker-custom-theme',
  OWNED_THEMES: 'tasktracker-owned-themes',
  SAVE_PREFERENCE: 'tasktracker-save-theme-preference',
} as const;

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ================================
// PROVIDER COMPONENT
// ================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // State management
  const [customTheme, setCustomThemeState] = useState<ThemeConfig | null>(null);
  const [ownedThemes, setOwnedThemes] = useState<string[]>([]);
  const [saveThemePreference, setSaveThemePreferenceState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get all available themes
  const availableThemes = getAllThemes();
  const defaultThemes = Object.values(DEFAULT_THEMES);
  const marketplaceThemes = Object.values(MARKETPLACE_THEMES);
  
  // ================================
  // AUTHENTICATION INTEGRATION
  // ================================
  
  useEffect(() => {
    // Listen for auth changes - in a real app, this would use the AuthContext
    // For now, we'll check localStorage for authentication status
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      setIsAuthenticated(!!accessToken);
    };
    
    checkAuthStatus();
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // ================================
  // INITIALIZATION
  // ================================
  
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Load saved preferences
        const savedCustomTheme = getCookie(COOKIE_NAMES.CUSTOM_THEME);
        const savedOwnedThemes = getCookie(COOKIE_NAMES.OWNED_THEMES);
        const savedPreference = getCookie(COOKIE_NAMES.SAVE_PREFERENCE);
        
        // Parse owned themes
        if (savedOwnedThemes) {
          try {
            const owned = JSON.parse(savedOwnedThemes);
            setOwnedThemes(Array.isArray(owned) ? owned : []);
          } catch (e) {
            console.warn('Failed to parse owned themes:', e);
          }
        }
        
        // Parse custom theme
        if (savedCustomTheme) {
          try {
            const theme = JSON.parse(savedCustomTheme);
            if (theme && theme.id) {
              const foundTheme = getThemeById(theme.id);
              if (foundTheme) {
                setCustomThemeState(foundTheme);
              }
            }
          } catch (e) {
            console.warn('Failed to parse custom theme:', e);
          }
        }
        
        // Set save preference
        if (savedPreference !== null) {
          setSaveThemePreferenceState(savedPreference === 'true');
        }
        
        // Detect system theme
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setResolvedMode(mediaQuery.matches ? 'dark' : 'light');
          
          // Listen for changes
          const handleChange = (e: MediaQueryListEvent) => {
            setResolvedMode(e.matches ? 'dark' : 'light');
          };
          
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      } catch (error) {
        console.error('Theme initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeTheme();
  }, []);
  
  // ================================
  // MODAL MANAGEMENT
  // ================================
  
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  
  // ================================
  // THEME MANAGEMENT FUNCTIONS
  // ================================
  
  const setCustomTheme = useCallback((theme: ThemeConfig | null) => {
    setCustomThemeState(theme);
    
    if (saveThemePreference) {
      if (theme) {
        setCookie(COOKIE_NAMES.CUSTOM_THEME, JSON.stringify({ id: theme.id }));
      } else {
        deleteCookie(COOKIE_NAMES.CUSTOM_THEME);
      }
    }
    
    // Apply theme immediately
    if (theme) {
      applyThemeColors(theme, resolvedMode);
    }
  }, [saveThemePreference, resolvedMode]);
  
  const setSaveThemePreference = useCallback((save: boolean) => {
    setSaveThemePreferenceState(save);
    setCookie(COOKIE_NAMES.SAVE_PREFERENCE, save.toString());
    
    if (!save) {
      // Clear saved preferences
      deleteCookie(COOKIE_NAMES.CUSTOM_THEME);
      deleteCookie(COOKIE_NAMES.OWNED_THEMES);
    }
  }, []);
  
  const purchaseTheme = useCallback(async (themeId: string): Promise<boolean> => {
    try {
      // Check authentication for premium themes
      const theme = getThemeById(themeId);
      if (!theme) return false;
      
      if (theme.isPremium && !isAuthenticated) {
        console.warn('Authentication required for premium theme purchase');
        return false;
      }
      
      // Simulate marketplace purchase - replace with real implementation
      const newOwnedThemes = [...ownedThemes, themeId];
      setOwnedThemes(newOwnedThemes);
      
      if (saveThemePreference) {
        setCookie(COOKIE_NAMES.OWNED_THEMES, JSON.stringify(newOwnedThemes));
      }
      
      return true;
    } catch (error) {
      console.error('Theme purchase error:', error);
      return false;
    }
  }, [ownedThemes, saveThemePreference, isAuthenticated]);
  
  const isThemeOwned = useCallback((themeId: string): boolean => {
    const theme = getThemeById(themeId);
    if (!theme) return false;
    
    // Default themes are always owned
    if (!theme.isPremium) return true;
    
    // Premium themes require authentication and ownership
    if (!isAuthenticated) return false;
    
    // Check if user owns this premium theme
    return ownedThemes.includes(themeId);
  }, [ownedThemes, isAuthenticated]);
  
  const applyTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme && isThemeOwned(themeId)) {
      setCustomTheme(theme);
    } else if (theme && theme.isPremium && !isAuthenticated) {
      console.warn('Authentication required to apply premium theme');
    } else if (theme && !isThemeOwned(themeId)) {
      console.warn('Theme not owned:', themeId);
    }
  }, [setCustomTheme, isThemeOwned, isAuthenticated]);
  
  const resetToDefault = useCallback(() => {
    setCustomTheme(null);
  }, [setCustomTheme]);
  
  // ================================
  // THEME APPLICATION
  // ================================
  
  useEffect(() => {
    if (customTheme && !isLoading) {
      applyThemeColors(customTheme, resolvedMode);
    }
  }, [customTheme, resolvedMode, isLoading]);
  
  // ================================
  // CONTEXT VALUE
  // ================================
  
  const contextValue: ThemeContextType = {
    // Will be populated by NextThemesProvider's useTheme hook
    mode: 'system',
    setMode: () => {},
    resolvedMode,
    
    // Custom theme management
    customTheme,
    setCustomTheme,
    
    // Available themes
    availableThemes,
    defaultThemes,
    marketplaceThemes,
    
    // Owned themes
    ownedThemes,
    purchaseTheme,
    
    // Utilities
    isThemeOwned,
    applyTheme,
    resetToDefault,
    
    // Settings
    saveThemePreference,
    setSaveThemePreference,
    
    // Modal state
    isModalOpen,
    openModal,
    closeModal,
    
    // Loading
    isLoading,
    
    // Authentication
    isAuthenticated,
  };
  
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
    >
      <ThemeContext.Provider value={contextValue}>
        <ThemeWrapper>{children}</ThemeWrapper>
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

// ================================
// THEME WRAPPER
// ================================

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const context = useContext(ThemeContext);
  
  if (!context) return <>{children}</>;
  
  // Update context with next-themes values
  const updatedContext: ThemeContextType = {
    ...context,
    mode: theme as ThemeMode,
    setMode: setTheme,
    resolvedMode: (resolvedTheme as 'light' | 'dark') || 'light',
  };
  
  return (
    <ThemeContext.Provider value={updatedContext}>
      {children}
    </ThemeContext.Provider>
  );
}

// ================================
// HOOK
// ================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ================================
// UTILITIES
// ================================

export const getStoredThemePreference = (): string | null => {
  return getCookie(COOKIE_NAMES.CUSTOM_THEME);
};

export const getStoredOwnedThemes = (): string[] => {
  const stored = getCookie(COOKIE_NAMES.OWNED_THEMES);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const clearThemeStorage = (): void => {
  deleteCookie(COOKIE_NAMES.CUSTOM_THEME);
  deleteCookie(COOKIE_NAMES.OWNED_THEMES);
  deleteCookie(COOKIE_NAMES.SAVE_PREFERENCE);
}; 