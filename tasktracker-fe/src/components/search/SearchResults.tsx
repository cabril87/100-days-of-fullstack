/*
 * SearchResults Component
 * Enterprise-grade search results display with gamification styling
 * Features: Entity grouping, load more, highlighting, result actions
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Calendar, 
  User, 
  Trophy, 
  Target, 
  Bell, 
  Activity, 
  ChevronDown, 
  ExternalLink,
  Clock,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SearchResultsProps,
  SearchEntityTypeDTO,
  SearchResultItemDTO,
  SearchResultGroupDTO
} from '@/lib/types/search';

/**
 * Individual Search Result Item Component
 */
interface SearchResultItemProps {
  result: SearchResultItemDTO;
  onResultClick: (result: SearchResultItemDTO) => void;
  onActionClick?: (result: SearchResultItemDTO, action: string) => void;
}

function SearchResultItem({ result, onResultClick, onActionClick }: SearchResultItemProps) {
  const entityConfig = {
    [SearchEntityTypeDTO.Tasks]: {
      icon: <Target className="w-4 h-4 text-green-500" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      actions: ['View', 'Edit', 'Complete']
    },
    [SearchEntityTypeDTO.Families]: {
      icon: <User className="w-4 h-4 text-blue-500" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      actions: ['View', 'Join', 'Invite']
    },
    [SearchEntityTypeDTO.Achievements]: {
      icon: <Trophy className="w-4 h-4 text-yellow-500" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      actions: ['View', 'Track', 'Share']
    },
    [SearchEntityTypeDTO.Boards]: {
      icon: <Activity className="w-4 h-4 text-purple-500" />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      actions: ['View', 'Edit', 'Share']
    },
    [SearchEntityTypeDTO.Notifications]: {
      icon: <Bell className="w-4 h-4 text-red-500" />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      actions: ['View', 'Mark Read', 'Archive']
    },
    [SearchEntityTypeDTO.Activities]: {
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
      actions: ['View', 'Join', 'Remind']
    }
  };

  const config = entityConfig[result.EntityType as keyof typeof entityConfig] || entityConfig[SearchEntityTypeDTO.Tasks];

  const handleActionClick = useCallback((action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick?.(result, action);
  }, [result, onActionClick]);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg",
        "border-l-4 hover:border-l-6",
        config.borderColor,
        config.bgColor
      )}
      onClick={() => onResultClick(result)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Entity Icon */}
            <div className="mt-1 flex-shrink-0">
              {config.icon}
            </div>

            {/* Result Content */}
            <div className="flex-1 min-w-0">
              {/* Title with highlighting */}
              <h3 
                className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                dangerouslySetInnerHTML={{ __html: result.Title }}
              />

              {/* Description with highlighting */}
              {result.Description && (
                <p 
                  className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.Description }}
                />
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                {result.UpdatedAt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(result.UpdatedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {result.Score > 0 && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{Math.round(result.Score * 100)}% match</span>
                  </div>
                )}

                {result.EntityData?.familyName ? (
                  <Badge variant="outline" className="text-xs">
                    {String(result.EntityData.familyName)}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {config.actions.map((action: string) => (
                <DropdownMenuItem
                  key={action}
                  onClick={(e) => handleActionClick(action, e)}
                >
                  {action}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={(e) => handleActionClick('Open in New Tab', e)}>
                <ExternalLink className="w-3 h-3 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Search Result Group Component
 */
interface SearchResultGroupProps {
  group: SearchResultGroupDTO;
  onResultClick: (result: SearchResultItemDTO) => void;
  onLoadMore?: (entityType: SearchEntityTypeDTO) => void;
  onActionClick?: (result: SearchResultItemDTO, action: string) => void;
  isLoading?: boolean;
}

function SearchResultGroup({ 
  group, 
  onResultClick, 
  onLoadMore, 
  onActionClick,
  isLoading = false 
}: SearchResultGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

    const entityConfig = {
    [SearchEntityTypeDTO.Tasks]: { 
      label: 'Tasks', 
      icon: '✅', 
      gradient: 'from-green-500 to-emerald-500' 
    },
    [SearchEntityTypeDTO.Families]: { 
      label: 'Families', 
      icon: '👨‍👩‍👧‍👦', 
      gradient: 'from-blue-500 to-cyan-500' 
    },
    [SearchEntityTypeDTO.Achievements]: { 
      label: 'Achievements', 
      icon: '🏆', 
      gradient: 'from-yellow-500 to-orange-500' 
    },
    [SearchEntityTypeDTO.Boards]: { 
      label: 'Boards', 
      icon: '📋', 
      gradient: 'from-indigo-500 to-purple-500' 
    },
    [SearchEntityTypeDTO.Notifications]: { 
      label: 'Notifications', 
      icon: '🔔', 
      gradient: 'from-red-500 to-pink-500' 
    },
    [SearchEntityTypeDTO.Activities]: { 
      label: 'Activities', 
      icon: '📊', 
      gradient: 'from-teal-500 to-green-500' 
    },
    [SearchEntityTypeDTO.Tags]: { 
      label: 'Tags', 
      icon: '🏷️', 
      gradient: 'from-pink-500 to-rose-500' 
    },
    [SearchEntityTypeDTO.Categories]: { 
      label: 'Categories', 
      icon: '📁', 
      gradient: 'from-amber-500 to-yellow-500' 
    },
    [SearchEntityTypeDTO.Templates]: { 
      label: 'Templates', 
      icon: '📄', 
      gradient: 'from-slate-500 to-gray-500' 
    }
  };

  const config = entityConfig[group.EntityType];

  const handleLoadMore = useCallback(() => {
    onLoadMore?.(group.EntityType);
  }, [group.EntityType, onLoadMore]);

  return (
    <div className="mb-6">
      {/* Group Header */}
      <div 
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
            `bg-gradient-to-r ${config.gradient}`
          )}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {group.TotalCount} result{group.TotalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Results count badge */}
          <Badge 
            variant="secondary" 
            className={cn(
              "text-white",
              `bg-gradient-to-r ${config.gradient}`
            )}
          >
            {group.Results.length}/{group.TotalCount}
          </Badge>

          {/* Expand/Collapse button */}
          <Button variant="ghost" size="sm" className="p-1">
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                !isExpanded && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Group Results */}
      {isExpanded && (
        <div className="border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg bg-gray-50 dark:bg-gray-900 p-4">
          {group.Results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found for {config.label.toLowerCase()}
            </div>
          ) : (
            <div className="space-y-3">
              {group.Results.map((result, index) => (
                <SearchResultItem
                  key={`${result.EntityType}-${result.Id}-${index}`}
                  result={result}
                  onResultClick={onResultClick}
                  onActionClick={onActionClick}
                />
              ))}

              {/* Load More Button */}
              {group.HasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="hover:bg-white dark:hover:bg-gray-800"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Load {Math.min(10, group.TotalCount - group.Results.length)} more {config.label.toLowerCase()}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Main Search Results Component
 */
export function SearchResults({
  results,
  onResultClick,
  onLoadMore,
  isLoading = false,
  executionTime = 0,
  totalCount = 0,
  className
}: SearchResultsProps) {
  if (!results || results.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Search Stats */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Found {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''} 
              {executionTime > 0 && ` in ${executionTime}ms`}
            </p>
          </div>

          {/* Performance indicator */}
          {executionTime > 0 && (
            <div className="flex items-center space-x-2">
              <Zap className={cn(
                "w-4 h-4",
                executionTime < 100 ? "text-green-500" :
                executionTime < 500 ? "text-yellow-500" : "text-red-500"
              )} />
              <span className={cn(
                "text-sm font-medium",
                executionTime < 100 ? "text-green-600 dark:text-green-400" :
                executionTime < 500 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
              )}>
                {executionTime < 100 ? "Fast" : executionTime < 500 ? "Good" : "Slow"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Groups */}
      <div className="space-y-6">
        {results.map((group, index) => (
          <SearchResultGroup
            key={`${group.EntityType}-${index}`}
            group={group}
            onResultClick={onResultClick}
            onLoadMore={onLoadMore}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-300">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults; 