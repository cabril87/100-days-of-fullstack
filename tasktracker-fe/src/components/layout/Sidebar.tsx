'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthContext';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { useFocus } from '@/lib/providers/FocusContext';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { family } = useFamily();
  const { userProgress } = useGamification();
  const { currentSession } = useFocus();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    tasks: true,
    family: true,
    gamification: true,
    admin: true,
    templates: true,
  });

  const displayName = user?.displayName || user?.firstName || user?.username || 'User';
  const isAdmin = user?.role === 'admin';
  const userPoints = userProgress?.totalPoints || 0;

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
    console.log('🚫 Sidebar: handleClose called');
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(() => {
    console.log('🖱️ Sidebar: Backdrop clicked');
    handleClose();
  }, [handleClose]);

  // Close sidebar on route change (mobile only) - only if sidebar is open
  useEffect(() => {
    // Only close on mobile devices when route changes
    const isMobile = window.innerWidth < 1024;
    if (isOpen && isMobile) {
      console.log('📍 Sidebar: Route changed on mobile, closing sidebar');
      handleClose();
    }
  }, [pathname, handleClose]); // Add handleClose to dependencies since it's stable

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('⌨️ Sidebar: Escape key pressed, closing sidebar');
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // Debug effect to track isOpen changes
  useEffect(() => {
    console.log('🔧 Sidebar: isOpen changed to:', isOpen);
  }, [isOpen]);

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
        className="sidebar-container fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 shadow-2xl z-[40] lg:static lg:top-0 lg:h-full lg:translate-x-0"
      >
        {/* Enhanced decorative gradient bars */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>

        <div className="flex flex-col h-full">
          {/* Header with Theme Toggle */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-black sidebar-heading">
                Quick Access
              </h4>
              <button
                onClick={() => {
                  console.log('❌ Sidebar: Close button clicked');
                  handleClose();
                }}
                className="sidebar-button lg:hidden p-2 rounded-lg transition-colors"
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
                className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
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
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/dashboard')
                        ? 'bg-purple-500/20 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    🏠 Dashboard
                  </Link>

                  <Link
                    href="/calendar"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/calendar')
                        ? 'bg-blue-500/20 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    📅 Global Calendar
                  </Link>

                  <Link
                    href="/analytics"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/analytics')
                        ? 'bg-purple-500/20 border-l-4 border-purple-400'
                        : ''
                    }`}
                  >
                    📈 Analytics
                  </Link>
                  <Link
                    href="/profile"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/profile')
                        ? 'bg-indigo-500/20 border-l-4 border-indigo-400'
                        : ''
                    }`}
                  >
                    👤 Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <button
                onClick={() => toggleSection('tasks')}
                className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
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
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/tasks') && pathname === '/tasks'
                        ? 'bg-green-500/20 border-l-4 border-green-400'
                        : ''
                    }`}
                  >
                    📝 All Tasks
                  </Link>
                  <Link
                    href="/tasks/board"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/tasks/board')
                        ? 'bg-purple-500/20 border-l-4 border-purple-400'
                        : ''
                    }`}
                  >
                    📊 Kanban Board
                  </Link>
                  <Link
                    href="/tasks/create"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/tasks/create')
                        ? 'bg-blue-500/20 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    ➕ Create Task
                  </Link>
                  <Link
                    href="/tasks"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      (isActiveLink('/tasks') || pathname === '/categories')
                        ? 'bg-amber-500/20 border-l-4 border-amber-400'
                        : ''
                    }`}
                  >
                    🏷️ Categories (via Tasks)
                  </Link>
                  <Link
                    href="/focus"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/focus')
                        ? 'bg-indigo-500/20 border-l-4 border-indigo-400'
                        : ''
                    }`}
                  >
                    🎯 Focus Mode
                    {currentSession && (
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Templates Section */}
            <div>
              <button
                onClick={() => toggleSection('templates')}
                className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
              >
                <span className="flex items-center gap-2">
                  📄 Templates & Automation
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.templates ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.templates && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/templates"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/templates') && pathname === '/templates'
                        ? 'bg-purple-500/20 border-l-4 border-purple-400'
                        : ''
                    }`}
                  >
                    📚 Template Library
                  </Link>
                  <Link
                    href="/templates/builder"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/templates/builder')
                        ? 'bg-blue-500/20 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    🛠️ Template Builder
                  </Link>
                  <Link
                    href="/templates/marketplace"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/templates/marketplace')
                        ? 'bg-green-500/20 border-l-4 border-green-400'
                        : ''
                    }`}
                  >
                    🌐 Marketplace
                  </Link>
                  <Link
                    href="/templates/automation"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/templates/automation')
                        ? 'bg-orange-500/20 border-l-4 border-orange-400'
                        : ''
                    }`}
                  >
                    ⚡ Smart Automation
                  </Link>
                  <Link
                    href="/templates/analytics"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/templates/analytics')
                        ? 'bg-teal-500/20 border-l-4 border-teal-400'
                        : ''
                    }`}
                  >
                    📈 Template Analytics
                  </Link>
                </div>
              )}
            </div>

            {/* Family Section */}
            <div>
              <button
                onClick={() => toggleSection('family')}
                className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
              >
                <span className="flex items-center gap-2">
                  👨‍👩‍👧‍👦 Family
                  {family && <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></span>}
                </span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${expandedSections.family ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.family && (
                <div className="space-y-1 ml-4">
                  <Link
                    href="/family"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/family') && pathname === '/family'
                        ? 'bg-orange-500/20 border-l-4 border-orange-400'
                        : ''
                    }`}
                  >
                    🏡 Family Hub
                  </Link>
                  {family && (
                    <Link
                      href={`/family/${family.id}/calendar`}
                      className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveLink(`/family/${family.id}/calendar`)
                          ? 'bg-blue-500/20 border-l-4 border-blue-400'
                          : ''
                      }`}
                    >
                      📅 Family Calendar
                    </Link>
                  )}
                  <Link
                    href="/family/create"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/family/create')
                        ? 'bg-emerald-500/20 border-l-4 border-emerald-400'
                        : ''
                    }`}
                  >
                    ➕ Create Family
                  </Link>
                </div>
              )}
            </div>

            {/* Gamification Section */}
            <div>
              <button
                onClick={() => toggleSection('gamification')}
                className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
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
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification') && pathname === '/gamification'
                        ? 'bg-purple-500/20 border-l-4 border-purple-400'
                        : ''
                    }`}
                  >
                    🎮 Gamification Hub
                  </Link>
                  <Link
                    href="/gamification/achievements"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification/achievements')
                        ? 'bg-yellow-500/20 border-l-4 border-yellow-400'
                        : ''
                    }`}
                  >
                    🏆 Achievements
                  </Link>
                  <Link
                    href="/gamification/badges"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification/badges')
                        ? 'bg-blue-500/20 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    🎖️ Badges
                  </Link>
                  <Link
                    href="/gamification/leaderboard"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification/leaderboard')
                        ? 'bg-green-500/20 border-l-4 border-green-400'
                        : ''
                    }`}
                  >
                    🥇 Leaderboard
                  </Link>
                  <Link
                    href="/gamification/challenges"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification/challenges')
                        ? 'bg-orange-500/20 border-l-4 border-orange-400'
                        : ''
                    }`}
                  >
                    🎯 Challenges
                  </Link>
                  <Link
                    href="/gamification/history"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/gamification/history')
                        ? 'bg-indigo-500/20 border-l-4 border-indigo-400'
                        : ''
                    }`}
                  >
                    📈 Recent Activity
                  </Link>
                </div>
              )}
            </div>

            {/* Admin Section - Only for Admins */}
            {(user?.email === 'admin@tasktracker.com' || user?.role === 'Admin') && (
              <div>
                <button
                  onClick={() => toggleSection('admin')}
                  className="sidebar-button flex items-center justify-between w-full text-left text-sm font-bold mb-3 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    🛡️ Admin Panel
                    <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${expandedSections.admin ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.admin && (
                  <div className="space-y-1 ml-4">
                    <Link
                      href="/admin"
                      className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveLink('/admin')
                          ? 'bg-red-500/20 border-l-4 border-red-400'
                          : ''
                      }`}
                    >
                      📊 Security Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveLink('/admin/users')
                          ? 'bg-orange-500/20 border-l-4 border-orange-400'
                          : ''
                      }`}
                    >
                      👥 User Management
                    </Link>
                    <Link
                      href="/admin/settings"
                      className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveLink('/admin/settings')
                          ? 'bg-yellow-500/20 border-l-4 border-yellow-400'
                          : ''
                      }`}
                    >
                      ⚙️ System Settings
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-sm font-bold sidebar-heading mb-3">⚡ Quick Actions</h3>
              <div className="space-y-2">
                <button className="sidebar-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-all duration-200">
                  ➕ New Task
                </button>
                <button className="sidebar-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/20 transition-all duration-200">
                  ⏰ Set Reminder
                </button>
                <button className="sidebar-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-all duration-200">
                  🎯 Start Focus
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