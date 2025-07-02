/*
 * GlobalSearchModal Component
 * Enterprise-grade instant search modal with mobile-first responsive design
 * Features: Cmd+K trigger, keyboard navigation, touch-friendly interface, robust error handling
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  ArrowRight,
  Command,
  Clock,
  Star,
  Target,
  User,
  Trophy,
  Activity,
  Bell,
  Calendar,
  Tag,
  Folder,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useUnifiedSearch } from '@/lib/hooks/useUnifiedSearch';
import {
  SearchEntityTypeDTO,
  SearchSuggestionDTO,
  SearchResultItemDTO
} from '@/lib/types/search';
import {
  GlobalSearchModalProps,
  QuickResultProps,
  RecentSearchesProps,
  SavedSearchesProps
} from '@/lib/types';
import { VoiceSearchButton } from './MobileSearchEnhancements';
import { triggerHapticFeedback } from '@/lib/helpers/mobile';

function QuickResult({ result, onSelect, isSelected, isHighlighted }: QuickResultProps) {
  const entityConfig = {
    [SearchEntityTypeDTO.Tasks]: { 
      icon: <Target className="w-4 h-4 text-green-500" />, 
      label: 'Task',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    [SearchEntityTypeDTO.Families]: { 
      icon: <User className="w-4 h-4 text-blue-500" />, 
      label: 'Family',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    [SearchEntityTypeDTO.Achievements]: { 
      icon: <Trophy className="w-4 h-4 text-yellow-500" />, 
      label: 'Achievement',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    [SearchEntityTypeDTO.Boards]: { 
      icon: <Activity className="w-4 h-4 text-purple-500" />, 
      label: 'Board',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    [SearchEntityTypeDTO.Notifications]: { 
      icon: <Bell className="w-4 h-4 text-red-500" />, 
      label: 'Notification',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    [SearchEntityTypeDTO.Activities]: { 
      icon: <Calendar className="w-4 h-4 text-indigo-500" />, 
      label: 'Activity',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    [SearchEntityTypeDTO.Tags]: { 
      icon: <Tag className="w-4 h-4 text-teal-500" />, 
      label: 'Tag',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    [SearchEntityTypeDTO.Categories]: { 
      icon: <Folder className="w-4 h-4 text-orange-500" />, 
      label: 'Category',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    [SearchEntityTypeDTO.Templates]: { 
      icon: <FileText className="w-4 h-4 text-gray-500" />, 
      label: 'Template',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    }
  };

  const config = entityConfig[result.EntityType] || entityConfig[SearchEntityTypeDTO.Tasks];

  const handleClick = useCallback(() => {
    // Mobile haptic feedback
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      triggerHapticFeedback('light');
    }
    onSelect(result);
  }, [onSelect, result]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full p-3 rounded-lg transition-all duration-200 text-left",
        "flex items-center space-x-3",
        "hover:bg-gray-50 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        // Mobile touch targets
        "min-h-[44px] active:scale-95 touch-manipulation",
        isSelected && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700",
        isHighlighted && "ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      {/* Entity Icon */}
      <div className="flex-shrink-0">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {result.Title || `${config.label} #${result.Id}`}
          </h4>
          <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
            {config.label}
          </Badge>
        </div>
        
        {result.Description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {result.Description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  );
}

/**
 * Recent Searches Component
 */
// RecentSearchesProps now imported from lib/types

