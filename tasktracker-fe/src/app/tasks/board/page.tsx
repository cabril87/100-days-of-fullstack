'use client';

import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/boards/KanbanBoard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useBoard } from '@/lib/providers/BoardProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, AlertTriangle } from 'lucide-react';

export default function BoardPage() {
  const { 
    state: { currentBoard, isLoading, error },
    fetchUserBoards,
    createBoard,
    clearErrors
  } = useBoard();
  
  const handleCreateBoard = async () => {
    try {
      clearErrors();
      await createBoard({
        name: 'New Board',
        description: 'A new task management board'
      });
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleRetry = async () => {
    try {
      clearErrors();
      await fetchUserBoards();
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading board...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !currentBoard) {
    return (
      <AuthGuard>
        <ErrorBoundary>
          <Card className="mx-auto max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {error || 'No Board Available'}
              </h2>
              <p className="text-muted-foreground">
                {error 
                  ? 'There was an error loading your board. Please try again.' 
                  : 'You don\'t have any boards yet. Create your first board to get started.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={handleCreateBoard} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Board
                </Button>
              </div>
            </CardContent>
          </Card>
        </ErrorBoundary>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ErrorBoundary>
        <div className="space-y-4">
          <KanbanBoard 
            boardId={currentBoard.id}
            showGamification={true}
            enableRealtime={true}
            className="max-w-full"
          />
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
} 