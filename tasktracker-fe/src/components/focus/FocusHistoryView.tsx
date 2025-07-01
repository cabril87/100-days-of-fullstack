/*
 * Enterprise Focus History View Component
 * Copyright (c) 2025 Carlos Abril Jr
 * Following .cursorrules Enterprise Standards
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  History, 
  Clock, 
  Target, 
  Search,
  RefreshCw,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ✅ EXPLICIT TYPES: Following .cursorrules requirements
import type { 
  FocusSession, 
  FocusSessionStatus 
} from '@/lib/types/focus';

// ✅ ENTERPRISE SERVICES: Real API integration
import { focusService } from '@/lib/services/focusService';

// ================================
// EXPLICIT TYPESCRIPT INTERFACES - NO ANY TYPES
// ================================

interface FocusHistoryViewProps {
  userId: number;
  className?: string;
  onSessionSelect?: (session: FocusSession) => void;
}

interface HistoryState {
  sessions: FocusSession[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface FilterOptions {
  search: string;
  status: FocusSessionStatus | 'all';
}

// ================================
// ENTERPRISE HISTORY CONFIGURATION
// ================================

const SESSION_STATUS_CONFIG: Record<FocusSessionStatus | 'all', {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  'InProgress': {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-200',
    icon: Play,
  },
  'Paused': {
    label: 'Paused',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 border-yellow-200',
    icon: Pause,
  },
  'Completed': {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-200',
    icon: CheckCircle,
  },
  'Interrupted': {
    label: 'Interrupted',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-200',
    icon: XCircle,
  },
  'all': {
    label: 'All Sessions',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-200',
    icon: History,
  },
};

// ================================
// ENTERPRISE FOCUS HISTORY COMPONENT
// ================================

export default function FocusHistoryView({
  userId,
  className = '',
  onSessionSelect
}: FocusHistoryViewProps): React.ReactElement {

  const [historyState, setHistoryState] = useState<HistoryState>({
    sessions: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
  });

  // Responsive hook available if needed for future enhancements

  // ================================
  // DATA FETCHING - REAL API CALLS
  // ================================

  const loadHistoryData = useCallback(async () => {
    if (!userId) return;

    setHistoryState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const sessions = await focusService.getFocusHistory();

      setHistoryState(prev => ({
        ...prev,
        sessions,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      }));

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session history';
      setHistoryState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error('Failed to load session history');
    }
  }, [userId]);

  // ================================
  // FILTERING LOGIC - ENTERPRISE MEMO OPTIMIZATION
  // ================================

  const filteredSessions = useMemo(() => {
    let filtered = [...historyState.sessions];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(session => 
        session.taskItem?.title?.toLowerCase().includes(searchTerm) ||
        session.taskItem?.description?.toLowerCase().includes(searchTerm) ||
        session.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Sort by most recent first
    filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return filtered;
  }, [historyState.sessions, filters.search, filters.status]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // ================================
  // RENDER HELPERS
  // ================================

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderSessionCard = (session: FocusSession): React.ReactElement => {
    const statusConfig = SESSION_STATUS_CONFIG[session.status];
    const StatusIcon = statusConfig.icon;

    return (
      <Card 
        key={session.id}
        className="transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.98]"
        onClick={() => onSessionSelect?.(session)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {session.taskItem?.title || `Session #${session.id}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(session.startTime)}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={`${statusConfig.bgColor} ${statusConfig.color} text-xs shrink-0`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(session.durationMinutes)}</span>
              </div>
              
              {session.taskItem && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Task #{session.taskItem.id}</span>
                </div>
              )}
            </div>

            {/* Progress Bar (if applicable) */}
            {session.taskProgressAfter > session.taskProgressBefore && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Task Progress</span>
                  <span className="font-medium">
                    {session.taskProgressBefore}% → {session.taskProgressAfter}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${session.taskProgressAfter}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notes Preview */}
            {session.notes && (
              <p className="text-xs text-muted-foreground italic truncate">
                &ldquo;{session.notes}&rdquo;
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ================================
  // ERROR STATE HANDLING
  // ================================

  if (historyState.error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Failed to Load History
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {historyState.error}
              </p>
              <Button 
                onClick={loadHistoryData}
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================
  // EMPTY STATE HANDLING
  // ================================

  if (!historyState.isLoading && historyState.sessions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <History className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
              <p className="text-muted-foreground">
                Start your first focus session to see your history here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================
  // MAIN RENDER
  // ================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Session History
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredSessions.length} of {historyState.sessions.length} sessions
          </p>
        </div>
        
        <Button
          onClick={loadHistoryData}
          variant="outline"
          size="sm"
          disabled={historyState.isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${historyState.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SESSION_STATUS_CONFIG) as (FocusSessionStatus | 'all')[]).map((status) => (
                <Button
                  key={status}
                  variant={filters.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                  className="text-xs h-8"
                >
                  {SESSION_STATUS_CONFIG[status].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-3">
        {historyState.isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSessions.length === 0 ? (
          // No filtered results
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No sessions match your filters</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          // Session cards
          filteredSessions.map(renderSessionCard)
        )}
      </div>

      {historyState.lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {historyState.lastUpdated.toLocaleString()}
        </p>
      )}
    </div>
  );
}
