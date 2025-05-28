'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Clock, 
  Calendar, 
  Flag, 
  Target,
  Play,
  Filter,
  Star,
  Zap
} from 'lucide-react';
import { Task } from '@/lib/types/task';
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
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      loadTasks();
      loadSuggestions();
      // Reset state when modal opens
      setSelectedTask(null);
      setNotes('');
      setSearchQuery('');
      setFilter('suggestions');
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select a Task for Focus Session
          </DialogTitle>
          <DialogDescription>
            Choose a task to focus on. You can search, filter, or select from our suggestions.
          </DialogDescription>
        </DialogHeader>

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
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'suggestions', label: 'Suggestions', icon: Zap },
                  { key: 'all', label: 'All Tasks', icon: Target },
                  { key: 'priority', label: 'By Priority', icon: Flag },
                  { key: 'due', label: 'By Due Date', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-4">
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{filter === 'suggestions' ? 'No task suggestions available' : 'No tasks found matching your criteria'}</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTask?.id === task.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1 ml-2">
                          {filter === 'suggestions' && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {getNormalizedPriority(task.priority)}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDueDate(task.dueDate)}
                          </div>
                        )}
                        {task.estimatedTimeMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTimeMinutes}m
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Session Details Panel */}
          <div className="lg:w-80 flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-sm">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTask ? (
                  <>
                    {/* Selected Task Info */}
                    <div>
                      <h4 className="font-medium mb-2">{selectedTask.title}</h4>
                      {selectedTask.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedTask.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="secondary" className={getPriorityColor(selectedTask.priority)}>
                            {getNormalizedPriority(selectedTask.priority)}
                          </Badge>
                        </div>
                        
                        {selectedTask.dueDate && (
                          <div className="flex justify-between">
                            <span>Due:</span>
                            <span>{formatDueDate(selectedTask.dueDate)}</span>
                          </div>
                        )}
                        
                        {selectedTask.estimatedTimeMinutes && (
                          <div className="flex justify-between">
                            <span>Estimated:</span>
                            <span>{selectedTask.estimatedTimeMinutes} min</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span>Progress:</span>
                          <span>{selectedTask.progressPercentage || 0}%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Session Notes */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Session Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="What do you want to accomplish in this session?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleStartSession}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Focus Session
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a task to start your focus session</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 