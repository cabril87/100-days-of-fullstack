'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Circle, Clock, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskCreationModal from './TaskCreationModal';
import { TasksPageContentProps, Task, TaskStats } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { formatDistance } from 'date-fns';

export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks || []);
  const [stats, setStats] = useState<TaskStats>(initialData.stats);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [recentTasks, taskStats] = await Promise.all([
        taskService.getRecentTasks(50), // Load more tasks for full view
        taskService.getUserTaskStats()
      ]);
      setTasks(recentTasks);
      setStats(taskStats);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    loadTasks(); // Refresh to get updated stats
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      // Update task in local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, isCompleted: true, completedAt: new Date() }
          : task
      ));
      // Refresh stats
      const updatedStats = await taskService.getUserTaskStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      // Refresh stats
      const updatedStats = await taskService.getUserTaskStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.isCompleted) ||
                         (filterStatus === 'pending' && !task.isCompleted);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and boost productivity
          </p>
        </div>
        {user && (
          <TaskCreationModal 
            user={user}
            family={null} // TODO: Add family context when available
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">Loading tasks...</div>
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-gray-500 text-lg">
                  {tasks.length === 0 ? '🎯 No tasks yet!' : '🔍 No tasks match your filters'}
                </div>
                <p className="text-gray-400 text-sm">
                  {tasks.length === 0 
                    ? 'Create your first task to get started with productivity tracking'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className={`transition-all hover:shadow-md ${
              task.isCompleted ? 'opacity-75' : ''
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Completion Toggle */}
                    <button
                      onClick={() => !task.isCompleted && handleCompleteTask(task.id)}
                      className="mt-1 flex-shrink-0"
                      disabled={task.isCompleted}
                    >
                      {task.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${
                          task.isCompleted 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </Badge>
                        {task.pointsValue && (
                          <Badge variant="outline" className="text-purple-600">
                            ⭐ {task.pointsValue} pts
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {formatDistance(new Date(task.dueDate), new Date(), { addSuffix: true })}
                          </div>
                        )}
                        {task.estimatedTimeMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTimeMinutes}m
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed {formatDistance(new Date(task.completedAt), new Date(), { addSuffix: true })}
                          </div>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Points Summary */}
      {stats.totalPoints > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                🏆 {stats.totalPoints} Points
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm mt-1">
                Keep completing tasks to earn more points and level up!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 