/*
 * SearchBar Component
 * Enterprise-grade search interface with gamification styling
 * Features: Auto-complete, suggestions, entity filters, keyboard shortcuts
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Filter, Sparkles, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  SearchBarProps,
  SearchEntityTypeDTO,
  SearchSuggestionDTO,
  SearchSuggestionTypeDTO
} from '@/lib/types/search';

/**
 * Enterprise Search Bar Component
 * Beautiful, responsive search interface with gamification elements
 */
export function SearchBar({
  onSearch,
  onSuggestionSelect,
  placeholder = "🔍 Search tasks, families, achievements...",
  suggestions = [],
  isLoading = false,
  autoFocus = false,
  showEntityFilters = true,
  defaultEntityTypes = [
    SearchEntityTypeDTO.Tasks,
    SearchEntityTypeDTO.Families,
    SearchEntityTypeDTO.Achievements,
    SearchEntityTypeDTO.Boards,
    SearchEntityTypeDTO.Notifications,
    SearchEntityTypeDTO.Activities,
    SearchEntityTypeDTO.Tags,
    SearchEntityTypeDTO.Categories,
    SearchEntityTypeDTO.Templates
  ],
  className
}: SearchBarProps) {
  // State management
  const [query, setQuery] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<SearchEntityTypeDTO[]>(defaultEntityTypes);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Entity type configuration
  const entityTypeConfig = {
    [SearchEntityTypeDTO.Tasks]: { 
      label: 'Tasks', 
      icon: '✅', 
      color: 'bg-gradient-to-r from-green-500 to-emerald-500' 
    },
    [SearchEntityTypeDTO.Families]: { 
      label: 'Families', 
      icon: '👨‍👩‍👧‍👦', 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500' 
    },
    [SearchEntityTypeDTO.Achievements]: { 
      label: 'Achievements', 
      icon: '🏆', 
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500' 
    },
    [SearchEntityTypeDTO.Boards]: { 
      label: 'Boards', 
      icon: '📋', 
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500' 
    },
    [SearchEntityTypeDTO.Notifications]: { 
      label: 'Notifications', 
      icon: '🔔', 
      color: 'bg-gradient-to-r from-red-500 to-pink-500' 
    },
    [SearchEntityTypeDTO.Activities]: { 
      label: 'Activities', 
      icon: '📊', 
      color: 'bg-gradient-to-r from-teal-500 to-green-500' 
    },
    [SearchEntityTypeDTO.Tags]: { 
      label: 'Tags', 
      icon: '🏷️', 
      color: 'bg-gradient-to-r from-pink-500 to-rose-500' 
    },
    [SearchEntityTypeDTO.Categories]: { 
      label: 'Categories', 
      icon: '📁', 
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500' 
    },
    [SearchEntityTypeDTO.Templates]: { 
      label: 'Templates', 
      icon: '📄', 
      color: 'bg-gradient-to-r from-slate-500 to-gray-500' 
    }
  };

  // Suggestion type configuration
  const suggestionTypeConfig = {
    [SearchSuggestionTypeDTO.QueryCompletion]: { 
      icon: <Sparkles className="w-3 h-3 text-blue-500" />, 
      label: 'Complete' 
    },
    [SearchSuggestionTypeDTO.DidYouMean]: { 
      icon: <Zap className="w-3 h-3 text-yellow-500" />, 
      label: 'Did you mean' 
    },
    [SearchSuggestionTypeDTO.RelatedTerms]: { 
      icon: <Search className="w-3 h-3 text-green-500" />, 
      label: 'Related' 
    },
    [SearchSuggestionTypeDTO.PopularSearch]: { 
      icon: <Clock className="w-3 h-3 text-purple-500" />, 
      label: 'Popular' 
    },
    [SearchSuggestionTypeDTO.EntitySuggestion]: { 
      icon: <Filter className="w-3 h-3 text-indigo-500" />, 
      label: 'Entity' 
    }
  };

  // ================================
  // EVENT HANDLERS
  // ================================

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [query, onSearch]);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestionDTO) => {
    setQuery(suggestion.Text);
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [onSuggestionSelect]);

  const handleEntityTypeToggle = useCallback((entityType: SearchEntityTypeDTO) => {
    setSelectedEntityTypes(prev => {
      if (prev.includes(entityType)) {
        // Remove the entity type
        const updated = prev.filter(type => type !== entityType);
        // If no types selected, select all types
        return updated.length === 0 ? defaultEntityTypes : updated;
      } else {
        // Add the entity type
        return [...prev, entityType];
      }
    });
  }, [defaultEntityTypes]);

  // ================================
  // KEYBOARD NAVIGATION
  // ================================

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSearch, handleSuggestionClick]);

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (suggestions.length > 0 && isFocused) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, isFocused]);

  // ================================
  // RENDER
  // ================================

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      {/* Main Search Container */}
      <div 
        className={cn(
          "relative group",
          "bg-white dark:bg-gray-800",
          "border-2 rounded-xl shadow-lg",
          "transition-all duration-300 ease-in-out",
          isFocused 
            ? "border-blue-500 shadow-xl ring-4 ring-blue-500/20" 
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        )}
      >
        {/* Search Input */}
        <div className="flex items-center p-3">
          <Search 
            className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isFocused ? "text-blue-500" : "text-gray-400"
            )}
          />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent text-base placeholder:text-gray-500 focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="mr-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="mr-2 p-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </Button>
          )}

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Entity Type Filters */}
        {showEntityFilters && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Search in:
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    {selectedEntityTypes.length === 1 
                      ? entityTypeConfig[selectedEntityTypes[0]].label
                      : `${selectedEntityTypes.length} types`
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Entity Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(entityTypeConfig).map(([type, config]) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedEntityTypes.includes(type as unknown as SearchEntityTypeDTO)}
                      onCheckedChange={() => handleEntityTypeToggle(type as unknown as SearchEntityTypeDTO)}
                    >
                      <span className="mr-2">{config.icon}</span>
                      {config.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEntityTypes.map(type => {
                const config = entityTypeConfig[type];
                return (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={cn(
                      "text-white text-xs px-2 py-1 rounded-full",
                      config.color
                    )}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              Search Suggestions
            </div>
            
            {suggestions.map((suggestion, index) => {
              const typeConfig = suggestionTypeConfig[suggestion.Type];
              return (
                <button
                  key={`${suggestion.Type}-${suggestion.Text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors duration-150",
                    "flex items-center justify-between",
                    selectedSuggestionIndex === index
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <div className="mr-3">
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.Text}
                      </div>
                      {suggestion.EntityType && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {entityTypeConfig[suggestion.EntityType]?.icon} {entityTypeConfig[suggestion.EntityType]?.label}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-2">
                    <Badge variant="outline" className="text-xs">
                      {typeConfig.label}
                    </Badge>
                    {suggestion.Score > 0 && (
                      <div className="ml-2 text-xs text-gray-400">
                        {Math.round(suggestion.Score * 100)}%
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute -bottom-6 right-0 text-xs text-gray-400 hidden sm:block">
        Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑↓</kbd> to navigate, 
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs ml-1">Enter</kbd> to select
      </div>
    </div>
  );
}

export default SearchBar; 