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
import { cn } from '@/lib/helpers/utils/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  GripVertical,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

import { ColumnsTabContentProps } from '@/lib/types/board-tabs';
import { BoardColumnDTO, BoardColumnUpdateDTO } from '@/lib/types/boards';
import { TaskItemStatus } from '@/lib/types/tasks';
import { BoardService } from '@/lib/services/boardService';

// Color palette for columns
const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
  '#6b7280', // gray-500
];

interface ColumnFormData extends BoardColumnDTO {
  hasChanges?: boolean;
  isNew?: boolean;
}

export const ColumnsTabContent: React.FC<ColumnsTabContentProps> = ({
  board,
  onColumnsUpdate,
}) => {
  const [columns, setColumns] = useState<ColumnFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize columns from board data
  useEffect(() => {
    const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
    setColumns(sortedColumns.map(col => ({ ...col, hasChanges: false, isNew: false })));
  }, [board.columns]);

  const handleColumnChange = (index: number, field: keyof BoardColumnDTO, value: string | number | TaskItemStatus) => {
    setColumns(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        hasChanges: true
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleAddColumn = () => {
    const newColumn: ColumnFormData = {
      id: Date.now(), // Temporary ID for new columns
      name: `Column ${columns.length + 1}`,
      order: columns.length,
      color: COLOR_PALETTE[columns.length % COLOR_PALETTE.length],
      status: TaskItemStatus.Pending,
      isNew: true,
      hasChanges: true
    };

    setColumns(prev => [...prev, newColumn]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length <= 3) {
      toast.error('Board must have at least 3 columns');
      return;
    }

    setColumns(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleResetChanges = () => {
    const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);
    setColumns(sortedColumns.map(col => ({ ...col, hasChanges: false, isNew: false })));
    setHasUnsavedChanges(false);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      // Prepare columns for update
      const columnsToUpdate: BoardColumnUpdateDTO[] = columns.map((col, index) => ({
        id: col.isNew ? undefined : col.id,
        name: col.name,
        order: index,
        color: col.color,
        status: col.status,
        alias: col.alias,
        description: col.description,
        isCore: col.isCore
      }));

      await BoardService.updateBoard(board.id, {
        columns: columnsToUpdate
      });

      toast.success('Columns updated successfully');
      setHasUnsavedChanges(false);
      onColumnsUpdate();
    } catch (error) {
      console.error('Failed to update columns:', error);
      toast.error('Failed to update columns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: TaskItemStatus) => {
    switch (status) {
      case TaskItemStatus.NotStarted:
        return 'bg-gray-100 text-gray-800';
      case TaskItemStatus.Pending:
        return 'bg-blue-100 text-blue-800';
      case TaskItemStatus.Completed:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Column Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your board columns, their order, and properties
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChanges}
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Columns List */}
      <div className="space-y-4">
        {columns.map((column, index) => (
          <Card key={column.id} className={cn(
            "transition-all duration-200",
            column.hasChanges && "ring-2 ring-blue-200 border-blue-300"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Column Form */}
                <div className="flex-1 space-y-4">
                  {/* Name and Status Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`column-name-${index}`} className="text-sm font-medium text-gray-700">
                        Column Name
                      </Label>
                      <Input
                        id={`column-name-${index}`}
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                        placeholder="Enter column name"
                        className="text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(column.status)}>
                          {column.status}
                        </Badge>
                        {column.isCore && (
                          <Badge variant="outline" className="text-xs">
                            Core
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Color and Order Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: column.color }}
                        />
                        <div className="flex flex-wrap gap-1">
                          {COLOR_PALETTE.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColumnChange(index, 'color', color)}
                              className={cn(
                                "w-6 h-6 rounded border-2 transition-all duration-200",
                                column.color === color
                                  ? "border-gray-900 scale-110"
                                  : "border-gray-200 hover:border-gray-400"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Order Position
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          Position {index + 1}
                        </Badge>
                        {column.hasChanges && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`column-desc-${index}`} className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </Label>
                    <Input
                      id={`column-desc-${index}`}
                      value={column.description || ''}
                      onChange={(e) => handleColumnChange(index, 'description', e.target.value)}
                      placeholder="Add a description for this column"
                      className="text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveColumn(index)}
                  disabled={columns.length <= 3}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Column Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              onClick={handleAddColumn}
              className="w-full h-16 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Column
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Column Configuration Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Boards must have at least 3 columns</li>
                <li>• First column represents &quot;Not Started&quot; tasks</li>
                <li>• Last column represents &quot;Completed&quot; tasks</li>
                <li>• Middle columns represent &quot;In Progress&quot; tasks</li>
                <li>• Drag columns to reorder them</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 

