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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdateBoardDTO, EditBoardModalProps, BoardColumnDTO } from '../../lib/types/board';
import { BoardService } from '../../lib/services/boardService';
import { apiClient } from '../../lib/config/api-client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  Trash2,
  GripVertical,
  Edit,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Crown,
  Target
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const editBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type EditBoardFormData = z.infer<typeof editBoardSchema>;

// Sortable Column Item Component
interface SortableColumnItemProps {
  column: BoardColumnDTO;
  isEditing: boolean;
  editValue: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditValueChange: (value: string) => void;
  loading: boolean;
  deleting: boolean;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditValueChange,
  loading,
  deleting
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border-0 shadow-lg transition-all duration-300",
        "bg-gradient-to-br from-white via-slate-50 to-slate-100",
        "hover:shadow-xl hover:scale-[1.02]",
        isDragging && "opacity-50 scale-105 rotate-2 shadow-2xl z-50"
      )}
    >
      {/* Gradient accent bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ 
          background: `linear-gradient(90deg, ${column.color || '#6B7280'}, ${column.color || '#6B7280'}CC)` 
        }}
      />
      
      <CardContent className="p-4 relative">
        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200",
              "bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300",
              "group-hover:shadow-md"
            )}
          >
            <GripVertical className="h-4 w-4 text-slate-600" />
          </div>
          
          {/* Column Color Indicator */}
          <div className="relative">
            <div 
              className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white"
              style={{ backgroundColor: column.color || '#6B7280' }}
            />
            <div 
              className="absolute inset-0 w-6 h-6 rounded-full animate-pulse opacity-30"
              style={{ backgroundColor: column.color || '#6B7280' }}
            />
          </div>
          
          {/* Column Content */}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  className="h-10 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 focus:border-emerald-400"
                  placeholder="Column name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSave();
                    } else if (e.key === 'Escape') {
                      onCancel();
                    }
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={onSave}
                  disabled={loading}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="font-semibold text-slate-800 flex items-center space-x-2">
                  <span>{column.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-xs"
                  >
                    Order {column.order + 1}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Status: <span className="font-medium">{column.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600"
                onClick={onEdit}
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={onDelete}
                disabled={loading || deleting}
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

// Gamification Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type: 'board' | 'column';
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  type,
  loading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <div className="relative z-10">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {title}
            </DialogTitle>
            <p className="text-slate-600 mt-2">
              {description}
            </p>
          </DialogHeader>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6 border border-red-100">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">
                  ⚠️ This action cannot be undone!
                </h4>
                <p className="text-sm text-red-700">
                  {type === 'board' 
                    ? 'All tasks and columns in this board will be permanently deleted.'
                    : 'All tasks in this column will need to be moved to other columns first.'
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-slate-300 hover:bg-slate-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {type === 'board' ? 'Board' : 'Column'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  open,
  onClose,
  onBoardUpdated,
  onBoardDeleted,
  board
}) => {
  const [loading, setLoading] = useState(false);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [editColumnName, setEditColumnName] = useState('');
  const [deletingColumn, setDeletingColumn] = useState<number | null>(null);
  const [columns, setColumns] = useState<BoardColumnDTO[]>([]);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [showDeleteColumn, setShowDeleteColumn] = useState<{show: boolean, column: BoardColumnDTO | null}>({
    show: false,
    column: null
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<EditBoardFormData>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description || '',
    },
  });

  // Initialize columns and reset form when board changes
  useEffect(() => {
    setColumns([...board.columns].sort((a, b) => a.order - b.order));
    form.reset({
      name: board.name,
      description: board.description || '',
    });
  }, [board, form]);

  const handleSubmit = async (data: EditBoardFormData) => {
    try {
      setLoading(true);

      const updateBoardDto: UpdateBoardDTO = {
        name: data.name,
        description: data.description,
      };

      await BoardService.updateBoard(board.id, updateBoardDto);
      
      toast.success('📋 Board updated successfully!', {
        description: 'Your board settings have been saved.',
      });
      onBoardUpdated();
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      setLoading(true);
      await BoardService.deleteBoard(board.id);
      
      toast.success('🗑️ Board deleted successfully', {
        description: 'Your board has been permanently removed.',
      });
      onClose();
      
      if (onBoardDeleted) {
        onBoardDeleted();
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    } finally {
      setLoading(false);
      setShowDeleteBoard(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);

      const newColumns = arrayMove(columns, oldIndex, newIndex);
      
      // Update order values
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
      
      setColumns(updatedColumns);

      // Save the new order to backend
      try {
        await Promise.all(
          updatedColumns.map(col => 
            apiClient.put(`/v1/boards/${board.id}/columns/${col.id}`, {
              name: col.name,
              order: col.order
            })
          )
        );
        
        toast.success('✨ Column order updated!', {
          description: 'Your columns have been reordered successfully.',
        });
        onBoardUpdated();
      } catch (error) {
        console.error('Error updating column order:', error);
        toast.error('Failed to update column order');
        // Revert the change
        setColumns([...board.columns].sort((a, b) => a.order - b.order));
      }
    }
  };

  const handleEditColumn = (column: BoardColumnDTO) => {
    setEditingColumn(column.id);
    setEditColumnName(column.name);
  };

  const handleSaveColumnEdit = async () => {
    if (!editColumnName.trim() || !editingColumn) {
      toast.error('Column name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(`/v1/boards/${board.id}/columns/${editingColumn}`, {
        name: editColumnName.trim()
      });
      
      toast.success('📝 Column updated successfully', {
        description: `Column renamed to "${editColumnName.trim()}"`,
      });
      setEditingColumn(null);
      setEditColumnName('');
      onBoardUpdated();
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Failed to update column');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelColumnEdit = () => {
    setEditingColumn(null);
    setEditColumnName('');
  };

  const handleDeleteColumn = async (column: BoardColumnDTO) => {
    try {
      setDeletingColumn(column.id);
      await apiClient.delete(`/v1/boards/${board.id}/columns/${column.id}`);
      
      toast.success('🗑️ Column deleted successfully', {
        description: `"${column.name}" column has been removed.`,
      });
      onBoardUpdated();
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Failed to delete column');
    } finally {
      setDeletingColumn(null);
      setShowDeleteColumn({ show: false, column: null });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="relative z-10 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Board Settings
                  </span>
                  <p className="text-sm text-slate-600 font-normal mt-1">
                    Customize your board name, description, and column layout
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8">
              {/* Basic Board Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span>Board Information</span>
                  </h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Board Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter board name..."
                                className="h-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-blue-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your board..."
                                className="min-h-[80px] resize-none bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-blue-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Board Columns with Drag & Drop */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      <span>Board Columns</span>
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
                    >
                      {columns.length} columns
                    </Badge>
                  </div>

                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GripVertical className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          💡 Drag & Drop to Reorder
                        </h4>
                        <p className="text-sm text-blue-700">
                          Drag columns by their handle to reorder them. Changes are saved automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {columns.map((column) => (
                          <SortableColumnItem
                            key={column.id}
                            column={column}
                            isEditing={editingColumn === column.id}
                            editValue={editColumnName}
                            onEdit={() => handleEditColumn(column)}
                            onSave={handleSaveColumnEdit}
                            onCancel={handleCancelColumnEdit}
                            onDelete={() => setShowDeleteColumn({ show: true, column })}
                            onEditValueChange={setEditColumnName}
                            loading={loading}
                            deleting={deletingColumn === column.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Danger Zone</span>
                  </h3>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">Delete Board</h4>
                        <p className="text-sm text-red-700">
                          Permanently delete this board and all its tasks. This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteBoard(true)}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Board
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation */}
      <DeleteConfirmationModal
        open={showDeleteBoard}
        onClose={() => setShowDeleteBoard(false)}
        onConfirm={handleDeleteBoard}
        title="Delete Board"
        description={`Are you sure you want to delete "${board.name}"?`}
        type="board"
        loading={loading}
      />

      {/* Delete Column Confirmation */}
      <DeleteConfirmationModal
        open={showDeleteColumn.show}
        onClose={() => setShowDeleteColumn({ show: false, column: null })}
        onConfirm={() => showDeleteColumn.column && handleDeleteColumn(showDeleteColumn.column)}
        title="Delete Column"
        description={`Are you sure you want to delete the "${showDeleteColumn.column?.name}" column?`}
        type="column"
        loading={deletingColumn === showDeleteColumn.column?.id}
      />
    </>
  );
};