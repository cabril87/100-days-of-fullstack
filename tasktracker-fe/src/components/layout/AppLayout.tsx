'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useSidebar } from '@/lib/providers/SidebarContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import RealTimeNotificationWidget from '@/components/notifications/RealTimeNotificationWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = React.memo(function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  const handleDropdownToggle = useCallback((isOpen: boolean) => {
    console.log('🔽 AppLayout: handleDropdownToggle called with:', isOpen);
    // No longer hiding sidebar when dropdown opens - let them coexist
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-dark">
      {/* Navbar */}
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        onDropdownToggle={handleDropdownToggle} 
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex relative">
        {/* Sidebar - only show for authenticated users */}
        {user && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}

        {/* Main content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          user && isSidebarOpen ? 'lg:ml-80' : ''
        }`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Real-time Notification Widget - only show for authenticated users */}
      {user && <RealTimeNotificationWidget />}
    </div>
  );
}); 