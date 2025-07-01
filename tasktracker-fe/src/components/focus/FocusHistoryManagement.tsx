'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { focusService } from '@/lib/services/focusService';
import type { 
  FocusSession,
  BulkDeleteResult,
  ClearHistoryResult,
  FocusHistoryExport
} from '@/lib/types/focus';
import type { 
  FocusHistoryManagementProps
} from '@/lib/types/focus-components';
import { 
  History,
  Trash2,
  Download,
  Search,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  FileText,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

/**
 * Enterprise Focus History Management Component
 * Mobile-first responsive design with comprehensive delete/export operations
 * Includes bulk operations, confirmation flows, and real-time updates
 */
export default function FocusHistoryManagement({
  className,
  sessions: initialSessions = [],
  onSessionsChange,
  showExportOptions = true,
  showBulkOperations = true
}: FocusHistoryManagementProps) {
  
  // ============================================================================
  // STATE MANAGEMENT - ENTERPRISE PATTERNS
  // ============================================================================
  
  const [sessions, setSessions] = useState<FocusSession[]>(initialSessions);
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Operation states
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [deleteDate, setDeleteDate] = useState<string>('');
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      session.taskItem?.title?.toLowerCase().includes(query) ||
      session.taskItem?.description?.toLowerCase().includes(query) ||
      session.notes?.toLowerCase().includes(query) ||
      session.id.toString().includes(query)
    );
  });

  const selectedSessionsArray = Array.from(selectedSessions);
  const isAllSelected = filteredSessions.length > 0 && selectedSessions.size === filteredSessions.length;
  const isSomeSelected = selectedSessions.size > 0 && selectedSessions.size < filteredSessions.length;

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  const toggleSessionSelection = useCallback((sessionId: number) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
    }
  }, [isAllSelected, filteredSessions]);

  const clearSelection = useCallback(() => {
    setSelectedSessions(new Set());
  }, []);

  // ============================================================================
  // DELETE OPERATIONS - ENTERPRISE PATTERNS
  // ============================================================================

  const handleDeleteSession = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    try {
      const success = await focusService.deleteFocusSession(sessionId);
      
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setSelectedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
        
        toast.success('🗑️ Focus session deleted successfully');
        onSessionsChange?.(sessions.filter(s => s.id !== sessionId));
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      toast.error('Failed to delete focus session');
      setError('Failed to delete session');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setSessionToDelete(null);
    }
  }, [sessions, onSessionsChange]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedSessionsArray.length === 0) return;
    
    setIsLoading(true);
    try {
      const result: BulkDeleteResult = await focusService.bulkDeleteFocusSessions(selectedSessionsArray);
      
      // Update sessions list by removing successfully deleted ones
      setSessions(prev => prev.filter(s => !result.successfulDeletes.includes(s.id)));
      setSelectedSessions(new Set());
      
      const successMessage = `✅ Deleted ${result.successCount}/${result.requestedCount} sessions`;
      if (result.failedCount > 0) {
        toast.warning(`${successMessage}. ${result.failedCount} failed.`);
      } else {
        toast.success(successMessage);
      }
      
      onSessionsChange?.(sessions.filter(s => !result.successfulDeletes.includes(s.id)));
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('Failed to delete selected sessions');
      setError('Bulk delete operation failed');
    } finally {
      setIsLoading(false);
      setShowBulkDeleteDialog(false);
    }
  }, [selectedSessionsArray, sessions, onSessionsChange]);

  const handleClearHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const beforeDate = deleteDate ? new Date(deleteDate) : undefined;
      const result: ClearHistoryResult = await focusService.clearFocusHistory(beforeDate);
      
      // Update sessions list
      if (beforeDate) {
        setSessions(prev => prev.filter(s => new Date(s.startTime) > beforeDate));
      } else {
        setSessions([]);
      }
      setSelectedSessions(new Set());
      
      toast.success(`🧹 Cleared ${result.deletedSessionCount} sessions (${result.totalHoursDeleted.toFixed(1)}h)`);
      onSessionsChange?.(beforeDate ? sessions.filter(s => new Date(s.startTime) > beforeDate) : []);
    } catch (error) {
      console.error('❌ Clear history failed:', error);
      toast.error('Failed to clear focus history');
      setError('Clear history operation failed');
    } finally {
      setIsLoading(false);
      setShowClearHistoryDialog(false);
      setDeleteDate('');
    }
  }, [deleteDate, sessions, onSessionsChange]);

  // ============================================================================
  // EXPORT OPERATIONS
  // ============================================================================

  const handleExportHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = exportDateRange.startDate ? new Date(exportDateRange.startDate) : undefined;
      const endDate = exportDateRange.endDate ? new Date(exportDateRange.endDate) : undefined;
      
      const exportData: FocusHistoryExport = await focusService.exportFocusHistory(startDate, endDate);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `focus-history-${exportData.startDate.toISOString().split('T')[0]}-to-${exportData.endDate.toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`📄 Exported ${exportData.totalSessions} sessions (${exportData.totalMinutes}min)`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      toast.error('Failed to export focus history');
      setError('Export operation failed');
    } finally {
      setIsLoading(false);
      setShowExportDialog(false);
    }
  }, [exportDateRange]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'Interrupted': return <XCircle className="h-3 w-3 text-red-600" />;
      case 'Paused': return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <History className="h-5 w-5" />
                Focus History Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredSessions.length} sessions • {selectedSessions.size} selected
              </p>
            </div>
            
            {/* Mobile-optimized action buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {showExportOptions && (
                <Button
                  onClick={() => setShowExportDialog(true)}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] touch-manipulation"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              
              {showBulkOperations && selectedSessions.size > 0 && (
                <Button
                  onClick={() => setShowBulkDeleteDialog(true)}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] touch-manipulation bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedSessions.size})
                </Button>
              )}
              
              <Button
                onClick={() => setShowClearHistoryDialog(true)}
                variant="outline"
                size="sm"
                className="min-h-[44px] touch-manipulation bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search & Selection Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions by task, notes, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px] touch-manipulation"
              />
            </div>
            
            {showBulkOperations && filteredSessions.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  className="touch-manipulation"
                  ref={(element) => {
                    if (element) {
                      // Find the actual input element within the checkbox component
                      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
                      if (input) {
                        input.indeterminate = isSomeSelected && !isAllSelected;
                      }
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Select All
                </span>
                
                {selectedSessions.size > 0 && (
                  <Button
                    onClick={clearSelection}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-3">
        {isLoading && filteredSessions.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Focus Sessions Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No sessions match your search criteria.' : 'Start your first focus session to see it here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card 
              key={session.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                selectedSessions.has(session.id) && "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start gap-3">
                    {showBulkOperations && (
                      <Checkbox
                        checked={selectedSessions.has(session.id)}
                        onCheckedChange={() => toggleSessionSelection(session.id)}
                        className="mt-1 touch-manipulation"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {session.taskItem?.title || `Session #${session.id}`}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(session.startTime)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{session.status}</span>
                          </Badge>
                          
                          <Button
                            onClick={() => {
                              setSessionToDelete(session.id);
                              setShowDeleteDialog(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 touch-manipulation"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
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
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{session.startTime.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div className="ml-6 text-xs text-muted-foreground bg-gray-50 rounded p-2">
                      &ldquo;{session.notes}&rdquo;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Single Session Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Focus Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this focus session? This action cannot be undone.
            </p>
            
            {sessionToDelete && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">
                  Session #{sessionToDelete}
                </p>
                {sessions.find(s => s.id === sessionToDelete) && (
                  <p className="text-xs text-red-700 mt-1">
                    {sessions.find(s => s.id === sessionToDelete)?.taskItem?.title}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setSessionToDelete(null);
              }}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Selected Sessions
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {selectedSessions.size} selected focus sessions? 
              This action cannot be undone.
            </p>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900">
                {selectedSessions.size} sessions will be permanently deleted
              </p>
              <p className="text-xs text-red-700 mt-1">
                Total time: {selectedSessionsArray.reduce((acc, id) => {
                  const session = sessions.find(s => s.id === id);
                  return acc + (session?.durationMinutes || 0);
                }, 0)} minutes
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowBulkDeleteDialog(false)}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : `Delete ${selectedSessions.size} Sessions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear History Dialog */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Clear Focus History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose to clear all history or sessions before a specific date.
            </p>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Delete sessions before (optional):
              </label>
              <Input
                type="date"
                value={deleteDate}
                onChange={(e) => setDeleteDate(e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to delete ALL focus session history
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Consider exporting your data first
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowClearHistoryDialog(false);
                setDeleteDate('');
              }}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearHistory}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Clearing...' : 'Clear History'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Export Focus History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your focus session data as JSON for backup or analysis.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Start Date (optional):</label>
                <Input
                  type="date"
                  value={exportDateRange.startDate}
                  onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full mt-1"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">End Date (optional):</label>
                <Input
                  type="date"
                  value={exportDateRange.endDate}
                  onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full mt-1"
                  max={new Date().toISOString().split('T')[0]}
                  min={exportDateRange.startDate}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Leave dates empty to export all sessions (last 90 days by default)
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                📄 JSON Export Format
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Includes session details, statistics, and metadata
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowExportDialog(false);
                setExportDateRange({ startDate: '', endDate: '' });
              }}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportHistory}
              disabled={isLoading}
            >
              {isLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 