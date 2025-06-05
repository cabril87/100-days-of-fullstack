'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSidebar } from '@/lib/providers/SidebarContext';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AppLayoutProps } from '@/lib/types';

export function AppLayout({ children }: AppLayoutProps) {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Define public pages that should not show sidebar
  const publicPages = [
    '/',
    '/features',
    '/blog',
    '/pricing',
    '/support',
    '/community',
    '/privacy',
    '/terms',
    '/contact',
    '/docs',
    '/about',
    '/auth/login',
    '/auth/register',
    '/forgot-password'
  ];
  
  // Show sidebar on all pages for now (can be customized later)
  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  const shouldShowSidebar = !isPublicPage;

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
          {shouldShowSidebar && (
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          )}
          <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            shouldShowSidebar && isSidebarOpen ? 'lg:mx-10' : ''
          }`}>
            <div className="container mx-auto px-4 py-6 w-full">
              {children}
            </div>
          </main>
        </div>
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
        {shouldShowSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}

        {/* Main content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          shouldShowSidebar && isSidebarOpen ? 'lg:mx-10' : ''
        }`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 