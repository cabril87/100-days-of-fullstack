'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    tasks: true,
    family: true,
    gamification: true,
    admin: true,
    templates: true,
    settings: true,
  });

  const displayName = user?.displayName || user?.firstName || user?.username || 'User';
  const isAdmin = user?.role.toLowerCase() === 'admin';
  const isFamilyAdmin = user?.isFamilyAdmin || isAdmin;
  const userPoints = user?.points || 0;

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const isActiveLink = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // Close sidebar on route change (mobile only) - only if sidebar is open
  useEffect(() => {
    // Only close on mobile devices when route changes
    const isMobile = window.innerWidth < 1024;
    if (isOpen && isMobile) {
      handleClose();
    }
  }, [pathname, handleClose, isOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!user) return null;

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const backdropVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[30] lg:hidden"
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="sidebar-theme fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 shadow-2xl z-[40] lg:static lg:top-0 lg:h-full lg:translate-x-0 theme-transition border-r border-[rgb(var(--sidebar-border))]"
      >
        {/* Enhanced decorative gradient bars */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>

        <div className="flex flex-col h-full">
          {/* Header with Theme Toggle */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-black text-gray-900 dark:text-white">
                Quick Access
              </h4>
              <button
                onClick={() => {
                  handleClose();
                }}
                className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Enhanced User Section */}
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  {isAdmin && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs">👑</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                      ADMIN
                    </span>
                  )}
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      ⭐ {userPoints.toLocaleString()} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Dashboard Section */}
            <div>
              <button
                onClick={() => toggleSection('dashboard')}
                className="flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  📊 Main Menu
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.dashboard ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.dashboard && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/dashboard')
                        ? 'bg-purple-500/20 border-l-4 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    🏠 Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <button
                onClick={() => toggleSection('tasks')}
                className="flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  ✅ Tasks & Productivity
                  <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></span>
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.tasks ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.tasks && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/tasks"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/tasks') && pathname === '/tasks'
                        ? 'bg-green-500/20 border-l-4 border-green-400 text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    📝 All Tasks
                  </Link>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div>
              <button
                onClick={() => toggleSection('settings')}
                className="flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  ⚙️ Settings & Account
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    ✓ 4/5
                  </span>
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.settings ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.settings && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/settings/profile"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/settings/profile')
                        ? 'bg-blue-500/20 border-l-4 border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    👤 Profile
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓
                    </span>
                  </Link>

                  {isFamilyAdmin && (
                    <Link
                      href="/settings/family"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveLink('/settings/family')
                          ? 'bg-green-500/20 border-l-4 border-green-400 text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      👨‍👩‍👧‍👦 Family Management
                      {isAdmin && <span className="text-xs">👑</span>}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✓
                      </span>
                    </Link>
                  )}

                  <Link
                    href="/settings/notifications"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/settings/notifications')
                        ? 'bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    🔔 Notifications
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓
                    </span>
                  </Link>

                  <Link
                    href="/settings/appearance"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/settings/appearance')
                        ? 'bg-purple-500/20 border-l-4 border-purple-400 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    🎨 Appearance & Themes
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓
                    </span>
                  </Link>

                  <Link
                    href="/settings/security"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/settings/security')
                        ? 'bg-red-500/20 border-l-4 border-red-400 text-red-700 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    🛡️ Privacy & Security
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Gamification Section */}
            <div>
              <button
                onClick={() => toggleSection('gamification')}
                className="flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  🎮 Gamification
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></span>
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.gamification ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.gamification && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/gamification"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification') && pathname === '/gamification'
                        ? 'bg-purple-500/20 border-l-4 border-purple-400 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    🎮 Gamification Hub
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">⚡ Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-all duration-200 text-gray-700 dark:text-gray-300">
                  ➕ New Task
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/20 transition-all duration-200 text-gray-700 dark:text-gray-300">
                  ⏰ Set Reminder
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-3">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all duration-200 border-2 border-transparent hover:border-red-400/20"
              >
                🚪 Logout
              </button>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  TaskTracker v2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}); 