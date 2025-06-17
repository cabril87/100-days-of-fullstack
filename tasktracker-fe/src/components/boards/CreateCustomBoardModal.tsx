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
import { CreateBoardDTO, CreateBoardModalProps } from '../../lib/types/board';
import { TaskItemStatus } from '../../lib/types/task';
import { BoardService } from '../../lib/services/boardService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  Sparkles,
  Palette,
  X,
  Info,
  GripVertical
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const createCustomBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type CreateCustomBoardFormData = z.infer<typeof createCustomBoardSchema>;

// Color palette for columns
const COLUMN_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
  '#6B7280', '#1F2937', '#7C3AED', '#059669', '#DC2626', '#7C2D12'
];

// Status type options for middle columns
const MIDDLE_STATUS_OPTIONS = [
  { value: TaskItemStatus.InProgress, label: 'In Progress', icon: '⚡', color: '#3B82F6' },
  { value: TaskItemStatus.Pending, label: 'Pending', icon: '🕐', color: '#F59E0B' },
  { value: TaskItemStatus.OnHold, label: 'On Hold', icon: '⏸️', color: '#6B7280' },
];

interface CustomColumn {
  Name: string;
  Color: string;
  Status: TaskItemStatus;
  Order: number;
  IsCore: boolean;
}

export const CreateCustomBoardModal: React.FC<CreateBoardModalProps> = ({
  open,
  onClose,
  onBoardCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([
    { Name: 'To Do', Color: '#6B7280', Status: TaskItemStatus.NotStarted, Order: 0, IsCore: true },
    { Name: 'In Progress', Color: '#3B82F6', Status: TaskItemStatus.InProgress, Order: 1, IsCore: false },
    { Name: 'Done', Color: '#10B981', Status: TaskItemStatus.Completed, Order: 2, IsCore: true }
  ]);

  const form = useForm<CreateCustomBoardFormData>({
    resolver: zodResolver(createCustomBoardSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Auto-enforce status rules whenever columns change
  useEffect(() => {
    if (customColumns.length >= 2) {
      const updatedColumns = [...customColumns];
      
      // First column must be NotStarted
      if (updatedColumns[0].Status !== TaskItemStatus.NotStarted) {
        updatedColumns[0] = { ...updatedColumns[0], Status: TaskItemStatus.NotStarted, IsCore: true };
      }
      
      // Last column must be Completed
      const lastIndex = updatedColumns.length - 1;
      if (updatedColumns[lastIndex].Status !== TaskItemStatus.Completed) {
        updatedColumns[lastIndex] = { ...updatedColumns[lastIndex], Status: TaskItemStatus.Completed, IsCore: true };
      }
      
      // Update orders
      updatedColumns.forEach((col, index) => {
        col.Order = index;
      });
      
      setCustomColumns(updatedColumns);
    }
  }, [customColumns.length, customColumns]);

  const handleSubmit = async (data: CreateCustomBoardFormData) => {
    try {
      setLoading(true);

      // Final validation and status enforcement
      const finalColumns = customColumns.map((col, index) => ({
        ...col,
        Order: index,
        Status: index === 0 ? TaskItemStatus.NotStarted : 
                index === customColumns.length - 1 ? TaskItemStatus.Completed : 
                col.Status,
        IsCore: index === 0 || index === customColumns.length - 1
      }));

      const createBoardDto: CreateBoardDTO = {
        Name: data.name,
        Description: data.description,
        Columns: finalColumns,
      };

      await BoardService.createBoard(createBoardDto);
      
      toast.success('🎯 Custom board created successfully!', {
        description: `"${data.name}" is ready with ${finalColumns.length} columns.`,
      });
      onBoardCreated();
    } catch (error) {
      console.error('Error creating custom board:', error);
      toast.error('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const handleColumnNameChange = (index: number, newName: string) => {
    const updatedColumns = [...customColumns];
    updatedColumns[index] = { ...updatedColumns[index], Name: newName };
    setCustomColumns(updatedColumns);
  };

  const handleColumnColorChange = (index: number, newColor: string) => {
    const updatedColumns = [...customColumns];
    updatedColumns[index] = { ...updatedColumns[index], Color: newColor };
    setCustomColumns(updatedColumns);
  };

  const handleColumnStatusChange = (index: number, newStatus: TaskItemStatus) => {
    // Only allow status changes for middle columns
    if (index === 0 || index === customColumns.length - 1) return;
    
    const updatedColumns = [...customColumns];
    updatedColumns[index] = { ...updatedColumns[index], Status: newStatus };
    setCustomColumns(updatedColumns);
  };

  const addColumn = () => {
    const newColumn: CustomColumn = {
      Name: `Column ${customColumns.length + 1}`,
      Color: COLUMN_COLORS[customColumns.length % COLUMN_COLORS.length],
      Status: TaskItemStatus.InProgress,
      Order: customColumns.length - 1, // Insert before last column
      IsCore: false
    };
    
    // Insert before the last column (which should remain "Completed")
    const updatedColumns = [...customColumns];
    updatedColumns.splice(-1, 0, newColumn);
    setCustomColumns(updatedColumns);
  };

  const removeColumn = (index: number) => {
    if (customColumns.length <= 3) {
      toast.error('Minimum 3 columns required');
      return;
    }
    
    // Don't allow removing first or last column
    if (index === 0 || index === customColumns.length - 1) {
      toast.error('Cannot remove first or last column');
      return;
    }
    
    const updatedColumns = customColumns.filter((_, i) => i !== index);
    setCustomColumns(updatedColumns);
  };

  const getStatusDisplay = (column: CustomColumn, index: number) => {
    if (index === 0) {
      return { icon: '🎯', label: 'Not Started', color: '#6B7280', locked: true };
    }
    if (index === customColumns.length - 1) {
      return { icon: '✅', label: 'Completed', color: '#10B981', locked: true };
    }
    
    const statusOption = MIDDLE_STATUS_OPTIONS.find(opt => opt.value === column.Status);
    return statusOption ? { ...statusOption, locked: false } : { ...MIDDLE_STATUS_OPTIONS[0], locked: false };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
        
        <div className="relative z-10 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Create Custom Board
                </span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              Build your personalized task management board with unlimited columns. First column is always &quot;Not Started&quot; and last column is always &quot;Completed&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Board Details Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>Board Information</span>
                </h3>
                
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">Board Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Family Chores, Work Projects, Personal Goals"
                              className="h-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-purple-400"
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
                          <FormLabel className="text-slate-700 font-semibold">Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this board will be used for..."
                              className="min-h-[80px] resize-none bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-purple-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Column Setup */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-blue-500" />
                    <span>Column Setup</span>
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 bg-blue-50 px-3 py-1 rounded-full">
                    <Info className="h-3 w-3" />
                    <span>First = Not Started, Last = Completed</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {customColumns.map((column, index) => {
                    const statusDisplay = getStatusDisplay(column, index);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-mono">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <Input
                            value={column.Name}
                            onChange={(e) => handleColumnNameChange(index, e.target.value)}
                            className="h-10 bg-white border-slate-200 font-medium"
                            placeholder="Column name..."
                          />
                        </div>

                        {/* Status Display/Selector */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border">
                            <span className="text-sm">{statusDisplay.icon}</span>
                            <span className="text-xs font-medium" style={{ color: statusDisplay.color }}>
                              {statusDisplay.label}
                            </span>
                            {statusDisplay.locked && (
                              <div className="w-2 h-2 bg-slate-400 rounded-full" title="Status locked" />
                            )}
                          </div>
                          
                          {!statusDisplay.locked && (
                            <select
                              value={column.Status}
                              onChange={(e) => handleColumnStatusChange(index, parseInt(e.target.value) as TaskItemStatus)}
                              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                            >
                              {MIDDLE_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.icon} {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Color Selector */}
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: column.Color }}
                          />
                          <div className="flex flex-wrap gap-1">
                            {COLUMN_COLORS.slice(0, 8).map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={cn(
                                  "w-5 h-5 rounded-full border-2 transition-all duration-200",
                                  column.Color === color 
                                    ? "border-gray-800 scale-110" 
                                    : "border-gray-300 hover:border-gray-500"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColumnColorChange(index, color)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Remove Button */}
                        {customColumns.length > 3 && index !== 0 && index !== customColumns.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColumn(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addColumn}
                  className="w-full mt-4 border-dashed border-2 border-slate-300 hover:border-purple-400 text-slate-600 hover:text-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span>Board Preview</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {customColumns.map((column, index) => {
                    const statusDisplay = getStatusDisplay(column, index);
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-4 py-3 rounded-lg border-2 bg-white shadow-sm"
                        style={{ borderColor: column.Color }}
                      >
                        <span className="text-sm">{statusDisplay.icon}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: column.Color }}
                        />
                        <span className="text-sm font-medium" style={{ color: column.Color }}>
                          {column.Name}
                        </span>
                        {statusDisplay.locked && (
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  {customColumns.length} columns • First column handles new tasks • Last column handles completed tasks
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={loading || !form.watch('name')}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Create Board ({customColumns.length} columns)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 