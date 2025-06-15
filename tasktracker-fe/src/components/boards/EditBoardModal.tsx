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

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdateBoardDTO, EditBoardModalProps, BoardColumnDTO } from '../../lib/types/board';
import { TaskItemStatus } from '../../lib/types/task';
import { BoardService } from '../../lib/services/boardService';
import { apiClient } from '../../lib/config/api-client';
import { StatusMappingService } from '../../lib/utils/statusMapping';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  Target,
  Palette,
  Info,
  Plus,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  Pause,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const editBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type EditBoardFormData = z.infer<typeof editBoardSchema>;

// Enhanced column editing schema
const columnEditSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  status: z.nativeEnum(TaskItemStatus),
  alias: z.string().max(30, 'Alias too long').optional(),
  description: z.string().max(200, 'Description too long').optional(),
});

type ColumnEditFormData = z.infer<typeof columnEditSchema>;

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: TaskItemStatus.NotStarted, label: 'Not Started', icon: '🎯', color: '#6B7280' },
  { value: TaskItemStatus.InProgress, label: 'In Progress', icon: '⚡', color: '#3B82F6' },
  { value: TaskItemStatus.OnHold, label: 'On Hold', icon: '⏸️', color: '#F59E0B' },
  { value: TaskItemStatus.Pending, label: 'Pending', icon: '🕐', color: '#8B5CF6' },
  { value: TaskItemStatus.Completed, label: 'Completed', icon: '✅', color: '#10B981' },
  { value: TaskItemStatus.Cancelled, label: 'Cancelled', icon: '❌', color: '#EF4444' },
];

// Color palette for columns
const COLOR_PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
  '#6B7280', '#1F2937', '#7C3AED', '#059669', '#DC2626', '#7C2D12'
];

// Enhanced Sortable Column Item Component
interface EnhancedSortableColumnItemProps {
  column: BoardColumnDTO;
  isEditing: boolean;
  editData: ColumnEditFormData;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditDataChange: (field: keyof ColumnEditFormData, value: any) => void;
  loading: boolean;
  deleting: boolean;
  isDragDisabled: boolean;
  validationErrors: string[];
}

