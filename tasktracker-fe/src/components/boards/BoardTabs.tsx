'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/helpers/utils/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

// Types and Services
import { BoardTabsProps } from '@/lib/props/components/boards.props';
import { BoardTabType } from '@/lib/types/boards/board-tabs';
import { BoardDTO } from '@/lib/types/boards';
import { BoardService } from '@/lib/services/boardService';

// Tab Components
import { TabNavigation } from './tabs/TabNavigation';
import { MobileTabBar } from './tabs/MobileTabBar';
import { BoardTabContent } from './tabs/BoardTabContent';
import { SettingsTabContent } from './tabs/SettingsTabContent';

export const BoardTabs: React.FC<BoardTabsProps> = ({
  boardId,
  initialTab = 'board',
  className
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BoardTabType>((initialTab as BoardTabType) || 'board');
  const [board, setBoard] = useState<BoardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const boardData = await BoardService.getBoardById(boardId);
        setBoard(boardData.board);
      } catch (err) {
        console.error('Failed to load board:', err);
        setError('Failed to load board details');
        toast.error('Failed to load board details');
        
        // Redirect to boards list if board not found
        setTimeout(() => {
          router.push('/boards');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, router]);

  const handleBoardUpdate = async () => {
    try {
      const boardData = await BoardService.getBoardById(boardId);
      setBoard(boardData.board);
      toast.success('Board updated successfully');
    } catch (err) {
      console.error('Failed to refresh board:', err);
      toast.error('Failed to refresh board data');
    }
  };

  const handleBoardDelete = () => {
    toast.success('Board deleted successfully');
    router.push('/boards');
  };

  const handleTabChange = (tab: BoardTabType) => {
    setActiveTab(tab);
  };

  const handleBackToBoards = () => {
    router.push('/boards');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden bg-background border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>

        {/* Desktop Header Skeleton */}
        <div className="hidden lg:block bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="bg-background border-b border-border">
          <div className="px-4 lg:px-6">
            <div className="flex gap-1 lg:gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-24 lg:w-32" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 lg:p-6">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Board Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The board you\'re looking for doesn\'t exist or has been deleted.'}
          </p>
          <Button onClick={handleBackToBoards} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Boards
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToBoards}
            className="p-2 hover:bg-accent text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {board.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToBoards}
            className="p-2 hover:bg-accent text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {board.name}
            </h1>
            {board.description && (
              <p className="text-muted-foreground text-sm">
                {board.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-background border-b border-border">
        {/* Desktop Tabs */}
        <div className="hidden lg:block px-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 lg:p-6 bg-muted/30">
        {activeTab === 'board' && (
          <BoardTabContent
            board={board}
            onBoardUpdate={handleBoardUpdate}
            onBoardDelete={handleBoardDelete}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTabContent
            board={board}
            onBoardUpdate={handleBoardUpdate}
            onBoardDelete={handleBoardDelete}
          />
        )}
      </div>
    </div>
  );
}; 

