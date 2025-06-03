'use client';

/**
 * Board Settings Panel Component
 * Comprehensive settings management for Kanban boards
 */

import React, { useState, useCallback } from 'react';

// Types
import { Board, BoardSettings, UpdateBoardSettings } from '@/lib/types/board';
import { CustomTaskStatus } from '@/lib/types/task';

// Components
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import {
  Settings,
  Palette,
  Zap,
  Bell,
  Layout,
  Target,
  Save,
  RotateCcw,
  AlertCircle,
  Workflow
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

interface BoardSettingsPanelProps {
  board: Board;
  settings: BoardSettings | null;
  onUpdateSettings: (settings: UpdateBoardSettings) => Promise<void>;
  onUpdateBoard: (boardId: number, data: Partial<Board>) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function BoardSettingsPanel({
  board,
  settings,
  onUpdateSettings,
  onUpdateBoard,
  isOpen,
  onClose
}: BoardSettingsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock custom statuses for now (replace with real data)
  const [customStatuses] = useState<CustomTaskStatus[]>([]);

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<Partial<UpdateBoardSettings>>(
    settings ? {
      theme: settings.theme,
      backgroundColor: settings.backgroundColor,
      headerColor: settings.headerColor,
      enableWipLimits: settings.enableWipLimits,
      enableColumnCollapse: settings.enableColumnCollapse,
      enableTaskCounting: settings.enableTaskCounting,
      enableDueDateWarnings: settings.enableDueDateWarnings,
      enablePriorityColors: settings.enablePriorityColors,
      autoMoveCompletedTasks: settings.autoMoveCompletedTasks,
      showColumnIcons: settings.showColumnIcons,
      showTaskLabels: settings.showTaskLabels,
      showTaskAssignees: settings.showTaskAssignees,
      showTaskDueDates: settings.showTaskDueDates,
      showTaskPriorities: settings.showTaskPriorities,
      defaultTaskPriority: settings.defaultTaskPriority,
      defaultColumnColor: settings.defaultColumnColor,
      maxTasksPerColumn: settings.maxTasksPerColumn,
      enableRealTimeUpdates: settings.enableRealTimeUpdates,
      enableNotifications: settings.enableNotifications,
      enableKeyboardShortcuts: settings.enableKeyboardShortcuts,
      enableDragAndDrop: settings.enableDragAndDrop,
      enableColumnReordering: settings.enableColumnReordering,
      enableTaskFiltering: settings.enableTaskFiltering,
      enableSearchFunction: settings.enableSearchFunction,
      enableBulkOperations: settings.enableBulkOperations,
      enableTimeTracking: settings.enableTimeTracking,
      enableProgressTracking: settings.enableProgressTracking,
    } : {}
  );

  const [localBoard, setLocalBoard] = useState({
    name: board.name,
    description: board.description || ''
  });

  // Handle setting updates
  const updateSetting = useCallback((key: keyof UpdateBoardSettings, value: string | number | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Handle board info updates
  const updateBoard = useCallback((key: 'name' | 'description', value: string) => {
    setLocalBoard(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Save changes
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save board info changes
      if (localBoard.name !== board.name || localBoard.description !== board.description) {
        await onUpdateBoard(board.id, localBoard);
      }

      // Save settings changes
      if (Object.keys(localSettings).length > 0) {
        await onUpdateSettings(localSettings);
      }

      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [localBoard, board, localSettings, onUpdateBoard, onUpdateSettings]);

  // Reset changes
  const handleReset = useCallback(() => {
    setLocalBoard({
      name: board.name,
      description: board.description || ''
    });
    setLocalSettings(settings ? {
      theme: settings.theme,
      backgroundColor: settings.backgroundColor,
      headerColor: settings.headerColor,
      enableWipLimits: settings.enableWipLimits,
      enableColumnCollapse: settings.enableColumnCollapse,
      enableTaskCounting: settings.enableTaskCounting,
      enableDueDateWarnings: settings.enableDueDateWarnings,
      enablePriorityColors: settings.enablePriorityColors,
      autoMoveCompletedTasks: settings.autoMoveCompletedTasks,
      showColumnIcons: settings.showColumnIcons,
      showTaskLabels: settings.showTaskLabels,
      showTaskAssignees: settings.showTaskAssignees,
      showTaskDueDates: settings.showTaskDueDates,
      showTaskPriorities: settings.showTaskPriorities,
      defaultTaskPriority: settings.defaultTaskPriority,
      defaultColumnColor: settings.defaultColumnColor,
      maxTasksPerColumn: settings.maxTasksPerColumn,
      enableRealTimeUpdates: settings.enableRealTimeUpdates,
      enableNotifications: settings.enableNotifications,
      enableKeyboardShortcuts: settings.enableKeyboardShortcuts,
      enableDragAndDrop: settings.enableDragAndDrop,
      enableColumnReordering: settings.enableColumnReordering,
      enableTaskFiltering: settings.enableTaskFiltering,
      enableSearchFunction: settings.enableSearchFunction,
      enableBulkOperations: settings.enableBulkOperations,
      enableTimeTracking: settings.enableTimeTracking,
      enableProgressTracking: settings.enableProgressTracking,
    } : {});
    setHasChanges(false);
  }, [board, settings]);

  // Predefined themes
  const themes = [
    { value: 'default', label: 'Default', description: 'Clean and modern' },
    { value: 'dark', label: 'Dark Mode', description: 'Easy on the eyes' },
    { value: 'light', label: 'Light Mode', description: 'Bright and airy' },
    { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
    { value: 'professional', label: 'Professional', description: 'Business focused' },
    { value: 'creative', label: 'Creative', description: 'Colorful and inspiring' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 1, label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 2, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 3, label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 4, label: 'Critical', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Board Settings
          </DialogTitle>
          <DialogDescription>
            Customize your board appearance, behavior, and features
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Board Information</CardTitle>
                  <CardDescription>
                    Basic information about your board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="board-name">Board Name</Label>
                    <Input
                      id="board-name"
                      value={localBoard.name}
                      onChange={(e) => updateBoard('name', e.target.value)}
                      placeholder="Enter board name..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="board-description">Description</Label>
                    <Textarea
                      id="board-description"
                      value={localBoard.description}
                      onChange={(e) => updateBoard('description', e.target.value)}
                      placeholder="Describe the purpose of this board..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Default Settings</CardTitle>
                  <CardDescription>
                    Default values for new tasks and columns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Task Priority</Label>
                    <Select
                      value={localSettings.defaultTaskPriority?.toString()}
                      onValueChange={(value) => updateSetting('defaultTaskPriority', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select default priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value.toString()}>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", priority.color)}>
                                {priority.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="default-column-color">Default Column Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="default-column-color"
                        type="color"
                        value={localSettings.defaultColumnColor || '#3b82f6'}
                        onChange={(e) => updateSetting('defaultColumnColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={localSettings.defaultColumnColor || '#3b82f6'}
                        onChange={(e) => updateSetting('defaultColumnColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Maximum Tasks Per Column</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[localSettings.maxTasksPerColumn || 20]}
                        onValueChange={([value]) => updateSetting('maxTasksPerColumn', value)}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>5 tasks</span>
                        <span className="font-medium">{localSettings.maxTasksPerColumn || 20} tasks</span>
                        <span>100 tasks</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme & Colors</CardTitle>
                  <CardDescription>
                    Customize the visual appearance of your board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Board Theme</Label>
                    <Select
                      value={localSettings.theme || 'default'}
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme..." />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div>
                              <div className="font-medium">{theme.label}</div>
                              <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={localSettings.backgroundColor || '#ffffff'}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={localSettings.backgroundColor || '#ffffff'}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="header-color">Header Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="header-color"
                        type="color"
                        value={localSettings.headerColor || '#f1f5f9'}
                        onChange={(e) => updateSetting('headerColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={localSettings.headerColor || '#f1f5f9'}
                        onChange={(e) => updateSetting('headerColor', e.target.value)}
                        placeholder="#f1f5f9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Display Options</CardTitle>
                  <CardDescription>
                    Control what information is shown on the board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Column Icons</Label>
                      <p className="text-sm text-muted-foreground">Display icons next to column names</p>
                    </div>
                    <Switch
                      checked={localSettings.showColumnIcons ?? true}
                      onCheckedChange={(checked) => updateSetting('showColumnIcons', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Task Labels</Label>
                      <p className="text-sm text-muted-foreground">Display category labels on tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.showTaskLabels ?? true}
                      onCheckedChange={(checked) => updateSetting('showTaskLabels', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Task Assignees</Label>
                      <p className="text-sm text-muted-foreground">Display assigned users on tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.showTaskAssignees ?? true}
                      onCheckedChange={(checked) => updateSetting('showTaskAssignees', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Due Dates</Label>
                      <p className="text-sm text-muted-foreground">Display due dates on tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.showTaskDueDates ?? true}
                      onCheckedChange={(checked) => updateSetting('showTaskDueDates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Priority Colors</Label>
                      <p className="text-sm text-muted-foreground">Use colors to indicate task priority</p>
                    </div>
                    <Switch
                      checked={localSettings.enablePriorityColors ?? true}
                      onCheckedChange={(checked) => updateSetting('enablePriorityColors', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workflow Settings */}
            <TabsContent value="workflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">WIP Limits & Flow</CardTitle>
                  <CardDescription>
                    Control task flow and work-in-progress limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable WIP Limits</Label>
                      <p className="text-sm text-muted-foreground">Enforce work-in-progress limits on columns</p>
                    </div>
                    <Switch
                      checked={localSettings.enableWipLimits ?? true}
                      onCheckedChange={(checked) => updateSetting('enableWipLimits', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-move Completed Tasks</Label>
                      <p className="text-sm text-muted-foreground">Automatically move completed tasks to done column</p>
                    </div>
                    <Switch
                      checked={localSettings.autoMoveCompletedTasks ?? false}
                      onCheckedChange={(checked) => updateSetting('autoMoveCompletedTasks', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Task Counting</Label>
                      <p className="text-sm text-muted-foreground">Show task counts on column headers</p>
                    </div>
                    <Switch
                      checked={localSettings.enableTaskCounting ?? true}
                      onCheckedChange={(checked) => updateSetting('enableTaskCounting', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Due Date Warnings</Label>
                      <p className="text-sm text-muted-foreground">Highlight tasks approaching due dates</p>
                    </div>
                    <Switch
                      checked={localSettings.enableDueDateWarnings ?? true}
                      onCheckedChange={(checked) => updateSetting('enableDueDateWarnings', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Tracking</CardTitle>
                  <CardDescription>
                    Monitor progress and time tracking features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Time Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track time spent on tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.enableTimeTracking ?? false}
                      onCheckedChange={(checked) => updateSetting('enableTimeTracking', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Progress Tracking</Label>
                      <p className="text-sm text-muted-foreground">Show completion progress on tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.enableProgressTracking ?? false}
                      onCheckedChange={(checked) => updateSetting('enableProgressTracking', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Custom Task Statuses
                  </CardTitle>
                  <CardDescription>
                    Create and manage custom statuses for your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Custom Status Workflow</Label>
                      <p className="text-sm text-muted-foreground">
                        Define custom statuses beyond the default To Do, In Progress, Done
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Statuses
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {customStatuses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span>Current statuses:</span>
                        {customStatuses.slice(0, 5).map((status, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {status.displayName}
                          </Badge>
                        ))}
                        {customStatuses.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{customStatuses.length - 5} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p>Using default statuses: To Do, In Progress, Done</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Settings */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Board Features</CardTitle>
                  <CardDescription>
                    Enable or disable board functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Drag & Drop</Label>
                      <p className="text-sm text-muted-foreground">Allow dragging tasks between columns</p>
                    </div>
                    <Switch
                      checked={localSettings.enableDragAndDrop ?? true}
                      onCheckedChange={(checked) => updateSetting('enableDragAndDrop', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Column Reordering</Label>
                      <p className="text-sm text-muted-foreground">Allow reordering of columns</p>
                    </div>
                    <Switch
                      checked={localSettings.enableColumnReordering ?? true}
                      onCheckedChange={(checked) => updateSetting('enableColumnReordering', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Filtering</Label>
                      <p className="text-sm text-muted-foreground">Enable task filtering and search</p>
                    </div>
                    <Switch
                      checked={localSettings.enableTaskFiltering ?? true}
                      onCheckedChange={(checked) => updateSetting('enableTaskFiltering', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Search Function</Label>
                      <p className="text-sm text-muted-foreground">Enable search across tasks</p>
                    </div>
                    <Switch
                      checked={localSettings.enableSearchFunction ?? true}
                      onCheckedChange={(checked) => updateSetting('enableSearchFunction', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bulk Operations</Label>
                      <p className="text-sm text-muted-foreground">Allow bulk task operations</p>
                    </div>
                    <Switch
                      checked={localSettings.enableBulkOperations ?? false}
                      onCheckedChange={(checked) => updateSetting('enableBulkOperations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Keyboard Shortcuts</Label>
                      <p className="text-sm text-muted-foreground">Enable keyboard shortcuts for power users</p>
                    </div>
                    <Switch
                      checked={localSettings.enableKeyboardShortcuts ?? true}
                      onCheckedChange={(checked) => updateSetting('enableKeyboardShortcuts', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Column Features</CardTitle>
                  <CardDescription>
                    Column-specific functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Column Collapse</Label>
                      <p className="text-sm text-muted-foreground">Allow collapsing/expanding columns</p>
                    </div>
                    <Switch
                      checked={localSettings.enableColumnCollapse ?? true}
                      onCheckedChange={(checked) => updateSetting('enableColumnCollapse', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time & Notifications</CardTitle>
                  <CardDescription>
                    Configure real-time updates and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive live updates from other users</p>
                    </div>
                    <Switch
                      checked={localSettings.enableRealTimeUpdates ?? true}
                      onCheckedChange={(checked) => updateSetting('enableRealTimeUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notification alerts for board changes</p>
                    </div>
                    <Switch
                      checked={localSettings.enableNotifications ?? true}
                      onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="mr-auto">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
          
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
            {isLoading ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 