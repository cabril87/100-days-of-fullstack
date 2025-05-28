'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthContext';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useFocus } from '@/lib/providers/FocusContext';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from '@/components/GlobalSearch';
import { Timer, Brain, XCircle } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onDropdownToggle?: (isOpen: boolean) => void;
  isSidebarOpen?: boolean;
}

// Focus Mode Indicator Component
const FocusModeIndicator = () => {
  const { currentSession, endFocusSession } = useFocus();
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!currentSession || currentSession.status !== 'InProgress') {
      setTimeElapsed(0);
      return;
    }

    const startTime = new Date(currentSession.startTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setTimeElapsed(elapsed);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = async () => {
    if (currentSession) {
      await endFocusSession(currentSession.id);
    }
  };

  if (!currentSession || currentSession.status !== 'InProgress') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-white animate-pulse" />
            <span className="text-sm font-medium">Focus Mode Active</span>
          </div>
          <div className="hidden sm:block text-sm text-purple-100">
            Task: {currentSession.task?.title || 'Untitled Task'}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
            <Timer className="h-4 w-4" />
            <span className="font-mono text-sm font-medium">
              {formatTime(timeElapsed)}
            </span>
          </div>
          
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 text-xs transition-colors"
            title="End Focus Session"
          >
            <XCircle className="h-3 w-3" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Navbar = React.memo(function Navbar({ onToggleSidebar, onDropdownToggle, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const { family } = useFamily();
  const { currentSession } = useFocus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.firstName || user?.username || 'User';

  // Debug sidebar state
  useEffect(() => {
    console.log('🔧 Navbar: isSidebarOpen prop changed to:', isSidebarOpen);
    console.log('🔧 Navbar: user authenticated:', !!user);
  }, [isSidebarOpen, user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    console.log('👤 Navbar: Profile menu toggle clicked');
    console.log('📊 Current profile menu state:', isProfileMenuOpen);
    console.log('🔗 onDropdownToggle function exists:', !!onDropdownToggle);
    
    const newState = !isProfileMenuOpen;
    setIsProfileMenuOpen(newState);
    console.log('📊 New profile menu state:', newState);
    
    // Notify parent about dropdown state change
    if (onDropdownToggle) {
      console.log('📤 Calling onDropdownToggle with:', newState);
      onDropdownToggle(newState);
    } else {
      console.warn('⚠️ onDropdownToggle is not defined!');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        console.log('🖱️ Navbar: Click outside detected, closing profile menu');
        setIsProfileMenuOpen(false);
        // Notify parent that dropdown is closed
        if (onDropdownToggle) {
          console.log('📤 Calling onDropdownToggle(false) from click outside');
          onDropdownToggle(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDropdownToggle]);

  return (
    <>
      {/* Focus Mode Indicator - shows at top when active */}
      <FocusModeIndicator />
      
      <nav className={`navbar-container shadow-xl relative z-[100] ${currentSession?.status === 'InProgress' ? 'mt-12' : ''}`}>
            {/* Enhanced decorative gradient bars */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 group-hover:from-purple-800 group-hover:via-indigo-800 group-hover:to-blue-800 transition-all duration-300 drop-shadow-sm">
                TaskTracker
              </span>
              <div className="ml-3 flex flex-col gap-0.5">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-md"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse delay-500 shadow-sm"></div>
              </div>
            </Link>
                      <div className="hidden lg:ml-6 lg:flex lg:space-x-4 xl:space-x-6">
            {user ? (
              // Authenticated user - show icons only
              <>
                <Link
                  href="/dashboard"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 text-xl"
                  title="Dashboard"
                >
                  📊
                </Link>
                <Link
                  href="/tasks"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-indigo-500/20 transition-all duration-300 text-xl"
                  title="Tasks"
                >
                  ✅
                </Link>
                <Link
                  href="/templates"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-emerald-500/20 transition-all duration-300 text-xl"
                  title="Templates"
                >
                  📋
                </Link>
                <Link
                  href="/focus"
                  className={`navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 transition-all duration-300 text-xl relative ${
                    currentSession?.status === 'InProgress' 
                      ? 'border-amber-500/40 bg-amber-500/20 shadow-amber-500/25' 
                      : 'border-transparent hover:border-amber-500/20'
                  }`}
                  title="Focus Mode"
                >
                  🎯
                  {currentSession?.status === 'InProgress' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></span>
                  )}
                </Link>
                <Link
                  href="/notifications/center"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 text-xl"
                  title="Notifications"
                >
                  🔔
                </Link>
                <Link
                  href="/reminders"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-green-500/20 transition-all duration-300 text-xl"
                  title="Reminders"
                >
                  ⏰
                </Link>
                <Link
                  href="/gamification"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-purple-500/20 transition-all duration-300 text-xl"
                  title="Gamification"
                >
                  🎮
                </Link>
                <Link
                  href="/family"
                  className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-orange-500/20 transition-all duration-300 text-xl relative"
                  title="Family"
                >
                  👨‍👩‍👧‍👦
                  {family && <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></span>}
                </Link>
                {(user?.email === 'admin@tasktracker.com' || user?.role === 'Admin') && (
                  <Link
                    href="/admin"
                    className="navbar-link inline-flex items-center px-3 py-2 rounded-lg border-2 border-transparent hover:border-red-500/20 transition-all duration-300 text-xl relative"
                    title="Admin Dashboard"
                  >
                    🛡️
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                  </Link>
                )}

              </>
            ) : (
              // Public user - show only public navigation links
              <>
                <Link
                  href="/"
                  className="navbar-link inline-flex items-center px-4 py-2 rounded-lg border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 font-bold text-sm"
                >
                  🏠 Home
                </Link>
                <Link
                  href="/about"
                  className="navbar-link inline-flex items-center px-4 py-2 rounded-lg border-2 border-transparent hover:border-slate-500/20 transition-all duration-300 font-bold text-sm"
                >
                  ℹ️ About
                </Link>
              </>
            )}
          </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            {user ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                <GlobalSearch />
                <ThemeToggle />
                {onToggleSidebar && (
                  <button
                    onClick={() => {
                      console.log('🔘 Navbar: Desktop sidebar toggle clicked');
                      console.log('🔗 onToggleSidebar function exists:', !!onToggleSidebar);
                      if (onToggleSidebar) {
                        onToggleSidebar();
                      } else {
                        console.error('❌ onToggleSidebar is not defined!');
                      }
                    }}
                    className={`navbar-button p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 shadow-sm hover:shadow-md ${
                      isSidebarOpen 
                        ? 'border-red-400 bg-red-500/20 shadow-red-500/25' 
                        : 'border-blue-400 bg-blue-500/20 shadow-blue-500/25'
                    }`}
                    title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isSidebarOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      )}
                    </svg>
                  </button>
                )}
                
                <div className="flex items-center space-x-4 relative">
                  {/* Notification Center */}
                  <NotificationCenter />
                  
                  <div ref={profileMenuRef} className="relative">
                    <button
                      onClick={toggleProfileMenu}
                        className="navbar-button flex items-center text-sm backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 transition-all duration-300 shadow-sm hover:shadow-md font-bold focus:outline-none"
                    >
                      <span className="mr-2">👋 Welcome, {displayName}</span>
                      <svg
                        className={`h-4 w-4 transform transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 z-[9999] overflow-hidden ">
                        {/* Enhanced decorative gradient bars */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
                        
                        <div className="py-3" role="menu" aria-orientation="vertical">
                          {/* Header Section */}
                          <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Quick Actions
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-2">
                          <Link
                            href="/profile"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-blue-50/50 dark:text-gray-200 dark:hover:bg-blue-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                            role="menuitem"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            👤 Your Profile
                          </Link>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-purple-50/50 dark:text-gray-200 dark:hover:bg-purple-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              📊 Dashboard
                            </Link>
                            <Link
                              href="/focus"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-amber-50/50 dark:text-gray-200 dark:hover:bg-amber-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              🎯 Focus Mode
                            </Link>
                            <Link
                              href="/gamification"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-purple-50/50 dark:text-gray-200 dark:hover:bg-purple-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              🎮 Gamification
                            </Link>
                            <Link
                              href="/gamification/history"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-indigo-50/50 dark:text-gray-200 dark:hover:bg-indigo-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              📈 Recent Activity
                            </Link>
                            <Link
                              href="/notifications/center"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-blue-50/50 dark:text-gray-200 dark:hover:bg-blue-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              🔔 Notifications
                            </Link>
                            <Link
                              href="/reminders"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-green-50/50 dark:text-gray-200 dark:hover:bg-green-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                              role="menuitem"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              ⏰ Reminders
                            </Link>
                          <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                          <Link
                            href="/family"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-orange-50/50 dark:text-gray-200 dark:hover:bg-orange-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                            role="menuitem"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            👨‍👩‍👧‍👦 Family
                          </Link>
                          <Link
                            href="/family/create"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-emerald-50/50 dark:text-gray-200 dark:hover:bg-emerald-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                            role="menuitem"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            ➕ Create Family
                          </Link>
                          {(user?.email === 'admin@tasktracker.com' || user?.role === 'Admin') && (
                            <>
                              <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-red-50/50 dark:text-gray-200 dark:hover:bg-red-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                                role="menuitem"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                🛡️ Admin Dashboard
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                          <button
                            onClick={() => {
                              console.log('🚪 Navbar: Logout button clicked');
                              logout();
                              setIsProfileMenuOpen(false);
                              if (onDropdownToggle) {
                                console.log('📤 Calling onDropdownToggle(false) from logout');
                                onDropdownToggle(false);
                              }
                            }}
                              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg mx-2 transition-all duration-200 font-medium"
                            role="menuitem"
                          >
                            🚪 Logout
                          </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 inline-flex items-center px-4 py-2 rounded-lg border-2 border-transparent hover:border-blue-500/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 font-bold text-sm"
                >
                  🔑 Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 Sign Up Free
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <div className="flex items-center space-x-2">
              {user && <GlobalSearch />}
              <ThemeToggle />
              {user && <NotificationCenter />}
              {user && onToggleSidebar && (
                <button
                  onClick={() => {
                    console.log('📱 Navbar: Mobile sidebar toggle clicked');
                    console.log('🔗 onToggleSidebar function exists:', !!onToggleSidebar);
                    if (onToggleSidebar) {
                      onToggleSidebar();
                    } else {
                      console.error('❌ onToggleSidebar is not defined!');
                    }
                  }}
                  className={`navbar-button p-2 rounded-xl backdrop-blur-sm border transition-all duration-300 shadow-sm hover:shadow-md ${
                    isSidebarOpen 
                      ? 'border-red-400 bg-red-500/20 shadow-red-500/25' 
                      : 'border-blue-400 bg-blue-500/20 shadow-blue-500/25'
                  }`}
                  title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isSidebarOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    )}
                  </svg>
                </button>
              )}
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-800 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 dark:text-gray-200 focus:outline-none shadow-sm hover:shadow-md transition-all duration-300"
                aria-expanded="false"
              >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg relative overflow-hidden">
          {/* Enhanced decorative gradient bars */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
          <div className="pt-4 pb-4 space-y-2 px-4">
            {user ? (
              // Authenticated user mobile menu
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-800 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="text-gray-800 hover:bg-indigo-50/50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-indigo-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ✅ Tasks
                </Link>
                <Link
                  href="/templates"
                  className="text-gray-800 hover:bg-emerald-50/50 hover:text-emerald-600 dark:text-gray-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-emerald-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📋 Templates
                </Link>
                <Link
                  href="/focus"
                  className="text-gray-800 hover:bg-amber-50/50 hover:text-amber-600 dark:text-gray-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-amber-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎯 Focus Mode
                </Link>
                <Link
                  href="/notifications/center"
                  className="text-gray-800 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔔 Notifications
                </Link>
                <Link
                  href="/reminders"
                  className="text-gray-800 hover:bg-green-50/50 hover:text-green-600 dark:text-gray-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-green-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⏰ Reminders
                </Link>
                <Link
                  href="/gamification"
                  className="text-gray-800 hover:bg-purple-50/50 hover:text-purple-600 dark:text-gray-200 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-purple-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎮 Gamification
                </Link>
                <Link
                  href="/gamification/history"
                  className="text-gray-800 hover:bg-indigo-50/50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-indigo-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📈 Recent Activity
                </Link>
                <Link
                  href="/family"
                  className="text-gray-800 hover:bg-orange-50/50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-orange-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👨‍👩‍👧‍👦 Family
                </Link>
              </>
            ) : (
              // Public user mobile menu
              <>
                <Link
                  href="/"
                  className="text-gray-800 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-800 hover:bg-slate-50/50 hover:text-slate-600 dark:text-gray-200 dark:hover:bg-slate-900/20 dark:hover:text-slate-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-slate-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ℹ️ About
                </Link>
                <Link
                  href="/auth/login"
                  className="text-gray-800 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔑 Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚀 Sign Up Free
                </Link>
              </>
            )}
          </div>
          {user && (
            <div className="pt-4 pb-4 border-t border-gray-200/50 dark:border-gray-700/50 px-4">
              <div className="space-y-3">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        👋 Welcome, {displayName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Mobile Menu
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-50/50 dark:text-gray-200 dark:hover:bg-blue-900/20 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Your Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl text-base font-bold transition-all duration-300 border-2 border-transparent hover:border-red-500/20"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
    </>
  );
}); 