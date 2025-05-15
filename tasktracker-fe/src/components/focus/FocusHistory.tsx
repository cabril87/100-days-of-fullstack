'use client';

import { useState, useEffect } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FocusSession } from '@/lib/services/focusService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

export function FocusHistory() {
  const { fetchHistory, fetchSessionDistractions } = useFocus();
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);
  const [distractions, setDistractions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const sessions = await fetchHistory();
        setHistory(sessions);
      } catch (error) {
        console.error('Error loading focus history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [fetchHistory]);

  const handleViewDetails = async (session: FocusSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
    
    try {
      const distractionData = await fetchSessionDistractions(session.id);
      setDistractions(distractionData);
    } catch (error) {
      console.error('Error loading distractions:', error);
      setDistractions([]);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Group sessions by date
  const groupedSessions = history.reduce((groups: Record<string, FocusSession[]>, session) => {
    const date = new Date(session.startTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(session);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Focus Session History</CardTitle>
          <CardDescription>Your past focus sessions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedSessions).map(([date, sessions]) => (
                <div key={date} className="space-y-2">
                  <h3 className="font-medium text-gray-700 mb-2">{date}</h3>
                  <div className="space-y-2">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {session.task?.title || 'Unknown Task'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                session.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                session.status === 'Interrupted' ? 'bg-red-100 text-red-800' : 
                                session.status === 'Paused' ? 'bg-amber-100 text-amber-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatDate(session.startTime)} • {formatDuration(session.durationMinutes)}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(session)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't completed any focus sessions yet.</p>
              <Link href="/dashboard" className="text-brand-navy hover:underline">
                Start your first focus session
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Focus Session Details</DialogTitle>
            <DialogDescription>
              {selectedSession && formatDate(selectedSession.startTime)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Task</div>
                  <div className="font-medium">{selectedSession.task?.title || 'Unknown Task'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">{selectedSession.status}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{formatDuration(selectedSession.durationMinutes)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Started</div>
                  <div className="font-medium">{formatDate(selectedSession.startTime)}</div>
                </div>
                {selectedSession.endTime && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Ended</div>
                    <div className="font-medium">{formatDate(selectedSession.endTime)}</div>
                  </div>
                )}
                {selectedSession.notes && (
                  <div className="space-y-1 col-span-2">
                    <div className="text-sm text-gray-500">Notes</div>
                    <div className="font-medium">{selectedSession.notes}</div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">Distractions</h4>
                {distractions.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {distractions.map(distraction => (
                      <div key={distraction.id} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between">
                          <div className="font-medium">{distraction.description}</div>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {distraction.category}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(distraction.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No distractions recorded for this session.</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 