const EnhancedSortableColumnItem: React.FC<EnhancedSortableColumnItemProps> = ({
  column,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditDataChange,
  loading,
  deleting,
  isDragDisabled,
  validationErrors
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isDragDisabled || isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle both string and number status values from backend with robust parsing
  const normalizedStatus = normalizeStatus(column.status);
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === normalizedStatus);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border-0 shadow-lg transition-all duration-300",
        "bg-gradient-to-br from-white via-slate-50 to-slate-100",
        "hover:shadow-xl hover:scale-[1.02]",
        isDragging && "opacity-50 scale-105 rotate-2 shadow-2xl z-50",
        isEditing && "ring-2 ring-blue-400 shadow-2xl scale-[1.02]",
        validationErrors.length > 0 && "ring-2 ring-red-400"
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
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Issues found:</span>
            </div>
            <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 flex-shrink-0 mt-1",
              isDragDisabled || isEditing
                ? "cursor-not-allowed bg-gray-100"
                : "cursor-grab active:cursor-grabbing bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 group-hover:shadow-md"
            )}
          >
            <GripVertical className={cn(
              "h-4 w-4",
              isDragDisabled || isEditing
                ? "text-gray-400"
                : "text-gray-600 hover:text-gray-800"
            )} />
          </div>
          
          {/* Column Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Name
                  </label>
                <Input
                    value={editData.name}
                    onChange={(e) => onEditDataChange('name', e.target.value)}
                    className="h-10 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 focus:border-emerald-400 text-gray-900 placeholder:text-gray-500"
                  placeholder="Column name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                      onSave();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                      onCancel();
                    }
                  }}
                  autoFocus
                />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Type
                  </label>
                  <Select
                    value={editData.status.toString()}
                    onValueChange={(value) => onEditDataChange('status', parseInt(value))}
                  >
                    <SelectTrigger className="h-10 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 focus:border-emerald-400 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: editData.color }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all duration-200",
                            editData.color === color
                              ? "border-gray-800 scale-110"
                              : "border-gray-300 hover:border-gray-500"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => onEditDataChange('color', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alias Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Alias (Optional)
                  </label>
                  <Input
                    value={editData.alias || ''}
                    onChange={(e) => onEditDataChange('alias', e.target.value)}
                    className="h-10 bg-white/80 backdrop-blur-sm border-2 border-blue-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-500"
                    placeholder="e.g., 'Cooking', 'Review', 'Ideas'..."
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => onEditDataChange('description', e.target.value)}
                    className="min-h-[60px] resize-none bg-white/80 backdrop-blur-sm border-2 border-blue-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-500"
                    placeholder="Describe what this column represents..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                    className="h-10 px-4 text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                    onClick={onCancel}
                  disabled={loading}
                >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                </Button>
                <Button
                    variant="default"
                  size="sm"
                    className="h-10 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                    onClick={onSave}
                  disabled={loading}
                >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Status Icon & Color */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white flex items-center justify-center text-xs"
                        style={{ backgroundColor: column.color || '#6B7280' }}
                      >
                        {statusOption?.icon || '📋'}
                </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 truncate">
                          {column.alias || column.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {statusOption?.label || `Status: ${column.status}`}
                        </p>
                </div>
              </div>
          </div>

          {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={onEdit}
                      disabled={loading || deleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
                      disabled={loading || deleting || column.isCore}
                      title={column.isCore ? "Core columns cannot be deleted" : "Delete column"}
              >
                {deleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
                </div>

                {/* Column Description */}
                {column.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                    {column.description}
                  </p>
                )}

                {/* Core Column Badge */}
                {column.isCore && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Core Column
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
};

// Delete Confirmation Modal
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
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:w-auto sm:h-auto sm:max-w-[500px] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-0 shadow-2xl p-0 sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]">
        {/* Animated danger header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

        <DialogHeader className="pb-4 sm:pb-6 pt-8 sm:pt-6 px-4 sm:px-6 flex-shrink-0">
          <DialogTitle className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              <div className="relative p-3 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white shadow-lg">
                <AlertTriangle className="h-8 w-8 sm:h-8 sm:w-8" />
            </div>
            </div>
            <div>
              <span className="text-xl sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {title}
              </span>
              <div className="flex items-center justify-center mt-1 space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
            </DialogTitle>
          <DialogDescription className="text-center text-gray-700 font-medium mt-3 sm:mt-4 px-2 text-base sm:text-base">
              {description}
          </DialogDescription>
          </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Gamified warning section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-100 via-orange-100 to-red-100 border-2 border-red-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-red-200 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16 opacity-20" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-orange-200 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12 opacity-20" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500 rounded-lg text-white flex-shrink-0">
                  <Trash2 className="h-5 w-5 sm:h-5 sm:w-5" />
              </div>
                <h3 className="font-bold text-red-800 text-base sm:text-base md:text-lg">
                  🚨 Danger Zone Alert
                </h3>
              </div>

                              {type === 'board' ? (
                <div className="space-y-3 sm:space-y-3">
                  <div className="flex items-start space-x-2 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 sm:mt-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-sm md:text-base leading-tight">This action is PERMANENT and cannot be undone</span>
                  </div>
                  <div className="flex items-start space-x-2 text-red-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 sm:mt-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-sm md:text-base leading-tight">All tasks and progress will be lost forever</span>
                  </div>
                  <div className="flex items-start space-x-2 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 sm:mt-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-sm md:text-base leading-tight">Board history and analytics will be deleted</span>
                  </div>
                  
                  <div className="mt-4 sm:mt-4 p-3 bg-red-200 rounded-lg border border-red-300">
                    <p className="text-sm sm:text-sm text-red-800 font-bold text-center leading-tight">
                      💀 FINAL WARNING: This will destroy everything in this board! 💀
                </p>
              </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-3">
                  <div className="flex items-start space-x-2 text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 sm:mt-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-sm md:text-base leading-tight">Column and all its tasks will be removed</span>
                  </div>
                  <div className="flex items-start space-x-2 text-orange-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 sm:mt-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-sm md:text-base leading-tight">This action cannot be undone</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type DELETE confirmation section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 font-medium mb-4 sm:mb-4 text-base sm:text-base">
                Are you absolutely sure you want to proceed?
              </p>
              <div className="space-y-4 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-sm sm:text-sm text-gray-500">
                  <span>Type</span>
                  <code className="px-2 py-1 bg-gray-100 rounded font-mono text-red-600 font-bold text-sm sm:text-sm">
                    DELETE
                  </code>
                  <span>to confirm</span>
                </div>
                
                <div className="relative">
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here..."
                    className={cn(
                      "h-12 sm:h-12 text-center font-mono font-bold text-lg sm:text-lg bg-white border-2 transition-all duration-200 placeholder:text-gray-400",
                      isConfirmed 
                        ? "border-green-400 bg-green-50 text-green-700" 
                        : confirmText.length > 0 
                          ? "border-red-400 bg-red-50 text-red-700" 
                          : "border-gray-300 text-gray-900"
                    )}
                    disabled={loading}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {isConfirmed && (
                    <div className="absolute right-3 sm:right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                  )}
                </div>
                
                {confirmText.length > 0 && !isConfirmed && (
                  <p className="text-sm text-red-600 animate-pulse px-2">
                    Please type exactly "DELETE" (case insensitive)
                  </p>
                )}
                
                {isConfirmed && (
                  <p className="text-sm sm:text-sm text-green-600 font-semibold animate-pulse px-2">
                    ✅ Confirmation verified - You may now proceed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 sticky bottom-0 bg-gradient-to-t from-red-50 to-transparent pt-6 sm:pt-6 border-t border-gray-200 px-4 sm:px-6 pb-6 sm:pb-6">
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full space-y-reverse space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-6 py-3 sm:py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold text-base sm:text-base"
            >
              <X className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Cancel & Keep Safe</span>
              <span className="sm:hidden">Cancel</span>
            </Button>
            
            <Button
              variant="destructive" 
              onClick={onConfirm}
              disabled={loading || !isConfirmed}
              className={cn(
                "w-full sm:w-auto px-6 sm:px-6 py-3 sm:py-3 text-white font-bold shadow-lg transition-all duration-200 text-base sm:text-base",
                isConfirmed && !loading
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-5 sm:w-5 border-b-2 border-white mr-2" />
                  <span className="animate-pulse">Deleting...</span>
                </>
              ) : !isConfirmed ? (
                <>
                  <AlertTriangle className="h-5 w-5 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Type DELETE to Enable</span>
                  <span className="sm:hidden">Type DELETE</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">💀 DELETE {type === 'board' ? 'BOARD' : 'COLUMN'} 💀</span>
                  <span className="sm:hidden">💀 DELETE 💀</span>
                </>
              )}
            </Button>
        </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Utility function for robust status normalization
const normalizeStatus = (status: any): TaskItemStatus => {
  // Debug logging to understand what we're receiving
  console.log('Normalizing status:', { status, type: typeof status, value: status });

  if (typeof status === 'number' && !isNaN(status)) {
    return status;
  }

  if (typeof status === 'string') {
    // Handle string representations
    const trimmed = status.trim();

    // Try parsing as number first
    const parsed = parseInt(trimmed);
    if (!isNaN(parsed)) {
      return parsed;
    }

    // Handle string status names
    const statusMap: Record<string, TaskItemStatus> = {
      'notstarted': TaskItemStatus.NotStarted,
      'not started': TaskItemStatus.NotStarted,
      'inprogress': TaskItemStatus.InProgress,
      'in progress': TaskItemStatus.InProgress,
      'onhold': TaskItemStatus.OnHold,
      'on hold': TaskItemStatus.OnHold,
      'pending': TaskItemStatus.Pending,
      'completed': TaskItemStatus.Completed,
      'cancelled': TaskItemStatus.Cancelled,
      'canceled': TaskItemStatus.Cancelled
    };

    const normalized = statusMap[trimmed.toLowerCase()];
    if (normalized !== undefined) {
      return normalized;
    }
  }

  // Default fallback
  console.warn('Could not normalize status, using NotStarted as fallback:', status);
  return TaskItemStatus.NotStarted;
};

// Main EditBoardModal Component
export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  open,
  onClose,
  onBoardUpdated,
  onBoardDeleted,
  board
}) => {
  // Form state
  const form = useForm<EditBoardFormData>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description || '',
    },
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<BoardColumnDTO[]>([]);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [editColumnData, setEditColumnData] = useState<ColumnEditFormData>({
    name: '',
    color: '#6B7280',
    status: TaskItemStatus.NotStarted,
    alias: '',
    description: ''
  });
  const [deletingColumn, setDeletingColumn] = useState<number | null>(null);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [showDeleteColumn, setShowDeleteColumn] = useState<{ show: boolean; column: BoardColumnDTO | null }>({
    show: false,
    column: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeColumn, setActiveColumn] = useState<BoardColumnDTO | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [showTemplateConversion, setShowTemplateConversion] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [preventModalClose, setPreventModalClose] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize columns
  useEffect(() => {
    if (board.columns) {
      console.log('Board columns received:', board.columns);
      const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
      console.log('Sorted columns:', sortedColumns);
      setColumns(sortedColumns);
      validateAllColumns(sortedColumns);
    }
  }, [board.columns]);

  // Handle modal close with protection
  const handleModalClose = (shouldClose: boolean) => {
    if (preventModalClose && isDragging) {
      console.log('Modal close prevented - drag in progress');
      return;
    }

    if (pendingChanges) {
      // Apply pending changes when modal closes
      onBoardUpdated();
      setPendingChanges(false);
    }

    if (shouldClose) {
      onClose();
    }
  };

  // Comprehensive validation functions
  const validateAllColumns = useCallback((columnsToValidate: BoardColumnDTO[]) => {
    const errors: Record<number, string[]> = {};

    console.log('🔍 Validating columns:', columnsToValidate);

    // Normalize status values (handle both string and number from backend)
    const normalizedColumns = columnsToValidate.map(col => ({
      ...col,
      status: normalizeStatus(col.status)
    }));

    console.log('🔍 Normalized columns:', normalizedColumns);

    // Global validations
    const globalErrors: string[] = [];

    // Check minimum column count
    if (normalizedColumns.length < 3) {
      globalErrors.push(`Board needs at least 3 columns (currently has ${normalizedColumns.length})`);
    }

    // Check for core status validation
    try {
      const coreValidation = StatusMappingService.validateCoreStatuses(normalizedColumns);
      if (!coreValidation) {
        globalErrors.push('Core status validation failed');
      }
    } catch (error) {
      console.warn('StatusMappingService validation failed:', error);
    }

    // Per-column validations
    normalizedColumns.forEach((column, index) => {
      const columnErrors: string[] = [];

      // Check for empty names
      if (!column.name || !column.name.trim()) {
        columnErrors.push('❌ Column name cannot be empty');
      }

      // Check for very long names
      if (column.name && column.name.length > 50) {
        columnErrors.push('❌ Column name is too long (max 50 characters)');
      }

      // Check core column positioning
      const isFirst = index === 0;
      const isLast = index === normalizedColumns.length - 1;

      if (isFirst && column.status !== TaskItemStatus.NotStarted) {
        columnErrors.push('🎯 First column must be "Not Started" status');
      }

      if (isLast && column.status !== TaskItemStatus.Completed) {
        columnErrors.push('🏆 Last column must be "Completed" status');
      }

      // Check middle column statuses
      if (!isFirst && !isLast) {
        const validMiddleStatuses = [TaskItemStatus.InProgress, TaskItemStatus.Pending, TaskItemStatus.OnHold];
        if (!validMiddleStatuses.includes(column.status)) {
          columnErrors.push(`⚡ Middle columns should use: ${validMiddleStatuses.map(s => STATUS_OPTIONS.find(opt => opt.value === s)?.label).join(', ')}`);
        }
      }

      // Check for duplicate statuses (except allowed middle statuses)
      const sameStatusColumns = normalizedColumns.filter(col => col.status === column.status);
      if (sameStatusColumns.length > 1) {
        const allowedDuplicates = [TaskItemStatus.Pending, TaskItemStatus.InProgress, TaskItemStatus.OnHold];
        if (!allowedDuplicates.includes(column.status)) {
          const statusLabel = STATUS_OPTIONS.find(opt => opt.value === column.status)?.label || 'Unknown';
          columnErrors.push(`🔄 Multiple columns cannot have "${statusLabel}" status`);
        }
      }

      // Check for missing colors
      if (!column.color || column.color === '') {
        columnErrors.push('🎨 Column needs a color');
      }

      // Check for invalid color format
      if (column.color && !/^#[0-9A-F]{6}$/i.test(column.color)) {
        columnErrors.push('🎨 Invalid color format (should be #RRGGBB)');
      }

      // Check order consistency
      if (column.order !== index) {
        columnErrors.push(`📊 Column order mismatch (expected ${index}, got ${column.order})`);
      }

      // Add global errors to first column for display
      if (index === 0 && globalErrors.length > 0) {
        columnErrors.push(...globalErrors.map(err => `🌐 ${err}`));
      }

      if (columnErrors.length > 0) {
        errors[column.id] = columnErrors;
      }
    });

    console.log('🔍 Validation errors found:', errors);
    setValidationErrors(errors);

    // Return validation summary
    const totalErrors = Object.values(errors).flat().length;
    const hasErrors = totalErrors > 0;

    if (hasErrors) {
      console.log(`🚨 Found ${totalErrors} validation issues across ${Object.keys(errors).length} columns`);
    } else {
      console.log('✅ All columns passed validation');
    }

    return !hasErrors;
  }, []);

  // Comprehensive auto-fix for all validation issues
  const handleAutoFixStatuses = async () => {
    try {
      setLoading(true);

      console.log('🔧 Starting comprehensive auto-fix...');
      console.log('Current columns:', columns);
      console.log('Current validation errors:', validationErrors);

      // Step 1: Fix empty column names
      let fixedColumns = columns.map((col, index) => ({
        ...col,
        name: col.name.trim() || `Column ${index + 1}`,
        status: normalizeStatus(col.status)
      }));

      console.log('After name fixes:', fixedColumns);

      // Step 2: Ensure minimum 3 columns
      if (fixedColumns.length < 3) {
        const missingCount = 3 - fixedColumns.length;
        for (let i = 0; i < missingCount; i++) {
          const newColumn = {
            id: Date.now() + i, // Temporary ID
            name: `Column ${fixedColumns.length + 1}`,
            order: fixedColumns.length,
            status: TaskItemStatus.InProgress,
            color: COLOR_PALETTE[fixedColumns.length % COLOR_PALETTE.length],
            alias: '',
            description: '',
            isCore: false
          };
          fixedColumns.splice(-1, 0, newColumn); // Insert before last column
        }
      }

      // Step 3: Fix core column statuses and positioning
      fixedColumns = fixedColumns.map((col, index) => {
        const isFirst = index === 0;
        const isLast = index === fixedColumns.length - 1;

        let newStatus = col.status;
        let isCore = col.isCore;

        // Enforce enterprise rules
        if (isFirst) {
          newStatus = TaskItemStatus.NotStarted;
          isCore = true;
        } else if (isLast) {
          newStatus = TaskItemStatus.Completed;
          isCore = true;
        } else {
          // Middle columns should use valid middle statuses
          if (![TaskItemStatus.InProgress, TaskItemStatus.Pending, TaskItemStatus.OnHold].includes(newStatus)) {
            newStatus = TaskItemStatus.InProgress;
          }
          isCore = false;
        }

        return {
          ...col,
          status: newStatus,
          isCore,
          order: index
        };
      });

      console.log('After status fixes:', fixedColumns);

      // Step 4: Resolve duplicate statuses (except allowed middle statuses)
      const statusCounts = new Map<TaskItemStatus, number>();
      fixedColumns.forEach(col => {
        const count = statusCounts.get(col.status) || 0;
        statusCounts.set(col.status, count + 1);
      });

      // Fix duplicates for non-allowed statuses
      fixedColumns = fixedColumns.map((col, index) => {
        const isFirst = index === 0;
        const isLast = index === fixedColumns.length - 1;

        // Skip core columns and allowed middle statuses
        if (isFirst || isLast ||
          [TaskItemStatus.InProgress, TaskItemStatus.Pending, TaskItemStatus.OnHold].includes(col.status)) {
          return col;
        }

        // Check if this status has duplicates
        const duplicateCount = statusCounts.get(col.status) || 0;
        if (duplicateCount > 1 &&
          ![TaskItemStatus.InProgress, TaskItemStatus.Pending, TaskItemStatus.OnHold].includes(col.status)) {
          // Assign a safe middle status
          const middleStatuses = [TaskItemStatus.InProgress, TaskItemStatus.Pending, TaskItemStatus.OnHold];
          const safeStatus = middleStatuses[index % middleStatuses.length];
          return {
            ...col,
            status: safeStatus
          };
        }

        return col;
      });

      console.log('After duplicate fixes:', fixedColumns);

      // Step 5: Ensure proper colors
      fixedColumns = fixedColumns.map((col, index) => ({
        ...col,
        color: col.color || COLOR_PALETTE[index % COLOR_PALETTE.length]
      }));

      console.log('Final fixed columns:', fixedColumns);

      // Step 6: Save all changes to backend
      const savePromises = fixedColumns.map(async (col, index) => {
        try {
          if (col.id && typeof col.id === 'number' && col.id > 0) {
            // Update existing column
            return await apiClient.put(`/v1/boards/${board.id}/columns/${col.id}`, {
              name: col.name,
              order: col.order,
              status: col.status,
              color: col.color,
              alias: col.alias || null,
              description: col.description || null,
              isCore: col.isCore
            });
          } else {
            // Create new column
            return await apiClient.post(`/v1/boards/${board.id}/columns`, {
              name: col.name,
              order: col.order,
              status: col.status,
              color: col.color,
              alias: col.alias || null,
              description: col.description || null,
              isCore: col.isCore
            });
          }
        } catch (error) {
          console.error(`Failed to save column ${col.name}:`, error);
          throw error;
        }
      });

      const results = await Promise.allSettled(savePromises);
      const failures = results.filter(result => result.status === 'rejected');

      if (failures.length > 0) {
        console.error('Some columns failed to save:', failures);
        toast.error(`Failed to save ${failures.length} columns. Please try again.`);
        return;
      }

      // Step 7: Update local state and re-validate
      setColumns(fixedColumns);
      validateAllColumns(fixedColumns);

      // Count fixes applied
      const fixes = [];
      if (fixedColumns.some((col, i) => col.name !== columns[i]?.name)) fixes.push('column names');
      if (fixedColumns[0].status !== columns[0]?.status) fixes.push('first column status');
      if (fixedColumns[fixedColumns.length - 1].status !== columns[columns.length - 1]?.status) fixes.push('last column status');
      if (fixedColumns.length !== columns.length) fixes.push('column count');

      toast.success('🔧 Comprehensive auto-fix completed!', {
        description: `Fixed: ${fixes.join(', ') || 'all validation issues'}. Board is now compliant.`,
      });

      setPendingChanges(true);
      // Don't call onBoardUpdated() to prevent modal from closing

    } catch (error) {
      console.error('Error during comprehensive auto-fix:', error);
      toast.error('Failed to auto-fix board issues. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: EditBoardFormData) => {
    try {
      setLoading(true);
      const updateData: UpdateBoardDTO = {
        name: data.name,
        description: data.description,
      };

      await apiClient.put(`/v1/boards/${board.id}`, updateData);
      
      toast.success('🎉 Board updated successfully!', {
        description: `"${data.name}" has been updated.`,
      });
      onBoardUpdated();
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  // Handle board deletion
  const handleDeleteBoard = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/v1/boards/${board.id}`);
      
      toast.success('🗑️ Board deleted successfully', {
        description: `"${board.name}" has been permanently deleted.`,
      });
      onBoardDeleted?.();
      onClose();
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    } finally {
      setLoading(false);
      setShowDeleteBoard(false);
    }
  };

  // Convert template board to custom board
  const handleConvertToCustomBoard = async () => {
    try {
      setIsConverting(true);

      // Create a new custom board with current settings
      const customBoardData = {
        Name: `${board.name} (Custom)`,
        Description: board.description || 'Custom board created from template',
        Columns: columns.map(col => ({
          Name: col.name,
          Order: col.order,
          Color: col.color,
          Status: col.status,
          Alias: col.alias,
          Description: col.description,
          IsCore: col.isCore
        }))
      };

      const response = await apiClient.post('/v1/boards', customBoardData);
      const newBoard = (response as any).data;

      // Copy all tasks from the template board to the new custom board
      if (board.taskCount > 0) {
        try {
          await apiClient.post(`/v1/boards/${newBoard.id}/copy-tasks`, {
            sourceBoardId: board.id
          });
        } catch (error) {
          console.warn('Failed to copy tasks, but board was created:', error);
        }
      }

      toast.success('🎨 Custom board created!', {
        description: `"${customBoardData.Name}" has been created as your custom board.`,
      });

      setShowTemplateConversion(false);
      onClose();

      // Navigate to the new custom board
      window.location.href = `/boards/${newBoard.id}`;

    } catch (error) {
      console.error('Error converting to custom board:', error);
      toast.error('Failed to create custom board');
    } finally {
      setIsConverting(false);
    }
  };

  // Enhanced drag handling with modal protection
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const column = columns.find(col => col.id === active.id);
    if (column) {
      setActiveColumn(column);
      setIsDragging(true);
      setPreventModalClose(true); // Prevent modal from closing during drag
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveColumn(null);

    // Allow modal to close again after a short delay
    setTimeout(() => setPreventModalClose(false), 100);

    if (!over || active.id === over.id) {
      return;
    }

    // Check if this is a template board and prompt for conversion
    if (board.isTemplate || board.templateId) {
      toast.info('🎨 Template Board Detected', {
        description: 'Create a custom board to reorder columns and make changes.',
        action: {
          label: 'Create Custom Board',
          onClick: () => setShowTemplateConversion(true)
        }
      });
      return;
    }

      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

      const newColumns = arrayMove(columns, oldIndex, newIndex);
      
    // Apply enterprise status mapping rules
    const updatedColumns = newColumns.map((col, index) => {
      const isFirst = index === 0;
      const isLast = index === newColumns.length - 1;

      // Normalize current status with robust parsing
      const currentStatus = normalizeStatus(col.status);
      let newStatus = currentStatus;
      let isCore = col.isCore;

      // Enforce enterprise rules: First = NotStarted, Last = Completed
      if (isFirst && currentStatus !== TaskItemStatus.NotStarted) {
        newStatus = TaskItemStatus.NotStarted;
        isCore = true;
      } else if (isLast && currentStatus !== TaskItemStatus.Completed) {
        newStatus = TaskItemStatus.Completed;
        isCore = true;
      } else if (!isFirst && !isLast) {
        // Middle columns can be InProgress, Pending, or OnHold
        isCore = false;
      }

      return {
        ...col,
        order: index,
        status: newStatus,
        isCore
      };
    });
      
      setColumns(updatedColumns);
    validateAllColumns(updatedColumns);

    // Save the new order and status mappings to backend
      try {
        await Promise.all(
          updatedColumns.map(col => 
            apiClient.put(`/v1/boards/${board.id}/columns/${col.id}`, {
              name: col.name,
            order: col.order,
            status: col.status,
            color: col.color,
            alias: col.alias,
            description: col.description,
            isCore: col.isCore
            })
          )
        );
        
      toast.success('✨ Columns reordered successfully!', {
        description: 'Column order and status mappings have been updated.',
        });
      setPendingChanges(true);
      // Don't call onBoardUpdated() immediately to prevent modal closure
      } catch (error) {
        console.error('Error updating column order:', error);
        toast.error('Failed to update column order');
        // Revert the change
        setColumns([...board.columns].sort((a, b) => a.order - b.order));
    }
  };

  // Column editing functions
  const handleEditColumn = (column: BoardColumnDTO) => {
    // Check if this is a template board and prompt for conversion
    if (board.isTemplate || board.templateId) {
      toast.info('🎨 Template Board Detected', {
        description: 'Create a custom board to edit columns and make changes.',
        action: {
          label: 'Create Custom Board',
          onClick: () => setShowTemplateConversion(true)
        }
      });
      return;
    }

    setEditingColumn(column.id);
    setEditColumnData({
      name: column.name,
      color: column.color || '#6B7280',
      status: normalizeStatus(column.status),
      alias: column.alias || '',
      description: column.description || ''
    });
  };

  const handleEditDataChange = (field: keyof ColumnEditFormData, value: any) => {
    setEditColumnData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveColumnEdit = async () => {
    if (!editColumnData.name.trim() || !editingColumn) {
      toast.error('Column name cannot be empty');
      return;
    }

    try {
      setLoading(true);

      // Validate the edit
      const result = columnEditSchema.safeParse(editColumnData);
      if (!result.success) {
        toast.error('Please fix the validation errors');
        return;
      }

      await apiClient.put(`/v1/boards/${board.id}/columns/${editingColumn}`, {
        name: editColumnData.name.trim(),
        color: editColumnData.color,
        status: editColumnData.status,
        alias: editColumnData.alias?.trim() || null,
        description: editColumnData.description?.trim() || null
      });

      // Update local state
      setColumns(prev => prev.map(col =>
        col.id === editingColumn
          ? {
            ...col,
            name: editColumnData.name.trim(),
            color: editColumnData.color,
            status: editColumnData.status,
            alias: editColumnData.alias?.trim() || undefined,
            description: editColumnData.description?.trim() || undefined
          }
          : col
      ));
      
      toast.success('📝 Column updated successfully', {
        description: `Column "${editColumnData.name.trim()}" has been updated.`,
      });

      setEditingColumn(null);
      setPendingChanges(true);
      // Don't call onBoardUpdated() immediately to prevent modal closure
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Failed to update column');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelColumnEdit = () => {
    setEditingColumn(null);
    setEditColumnData({
      name: '',
      color: '#6B7280',
      status: TaskItemStatus.NotStarted,
      alias: '',
      description: ''
    });
  };

  const handleDeleteColumn = async (column: BoardColumnDTO) => {
    // Don't allow deleting first or last column (core columns)
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const isFirstColumn = sortedColumns[0].id === column.id;
    const isLastColumn = sortedColumns[sortedColumns.length - 1].id === column.id;

    if (isFirstColumn || isLastColumn) {
      toast.error('Cannot delete first or last column. These are core columns for task workflow.');
      return;
    }

    if (columns.length <= 3) {
      toast.error('Minimum 3 columns required');
      return;
    }

    try {
      setDeletingColumn(column.id);
      await apiClient.delete(`/v1/boards/${board.id}/columns/${column.id}`);

      // Update local state
      setColumns(prev => prev.filter(col => col.id !== column.id));
      
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

  const handleAddColumn = async () => {
    try {
      const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
      const newOrder = sortedColumns.length - 1; // Insert before last column

      const newColumn = {
        name: `Column ${columns.length + 1}`,
        order: newOrder,
        color: COLOR_PALETTE[columns.length % COLOR_PALETTE.length],
        status: TaskItemStatus.InProgress,
        alias: `Column ${columns.length + 1}`,
        description: 'New column for tasks',
        isCore: false
      };

      const response = await apiClient.post(`/v1/boards/${board.id}/columns`, newColumn) as { data: BoardColumnDTO };

      // Update local state - insert before last column and reorder
      const updatedColumns = [...sortedColumns];
      updatedColumns.splice(-1, 0, response.data);

      // Reorder all columns
      const reorderedColumns = updatedColumns.map((col, index) => ({
        ...col,
        order: index
      }));

      setColumns(reorderedColumns);

      toast.success('✨ Column added successfully', {
        description: `"${newColumn.name}" has been added to your board.`,
      });
      setPendingChanges(true);
      // Don't call onBoardUpdated() immediately to prevent modal closure
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Failed to add column');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // Use our custom close handler
          handleModalClose(!newOpen);
        }}
      >
        <DialogContent
          className="sm:max-w-[800px] max-h-[90vh] overflow-hidden"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking outside during drag or when modal close is prevented
            if (isDragging || preventModalClose) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with escape during drag or when modal close is prevented
            if (isDragging || preventModalClose) {
              e.preventDefault();
            }
          }}
        >
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
              {/* Template Board Warning */}
              {(board.isTemplate || board.templateId) && (
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Sparkles className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-800 mb-2">
                          📋 Template Board Detected
                        </h3>
                        <p className="text-amber-700 mb-4">
                          This board was created from a template. To make custom changes, we recommend creating a personal custom board.
                        </p>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowTemplateConversion(true)}
                            className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300 text-amber-800 hover:from-amber-200 hover:to-orange-200"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Create Custom Board
                          </Button>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            {board.templateCategory || 'Template'} Board
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                                className="h-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-500"
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
                                className="min-h-[80px] resize-none bg-white/80 backdrop-blur-sm border-2 border-slate-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-500"
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

              {/* Enhanced Board Columns with Drag & Drop */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      <span>Board Columns</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
                    >
                      {columns.length} columns
                    </Badge>
                      {Object.keys(validationErrors).length > 0 && (
                        <>
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {Object.keys(validationErrors).length} issues
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAutoFixStatuses}
                            disabled={loading}
                            className="h-8 px-3 text-xs bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-green-100"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600 mr-1" />
                                Fixing...
                              </>
                            ) : (
                              <>
                                <Zap className="h-3 w-3 mr-1" />
                                Auto-Fix
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Validation Summary Panel */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-800 mb-2">
                              🚨 Board Validation Issues Found
                            </h4>
                            <div className="space-y-1">
                              {Object.entries(validationErrors).map(([columnId, errors]) => {
                                const column = columns.find(c => c.id.toString() === columnId);
                                return (
                                  <div key={columnId} className="text-sm text-red-700">
                                    <span className="font-medium">{column?.name || 'Unknown Column'}:</span>
                                    <ul className="ml-4 list-disc">
                                      {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAutoFixStatuses}
                          disabled={loading}
                          className="ml-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Auto-Fix All Issues
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GripVertical className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          💡 Enhanced Column Management
                        </h4>
                        <p className="text-sm text-blue-700">
                          Drag columns to reorder • Click edit to customize name, color, status, and description •
                          First column = Not Started, Last column = Completed (auto-enforced)
                        </p>
                      </div>
                    </div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {columns.map((column) => (
                          <EnhancedSortableColumnItem
                            key={column.id}
                            column={column}
                            isEditing={editingColumn === column.id}
                            editData={editColumnData}
                            onEdit={() => handleEditColumn(column)}
                            onSave={handleSaveColumnEdit}
                            onCancel={handleCancelColumnEdit}
                            onDelete={() => setShowDeleteColumn({ show: true, column })}
                            onEditDataChange={handleEditDataChange}
                            loading={loading}
                            deleting={deletingColumn === column.id}
                            isDragDisabled={isDragging}
                            validationErrors={validationErrors[column.id] || []}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeColumn ? (
                        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-400 p-4 rotate-3 scale-105">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded-full shadow-lg"
                              style={{ backgroundColor: activeColumn.color || '#6B7280' }}
                            />
                            <span className="font-semibold text-gray-800">
                              {activeColumn.alias || activeColumn.name}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  {/* Add Column Button */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={handleAddColumn}
                      disabled={loading || isDragging}
                      className="w-full border-dashed border-2 border-purple-300 hover:border-purple-400 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  </div>
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
                        disabled={isDragging}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Board
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Modal Footer with Save & Close */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-6 -mx-6 -mb-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(isDragging || preventModalClose) && (
                    <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">
                        {isDragging ? 'Dragging...' : 'Saving changes...'}
                      </span>
                    </div>
                  )}
                  {pendingChanges && !isDragging && (
                    <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Changes saved</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleModalClose(true)}
                    disabled={isDragging || preventModalClose}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {pendingChanges ? 'Save & Close' : 'Close'}
                  </Button>

                  {Object.keys(validationErrors).length > 0 && (
                    <Button
                      onClick={handleAutoFixStatuses}
                      disabled={loading || isDragging}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Auto-Fix Issues
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
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

      {/* Template Conversion Confirmation */}
      <Dialog open={showTemplateConversion} onOpenChange={setShowTemplateConversion}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-amber-700">
              <Crown className="h-5 w-5" />
              <span>Create Custom Board</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">
                    🎨 Convert to Custom Board
                  </h4>
                  <p className="text-sm text-amber-700">
                    This will create a new custom board with all your current settings and tasks,
                    giving you full control to modify columns, statuses, and layout.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>All current tasks will be copied to the new board</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Column settings and customizations will be preserved</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>You'll have full editing control over the new board</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span>The original template board will remain unchanged</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateConversion(false)}
              disabled={isConverting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvertToCustomBoard}
              disabled={isConverting}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Create Custom Board
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};