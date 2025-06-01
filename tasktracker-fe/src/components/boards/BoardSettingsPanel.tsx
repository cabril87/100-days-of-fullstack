'use client';

/**
 * Board Settings Panel Component
 * Comprehensive settings UI with all configuration options
 */

import React, { useState, useEffect } from 'react';
import { Board, BoardSettings, UpdateBoardSettingsDTO } from '@/lib/types/board';
import { useBoard } from '@/lib/providers/BoardProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Palette, 
  Settings2,
  Bell,
  Eye,
  Columns,
  Timer,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface BoardSettingsPanelProps {
  board: Board;
  onClose: () => void;
}

export function BoardSettingsPanel({ board, onClose }: BoardSettingsPanelProps) {
  const { 
    state: { boardSettings, isLoadingSettings },
    updateBoardSettings,
    resetBoardSettings,
    exportBoardSettings,
    importBoardSettings
  } = useBoard();
  
  const { showToast } = useToast();
  const [localSettings, setLocalSettings] = useState<Partial<UpdateBoardSettingsDTO>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local settings when board settings are loaded
  useEffect(() => {
    if (boardSettings) {
      setLocalSettings({
        theme: boardSettings.theme,
        backgroundColor: boardSettings.backgroundColor,
        headerColor: boardSettings.headerColor,
        enableWipLimits: boardSettings.enableWipLimits,
        enableColumnCollapse: boardSettings.enableColumnCollapse,
        enableTaskCounting: boardSettings.enableTaskCounting,
        enableDueDateWarnings: boardSettings.enableDueDateWarnings,
        enablePriorityColors: boardSettings.enablePriorityColors,
        autoMoveCompletedTasks: boardSettings.autoMoveCompletedTasks,
        showColumnIcons: boardSettings.showColumnIcons,
        showTaskLabels: boardSettings.showTaskLabels,
        showTaskAssignees: boardSettings.showTaskAssignees,
        showTaskDueDates: boardSettings.showTaskDueDates,
        showTaskPriorities: boardSettings.showTaskPriorities,
        defaultTaskPriority: boardSettings.defaultTaskPriority,
        defaultColumnColor: boardSettings.defaultColumnColor,
        maxTasksPerColumn: boardSettings.maxTasksPerColumn,
        enableRealTimeUpdates: boardSettings.enableRealTimeUpdates,
        enableNotifications: boardSettings.enableNotifications,
        enableKeyboardShortcuts: boardSettings.enableKeyboardShortcuts,
        enableDragAndDrop: boardSettings.enableDragAndDrop,
        enableColumnReordering: boardSettings.enableColumnReordering,
        enableTaskFiltering: boardSettings.enableTaskFiltering,
        enableSearchFunction: boardSettings.enableSearchFunction,
        enableBulkOperations: boardSettings.enableBulkOperations,
        enableTimeTracking: boardSettings.enableTimeTracking,
        enableProgressTracking: boardSettings.enableProgressTracking
      });
    }
  }, [boardSettings]);

  // Update setting value and mark as changed
  const updateSetting = (key: keyof UpdateBoardSettingsDTO, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    try {
      await updateBoardSettings(board.id, localSettings);
      setHasChanges(false);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      await resetBoardSettings(board.id);
      setHasChanges(false);
      showToast('Settings reset to defaults', 'success');
    } catch (error) {
      showToast('Failed to reset settings', 'error');
    }
  };

  // Export settings
  const handleExport = async () => {
    try {
      await exportBoardSettings(board.id);
    } catch (error) {
      showToast('Failed to export settings', 'error');
    }
  };

  // Import settings
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importBoardSettings(board.id, file);
        setHasChanges(false);
        showToast('Settings imported successfully', 'success');
      } catch (error) {
        showToast('Failed to import settings', 'error');
      }
    }
  };

  if (isLoadingSettings) {
    return (
      <Card className="w-96 h-fit">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Board Settings
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Style</span>
            </TabsTrigger>
            <TabsTrigger value="features">
              <Zap className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Board Theme</Label>
                <Select 
                  value={localSettings.theme || 'light'} 
                  onValueChange={(value) => updateSetting('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={localSettings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="headerColor">Header Color</Label>
                <Input
                  id="headerColor"
                  type="color"
                  value={localSettings.headerColor || '#f8f9fa'}
                  onChange={(e) => updateSetting('headerColor', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showColumnIcons">Show Column Icons</Label>
                <Switch
                  id="showColumnIcons"
                  checked={localSettings.showColumnIcons || false}
                  onCheckedChange={(checked) => updateSetting('showColumnIcons', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTaskLabels">Show Task Labels</Label>
                <Switch
                  id="showTaskLabels"
                  checked={localSettings.showTaskLabels || false}
                  onCheckedChange={(checked) => updateSetting('showTaskLabels', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTaskAssignees">Show Task Assignees</Label>
                <Switch
                  id="showTaskAssignees"
                  checked={localSettings.showTaskAssignees || false}
                  onCheckedChange={(checked) => updateSetting('showTaskAssignees', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTaskDueDates">Show Due Dates</Label>
                <Switch
                  id="showTaskDueDates"
                  checked={localSettings.showTaskDueDates || false}
                  onCheckedChange={(checked) => updateSetting('showTaskDueDates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTaskPriorities">Show Task Priorities</Label>
                <Switch
                  id="showTaskPriorities"
                  checked={localSettings.showTaskPriorities || false}
                  onCheckedChange={(checked) => updateSetting('showTaskPriorities', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enablePriorityColors">Priority Color Coding</Label>
                <Switch
                  id="enablePriorityColors"
                  checked={localSettings.enablePriorityColors || false}
                  onCheckedChange={(checked) => updateSetting('enablePriorityColors', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableWipLimits">Enable WIP Limits</Label>
                <Switch
                  id="enableWipLimits"
                  checked={localSettings.enableWipLimits || false}
                  onCheckedChange={(checked) => updateSetting('enableWipLimits', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableTimeTracking">Enable Time Tracking</Label>
                <Switch
                  id="enableTimeTracking"
                  checked={localSettings.enableTimeTracking || false}
                  onCheckedChange={(checked) => updateSetting('enableTimeTracking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableProgressTracking">Enable Progress Tracking</Label>
                <Switch
                  id="enableProgressTracking"
                  checked={localSettings.enableProgressTracking || false}
                  onCheckedChange={(checked) => updateSetting('enableProgressTracking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoMoveCompletedTasks">Auto Move Completed Tasks</Label>
                <Switch
                  id="autoMoveCompletedTasks"
                  checked={localSettings.autoMoveCompletedTasks || false}
                  onCheckedChange={(checked) => updateSetting('autoMoveCompletedTasks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableColumnCollapse">Enable Column Collapse</Label>
                <Switch
                  id="enableColumnCollapse"
                  checked={localSettings.enableColumnCollapse || false}
                  onCheckedChange={(checked) => updateSetting('enableColumnCollapse', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableTaskCounting">Enable Task Counting</Label>
                <Switch
                  id="enableTaskCounting"
                  checked={localSettings.enableTaskCounting || false}
                  onCheckedChange={(checked) => updateSetting('enableTaskCounting', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableDueDateWarnings">Due Date Warnings</Label>
                <Switch
                  id="enableDueDateWarnings"
                  checked={localSettings.enableDueDateWarnings || false}
                  onCheckedChange={(checked) => updateSetting('enableDueDateWarnings', checked)}
                />
              </div>

              <div>
                <Label htmlFor="defaultTaskPriority">Default Task Priority</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[localSettings.defaultTaskPriority || 3]}
                    onValueChange={([value]) => updateSetting('defaultTaskPriority', value)}
                    max={5}
                    min={1}
                    step={1}
                  />
                  <div className="text-sm text-muted-foreground">
                    Priority: {localSettings.defaultTaskPriority || 3}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="maxTasksPerColumn">Max Tasks Per Column</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[localSettings.maxTasksPerColumn || 20]}
                    onValueChange={([value]) => updateSetting('maxTasksPerColumn', value)}
                    max={100}
                    min={1}
                    step={1}
                  />
                  <div className="text-sm text-muted-foreground">
                    {localSettings.maxTasksPerColumn || 20} tasks
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableRealTimeUpdates">Real-time Updates</Label>
                <Switch
                  id="enableRealTimeUpdates"
                  checked={localSettings.enableRealTimeUpdates || false}
                  onCheckedChange={(checked) => updateSetting('enableRealTimeUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableKeyboardShortcuts">Keyboard Shortcuts</Label>
                <Switch
                  id="enableKeyboardShortcuts"
                  checked={localSettings.enableKeyboardShortcuts || false}
                  onCheckedChange={(checked) => updateSetting('enableKeyboardShortcuts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableDragAndDrop">Drag and Drop</Label>
                <Switch
                  id="enableDragAndDrop"
                  checked={localSettings.enableDragAndDrop || false}
                  onCheckedChange={(checked) => updateSetting('enableDragAndDrop', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableColumnReordering">Column Reordering</Label>
                <Switch
                  id="enableColumnReordering"
                  checked={localSettings.enableColumnReordering || false}
                  onCheckedChange={(checked) => updateSetting('enableColumnReordering', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableTaskFiltering">Task Filtering</Label>
                <Switch
                  id="enableTaskFiltering"
                  checked={localSettings.enableTaskFiltering || false}
                  onCheckedChange={(checked) => updateSetting('enableTaskFiltering', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableSearchFunction">Search Function</Label>
                <Switch
                  id="enableSearchFunction"
                  checked={localSettings.enableSearchFunction || false}
                  onCheckedChange={(checked) => updateSetting('enableSearchFunction', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableBulkOperations">Bulk Operations</Label>
                <Switch
                  id="enableBulkOperations"
                  checked={localSettings.enableBulkOperations || false}
                  onCheckedChange={(checked) => updateSetting('enableBulkOperations', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications">Enable Notifications</Label>
                <Switch
                  id="enableNotifications"
                  checked={localSettings.enableNotifications || false}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>

              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                <p>Advanced notification settings will be available in a future update.</p>
                <p className="mt-2">Current notification features:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Basic task notifications</li>
                  <li>Due date reminders</li>
                  <li>Assignment notifications</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultColumnColor">Default Column Color</Label>
                <Input
                  id="defaultColumnColor"
                  type="color"
                  value={localSettings.defaultColumnColor || '#6366f1'}
                  onChange={(e) => updateSetting('defaultColumnColor', e.target.value)}
                  className="mt-1 w-20 h-10"
                />
              </div>

              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                <p>Advanced features coming soon:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>File attachment settings</li>
                  <li>Public sharing configuration</li>
                  <li>Data export options</li>
                  <li>Background sync settings</li>
                  <li>Custom integrations</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Settings Actions */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!hasChanges} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label className="flex-1">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {hasChanges && (
            <div className="text-center">
              <Badge variant="secondary">
                <Timer className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BoardSettingsPanel; 