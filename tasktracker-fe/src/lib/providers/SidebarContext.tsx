'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import { useAuth } from './AuthContext';

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
  // const { user, isLoading } = useAuth();
  // Start with true for better UX - sidebar will be open by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize sidebar state - simplified without auth dependency
  useEffect(() => {
    // Check localStorage for saved state
    const savedState = localStorage.getItem('tasktracker-sidebar-open');
    if (savedState !== null) {
      const parsedState = JSON.parse(savedState);
      setIsSidebarOpen(parsedState);
    } else {
      // Default to open
      setIsSidebarOpen(true);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasktracker-sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const setSidebarOpen = useCallback((isOpen: boolean) => {
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