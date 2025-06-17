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

import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Save,
  Trash2,
  AlertTriangle,
  Calendar,
  Tag,
  Info,
  Settings,
  Palette,
  Bell,
  Shield,
  Download,
  Upload
} from 'lucide-react';

import { SettingsTabContentProps } from '@/lib/types/board-tabs';
import { UpdateBoardDTO } from '@/lib/types/board';
import { BoardService } from '@/lib/services/boardService';

export const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
  board,
  onBoardUpdate,
  onBoardDelete,
}) => {
  const [formData, setFormData] = useState({
    name: board.name,
    description: board.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasChanges = formData.name !== board.name || formData.description !== (board.description || '');

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      const updateData: UpdateBoardDTO = {
        name: formData.name,
        description: formData.description || undefined,
      };

      await BoardService.updateBoard(board.id, updateData);
      toast.success('Board settings updated successfully');
      onBoardUpdate();
    } catch (error) {
      console.error('Failed to update board:', error);
      toast.error('Failed to update board settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChanges = () => {
    setFormData({
      name: board.name,
      description: board.description || '',
    });
  };

  const handleDeleteBoard = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      toast.error('Please type &quot;DELETE&quot; to confirm');
      return;
    }

    try {
      setLoading(true);
      await BoardService.deleteBoard(board.id);
      toast.success('Board deleted successfully');
      setShowDeleteDialog(false);
      onBoardDelete?.();
    } catch (error) {
      console.error('Failed to delete board:', error);
      toast.error('Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Board Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage board information, preferences, and advanced settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChanges}
              className="text-gray-600 hover:text-gray-900"
            >
              Reset
            </Button>
          )}
          
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name" className="text-sm font-medium text-gray-700">
              Board Name
            </Label>
            <Input
              id="board-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter board name"
              className="text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="board-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description for your board"
              rows={3}
              className="text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Board Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Board Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Board ID</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  #{board.id}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Total Tasks</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {board.taskCount} tasks
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Columns</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  {board.columns.length} columns
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Created</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formatDate(board.createdAt)}
                </span>
              </div>
            </div>

            {board.updatedAt && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(board.updatedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Template Information */}
          {(board.isTemplate || board.templateId) && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Template Information</Label>
                <div className="flex flex-wrap gap-2">
                  {board.isTemplate && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Tag className="h-3 w-3 mr-1" />
                      Template Board
                    </Badge>
                  )}
                  {board.templateId && (
                    <Badge variant="outline">
                      From Template: {board.templateId}
                    </Badge>
                  )}
                  {board.templateCategory && (
                    <Badge variant="outline">
                      Category: {board.templateCategory}
                    </Badge>
                  )}
                  {board.isCustom && (
                    <Badge className="bg-orange-100 text-orange-800">
                      Custom Board
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4 text-gray-900 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Export Board</div>
                  <div className="text-sm text-gray-600">Download board data as JSON</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 text-gray-900 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Import Tasks</div>
                  <div className="text-sm text-gray-600">Import tasks from CSV file</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 text-gray-900 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Theme Settings</div>
                  <div className="text-sm text-gray-600">Customize board appearance</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4 text-gray-900 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Notifications</div>
                  <div className="text-sm text-gray-600">Configure board notifications</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-medium text-red-900">Delete Board</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete this board and all its tasks. This action cannot be undone.
              </p>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Board
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Board
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the board
                    &quot;{board.name}&quot; and all of its tasks.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>Warning:</strong> You will lose all {board.taskCount} tasks and {board.columns.length} columns.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delete-confirm" className="text-sm font-medium text-gray-700">
                      Type <strong>DELETE</strong> to confirm:
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBoard}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete' || loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? 'Deleting...' : 'Delete Board'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 