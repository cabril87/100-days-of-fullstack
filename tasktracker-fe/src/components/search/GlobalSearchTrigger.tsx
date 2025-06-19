/*
 * GlobalSearchTrigger Component
 * Search button/hook for navbar with Cmd+K keyboard shortcut
 * Enterprise-grade global search integration
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import GlobalSearchModal from './GlobalSearchModal';

interface GlobalSearchTriggerProps {
  className?: string;
  variant?: 'button' | 'input-style' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Custom hook for global search functionality
 */
export function useGlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return {
    isSearchOpen,
    openSearch,
    closeSearch
  };
}

/**
 * Search trigger button component
 */
export function GlobalSearchTrigger({ 
  className, 
  variant = 'input-style', 
  size = 'md' 
}: GlobalSearchTriggerProps) {
  const { isSearchOpen, openSearch, closeSearch } = useGlobalSearch();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 px-2 text-xs',
      icon: 'w-3.5 h-3.5',
      kbd: 'text-xs px-1'
    },
    md: {
      button: 'h-10 px-3 text-sm',
      icon: 'w-4 h-4',
      kbd: 'text-xs px-1.5'
    },
    lg: {
      button: 'h-12 px-4 text-base',
      icon: 'w-5 h-5',
      kbd: 'text-sm px-2'
    }
  };

  const config = sizeConfig[size];

  if (variant === 'icon-only') {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={openSearch}
          className={cn(
            "relative text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors",
            className
          )}
          title="Search (⌘K)"
        >
          <Search className={config.icon} />
        </Button>
        <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          onClick={openSearch}
          className={cn(
            "justify-start text-gray-500 hover:text-gray-900 dark:hover:text-white",
            "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
            config.button,
            className
          )}
        >
          <Search className={cn(config.icon, "mr-2")} />
          <span>Search...</span>
          <div className="ml-auto flex items-center space-x-0.5">
            <kbd className={cn(
              "pointer-events-none select-none bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600",
              config.kbd
            )}>
              <Command className="w-3 h-3" />
            </kbd>
            <kbd className={cn(
              "pointer-events-none select-none bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600",
              config.kbd
            )}>
              K
            </kbd>
          </div>
        </Button>
        <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      </>
    );
  }

  // Default: input-style variant
  return (
    <>
      <button
        onClick={openSearch}
        className={cn(
          "flex items-center w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
          "transition-colors duration-200 group",
          config.button,
          className
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Search className={cn(config.icon, "mr-2 flex-shrink-0")} />
            <span className="text-gray-400 dark:text-gray-500 select-none">
              Search anything...
            </span>
          </div>
          
          <div className="flex items-center space-x-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <kbd className={cn(
              "pointer-events-none select-none bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600",
              "text-gray-600 dark:text-gray-400",
              config.kbd
            )}>
              <Command className="w-3 h-3" />
            </kbd>
            <kbd className={cn(
              "pointer-events-none select-none bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600",
              "text-gray-600 dark:text-gray-400",
              config.kbd
            )}>
              K
            </kbd>
          </div>
        </div>
      </button>
      <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}

/**
 * Standalone search modal that can be controlled externally
 */
export function GlobalSearchModalWrapper() {
  const { isSearchOpen, closeSearch } = useGlobalSearch();
  
  return <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />;
}

export default GlobalSearchTrigger; 