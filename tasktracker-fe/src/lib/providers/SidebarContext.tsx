'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { user, isLoading } = useAuth();
  // Start with true for better UX - sidebar will be open by default for authenticated users
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize sidebar state based on authentication
  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (user) {
      // User is authenticated - check localStorage or default to open
      const savedState = localStorage.getItem('tasktracker-sidebar-open');
      if (savedState !== null) {
        const parsedState = JSON.parse(savedState);
        console.log('🔧 SidebarContext: Loading saved state for authenticated user:', parsedState);
        // No delay - set immediately for better UX
        setIsSidebarOpen(parsedState);
      } else {
        // First time authenticated user - default to open (already set in useState)
        console.log('🔧 SidebarContext: First time user - defaulting to open');
        setIsSidebarOpen(true);
      }
    } else {
      // User is not authenticated - close sidebar immediately
      console.log('🔧 SidebarContext: User not authenticated - closing sidebar');
      setIsSidebarOpen(false);
    }
  }, [user, isLoading]);

  // Save sidebar state to localStorage whenever it changes (only for authenticated users)
  useEffect(() => {
    if (user && !isLoading) {
      console.log('🔧 SidebarContext: Saving sidebar state:', isSidebarOpen);
      localStorage.setItem('tasktracker-sidebar-open', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, user, isLoading]);

  const toggleSidebar = useCallback(() => {
    console.log('🔄 SidebarContext: toggleSidebar called');
    console.log('📊 Current sidebar state:', isSidebarOpen);
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    console.log('📊 New sidebar state:', newState);
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    console.log('🚫 SidebarContext: closeSidebar called');
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    console.log('✅ SidebarContext: openSidebar called');
    setIsSidebarOpen(true);
  }, []);

  const setSidebarOpen = useCallback((isOpen: boolean) => {
    console.log('📝 SidebarContext: setSidebarOpen called with:', isOpen);
    setIsSidebarOpen(isOpen);
  }, []);

  const value = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setSidebarOpen,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 