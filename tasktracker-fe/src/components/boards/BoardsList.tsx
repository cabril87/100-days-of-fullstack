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
import { BoardDTO, BOARD_TEMPLATES, BoardTemplate } from '../../lib/types/board';
import { BoardService } from '../../lib/services/boardService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import {
  Plus,
  Calendar,
  Target,
  Trophy,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { CreateBoardModal } from './CreateBoardModal';

export const BoardsList: React.FC = () => {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load boards
  const loadBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const boardsData = await BoardService.getBoards();
      setBoards(boardsData);
    } catch (err) {
      console.error('Error loading boards:', err);
      setError('Failed to load boards');
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  // Handle board creation
  const handleBoardCreated = () => {
    setShowCreateBoard(false);
    setShowTemplates(false);
    loadBoards();
    toast.success('🎯 Board created successfully!');
  };

  // Handle board actions
  const handleViewBoard = (boardId: number) => {
    router.push(`/boards/${boardId}`);
  };

  const handleDuplicateBoard = async (board: BoardDTO) => {
    try {
      const newBoard = await BoardService.duplicateBoard(board.id, `${board.name} (Copy)`);
      await loadBoards();
      toast.success(`📋 Board "${board.name}" duplicated successfully!`);
      router.push(`/boards/${newBoard.id}`);
    } catch (error) {
      console.error('Error duplicating board:', error);
      toast.error('Failed to duplicate board');
    }
  };

  const handleDeleteBoard = async (board: BoardDTO) => {
    if (!confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await BoardService.deleteBoard(board.id);
      await loadBoards();
      toast.success(`🗑️ Board "${board.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  };

  // Create board from template
  const handleCreateFromTemplate = async (template: BoardTemplate) => {
    try {
      const newBoard = await BoardService.createBoard({
        Name: template.name,
        Description: template.description,
        Columns: template.columns,
      });
      
      setShowTemplates(false);
      await loadBoards();
      toast.success(`🎯 Board created from "${template.name}" template!`);
      router.push(`/boards/${newBoard.id}`);
    } catch (error) {
      console.error('Error creating board from template:', error);
      toast.error('Failed to create board from template');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg font-semibold mb-2">
          Failed to load boards
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadBoards} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your Quest Boards</h2>
          <p className="text-sm text-muted-foreground">
            {boards.length} {boards.length === 1 ? 'board' : 'boards'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Board Templates</span>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {BOARD_TEMPLATES.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {template.columns.map((column, colIndex) => (
                              <Badge
                                key={colIndex}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: column.Color,
                                  color: column.Color,
                                }}
                              >
                                {column.Name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateFromTemplate(template)}
                          className="ml-4"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => setShowCreateBoard(true)}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first quest board to start organizing your family tasks visually. 
            Choose from our templates or start from scratch.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => setShowTemplates(true)}
              variant="outline"
            >
              <Star className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
            <Button
              onClick={() => setShowCreateBoard(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleViewBoard(board.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span>{board.name}</span>
                    </CardTitle>
                    {board.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewBoard(board.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Board
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateBoard(board)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteBoard(board)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Board Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>{board.taskCount} tasks</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(board.createdAt), 'MMM d')}</span>
                  </div>
                </div>

                {/* Board Columns Preview */}
                <div className="flex flex-wrap gap-1">
                  {board.columns
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 4)
                    .map((column) => (
                      <Badge
                        key={column.id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: column.color || '#6B7280',
                          color: column.color || '#6B7280',
                        }}
                      >
                        {column.name}
                      </Badge>
                    ))}
                  {board.columns.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{board.columns.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <CreateBoardModal
          open={showCreateBoard}
          onClose={() => setShowCreateBoard(false)}
          onBoardCreated={handleBoardCreated}
        />
      )}
    </div>
  );
}; 