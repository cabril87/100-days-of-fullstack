'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  Calendar, 
  Flag, 
  Target,
  Play,
  Filter,
  Star,
  Zap,
  Plus,
  ArrowLeft,
  Save,
  CheckCircle
} from 'lucide-react';
import { Task } from '@/lib/types/task';
import { TaskFormData } from '@/lib/types/task';
import { focusService } from '@/lib/services/focusService';
import { taskService } from '@/lib/services/taskService';
import { useToast } from '@/lib/hooks/useToast';

interface TaskSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSelect: (task: Task, notes?: string) => void;
}

export function TaskSelectionModal({ open, onOpenChange, onTaskSelect }: TaskSelectionModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'priority' | 'due' | 'suggestions'>('suggestions');
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  
  // Task creation state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    estimatedTimeMinutes: 60,
    dueDate: ''
  });
  
  const { showToast } = useToast();

  const priorityOptions = [
    { value: 'Low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'Medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'High', label: 'High Priority', color: 'bg-red-100 text-red-800' }
  ];

  const estimatedTimeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ];

  useEffect(() => {
    if (open) {
      loadTasks();
      loadSuggestions();
      // Reset state when modal opens
      setSelectedTask(null);
      setNotes('');
      setSearchQuery('');
      setFilter('suggestions');
      setActiveTab('select');
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        estimatedTimeMinutes: 60,
        dueDate: ''
      });
      setIsCreatingTask(false);
    }
  }, [open]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({
        sortBy: 'priority',
        sortDirection: 'desc'
      });
      
      if (response.data) {
        // Filter for non-completed tasks
        const activeTasks = Array.isArray(response.data) 
          ? response.data.filter((task: Task) => task.status !== 'done' && task.status !== 'Completed')
          : [];
        setTasks(activeTasks);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await focusService.getFocusSuggestions(5);
      if (response.data) {
        setSuggestions(response.data);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    // Handle both numeric strings from API and text strings
    const normalizedPriority = (() => {
      switch (priority) {
        case '0':
        case 'Low':
        case 'low':
          return 'Low';
        case '1':
        case 'Medium':
        case 'medium':
          return 'Medium';
        case '2':
        case 'High':
        case 'high':
          return 'High';
        default:
          return priority;
      }
    })();

    switch (normalizedPriority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNormalizedPriority = (priority: string): string => {
    switch (priority) {
      case '0':
      case 'Low':
      case 'low':
        return 'Low';
      case '1':
      case 'Medium':
      case 'medium':
        return 'Medium';
      case '2':
      case 'High':
      case 'high':
        return 'High';
      default:
        return priority;
    }
  };

  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Apply filter type
    switch (filter) {
      case 'suggestions':
        return suggestions;
      case 'priority':
        return filteredTasks.sort((a, b) => {
          const priorityOrder: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
          const normalizedA = getNormalizedPriority(a.priority);
          const normalizedB = getNormalizedPriority(b.priority);
          return (priorityOrder[normalizedB] || 0) - (priorityOrder[normalizedA] || 0);
        });
      case 'due':
        return filteredTasks
          .filter(task => task.dueDate)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      default:
        return filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleStartSession = () => {
    if (!selectedTask) return;
    
    onTaskSelect(selectedTask, notes.trim() || undefined);
    onOpenChange(false);
  };

  // Task creation handlers
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    setIsCreatingTask(true);
    try {
      // Map priority string to number for TaskFormData
      const getPriorityNumber = (priority: string): number => {
        switch (priority.toLowerCase()) {
          case 'low': return 0;
          case 'medium': return 1;
          case 'high': return 2;
          default: return 1;
        }
      };

      const taskData: TaskFormData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        status: 'todo' as const,
        priority: getPriorityNumber(newTask.priority),
        dueDate: newTask.dueDate || null
      };

      const response = await taskService.createTask(taskData);
      
      if (response.data) {
        const createdTask = response.data;
        showToast('Task created successfully!', 'success');
        
        // Automatically select the newly created task
        setSelectedTask(createdTask);
        setActiveTab('select');
        
        // Refresh task list
        await loadTasks();
        
        showToast('Task selected for focus session', 'info');
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCreateAndStart = async () => {
    if (!newTask.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    setIsCreatingTask(true);
    try {
      // Map priority string to number for TaskFormData
      const getPriorityNumber = (priority: string): number => {
        switch (priority.toLowerCase()) {
          case 'low': return 0;
          case 'medium': return 1;
          case 'high': return 2;
          default: return 1;
        }
      };

      const taskData: TaskFormData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        status: 'todo' as const,
        priority: getPriorityNumber(newTask.priority),
        dueDate: newTask.dueDate || null
      };

      const response = await taskService.createTask(taskData);
      
      if (response.data) {
        const createdTask = response.data;
        showToast('Task created successfully!', 'success');
        
        // Start focus session with the new task
        onTaskSelect(createdTask, notes.trim() || undefined);
        onOpenChange(false);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const isCreateFormValid = () => {
    return newTask.title.trim().length > 0;
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 opacity-[0.03] rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
        
        <DialogHeader className="relative z-10 pt-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <Target className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-bold">
              Select a Task for Focus Session
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Choose an existing task or create a new one to focus on and boost your productivity.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'select' | 'create')} className="flex-1 flex flex-col overflow-hidden relative z-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden h-full">
            {/* Subtle decorative elements for tabs */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-600 opacity-[0.02] rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-blue-600 opacity-[0.03] rounded-full blur-xl"></div>
            
            <div className="relative z-10 p-2 h-full">
              <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent h-full">
                <TabsTrigger
                  value="select"
                  className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Select Existing Task</div>
                    <div className="text-xs opacity-80">Choose from your tasks</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Create New Task</div>
                    <div className="text-xs opacity-80">Build from scratch</div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Select Task Tab */}
          <TabsContent value="select" className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
              {/* Task Selection Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search and Filter */}
                <div className="space-y-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'suggestions', label: 'Suggestions', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                      { key: 'all', label: 'All Tasks', icon: Target, color: 'from-purple-500 to-purple-600' },
                      { key: 'priority', label: 'By Priority', icon: Flag, color: 'from-red-500 to-red-600' },
                      { key: 'due', label: 'By Due Date', icon: Calendar, color: 'from-blue-500 to-blue-600' }
                    ].map(({ key, label, icon: Icon, color }) => (
                      <Button
                        key={key}
                        variant={filter === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(key as any)}
                        className={filter === key 
                          ? `bg-gradient-to-r ${color} text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-0`
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300'
                        }
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                        <p className="text-sm text-gray-600">Loading your tasks...</p>
                      </div>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Target className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800">No tasks found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery ? 'Try adjusting your search terms' : 'Create a new task to get started with focus sessions'}
                      </p>
                      <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Task
                      </Button>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group cursor-pointer transition-all duration-300 p-4 rounded-xl border hover:shadow-lg ${
                          selectedTask?.id === task.id 
                            ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md scale-[1.02]' 
                            : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30'
                        }`}
                        onClick={() => handleTaskSelect(task)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-3">
                            {filter === 'suggestions' && (
                              <div className="p-1 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                                <Star className="h-3 w-3" />
                              </div>
                            )}
                            <div className={`text-xs px-2 py-1 rounded-lg font-medium ${getPriorityColor(task.priority)}`}>
                              {getNormalizedPriority(task.priority)}
                            </div>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {task.dueDate && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                              <Calendar className="h-3 w-3" />
                              {formatDueDate(task.dueDate)}
                            </div>
                          )}
                          {task.estimatedTimeMinutes && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {task.estimatedTimeMinutes}m
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Session Details Panel */}
              <div className="lg:w-80">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-600 opacity-[0.05] rounded-full blur-xl"></div>
                  
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Session Details
                    </h3>
                    
                    {selectedTask ? (
                      <div className="space-y-6">
                        {/* Selected Task Info */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">{selectedTask.title}</h4>
                          {selectedTask.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedTask.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                              <span className="text-gray-600">Priority:</span>
                              <div className={`px-2 py-1 rounded-lg font-medium ${getPriorityColor(selectedTask.priority)}`}>
                                {getNormalizedPriority(selectedTask.priority)}
                              </div>
                            </div>
                            
                            {selectedTask.dueDate && (
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Due:</span>
                                <span className="font-medium text-gray-800">{formatDueDate(selectedTask.dueDate)}</span>
                              </div>
                            )}
                            
                            {selectedTask.estimatedTimeMinutes && (
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium text-gray-800">{selectedTask.estimatedTimeMinutes} min</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                              <span className="text-gray-600">Progress:</span>
                              <span className="font-medium text-gray-800">{selectedTask.progressPercentage || 0}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Session Notes */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-800">
                            Session Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="What do you want to accomplish in this focus session?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={handleStartSession}
                          className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-base"
                          size="lg"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Start Focus Session
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Target className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm mb-2 font-medium">Select a task to continue</p>
                        <p className="text-xs">Choose a task to start your productive focus session</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Create Task Tab */}
          <TabsContent value="create" className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              {/* Task Creation Form */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-600 opacity-[0.05] rounded-full blur-xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-600 opacity-[0.05] rounded-full blur-xl"></div>
                  
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Create New Task
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Task Title */}
                      <div>
                        <Label htmlFor="task-title" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Task Title *
                        </Label>
                        <Input
                          id="task-title"
                          placeholder="Enter a clear, specific task title..."
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11"
                          required
                        />
                      </div>

                      {/* Task Description */}
                      <div>
                        <Label htmlFor="task-description" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="task-description"
                          placeholder="Add details about what needs to be done..."
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          className="resize-none bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                          rows={3}
                        />
                      </div>

                      {/* Priority and Time Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Priority */}
                        <div>
                          <Label htmlFor="task-priority" className="text-sm font-semibold text-gray-800 mb-2 block">
                            Priority
                          </Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as 'Low' | 'Medium' | 'High' }))}
                          >
                            <SelectTrigger className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Estimated Time */}
                        <div>
                          <Label htmlFor="task-time" className="text-sm font-semibold text-gray-800 mb-2 block">
                            Estimated Time
                          </Label>
                          <Select
                            value={newTask.estimatedTimeMinutes.toString()}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, estimatedTimeMinutes: parseInt(value) }))}
                          >
                            <SelectTrigger className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {estimatedTimeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div>
                        <Label htmlFor="task-due-date" className="text-sm font-semibold text-gray-800 mb-2 block">
                          Due Date (Optional)
                        </Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={handleCreateAndStart}
                          disabled={!isCreateFormValid() || isCreatingTask}
                          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          size="lg"
                        >
                          {isCreatingTask ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                              Creating Task...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Create & Start Focus Session
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={handleCreateTask}
                          disabled={!isCreateFormValid() || isCreatingTask}
                          className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Save className="h-5 w-5 mr-2" />
                          Save Task Only
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="lg:w-80">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-600 opacity-[0.05] rounded-full blur-xl"></div>
                  
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Task Preview
                    </h3>
                    
                    {newTask.title ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-2">{newTask.title}</h4>
                          {newTask.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {newTask.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                              <span className="text-gray-600">Priority:</span>
                              <div className={`px-2 py-1 rounded-lg font-medium ${priorityOptions.find(p => p.value === newTask.priority)?.color}`}>
                                {newTask.priority}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium text-gray-800">{estimatedTimeOptions.find(t => t.value === newTask.estimatedTimeMinutes)?.label}</span>
                            </div>
                            
                            {newTask.dueDate && (
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm col-span-2">
                                <span className="text-gray-600">Due Date:</span>
                                <span className="font-medium text-gray-800">{new Date(newTask.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Session Notes for new task */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-800">
                            Session Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="What do you want to accomplish in this focus session?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none bg-white border-gray-200 focus:border-green-300 focus:ring-green-200"
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm mb-2 font-medium">Enter task details</p>
                        <p className="text-xs">Fill in the form to see your task preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 