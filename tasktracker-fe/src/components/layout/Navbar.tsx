'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useTokenRefresh } from '@/lib/hooks/useTokenRefresh';
import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Crown, Star } from 'lucide-react';
import { DecorativeLines } from '@/components/ui/DecorativeLines';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { usePathname } from 'next/navigation';

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
  const { user, logout, isAuthenticated } = useAuth();
  const { customTheme, isAuthenticated: isThemeAuthenticated } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Enable automatic token refresh
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
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 lg:space-x-4">
                  {/* Future components - commented out */}
                  {/* <GlobalSearch /> */}
                  <ThemeToggle />
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
              ) : (
                // Basic navigation for non-authenticated users
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  {/* Sidebar button removed for non-authenticated users */}
                  
                  {/* Auth links for non-authenticated users */}
                  <Link href="/auth/register" className="text-white hover:text-purple-400 inline-flex items-center px-4 py-2 rounded-lg border-2 border-transparent hover:border-purple-500/20 hover:bg-purple-900/20 transition-all duration-300 font-bold text-sm">🚀 Get Started</Link>
                  <Link href="/auth/login" className="text-white hover:text-blue-400 inline-flex items-center px-4 py-2 rounded-lg border-2 border-transparent hover:border-blue-500/20 hover:bg-blue-900/20 transition-all duration-300 font-bold text-sm">🔑 Sign In</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600 pt-4 pb-3 space-y-1 bg-gray-900">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center px-4 py-3 border-b border-gray-600">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(user.displayName || user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user.displayName || user.firstName || user.username}
                    </div>
                    <div className="text-sm text-gray-300">{user.email}</div>
                    <div className="flex items-center mt-1 space-x-2">
                      {user.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                          ADMIN
                        </Badge>
                      )}
                      <span className="text-xs text-gray-300 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {user.points || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-white hover:text-blue-400 hover:bg-gray-800">Dashboard</Link>
                <Link href="/profile" className="block px-4 py-2 text-base font-medium text-white hover:text-blue-400 hover:bg-gray-800">Profile</Link>
                <Link href="/settings" className="block px-4 py-2 text-base font-medium text-white hover:text-blue-400 hover:bg-gray-800">Settings</Link>
                
                <div className="border-t border-gray-600 pt-4">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-400 hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link href="/auth/login" className="block px-4 py-2 text-base font-medium text-white hover:text-blue-400 hover:bg-gray-800">Sign In</Link>
                <Link href="/auth/register" className="block px-4 py-2 text-base font-medium text-white hover:text-purple-400 hover:bg-gray-800">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}); 