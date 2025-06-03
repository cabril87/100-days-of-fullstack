'use client';

/**
 * Board Selector Component
 * Allows users to switch between boards and create new ones
 */

import React, { useState, useCallback } from 'react';

// Types
import { Board } from '@/lib/types/board';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Icons
import { 
  Plus, 
  MoreHorizontal, 
  Settings, 
  Trash2, 
  Copy,
  Star,
  StarOff,
  Folder,
  FolderOpen,
  Calendar,
  Users
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BoardSelectorProps {
  boards: Board[];
  currentBoard: Board | null;
  onBoardSelect: (board: Board) => void;
  onBoardCreate: (data: { name: string; description: string }) => Promise<void>;
  onBoardUpdate: (boardId: number, data: Partial<Board>) => Promise<void>;
  onBoardDelete: (boardId: number) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface CreateBoardFormData {
  name: string;
  description: string;
}

export function BoardSelector({
  boards,
  currentBoard,
  onBoardSelect,
  onBoardCreate,
  onBoardUpdate,
  onBoardDelete,
  isLoading = false,
  className = ''
}: BoardSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateBoardFormData>({
    name: '',
    description: ''
  });

  // Handle board creation
  const handleCreateBoard = useCallback(async () => {
    if (!formData.name.trim()) return;
    
    setIsCreating(true);
    try {
      await onBoardCreate({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      // Reset form
      setFormData({ name: '', description: '' });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  }, [formData, onBoardCreate]);

  // Handle board favoriting
  const handleToggleFavorite = useCallback(async (board: Board, isFavorite: boolean) => {
    try {
      await onBoardUpdate(board.id, { isFavorite });
    } catch (error) {
      console.error('Failed to update board:', error);
    }
  }, [onBoardUpdate]);

  // Handle board deletion
  const handleDeleteBoard = useCallback(async (boardId: number) => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      try {
        await onBoardDelete(boardId);
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  }, [onBoardDelete]);

  // Sort boards: favorites first, then by last updated
  const sortedBoards = [...boards].sort((a, b) => {
    // Favorites first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Then by last updated (handle potentially undefined updatedAt)
    const aDate = new Date(a.updatedAt || a.createdAt).getTime();
    const bDate = new Date(b.updatedAt || b.createdAt).getTime();
    return bDate - aDate;
  });

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Board Selector */}
      <div className="flex items-center gap-2">
        <Select
          value={currentBoard?.id.toString() || ''}
          onValueChange={(value) => {
            const board = boards.find(b => b.id.toString() === value);
            if (board) onBoardSelect(board);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-64">
            <div className="flex items-center gap-2">
              {currentBoard?.isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              <SelectValue placeholder="Select a board..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {sortedBoards.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No boards found</p>
                <p className="text-xs">Create your first board to get started</p>
              </div>
            ) : (
              <>
                {/* Favorite boards */}
                {sortedBoards.filter(board => board.isFavorite).length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      Favorites
                    </div>
                    {sortedBoards
                      .filter(board => board.isFavorite)
                      .map((board) => (
                        <SelectItem key={board.id} value={board.id.toString()}>
                          <div className="flex items-center gap-2 w-full">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{board.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Updated {formatDistanceToNow(new Date(board.updatedAt || board.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </>
                )}
                
                {/* Other boards */}
                {sortedBoards.filter(board => !board.isFavorite).length > 0 && (
                  <>
                    {sortedBoards.filter(board => board.isFavorite).length > 0 && (
                      <div className="border-t my-1" />
                    )}
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      Recent
                    </div>
                    {sortedBoards
                      .filter(board => !board.isFavorite)
                      .map((board) => (
                        <SelectItem key={board.id} value={board.id.toString()}>
                          <div className="flex items-center gap-2 w-full">
                            <FolderOpen className="h-3 w-3 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{board.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Updated {formatDistanceToNow(new Date(board.updatedAt || board.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </>
                )}
              </>
            )}
          </SelectContent>
        </Select>

        {/* Board Info */}
        {currentBoard && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(currentBoard.updatedAt || currentBoard.createdAt), { addSuffix: true })}
            </Badge>
            {currentBoard.memberCount && currentBoard.memberCount > 1 && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {currentBoard.memberCount} members
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Board Actions */}
      <div className="flex items-center gap-1">
        {/* Create Board */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>
                Create a new board to organize your tasks and workflows.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="board-name">Board Name</Label>
                <Input
                  id="board-name"
                  placeholder="Enter board name..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="board-description">Description (Optional)</Label>
                <Textarea
                  id="board-description"
                  placeholder="Describe the purpose of this board..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBoard}
                disabled={!formData.name.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Board'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Board Menu */}
        {currentBoard && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleToggleFavorite(currentBoard, !currentBoard.isFavorite)}
              >
                {currentBoard.isFavorite ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from favorites
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Add to favorites
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate board
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Board settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleDeleteBoard(currentBoard.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
} 