function RecentSearches({ onSearchSelect }: RecentSearchesProps) {
  const recentSearches = [
    'Family tasks',
    'Achievements',
    'Clean kitchen',
    'Weekly planning'
  ];

  if (recentSearches.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Recent Searches
        </span>
      </div>
      <div className="space-y-1">
        {recentSearches.slice(0, 3).map((search, index) => (
          <button
            key={index}
            onClick={() => onSearchSelect(search)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm",
              "text-gray-600 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "transition-colors duration-150",
              "min-h-[40px] touch-manipulation" // Mobile touch target
            )}
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Saved Searches Component
 */
// SavedSearchesProps now imported from lib/types

function SavedSearches({ onSavedSearchSelect }: SavedSearchesProps) {
  const savedSearches = [
    { name: 'Daily Tasks', query: 'status:pending priority:high' },
    { name: 'Family Goals', query: 'type:goals family:true' }
  ];

  if (savedSearches.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <Star className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Saved Searches
        </span>
      </div>
      <div className="space-y-1">
        {savedSearches.slice(0, 3).map((search, index) => (
          <button
            key={index}
            onClick={() => onSavedSearchSelect(search.query)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm",
              "text-gray-600 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "transition-colors duration-150",
              "min-h-[40px] touch-manipulation" // Mobile touch target
            )}
          >
            <div className="font-medium">{search.name}</div>
            <div className="text-xs text-gray-400 truncate">{search.query}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Global Search Modal Component
 */
export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showingResults, setShowingResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize search hook
  const {
    searchState,
    search,
    getSuggestions
  } = useUnifiedSearch(undefined, false, 200);

  const [suggestions, setSuggestions] = useState<SearchSuggestionDTO[]>([]);

  // All available items (suggestions + quick results)
  const allItems = React.useMemo(() => {
    const items: Array<{ type: 'suggestion' | 'result'; data: SearchSuggestionDTO | SearchResultItemDTO }> = [];
    
    // Add suggestions
    suggestions.forEach(suggestion => {
      items.push({ type: 'suggestion', data: suggestion });
    });
    
    // Add quick results (first few from each entity type)
    if (searchState.results && Array.isArray(searchState.results)) {
      searchState.results.forEach(group => {
        if (group && group.Results && Array.isArray(group.Results)) {
          group.Results.slice(0, 3).forEach(result => {
            items.push({ type: 'result', data: result });
          });
        }
      });
    }
    
    return items;
  }, [suggestions, searchState.results]);

  // ================================
  // SEARCH HANDLERS
  // ================================

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setShowingResults(false);
      setSuggestions([]);
      return;
    }

    setQuery(searchQuery);
    setShowingResults(true);
    
    // Mobile haptic feedback for search start
    if (isMobile) {
      triggerHapticFeedback('light');
    }
    
    // Get suggestions
    try {
      const newSuggestions = await getSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
      if (isMobile) {
        triggerHapticFeedback('error');
      }
    }
    
    // Perform quick search
    try {
      await search(searchQuery);
      setSelectedIndex(0);
      if (isMobile) {
        triggerHapticFeedback('success');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      if (isMobile) {
        triggerHapticFeedback('error');
      }
    }
  }, [getSuggestions, search, isMobile]);

  // Voice search handler
  const handleVoiceSearch = useCallback(async (transcript: string) => {
    if (transcript.trim()) {
      await handleSearch(transcript.trim());
    }
  }, [handleSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      handleSearch(value);
    } else {
      setShowingResults(false);
      setSuggestions([]);
      setSelectedIndex(0);
    }
  }, [handleSearch]);

  const handleResultClick = useCallback((result: SearchResultItemDTO) => {
    onClose();
    
    // Navigate based on entity type with proper fallbacks
    switch (result.EntityType) {
      case SearchEntityTypeDTO.Tasks:
        router.push(`/tasks/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Families:
        router.push(`/family/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Achievements:
        router.push(`/gamification?achievement=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Boards:
        router.push(`/boards/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Notifications:
        router.push(`/notifications?highlight=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Activities:
        router.push(`/dashboard?activity=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Tags:
        router.push(`/tasks?tag=${encodeURIComponent(result.Title || '')}`);
        break;
      case SearchEntityTypeDTO.Categories:
        router.push(`/tasks?category=${encodeURIComponent(result.Title || '')}`);
        break;
      case SearchEntityTypeDTO.Templates:
        router.push(`/boards?template=${result.Id}`);
        break;
      default:
        // Instead of going to /search, go to search page with the current query
        router.push(`/search?q=${encodeURIComponent(query || result.Title || '')}`);
    }
  }, [router, onClose, query]);

  const handleItemSelect = useCallback((item: { type: 'suggestion' | 'result'; data: SearchSuggestionDTO | SearchResultItemDTO }) => {
    if (item.type === 'suggestion') {
      const suggestion = item.data as SearchSuggestionDTO;
      setQuery(suggestion.Text);
      handleSearch(suggestion.Text);
    } else {
      const result = item.data as SearchResultItemDTO;
      handleResultClick(result);
    }
  }, [handleSearch, handleResultClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showingResults || allItems.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        onClose();
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < allItems.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : allItems.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          handleItemSelect(allItems[selectedIndex]);
        } else if (query.trim()) {
          onClose();
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [showingResults, allItems, selectedIndex, query, handleItemSelect, onClose, router]);

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setShowingResults(false);
      setSuggestions([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // ================================
  // RENDER
  // ================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          // Base modal styling
          "max-w-2xl p-0 gap-0 overflow-hidden",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-700",
          "shadow-2xl",
          // Mobile responsiveness
          "mx-4 my-8 sm:mx-auto sm:my-16",
          "w-[calc(100vw-2rem)] sm:w-full",
          "max-h-[calc(100vh-4rem)] sm:max-h-[80vh]"
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-0">
          {/* Accessibility */}
          <DialogTitle className="sr-only">
            Global Search
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search across all content. Use keyboard navigation with arrow keys and Enter to select results.
          </DialogDescription>
          
          {/* Search Input */}
          <div className={cn(
            "flex items-center p-4 border-b border-gray-200 dark:border-gray-700",
            "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
          )}>
            <div className="relative flex-shrink-0">
              <Search className="w-5 h-5 text-blue-500 mr-3" />
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="🔍 Search your quest..."
              className={cn(
                "border-0 bg-transparent text-base placeholder:text-gray-400",
                "focus:ring-0 focus:outline-none flex-1 text-gray-900 dark:text-white",
                // Mobile text sizing
                "text-base sm:text-lg"
              )}
            />
            
            {/* Mobile controls */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Voice search button for mobile */}
              {isMobile && (
                <VoiceSearchButton 
                  onVoiceResult={handleVoiceSearch}
                  size="sm"
                  className="w-8 h-8"
                />
              )}
              
              {/* Clear button */}
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    if (isMobile) {
                      triggerHapticFeedback('light');
                    }
                  }}
                  className="p-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              )}
            </div>
            
            {/* Keyboard hint */}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 flex-shrink-0 ml-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                K
              </kbd>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className={cn(
          "max-h-96 overflow-y-auto",
          "bg-white dark:bg-gray-900",
          // Mobile scroll behavior
          "overscroll-contain"
        )}>
          {!showingResults ? (
            /* Empty State - Recent & Saved Searches */
            <div className="py-2">
              {/* Only render authenticated components when user is authenticated */}
              {isAuthenticated && isReady && (
                <>
                  <RecentSearches onSearchSelect={handleSearch} />
                  <SavedSearches onSavedSearchSelect={handleSearch} />
                </>
              )}
              
              {/* Quick Actions */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  ⚡ Quick Actions
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🔍 Start typing to discover your quests!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="py-2">
              {searchState.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      🔍 Scanning the realm...
                    </span>
                  </div>
                </div>
              ) : searchState.error ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-4xl mb-2">😔</div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    {searchState.error}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSearch(query)}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : allItems.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onClose();
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }}
                    className="mt-2"
                  >
                    View Full Search Results
                  </Button>
                </div>
              ) : (
                <div className="px-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 px-2 uppercase tracking-wide">
                    Quick Results ({allItems.length})
                  </div>
                  <div className="space-y-1">
                    {allItems.map((item, index) => {
                      if (item.type === 'result') {
                        const result = item.data as SearchResultItemDTO;
                        return (
                          <QuickResult
                            key={`result-${result.EntityType}-${result.Id}`}
                            result={result}
                            onSelect={handleResultClick}
                            isSelected={selectedIndex === index}
                            isHighlighted={selectedIndex === index}
                          />
                        );
                      } else {
                        const suggestion = item.data as SearchSuggestionDTO;
                        return (
                          <button
                            key={`suggestion-${index}-${suggestion.Text}`}
                            onClick={() => handleSearch(suggestion.Text)}
                            className={cn(
                              "w-full p-3 rounded-lg transition-all duration-200 text-left",
                              "flex items-center space-x-3",
                              "hover:bg-gray-50 dark:hover:bg-gray-800",
                              "min-h-[44px] touch-manipulation",
                              selectedIndex === index && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                            )}
                          >
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {suggestion.Text}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Suggestion
                            </Badge>
                          </button>
                        );
                      }
                    })}
                  </div>
                  
                  {/* View All Results */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => {
                        onClose();
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                      }}
                    >
                      View All Results
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalSearchModal; 
