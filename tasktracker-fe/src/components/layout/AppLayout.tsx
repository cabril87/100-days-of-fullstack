'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSidebar } from '@/lib/providers/SidebarContext';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { AppLayoutProps } from '@/lib/types';
import { shouldShowSidebar } from '@/lib/utils/authUtils';

export function AppLayout({ children }: AppLayoutProps) {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use centralized logic for sidebar visibility
  const sidebarShouldShow = shouldShowSidebar(pathname, isAuthenticated);

  const handleDropdownToggle = useCallback(() => {
    // No longer hiding sidebar when dropdown opens - let them coexist
  }, []);

  // Enhanced background classes with theme system integration
  const backgroundClasses = "main-content";

  if (!mounted) {
    // Render a consistent layout during hydration
    return (
      <div className={backgroundClasses}>
        <Navbar 
          onToggleSidebar={toggleSidebar} 
          onDropdownToggle={handleDropdownToggle} 
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex relative">
          {sidebarShouldShow && (
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          )}
          <main className={`flex-1 transition-all duration-300 ${
            sidebarShouldShow && isSidebarOpen ? 'lg:mx-10' : ''
          }`}>
            <div className="container mx-auto px-4 py-6 w-full min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </main>
        </div>
        
        {/* Footer - only show on public pages */}
        {!sidebarShouldShow && <Footer />}
      </div>
    );
  }

  return (
    <div className={backgroundClasses}>
      {/* Navbar */}
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        onDropdownToggle={handleDropdownToggle} 
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex relative">
        {/* Sidebar */}
        {sidebarShouldShow && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarShouldShow && isSidebarOpen ? 'lg:mx-10' : ''
        }`}>
          <div className="container mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer - only show on public pages */}
      {!sidebarShouldShow && <Footer />}
    </div>
  );
} 