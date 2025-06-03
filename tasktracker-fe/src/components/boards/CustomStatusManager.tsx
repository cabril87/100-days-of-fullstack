'use client';

/**
 * Custom Status Manager Component
 * Allows users to create, edit, delete, and manage custom task statuses
 */

import React, { useState, useCallback, useEffect } from 'react';

// Types
import { 
  CustomTaskStatus, 
  CreateCustomStatusRequest, 
  UpdateCustomStatusRequest,
  WORKFLOW_STATUS_TEMPLATES,
  TaskStatusCategory
} from '@/lib/types/task';
import { Board } from '@/lib/types/board';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import {
  Plus,
  Edit,
  Trash2,
  Circle,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Settings,
  Tag,
  Download,
  Workflow,
  Sparkles
} from 'lucide-react';


interface CustomStatusManagerProps {
  board: Board;
  currentStatuses: CustomTaskStatus[];
  onCreateStatus: (statusData: CreateCustomStatusRequest) => Promise<void>;
  onUpdateStatus: (statusId: string, statusData: UpdateCustomStatusRequest) => Promise<void>;
  onDeleteStatus: (statusId: string) => Promise<void>;
  onApplyTemplate: (templateId: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface StatusFormData {
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  category: TaskStatusCategory;
}

// Icon mapping for status display
const statusIcons = {
  circle: Circle,
  play: Play,
  check: CheckCircle,
  clock: Clock,
  alert: AlertCircle,
  x: XCircle,
};

export function CustomStatusManager({
  board,
  currentStatuses,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
  onApplyTemplate,
  isOpen,
  onClose,
  className = ''
}: CustomStatusManagerProps) {
  const [activeTab, setActiveTab] = useState('manage');
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CustomTaskStatus | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<CustomTaskStatus[]>(currentStatuses);

  // Form state
  const [formData, setFormData] = useState<StatusFormData>({
    name: '',
    displayName: '',
    description: '',
    color: '#3B82F6',
    icon: 'circle',
    category: 'custom'
  });

  // Update local statuses when props change
  useEffect(() => {
    setStatuses(currentStatuses);
  }, [currentStatuses]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      color: '#3B82F6',
      icon: 'circle',
      category: 'custom'
    });
    setEditingStatus(null);
  }, []);

  // Handle create/edit status
  const handleSaveStatus = useCallback(async () => {
    if (!formData.displayName.trim()) return;

    setIsLoading(true);
    try {
      const statusData = {
        name: formData.name || formData.displayName.toLowerCase().replace(/\s+/g, '-'),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        category: formData.category,
        order: editingStatus?.order || statuses.length
      };

      if (editingStatus) {
        await onUpdateStatus(editingStatus.id, statusData);
      } else {
        await onCreateStatus(statusData);
      }

      resetForm();
      setShowStatusForm(false);
    } catch (error) {
      console.error('Failed to save status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, editingStatus, statuses.length, onCreateStatus, onUpdateStatus, resetForm]);

  // Handle edit status
  const handleEditStatus = useCallback((status: CustomTaskStatus) => {
    setFormData({
      name: status.name,
      displayName: status.displayName,
      description: status.description || '',
      color: status.color,
      icon: status.icon || 'circle',
      category: status.category
    });
    setEditingStatus(status);
    setShowStatusForm(true);
  }, []);

  // Handle delete status
  const handleDeleteStatus = useCallback(async () => {
    if (!statusToDelete) return;

    setIsLoading(true);
    try {
      await onDeleteStatus(statusToDelete);
      setShowDeleteDialog(false);
      setStatusToDelete(null);
    } catch (error) {
      console.error('Failed to delete status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusToDelete, onDeleteStatus]);

  // Handle apply template
  const handleApplyTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      await onApplyTemplate(templateId);
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onApplyTemplate]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Task Statuses
            </DialogTitle>
            <DialogDescription>
              Create and manage custom statuses for your board workflow
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Statuses
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Templates
                </TabsTrigger>
              </TabsList>

              {/* Manage Statuses Tab */}
              <TabsContent value="manage" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Current Statuses</h3>
                    <p className="text-sm text-muted-foreground">
                      {statuses.length} statuses configured
                    </p>
                  </div>
                  
                  <Button onClick={() => setShowStatusForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Status
                  </Button>
                </div>

                <div className="space-y-2">
                  {statuses.map((status) => {
                    const IconComponent = statusIcons[status.icon as keyof typeof statusIcons] || Circle;
                    
                    return (
                      <div
                        key={status.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: status.color }}
                        >
                          <IconComponent className="h-3 w-3 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{status.displayName}</h4>
                            <Badge 
                              variant={status.isSystemDefault ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {status.category}
                            </Badge>
                            {status.isSystemDefault && (
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                System
                              </Badge>
                            )}
                          </div>
                          {status.description && (
                            <p className="text-sm text-muted-foreground truncate">{status.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStatus(status)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {!status.isSystemDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStatusToDelete(status.id);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {statuses.length === 0 && (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Custom Statuses</h3>
                    <p className="text-muted-foreground mb-4">
                      Create custom statuses to match your workflow
                    </p>
                    <Button onClick={() => setShowStatusForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Status
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Workflow Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Workflow Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply pre-built status workflows for common use cases
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(WORKFLOW_STATUS_TEMPLATES).map(([templateId, template]) => (
                    <Card key={templateId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize">
                          {templateId.replace('-', ' ')}
                        </CardTitle>
                        <CardDescription>
                          {template.length} statuses included
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {template.slice(0, 4).map((status, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              <span className="text-xs">{status.displayName}</span>
                            </div>
                          ))}
                          {template.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{template.length - 4} more
                            </span>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleApplyTemplate(templateId)}
                          disabled={isLoading}
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Apply Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Form Dialog */}
      <Dialog open={showStatusForm} onOpenChange={setShowStatusForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStatus ? 'Edit Status' : 'Create Status'}
            </DialogTitle>
            <DialogDescription>
              {editingStatus ? 'Update the status configuration' : 'Define a new custom status for your workflow'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status-display-name">Display Name</Label>
              <Input
                id="status-display-name"
                placeholder="e.g., In Review"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status-description">Description</Label>
              <Textarea
                id="status-description"
                placeholder="Describe when tasks should have this status..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    category: value as TaskStatusCategory
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="play">Play</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="clock">Clock</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="x">X</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="status-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="status-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveStatus}
              disabled={!formData.displayName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  {editingStatus ? 'Update' : 'Create'} Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this status? This action cannot be undone.
              Tasks with this status will be moved to the default status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStatus}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 