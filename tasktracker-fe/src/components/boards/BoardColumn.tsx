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

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumnProps } from '../../lib/types/board';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ColorPicker } from '../ui/ColorPicker';
import { 
  Plus, 
  MoreVertical, 
  Edit2, 
  Palette, 
  Check, 
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import { TaskCard } from '@/components/boards/TaskCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { toast } from 'sonner';
import CookieStorage from '@/lib/utils/cookieStorage';


// Extended props for the enhanced column
interface EnhancedBoardColumnProps extends BoardColumnProps {
  boardId: number;
  onColumnUpdate?: (columnId: number, updates: { name?: string; color?: string }) => void;
  onColumnDelete?: (columnId: number) => void;
  selectedTasks?: Set<number>;
  isSelectionMode?: boolean;
  onTaskSelect?: (taskId: number, selected: boolean) => void;
}

export const BoardColumn: React.FC<EnhancedBoardColumnProps> = ({
  column,
  tasks,
  onCreateTask,
  className,
  boardId,
  onColumnUpdate,
  onColumnDelete,
  selectedTasks = new Set(),
  isSelectionMode = false,
  onTaskSelect
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
      status: column.status,
    },
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(column.color || 'from-slate-500 to-gray-600');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const taskIds = tasks.map(task => task.id.toString());

  // Load saved preferences on mount
  useEffect(() => {
    const savedGradient = CookieStorage.getColumnColor(boardId, column.id);
    const savedName = CookieStorage.getColumnName(boardId, column.id);
    
    if (savedGradient) setCurrentGradient(savedGradient);
    if (savedName) setEditedName(savedName);
  }, [boardId, column.id]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = useCallback(() => {
    if (!isEditingName) {
      setIsEditingName(true);
    }
  }, [isEditingName]);

  const handleNameSave = useCallback(async () => {
    if (editedName.trim() === '') {
      toast.error('Column name cannot be empty');
      setEditedName(column.name);
      setIsEditingName(false);
      return;
    }

    if (editedName.trim() === column.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Save to cookies immediately for responsive UX
      CookieStorage.saveColumnName(boardId, column.id, editedName.trim());
      
      // Update backend
      if (onColumnUpdate) {
        await onColumnUpdate(column.id, { name: editedName.trim() });
      }
      
      toast.success(`📝 Column renamed to "${editedName.trim()}"`);
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update column name:', error);
      toast.error('Failed to update column name');
      setEditedName(column.name); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  }, [editedName, column.name, column.id, boardId, onColumnUpdate]);

  const handleNameCancel = useCallback(() => {
    setEditedName(column.name);
    setIsEditingName(false);
  }, [column.name]);

  const handleColorSelect = useCallback(async (gradient: string) => {
    if (gradient === currentGradient) return;

    setIsUpdating(true);
    setCurrentGradient(gradient);
    
    try {
      // Save to cookies immediately for responsive UX
      CookieStorage.saveColumnColor(boardId, column.id, gradient);
      
      // Update backend
      if (onColumnUpdate) {
        await onColumnUpdate(column.id, { color: gradient });
      }
      
      toast.success('🎨 Column gradient updated');
      setShowColorPicker(false);
    } catch (error) {
      console.error('Failed to update column gradient:', error);
      toast.error('Failed to update column gradient');
      setCurrentGradient(column.color || 'from-slate-500 to-gray-600'); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  }, [currentGradient, boardId, column.id, column.color, onColumnUpdate]);

  const handleColumnDelete = useCallback(async () => {
    if (!onColumnDelete) return;
    
    if (tasks.length > 0) {
      toast.error('Cannot delete column with tasks', {
        description: 'Move or delete all tasks first'
      });
      return;
    }

    try {
      setIsUpdating(true);
      await onColumnDelete(column.id);
      
      // Clear saved preferences
      CookieStorage.clearColumnPreferences(boardId, column.id);
      
      toast.success(`🗑️ Column "${column.name}" deleted`);
    } catch (error) {
      console.error('Failed to delete column:', error);
      toast.error('Failed to delete column');
    } finally {
      setIsUpdating(false);
    }
  }, [onColumnDelete, column.id, column.name, boardId, tasks.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  }, [handleNameSave, handleNameCancel]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card 
          ref={setNodeRef}
          className={cn(
            "flex flex-col h-full transition-all duration-300 overflow-hidden relative",
            "bg-gradient-to-br border-0 shadow-lg hover:shadow-xl",
            isOver && [
              "ring-4 ring-blue-400/60 ring-offset-2 shadow-2xl scale-[1.01]",
              "after:absolute after:inset-0 after:bg-blue-100/20 after:rounded-lg after:pointer-events-none"
            ],
            isUpdating && "opacity-60 pointer-events-none",
            className
          )}
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          {/* Gradient Background */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-90",
              currentGradient
            )}
          />
          
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col h-full">
            <CardHeader className="pb-3 bg-white/10 backdrop-blur-sm border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full bg-white/60 flex-shrink-0 transition-all duration-200" />
                  
                  {isEditingName ? (
                    <div className="flex items-center space-x-1 flex-1">
                      <Input
                        ref={nameInputRef}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-sm font-semibold border-none shadow-none p-0 h-auto bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 focus-visible:ring-1 focus-visible:ring-white/50"
                        disabled={isUpdating}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleNameSave}
                        disabled={isUpdating}
                        className="h-6 w-6 p-0 text-white hover:text-green-200 hover:bg-green-500/20"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleNameCancel}
                        disabled={isUpdating}
                        className="h-6 w-6 p-0 text-white hover:text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <CardTitle 
                      className="text-sm font-semibold cursor-pointer text-white hover:text-white/80 transition-colors duration-200 flex-1 min-w-0 truncate"
                      onClick={handleNameClick}
                      title="Click to edit column name"
                    >
                      {editedName}
                    </CardTitle>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                  >
                    {isSelectionMode ? `${Array.from(selectedTasks).filter(id => tasks.some(t => t.id === id)).length}/` : ''}{tasks.length}
                  </Badge>
                  
                  {/* Color Picker */}
                  <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                        title="Change column gradient"
                      >
                        <Palette className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Choose Gradient</div>
                        <ColorPicker
                          selectedColor={currentGradient}
                          onColorSelect={handleColorSelect}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* More Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleNameClick}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename Column
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                        <Palette className="h-4 w-4 mr-2" />
                        Change Gradient
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onCreateTask}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Quest
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleColumnDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={tasks.length > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 pt-0 bg-white/5 backdrop-blur-sm relative">
              <div className="h-full flex flex-col space-y-3">
                {/* Add Quest Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateTask}
                  className="w-full justify-start text-xs border-dashed border-white/30 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm bg-white/5 transition-all duration-200 flex-shrink-0"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Quest
                </Button>

                {/* Tasks Container - Full Drop Zone */}
                <div className="flex-1 relative min-h-[400px]">
                  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="h-full p-4 space-y-3 min-h-[300px]">
                      {/* Sortable task list */}
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div key={`task-${task.id}`} className="relative">
                            <TaskCard
                              task={task}
                              columnColor="#FFFFFF"
                              isSelectionMode={isSelectionMode}
                              isSelected={selectedTasks.has(task.id)}
                              onSelect={onTaskSelect ? (selected) => onTaskSelect(task.id, selected) : undefined}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Empty state */}
                      {tasks.length === 0 && (
                        <div className="flex items-center justify-center h-48 text-center pointer-events-none">
                          <div className="text-white/70">
                            <div className="text-2xl mb-2">🎯</div>
                            <p className="text-xs">
                              No quests yet.<br />
                              Drop tasks here or click &quot;Add Quest&quot;
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Bottom drop zone for empty space */}
                      <div className="flex-1 min-h-[60px]" />
                    </div>
                  </SortableContext>
                  
                  {/* Full Column Drop Overlay */}
                  {isOver && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/15 via-blue-400/10 to-blue-500/15 border-2 border-blue-400/50 border-dashed rounded-lg animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                          ✨ Drop Quest Here
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </ContextMenuTrigger>
      
      {/* Right-click Context Menu */}
      <ContextMenuContent>
        <ContextMenuItem onClick={handleNameClick}>
          <Edit2 className="h-4 w-4 mr-2" />
          Rename Column
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setShowColorPicker(true)}>
          <Palette className="h-4 w-4 mr-2" />
          Change Gradient
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Quest
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={handleColumnDelete}
          className="text-red-600 hover:text-red-700"
          disabled={tasks.length > 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Column
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}; 