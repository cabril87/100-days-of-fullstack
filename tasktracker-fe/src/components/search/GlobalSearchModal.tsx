/*
 * GlobalSearchModal Component
 * Instant search modal with Cmd+K trigger
 * Enterprise-grade global search with keyboard navigation
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
import { 
  Search, 
  ArrowRight, 
  Command, 
  Clock, 
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useUnifiedSearch } from '@/lib/hooks/useUnifiedSearch';
import {
  SearchEntityTypeDTO,
  SearchSuggestionDTO,
  SearchResultItemDTO
} from '@/lib/types/search';


interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick Result Item Component
 */
interface QuickResultProps {
  result: SearchResultItemDTO;
  onSelect: (result: SearchResultItemDTO) => void;
  isSelected: boolean;
}

function QuickResult({ result, onSelect, isSelected }: QuickResultProps) {
  const entityConfig = {
    [SearchEntityTypeDTO.Tasks]: { icon: '✅', color: 'text-green-400', bgColor: 'from-green-600/20 to-emerald-600/20', borderColor: 'border-green-500/30' },
    [SearchEntityTypeDTO.Families]: { icon: '👨‍👩‍👧‍👦', color: 'text-blue-400', bgColor: 'from-blue-600/20 to-cyan-600/20', borderColor: 'border-blue-500/30' },
    [SearchEntityTypeDTO.Achievements]: { icon: '🏆', color: 'text-yellow-400', bgColor: 'from-yellow-600/20 to-orange-600/20', borderColor: 'border-yellow-500/30' },
    [SearchEntityTypeDTO.Boards]: { icon: '📋', color: 'text-purple-400', bgColor: 'from-purple-600/20 to-violet-600/20', borderColor: 'border-purple-500/30' },
    [SearchEntityTypeDTO.Notifications]: { icon: '🔔', color: 'text-red-400', bgColor: 'from-red-600/20 to-pink-600/20', borderColor: 'border-red-500/30' },
    [SearchEntityTypeDTO.Activities]: { icon: '📊', color: 'text-indigo-400', bgColor: 'from-indigo-600/20 to-blue-600/20', borderColor: 'border-indigo-500/30' }
  };

  const config = entityConfig[result.EntityType as keyof typeof entityConfig] || entityConfig[SearchEntityTypeDTO.Tasks];

  return (
    <button
      onClick={() => onSelect(result)}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-all duration-200",
        "flex items-center justify-between group relative overflow-hidden",
        "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border backdrop-blur-sm",
        `hover:${config.bgColor} hover:${config.borderColor}`,
        "hover:scale-102 hover:shadow-lg hover:shadow-purple-500/25",
        isSelected 
          ? `${config.bgColor} ${config.borderColor} shadow-lg scale-102` 
          : "border-slate-600/30 hover:border-slate-500/50"
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
        <div className="relative">
          <span className={`text-lg flex-shrink-0 ${config.color} group-hover:scale-110 transition-transform duration-200`}>
            {config.icon}
          </span>
          <div className={`absolute -inset-1 ${config.color.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div 
            className="text-sm font-medium text-purple-100 group-hover:text-white truncate transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: result.Title }}
          />
          {result.Description && (
            <div 
              className="text-xs text-purple-300/70 group-hover:text-purple-200 truncate transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: result.Description }}
            />
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0 relative z-10">
        <Badge variant="outline" className={`text-xs bg-slate-800/50 ${config.borderColor} ${config.color} font-mono`}>
          {result.EntityType}
        </Badge>
        <ArrowRight className="w-3 h-3 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  );
}

/**
 * Recent Searches Component
 */
interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
}

function RecentSearches({ onSearchSelect }: RecentSearchesProps) {
  const { isAuthenticated, isReady } = useAuth();
  const { getSearchHistory } = useUnifiedSearch();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Only load search history if user is authenticated
    if (!isAuthenticated || !isReady) return;

    const loadRecentSearches = async () => {
      try {
        const history = await getSearchHistory();
        const queries = history.slice(0, 5).map(item => item.SearchQuery);
        setRecentSearches(queries);
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    };
    loadRecentSearches();
  }, [getSearchHistory, isAuthenticated, isReady]);

  if (recentSearches.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="text-xs font-bold text-blue-300 mb-2 flex items-center">
        <Clock className="w-3 h-3 mr-1 animate-pulse" />
        ⏰ Recent Quests
      </div>
      <div className="space-y-1">
        {recentSearches.map((query, index) => (
          <button
            key={index}
            onClick={() => onSearchSelect(query)}
            className="w-full text-left px-3 py-2 text-sm bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 text-blue-200 hover:text-white hover:from-blue-600/20 hover:to-cyan-600/20 hover:border-blue-400/40 rounded-md transition-all duration-200 hover:scale-102 hover:shadow-md hover:shadow-blue-500/25 group"
          >
            <span className="group-hover:text-cyan-300 transition-colors duration-200">🔍 {query}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Saved Searches Component
 */
interface SavedSearchesProps {
  onSavedSearchSelect: (query: string) => void;
}

function SavedSearches({ onSavedSearchSelect }: SavedSearchesProps) {
  const { isAuthenticated, isReady } = useAuth();
  const { savedSearches } = useUnifiedSearch();

  // Only show saved searches if user is authenticated
  if (!isAuthenticated || !isReady || savedSearches.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="text-xs font-bold text-yellow-300 mb-2 flex items-center">
        <Star className="w-3 h-3 mr-1 animate-pulse" />
        ⭐ Favorite Spells
      </div>
      <div className="space-y-1">
        {savedSearches.slice(0, 3).map((savedSearch) => (
          <button
            key={savedSearch.Id}
            onClick={() => onSavedSearchSelect(savedSearch.SearchQuery.Query)}
            className="w-full text-left px-3 py-2 text-sm bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 text-yellow-200 hover:text-white hover:from-yellow-600/20 hover:to-orange-600/20 hover:border-yellow-400/40 rounded-md transition-all duration-200 hover:scale-102 hover:shadow-md hover:shadow-yellow-500/25 group"
          >
            <div className="font-medium group-hover:text-yellow-300 transition-colors duration-200">✨ {savedSearch.Name}</div>
            <div className="text-xs text-yellow-400/70 group-hover:text-yellow-300/90 transition-colors duration-200">&ldquo;{savedSearch.SearchQuery.Query}&rdquo;</div>
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Only initialize search hook when authenticated to prevent unnecessary API calls
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
  // EVENT HANDLERS
  // ================================

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setShowingResults(false);
      return;
    }

    setQuery(searchQuery);
    setShowingResults(true);
    
    // Get suggestions
    const newSuggestions = await getSuggestions(searchQuery);
    setSuggestions(newSuggestions);
    
    // Perform quick search
    await search(searchQuery);
    setSelectedIndex(0);
  }, [getSuggestions, search]);

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
    
    // Navigate based on entity type
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
      default:
        router.push('/search');
    }
  }, [router, onClose]);

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
        className="max-w-2xl p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-0">
          {/* Accessibility - Hidden title and description */}
          <DialogTitle className="sr-only">
            Global Search
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search across all content including tasks, families, achievements, boards, notifications, and activities. Use keyboard navigation with arrow keys and Enter to select results.
          </DialogDescription>
          
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm">
            <div className="relative">
              <Search className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0 animate-pulse" />
              <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="🔍 Search your quest..."
              className="border-0 bg-transparent text-lg placeholder:text-purple-300/70 focus:ring-0 focus:outline-none flex-1 text-white font-medium"
            />
            
            {/* Keyboard hint with gaming style */}
            <div className="flex items-center space-x-1 text-xs text-purple-300 flex-shrink-0">
              <kbd className="px-1.5 py-0.5 bg-purple-800/50 border border-purple-500/30 rounded text-xs font-mono shadow-inner">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-purple-800/50 border border-purple-500/30 rounded text-xs font-mono shadow-inner">
                K
              </kbd>
            </div>
          </div>
        </DialogHeader>

        {/* Content with gaming background */}
        <div className="max-h-96 overflow-y-auto bg-gradient-to-b from-slate-800/50 to-slate-900/80 backdrop-blur-sm">
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
              
              {/* Quick Actions with gaming style */}
              <div className="px-4 py-2 border-t border-purple-500/20 mt-2">
                <div className="text-xs font-bold text-purple-300 mb-2 flex items-center">
                  ⚡ Quick Actions
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-purple-400">
                    🔍 Start typing to discover your quests!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results with gaming theme */
            <div className="py-2">
              {searchState.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-8 h-8 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-sm text-purple-200 font-medium animate-pulse">🔍 Scanning the realm...</span>
                  </div>
                </div>
              ) : allItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 animate-bounce">🕵️</div>
                  <p className="text-sm text-purple-300 font-medium">
                    No treasures found for &ldquo;<span className="text-yellow-400">{query}</span>&rdquo;
                  </p>
                  <p className="text-xs text-purple-400 mt-2">
                    Try a different search spell! ✨
                  </p>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {allItems.map((item, index) => {
                    if (item.type === 'suggestion') {
                      const suggestion = item.data as SearchSuggestionDTO;
                      return (
                        <button
                          key={`suggestion-${index}`}
                          onClick={() => handleItemSelect(item)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left transition-all duration-200",
                            "flex items-center justify-between group",
                            "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/20",
                            "hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-400/40",
                            "hover:scale-102 hover:shadow-lg hover:shadow-purple-500/25",
                            selectedIndex === index
                              ? "from-purple-600/30 to-blue-600/30 border-purple-400/60 shadow-lg shadow-purple-500/30 scale-102"
                              : ""
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Search className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                              <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-sm text-purple-100 group-hover:text-white font-medium">
                              {suggestion.Text}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-purple-800/50 border-purple-500/40 text-purple-300">
                            💡 suggestion
                          </Badge>
                        </button>
                      );
                    } else {
                      const result = item.data as SearchResultItemDTO;
                      return (
                        <QuickResult
                          key={`result-${result.EntityType ?? 'unknown'}-${result.Id ?? `fallback-${index}`}`}
                          result={result}
                          onSelect={handleResultClick}
                          isSelected={selectedIndex === index}
                        />
                      );
                    }
                  })}
                </div>
              )}

              {/* Footer - Results summary with gaming style */}
              {showingResults && query.trim() && allItems.length > 0 && (
                <div className="px-4 py-2 border-t border-purple-500/20 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-purple-300">
                      🌟 Found {allItems.length} result{allItems.length !== 1 ? 's' : ''} for &ldquo;<span className="text-yellow-400">{query}</span>&rdquo;
                    </p>
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