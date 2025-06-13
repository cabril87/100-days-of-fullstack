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
import { UpdateBoardDTO, EditBoardModalProps } from '../../lib/types/board';
import { BoardService } from '../../lib/services/boardService';
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
import { toast } from 'sonner';
import {
  Settings,
  Save,
  Trash2,
  Plus,
  GripVertical,
  Edit
} from 'lucide-react';

const editBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type EditBoardFormData = z.infer<typeof editBoardSchema>;

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  open,
  onClose,
  onBoardUpdated,
  board
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<EditBoardFormData>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description || '',
    },
  });

  // Reset form when board changes
  useEffect(() => {
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
      
      toast.success('📋 Board updated successfully!');
      onBoardUpdated();
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await BoardService.deleteBoard(board.id);
      
      toast.success('🗑️ Board deleted successfully');
      onClose();
      // Note: Parent component should handle navigation away from deleted board
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <span>Edit Board Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Board Settings */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter board name..."
                        className="h-12"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your board..."
                        className="min-h-[80px] resize-none"
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
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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

          {/* Board Columns */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Board Columns</h3>
              <Badge variant="secondary">
                {board.columns.length} columns
              </Badge>
            </div>

            <div className="space-y-3">
              {board.columns
                .sort((a, b) => a.order - b.order)
                .map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: column.color || '#6B7280' }}
                    />
                    
                    <div className="flex-1">
                      <div className="font-medium">{column.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {column.status}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>

          {/* Board Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Board Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-500">{board.taskCount}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-500">{board.columns.length}</div>
                <div className="text-sm text-muted-foreground">Columns</div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Delete Board</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this board and all its tasks. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBoard}
                  disabled={loading}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 