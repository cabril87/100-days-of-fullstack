'use client';

/**
 * Column Modal Component
 * Modal for creating and editing columns
 */

import React, { useState, useEffect } from 'react';

// Types
import { ColumnModalProps, ColumnFormData } from '@/lib/types/kanban';
import { TaskStatusType } from '@/lib/types/task';

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Icons
import { Trash2 } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

const predefinedColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function ColumnModal({
  isOpen,
  onClose,
  column,
  boardId,
  onSave,
  onDelete
}: ColumnModalProps) {
  const [formData, setFormData] = useState<ColumnFormData>({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    mappedStatus: 'todo' as TaskStatusType,
    taskLimit: undefined,
    isCollapsible: true,
    isDoneColumn: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when column or modal opens
  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
        description: column.description || '',
        color: column.color || '#3b82f6',
        icon: column.icon || '',
        mappedStatus: column.mappedStatus,
        taskLimit: column.taskLimit,
        isCollapsible: column.isCollapsible,
        isDoneColumn: column.isDoneColumn
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '',
        mappedStatus: 'todo' as TaskStatusType,
        taskLimit: undefined,
        isCollapsible: true,
        isDoneColumn: false
      });
    }
  }, [column, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!column || !onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete(column.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {column ? 'Edit Column' : 'Create New Column'}
            </DialogTitle>
            <DialogDescription>
              {column ? 'Update the column details below.' : 'Fill in the details to create a new column.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter column name"
                required
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Enter column description"
                rows={2}
              />
            </div>

            {/* Color */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full border-2",
                        formData.color === color ? "border-gray-900" : "border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-8 p-1 border rounded"
                />
              </div>
            </div>

            {/* Mapped Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mappedStatus" className="text-right">
                Status Type
              </Label>
              <Select
                value={formData.mappedStatus}
                onValueChange={(value: TaskStatusType) => setFormData({ ...formData, mappedStatus: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task Limit */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskLimit" className="text-right">
                WIP Limit
              </Label>
              <Input
                id="taskLimit"
                type="number"
                min="0"
                value={formData.taskLimit || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  taskLimit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="col-span-3"
                placeholder="Leave empty for no limit"
              />
            </div>

            {/* Icon */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Icon</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="checkcircle">Check Circle</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="target">Target</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isCollapsible" className="text-sm font-medium">
                  Collapsible Column
                </Label>
                <Switch
                  id="isCollapsible"
                  checked={formData.isCollapsible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isCollapsible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isDoneColumn" className="text-sm font-medium">
                  Mark as Done Column
                </Label>
                <Switch
                  id="isDoneColumn"
                  checked={formData.isDoneColumn}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDoneColumn: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              {column && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                  {isLoading ? 'Saving...' : column ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 