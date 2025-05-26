'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  Info,
  RefreshCw,
  Plus,
  Target,
  Zap,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { reminderService, CreateReminderData } from '@/lib/services/reminderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ReminderFormData {
  title: string;
  description: string;
  reminderTime: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRepeating: boolean;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  taskId?: string;
}

export default function CreateReminderPage(): React.ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    reminderTime: '',
    dueDate: '',
    priority: 'medium',
    isRepeating: false,
    repeatFrequency: undefined,
    taskId: undefined
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReminderFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReminderFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.reminderTime && formData.dueDate) {
      const reminderDate = new Date(formData.reminderTime);
      const dueDate = new Date(formData.dueDate);
      
      if (reminderDate > dueDate) {
        newErrors.reminderTime = 'Reminder time must be before due date';
      }
    }

    if (formData.isRepeating && !formData.repeatFrequency) {
      newErrors.repeatFrequency = 'Repeat frequency is required for repeating reminders';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Create reminder data object
      const reminderData: CreateReminderData = {
        title: formData.title,
        description: formData.description || undefined,
        reminderTime: formData.reminderTime,
        dueDate: formData.dueDate,
        priority: formData.priority,
        isRepeating: formData.isRepeating,
        repeatFrequency: formData.isRepeating ? formData.repeatFrequency : undefined,
        taskId: formData.taskId || undefined,
      };

      // Call real API
      const response = await reminderService.createReminder(reminderData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showToast('Reminder created successfully!', 'success');
      router.push('/reminders');
    } catch (error) {
      console.error('Failed to create reminder:', error);
      showToast('Failed to create reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReminderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'from-red-400 to-red-600';
      case 'high': return 'from-orange-400 to-orange-600';
      case 'medium': return 'from-blue-400 to-blue-600';
      case 'low': return 'from-gray-400 to-gray-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Set default times
  const getDefaultReminderTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getDefaultDueDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/reminders"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Create New Reminder
              </h1>
              <p className="text-gray-600 mt-1">
                Set up a smart reminder to stay on top of your tasks
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="pt-6 relative z-10">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details for your reminder
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter reminder title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter reminder description (optional)..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded bg-gradient-to-r ${getPriorityColor('low')} text-white`}>
                              {getPriorityIcon('low')}
                            </div>
                            Low Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded bg-gradient-to-r ${getPriorityColor('medium')} text-white`}>
                              {getPriorityIcon('medium')}
                            </div>
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded bg-gradient-to-r ${getPriorityColor('high')} text-white`}>
                              {getPriorityIcon('high')}
                            </div>
                            High Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded bg-gradient-to-r ${getPriorityColor('urgent')} text-white`}>
                              {getPriorityIcon('urgent')}
                            </div>
                            Urgent
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Timing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Timing
                  </CardTitle>
                  <CardDescription>
                    Set when you want to be reminded and when the task is due
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">Reminder Time *</Label>
                      <Input
                        id="reminderTime"
                        type="datetime-local"
                        value={formData.reminderTime || getDefaultReminderTime()}
                        onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                        className={errors.reminderTime ? 'border-red-500' : ''}
                      />
                      {errors.reminderTime && (
                        <p className="text-sm text-red-600">{errors.reminderTime}</p>
                      )}
                      <p className="text-xs text-gray-500">When you want to be notified</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={formData.dueDate || getDefaultDueDate()}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className={errors.dueDate ? 'border-red-500' : ''}
                      />
                      {errors.dueDate && (
                        <p className="text-sm text-red-600">{errors.dueDate}</p>
                      )}
                      <p className="text-xs text-gray-500">When the task should be completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repeat Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                    Repeat Settings
                  </CardTitle>
                  <CardDescription>
                    Configure if this reminder should repeat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isRepeating">Repeating Reminder</Label>
                      <p className="text-sm text-gray-500">
                        Enable to make this reminder repeat automatically
                      </p>
                    </div>
                    <Switch
                      id="isRepeating"
                      checked={formData.isRepeating}
                      onCheckedChange={(checked) => handleInputChange('isRepeating', checked)}
                    />
                  </div>

                  {formData.isRepeating && (
                    <div className="space-y-2">
                      <Label htmlFor="repeatFrequency">Repeat Frequency *</Label>
                      <Select 
                        value={formData.repeatFrequency || ''} 
                        onValueChange={(value: any) => handleInputChange('repeatFrequency', value)}
                      >
                        <SelectTrigger className={errors.repeatFrequency ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.repeatFrequency && (
                        <p className="text-sm text-red-600">{errors.repeatFrequency}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Task Association */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    Task Association
                  </CardTitle>
                  <CardDescription>
                    Link this reminder to an existing task (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskId">Associated Task</Label>
                    <Select 
                      value={formData.taskId || ''} 
                      onValueChange={(value: any) => handleInputChange('taskId', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No task association</SelectItem>
                        <SelectItem value="task_123">Project Proposal Review</SelectItem>
                        <SelectItem value="task_456">Weekly Timesheet</SelectItem>
                        <SelectItem value="task_789">Team Meeting Preparation</SelectItem>
                        <SelectItem value="task_101">Client Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Linking to a task allows quick navigation and better organization
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.title && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-indigo-600" />
                      Preview
                    </CardTitle>
                    <CardDescription>
                      How your reminder will appear
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${getPriorityColor(formData.priority)} text-white flex-shrink-0`}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{formData.title}</h3>
                            {formData.isRepeating && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {formData.repeatFrequency}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              formData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              formData.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {formData.priority}
                            </span>
                          </div>
                          {formData.description && (
                            <p className="text-gray-600 text-sm mb-2">{formData.description}</p>
                          )}
                          <div className="text-sm text-gray-500">
                            {formData.reminderTime && (
                              <span>Reminder: {new Date(formData.reminderTime).toLocaleString()}</span>
                            )}
                            {formData.dueDate && (
                              <span className="ml-4">Due: {new Date(formData.dueDate).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <Link href="/reminders">
                  <Button variant="outline" type="button">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Reminder
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 