'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useTokenRefresh } from '@/lib/hooks/useTokenRefresh';
import { useNotifications } from '@/lib/hooks/useNotifications';
import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LogOut, Settings, User, Crown, Star, 
  Home, CheckSquare, Users, Trophy, 
  UserCog, Headphones, FileText, 
  Palette, Bell, Shield, UserPlus,
  BarChart3, Calendar,
  Sparkles, Plus
} from 'lucide-react';
import { DecorativeLines } from '@/components/ui/DecorativeLines';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { usePathname } from 'next/navigation';
import { getNavigationMode } from '@/lib/utils/authUtils';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onDropdownToggle?: (isOpen: boolean) => void;
  isSidebarOpen?: boolean;
}

// Focus Mode Indicator Component
const FocusModeIndicator = () => {
  // Placeholder for future focus mode implementation
  return null;
};

export const Navbar = React.memo(function Navbar({ onToggleSidebar, onDropdownToggle, isSidebarOpen }: NavbarProps) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { customTheme, isAuthenticated: isThemeAuthenticated } = useTheme();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Get navigation mode for current page
  const navigationMode = getNavigationMode(pathname);

  // Enable automatic token refresh (hook handles internal conditional logic)
  useTokenRefresh();

  // Define public routes where sidebar shouldn't show
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/about', '/contact', '/privacy', '/terms'];
  const isPublicPage = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');

  // Sidebar should only show on authenticated, non-public pages
  const shouldShowSidebar = isAuthenticated && !isPublicPage && onToggleSidebar;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    const newState = !isProfileMenuOpen;
    setIsProfileMenuOpen(newState);
    
    // Notify parent about dropdown state change
    if (onDropdownToggle) {
      onDropdownToggle(newState);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        // Notify parent that dropdown is closed
        if (onDropdownToggle) {
          onDropdownToggle(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDropdownToggle]);

  // Get theme-aware gradients for logo dots
  const getLogoGradients = () => {
    if (customTheme?.gradients?.primary && isThemeAuthenticated) {
      return {
        primary: { background: customTheme.gradients.primary },
        secondary: { background: customTheme.gradients.secondary || customTheme.gradients.primary }
      };
    }
    // Default gradients
    return {
      primary: {},
      secondary: {}
    };
  };

  // Get sidebar button gradient based on state only (not theme mode)
  const getSidebarButtonClasses = () => {
    if (isSidebarOpen) {
      // Red gradient for close state
      return "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600";
    } else {
      // Consistent gradient for open state (regardless of theme)
      return "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600";
    }
  };

  const logoGradients = getLogoGradients();

  return (
    <>
      {/* Focus Mode Indicator - shows at top when active */}
      <FocusModeIndicator />
      
      <nav className="navbar-theme fixed top-0 z-50 w-full theme-transition relative">
        {/* Decorative lines */}
        <DecorativeLines position="both" variant="theme-adaptive" />
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="ml-3 flex flex-col gap-0.5">
                  <div 
                    className={logoGradients.primary.background 
                      ? "w-3 h-3 rounded-full animate-pulse shadow-md"
                      : "w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-md"
                    }
                    style={logoGradients.primary.background ? logoGradients.primary : {}}
                  />
                  <div 
                    className={logoGradients.secondary.background 
                      ? "w-2 h-2 rounded-full animate-pulse delay-500 shadow-sm"
                      : "w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse delay-500 shadow-sm"
                    }
                    style={logoGradients.secondary.background ? logoGradients.secondary : {}}
                  />
                </div>
                
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-900 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    TaskTracker
                  </h1>
                  <p className="text-xs text-gray-300 font-medium">Family Edition</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              {/* Public Page Navigation */}
              {navigationMode === 'public' && (
                <div className="flex items-center space-x-6">
                  {/* Public Navigation Links */}
                  <nav className="hidden lg:flex items-center space-x-6">
                    <Link href="/features" className="text-white hover:text-blue-400 transition-colors">
                      Features
                    </Link>
                    <Link href="/pricing" className="text-white hover:text-blue-400 transition-colors">
                      Pricing
                    </Link>
                    <Link href="/about" className="text-white hover:text-blue-400 transition-colors">
                      About
                    </Link>
                    <Link href="/blog" className="text-white hover:text-blue-400 transition-colors">
                      Blog
                    </Link>
                    <Link href="/contact" className="text-white hover:text-blue-400 transition-colors">
                      Contact
                    </Link>
                  </nav>
                  
                  <ThemeToggle />
                  {isAuthenticated && user && !isLoading ? (
                    /* Authenticated user on public page - show minimal auth info */
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-white">Welcome back, {user.displayName || user.firstName}</span>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="text-white hover:text-blue-400">
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    /* Unauthenticated user on public page */
                    <>
                      <Link href="/auth/login">
                        <Button variant="ghost" className="text-white hover:text-blue-400">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Hybrid Page Navigation (Support, etc.) */}
              {navigationMode === 'hybrid' && (
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
              {isAuthenticated && user ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-white">Welcome, {user.displayName || user.firstName}</span>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="text-white hover:text-blue-400">
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : !isLoading && (
                    <div className="flex items-center space-x-2">
                      <Link href="/auth/login">
                        <Button variant="ghost" className="text-white hover:text-blue-400">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Authenticated Navigation */}
              {navigationMode === 'authenticated' && isAuthenticated && user && (
                <div className="flex items-center space-x-3 lg:space-x-4">
                  {/* Future components - commented out */}
                  {/* <GlobalSearch /> */}
                  <ThemeToggle />
                  
                  {/* Notification Icon with Badge */}
                  <div className="relative">
                    <Link href="/notifications">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative navbar-theme theme-transition hover:scale-105 text-white shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        title="Notifications"
                      >
                        <Bell className="h-[1.2rem] w-[1.2rem] text-white" />
                        {/* Notification Badge */}
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
                          </div>
                        )}
                      </Button>
                    </Link>
                  </div>
                  
                  {shouldShowSidebar && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleSidebar} 
                      className={`navbar-theme theme-transition hover:scale-105 text-white shadow-md ${getSidebarButtonClasses()}`}
                      title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                      <svg className="h-[1.2rem] w-[1.2rem] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isSidebarOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        )}
                      </svg>
                    </Button>
                  )}
                  
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {(user.displayName || user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        {user.role === 'admin' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {user.displayName || user.firstName || user.username}
                        </p>
                        <div className="flex items-center space-x-2">
                          {user.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                              ADMIN
                            </Badge>
                          )}
                          <p className="text-xs text-gray-300 flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {user.points || 0}
                          </p>
                        </div>
                      </div>
                      
                      <svg 
                        className={`w-4 h-4 text-gray-300 transform transition-transform group-hover:text-blue-400 ${
                          isProfileMenuOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-600">
                          <p className="text-sm font-semibold text-white">
                            {user.displayName || user.firstName || user.username}
                          </p>
                          <p className="text-sm text-gray-300">{user.email}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            {user.role === 'admin' && (
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                                ADMIN
                              </Badge>
                            )}
                            <span className="text-xs text-gray-300 flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {user.points || 0} points
                            </span>
                          </div>
                        </div>
                        
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        
                        <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        
                        <div className="border-t border-gray-600 my-1"></div>
                        
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={toggleMenu}
                className="p-2 rounded-xl backdrop-blur-sm border border-gray-600 bg-gray-800/80 transition-all duration-300 shadow-sm hover:shadow-md text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Comprehensive Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600 bg-gray-900 max-h-[80vh] overflow-y-auto">
            {isAuthenticated && user ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center px-4 py-4 border-b border-gray-600 bg-gradient-to-r from-blue-50/5 to-purple-50/5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {(user.displayName || user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    {user.role === 'admin' && (
                      <div className="absolute mt-[-48px] ml-8 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-semibold text-white">
                      {user.displayName || user.firstName || user.username}
                    </div>
                    <div className="text-sm text-gray-300">{user.email}</div>
                    <div className="flex items-center mt-2 space-x-3">
                      {user.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                          ADMIN
                        </Badge>
                      )}
                      <span className="text-xs text-gray-300 flex items-center bg-gray-800 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 mr-1" />
                        {user.points || 0} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 border-b border-gray-600 bg-gray-800/50">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-9"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Task
                    </Button>
                    {user.isFamilyAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white h-9"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Invite
                      </Button>
                    )}
                  </div>
                </div>

                {/* Main Navigation Sections */}
                <div className="py-2">
                  {/* Core Features */}
                  <div className="px-4 py-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Core Features</div>
                    <div className="space-y-1">
                      <Link 
                        href="/dashboard" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Home className="w-5 h-5 mr-3 text-blue-400" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link 
                        href="/tasks" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-green-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <CheckSquare className="w-5 h-5 mr-3 text-green-400" />
                        <span className="font-medium">My Tasks</span>
                      </Link>
                      <Link 
                        href="/families" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="w-5 h-5 mr-3 text-purple-400" />
                        <span className="font-medium">Families</span>
                      </Link>
                      <Link 
                        href="/gamification" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
                        <span className="font-medium">Achievements</span>
                      </Link>
                      <Link 
                        href="/notifications" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="w-5 h-5 mr-3 text-blue-400" />
                        <div className="flex items-center justify-between flex-1">
                          <span className="font-medium">Notifications</span>
                          {unreadCount > 0 && (
                            <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Productivity Tools */}
                  <div className="px-4 py-2 border-t border-gray-700/50">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Productivity</div>
                    <div className="space-y-1">
                      <Link 
                        href="/calendar" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                        <span className="font-medium">Calendar</span>
                      </Link>
                      <Link 
                        href="/analytics" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="w-5 h-5 mr-3 text-cyan-400" />
                        <span className="font-medium">Analytics</span>
                      </Link>
                      <Link 
                        href="/templates" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FileText className="w-5 h-5 mr-3 text-orange-400" />
                        <span className="font-medium">Templates</span>
                      </Link>
                    </div>
                  </div>

                  {/* Settings & Account */}
                  <div className="px-4 py-2 border-t border-gray-700/50">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</div>
                    <div className="space-y-1">
                      <Link 
                        href="/settings/profile" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-gray-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <Link 
                        href="/settings/family" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus className="w-5 h-5 mr-3 text-purple-400" />
                        <span className="font-medium">Family Management</span>
                      </Link>
                      <Link 
                        href="/settings/notifications" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="w-5 h-5 mr-3 text-blue-400" />
                        <span className="font-medium">Notifications</span>
                      </Link>
                      <Link 
                        href="/settings/security" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5 mr-3 text-red-400" />
                        <span className="font-medium">Security</span>
                      </Link>
                      <Link 
                        href="/settings/appearance" 
                        className="flex items-center px-3 py-2.5 text-white hover:text-pink-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Palette className="w-5 h-5 mr-3 text-pink-400" />
                        <span className="font-medium">Appearance</span>
                      </Link>
                    </div>
                  </div>

                  {/* Admin Section (if applicable) */}
                  {(user.role === 'admin' || user.role === 'globaladmin') && (
                    <div className="px-4 py-2 border-t border-gray-700/50">
                      <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin Tools
                      </div>
                      <div className="space-y-1">
                        <Link 
                          href="/admin" 
                          className="flex items-center px-3 py-2.5 text-white hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserCog className="w-5 h-5 mr-3 text-yellow-400" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                        <Link 
                          href="/admin/user-creation" 
                          className="flex items-center px-3 py-2.5 text-white hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserPlus className="w-5 h-5 mr-3 text-yellow-400" />
                          <span className="font-medium">Create Users</span>
                        </Link>
                        <Link 
                          href="/admin/support" 
                          className="flex items-center px-3 py-2.5 text-white hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Headphones className="w-5 h-5 mr-3 text-yellow-400" />
                          <span className="font-medium">Customer Support</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Logout Section */}
                  <div className="px-4 py-3 border-t border-gray-700/50 mt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Unauthenticated Mobile Menu */
              <div className="py-4">
                <div className="px-4 space-y-3">
                  <Link 
                    href="/auth/login" 
                    className="flex items-center justify-center w-full py-3 text-white bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="flex items-center justify-center w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}); 