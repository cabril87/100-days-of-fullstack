'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Calendar, Clock, Target, AlertTriangle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FocusSession, Distraction } from '@/lib/types/focus';

type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc';
type FilterOption = 'all' | 'completed' | 'interrupted' | 'in-progress';

export function FocusHistory() {
  const { 
    fetchHistory, 
    fetchSessionDistractions, 
    isLoading: contextLoading, 
    history: contextHistory 
  } = useFocus();
  
  const [history, setHistory] = useState<FocusSession[]>(contextHistory || []);
  const [filteredHistory, setFilteredHistory] = useState<FocusSession[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [sessionDistractions, setSessionDistractions] = useState<Record<number, Distraction[]>>({});

  // Load history data from API
  const loadHistory = useCallback(async () => {
    if (isDataLoading) return;

    setIsDataLoading(true);
    try {
      console.log('[FocusHistory] Loading history from API...');
      const historyData = await fetchHistory();
      
      if (historyData) {
        console.log('[FocusHistory] API returned', historyData.length, 'sessions');
        setHistory(historyData);
      } else {
        console.log('[FocusHistory] API returned no history data');
        setHistory([]);
      }
    } catch (error) {
      console.error('[FocusHistory] Error loading history:', error);
      setHistory([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [fetchHistory, isDataLoading]);

  // Load distractions for a specific session
  const loadSessionDistractions = useCallback(async (sessionId: number) => {
    if (sessionDistractions[sessionId]) return; // Already loaded

    try {
      console.log('[FocusHistory] Loading distractions for session', sessionId);
      const distractions = await fetchSessionDistractions(sessionId);
      
      setSessionDistractions(prev => ({
        ...prev,
        [sessionId]: distractions
      }));
      
      console.log('[FocusHistory] Loaded', distractions.length, 'distractions for session', sessionId);
    } catch (error) {
      console.error('[FocusHistory] Error loading distractions for session', sessionId, error);
      setSessionDistractions(prev => ({
        ...prev,
        [sessionId]: []
      }));
    }
  }, [fetchSessionDistractions, sessionDistractions]);

  // Filter and sort history based on user inputs
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...history];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        session.notes?.toLowerCase().includes(term) ||
        session.task?.title?.toLowerCase().includes(term) ||
        session.id.toString().includes(term)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(session => {
        switch (filterBy) {
          case 'completed':
            return session.status === 'Completed';
          case 'interrupted':
            return session.status === 'Interrupted';
          case 'in-progress':
            return session.status === 'InProgress';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'date-asc':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case 'duration-desc':
          return b.durationMinutes - a.durationMinutes;
        case 'duration-asc':
          return a.durationMinutes - b.durationMinutes;
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, sortBy, filterBy]);

  // Toggle expanded session details
  const toggleSessionExpansion = useCallback((sessionId: number) => {
    const newExpanded = new Set(expandedSessions);
    
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
      // Load distractions when expanding
      loadSessionDistractions(sessionId);
    }
    
    setExpandedSessions(newExpanded);
  }, [expandedSessions, loadSessionDistractions]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'InProgress':
        return 'secondary';
      case 'Interrupted':
        return 'destructive';
      case 'Paused':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Load data on mount
  useEffect(() => {
    if (contextHistory && contextHistory.length > 0) {
      setHistory(contextHistory);
    } else {
      loadHistory();
    }
  }, [contextHistory, loadHistory]);

  // Update context history changes
  useEffect(() => {
    if (contextHistory) {
      setHistory(contextHistory);
    }
  }, [contextHistory]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const isLoading = contextLoading || isDataLoading;

  if (isLoading && history.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading focus history from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy-dark">Focus History</h2>
        <p className="text-gray-600">Your complete focus session history from API</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sessions, tasks, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter by status */}
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="interrupted">Interrupted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort by */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="duration-desc">Longest First</SelectItem>
                <SelectItem value="duration-asc">Shortest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button 
              onClick={loadHistory} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Spinner size="sm" /> : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredHistory.length} of {history.length} sessions
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        {history.length > 0 && (
          <span>
            Total focus time: {formatDuration(history.reduce((sum, session) => sum + session.durationMinutes, 0))}
          </span>
        )}
      </div>

      {/* Session History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((session) => {
            const isExpanded = expandedSessions.has(session.id);
            const distractions = sessionDistractions[session.id] || [];

            return (
              <Card key={session.id} className="transition-all duration-200">
                <CardContent className="p-0">
                  {/* Session Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSessionExpansion(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(session.status)}>
                            {session.status}
                          </Badge>
                          <span className="text-sm text-gray-500">#{session.id}</span>
                        </div>
                        
                        <div>
                          <h3 className="font-medium">
                            {session.task?.title || `Task ${session.taskId}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center text-sm font-medium">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(session.durationMinutes)}
                          </div>
                          {session.notes && (
                            <p className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                              {session.notes}
                            </p>
                          )}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Session Details */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Session Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Start:</span>
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                            {session.endTime && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">End:</span>
                                <span>{formatDate(session.endTime)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span>{formatDuration(session.durationMinutes)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Task ID:</span>
                              <span>{session.taskId}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">
                            {session.notes || 'No notes for this session'}
                          </p>
                        </div>

                        {/* Distractions */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Distractions ({distractions.length})
                          </h4>
                          {distractions.length > 0 ? (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {distractions.map((distraction) => (
                                <div key={distraction.id} className="text-xs bg-white p-2 rounded border">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{distraction.description}</p>
                                      <p className="text-gray-500">{distraction.category}</p>
                                    </div>
                                    <span className="text-gray-400">
                                      {new Date(distraction.timestamp).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No distractions recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No matching sessions found' : 'No focus history yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Complete some focus sessions to see your history here'
                }
              </p>
              {(searchTerm || filterBy !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw API Data (Development) */}
      {process.env.NODE_ENV === 'development' && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Data (Dev Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary className="cursor-pointer text-sm font-medium mb-2">
                View {history.length} sessions from API
              </summary>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(history, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}