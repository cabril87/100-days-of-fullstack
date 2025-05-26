'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  X,
  MoreVertical,
  Pause,
  Archive,
  Star,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { reminderService, Reminder, ReminderStats } from '@/lib/services/reminderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogTrigger,
} from '@/components/ui/dialog';

// Using imported types from reminderService

export default function RemindersPage(): React.ReactElement {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    pending: 0,
    overdue: 0,
    completed: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [snoozeReminderId, setSnoozeReminderId] = useState<string | null>(null);
  const [snoozeHours, setSnoozeHours] = useState('1');
  const { showToast } = useToast();

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real reminders from API
      const response = await reminderService.getAllReminders();
      
      if (response.data) {
        setReminders(response.data);
        
        // Calculate stats from real data
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 86400000);
        
        const pending = response.data.filter(r => r.status === 'pending').length;
        const overdue = response.data.filter(r => {
          const dueDate = new Date(r.dueDate);
          return r.status === 'pending' && dueDate < now;
        }).length;
        const completed = response.data.filter(r => r.status === 'completed').length;
        const todayReminders = response.data.filter(r => {
          const reminderDate = new Date(r.reminderTime);
          return reminderDate >= today && reminderDate < tomorrow;
        }).length;
        
        setStats({
          total: response.data.length,
          pending,
          overdue,
          completed,
          today: todayReminders
        });
      } else {
        // Handle empty response
        setReminders([]);
        setStats({
          total: 0,
          pending: 0,
          overdue: 0,
          completed: 0,
          today: 0
        });
        
        if (response.error) {
          console.warn('Reminder API error:', response.error);
          showToast('Unable to load reminders. Please try again later.', 'warning');
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      showToast('Failed to load reminders', 'error');
      
      // Set empty state on error
      setReminders([]);
      setStats({
        total: 0,
        pending: 0,
        overdue: 0,
        completed: 0,
        today: 0
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const markAsCompleted = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId 
        ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() }
        : r
    ));
    setStats(prev => ({ 
      ...prev, 
      pending: prev.pending - 1, 
      completed: prev.completed + 1 
    }));
    showToast('Reminder marked as completed', 'success');
  };

  const dismissReminder = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, status: 'dismissed' as const } : r
    ));
    setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
    showToast('Reminder dismissed', 'success');
  };

  const deleteReminder = (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      pending: reminder?.status === 'pending' ? prev.pending - 1 : prev.pending,
      completed: reminder?.status === 'completed' ? prev.completed - 1 : prev.completed
    }));
    showToast('Reminder deleted', 'success');
  };

  const snoozeReminder = (reminderId: string, hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 3600000).toISOString();
    setReminders(prev => prev.map(r => 
      r.id === reminderId 
        ? { ...r, status: 'snoozed' as const, snoozeUntil }
        : r
    ));
    showToast(`Reminder snoozed for ${hours} hour${hours !== 1 ? 's' : ''}`, 'success');
    setShowSnoozeDialog(false);
    setSnoozeReminderId(null);
  };

  const bulkComplete = () => {
    const completedCount = selectedReminders.length;
    setReminders(prev => prev.map(r => 
      selectedReminders.includes(r.id) 
        ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() }
        : r
    ));
    setStats(prev => ({ 
      ...prev, 
      pending: prev.pending - completedCount, 
      completed: prev.completed + completedCount 
    }));
    setSelectedReminders([]);
    showToast(`${completedCount} reminders marked as completed`, 'success');
  };

  const bulkDelete = () => {
    const deletedReminders = reminders.filter(r => selectedReminders.includes(r.id));
    const pendingDeleted = deletedReminders.filter(r => r.status === 'pending').length;
    const completedDeleted = deletedReminders.filter(r => r.status === 'completed').length;
    
    setReminders(prev => prev.filter(r => !selectedReminders.includes(r.id)));
    setStats(prev => ({
      ...prev,
      total: prev.total - selectedReminders.length,
      pending: prev.pending - pendingDeleted,
      completed: prev.completed - completedDeleted
    }));
    setSelectedReminders([]);
    showToast(`${selectedReminders.length} reminders deleted`, 'success');
  };

  const getReminderIcon = (reminder: Reminder) => {
    if (reminder.status === 'completed') return <CheckCircle className="h-5 w-5" />;
    if (reminder.status === 'snoozed') return <Pause className="h-5 w-5" />;
    if (reminder.priority === 'urgent') return <AlertTriangle className="h-5 w-5" />;
    if (reminder.isRepeating) return <RefreshCw className="h-5 w-5" />;
    return <Bell className="h-5 w-5" />;
  };

  const getReminderColor = (reminder: Reminder) => {
    if (reminder.status === 'completed') return 'from-green-400 to-green-600';
    if (reminder.status === 'snoozed') return 'from-yellow-400 to-yellow-600';
    
    const now = new Date();
    const dueDate = new Date(reminder.dueDate);
    const isOverdue = reminder.status === 'pending' && dueDate < now;
    
    if (isOverdue) return 'from-red-400 to-red-600';
    
    switch (reminder.priority) {
      case 'urgent': return 'from-red-400 to-red-600';
      case 'high': return 'from-orange-400 to-orange-600';
      case 'medium': return 'from-blue-400 to-blue-600';
      case 'low': return 'from-gray-400 to-gray-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const absDiffMins = Math.abs(diffMins);
      const absDiffHours = Math.abs(diffHours);
      const absDiffDays = Math.abs(diffDays);
      
      if (absDiffMins < 60) return `${absDiffMins}m overdue`;
      if (absDiffHours < 24) return `${absDiffHours}h overdue`;
      return `${absDiffDays}d overdue`;
    }

    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays}d`;
  };

  const getFilteredReminders = () => {
    let filtered = reminders;

    // Filter by tab
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(r => {
          const dueDate = new Date(r.dueDate);
          return r.status === 'pending' && dueDate >= now;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(r => {
          const dueDate = new Date(r.dueDate);
          return r.status === 'pending' && dueDate < now;
        });
        break;
      case 'completed':
        filtered = filtered.filter(r => r.status === 'completed');
        break;
      case 'snoozed':
        filtered = filtered.filter(r => r.status === 'snoozed');
        break;
      default:
        break;
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());
  };

  const filteredReminders = getFilteredReminders();

  const toggleReminderSelection = (reminderId: string) => {
    setSelectedReminders(prev => 
      prev.includes(reminderId) 
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredReminders.map(r => r.id);
    setSelectedReminders(visibleIds);
  };

  const clearSelection = () => {
    setSelectedReminders([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/notifications/center"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Reminder Management
              </h1>
              <p className="text-gray-600 mt-1">
                Stay on top of your tasks with smart reminders
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/reminders/create">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="h-4 w-4" />
                  New Reminder
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Bell className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.total}</div>
              <div className="text-blue-100 text-sm">Total Reminders</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.pending}</div>
              <div className="text-orange-100 text-sm">Pending</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.overdue}</div>
              <div className="text-red-100 text-sm">Overdue</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.completed}</div>
              <div className="text-green-100 text-sm">Completed</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.today}</div>
              <div className="text-purple-100 text-sm">Today</div>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pb-4 border-b border-gray-100">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="snoozed">Snoozed</TabsTrigger>
                </TabsList>
              </div>

              {/* Filters and Search */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search reminders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Bulk Actions */}
                {selectedReminders.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 font-medium">
                        {selectedReminders.length} reminder{selectedReminders.length !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex gap-2">
                        {activeTab !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={bulkComplete}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={bulkDelete}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={clearSelection}>
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content for all tabs */}
              <TabsContent value={activeTab} className="mt-0">
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
                      ))}
                    </div>
                  ) : filteredReminders.length > 0 ? (
                    <div className="space-y-4">
                      {/* Quick Actions */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={selectAllVisible}>
                            Select All Visible
                          </Button>
                          {activeTab !== 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              const visibleIds = filteredReminders.map(r => r.id);
                              visibleIds.forEach(id => markAsCompleted(id));
                            }}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete All
                            </Button>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={fetchReminders}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      </div>
                      
                      {filteredReminders.map((reminder) => (
                        <div 
                          key={reminder.id}
                          className={`group relative rounded-xl border transition-all duration-300 hover:shadow-lg ${
                            reminder.status === 'completed' 
                              ? 'bg-green-50 border-green-200' 
                              : reminder.status === 'snoozed'
                              ? 'bg-yellow-50 border-yellow-200'
                              : new Date(reminder.dueDate) < new Date() && reminder.status === 'pending'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Selection Checkbox */}
                              <div className="flex items-center pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedReminders.includes(reminder.id)}
                                  onChange={() => toggleReminderSelection(reminder.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                              
                              {/* Icon */}
                              <div className={`p-3 rounded-lg bg-gradient-to-r ${getReminderColor(reminder)} text-white flex-shrink-0`}>
                                {getReminderIcon(reminder)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                                    {reminder.isRepeating && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        {reminder.repeatFrequency}
                                      </Badge>
                                    )}
                                    <Badge 
                                      variant={reminder.priority === 'urgent' ? 'destructive' : 'secondary'} 
                                      className={`text-xs ${
                                        reminder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        reminder.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                        reminder.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''
                                      }`}
                                    >
                                      {reminder.priority}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <span className={`text-sm font-medium ${
                                      new Date(reminder.dueDate) < new Date() && reminder.status === 'pending'
                                        ? 'text-red-600'
                                        : 'text-gray-500'
                                    }`}>
                                      {formatDateTime(reminder.reminderTime)}
                                    </span>
                                  </div>
                                </div>
                                
                                {reminder.description && (
                                  <p className="text-gray-600 text-sm mb-3">{reminder.description}</p>
                                )}
                                
                                {/* Task link */}
                                {reminder.taskId && (
                                  <div className="mb-3">
                                    <Link href={`/tasks/${reminder.taskId}`}>
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 cursor-pointer">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        {reminder.taskTitle || 'View Task'}
                                      </Badge>
                                    </Link>
                                  </div>
                                )}
                                
                                {/* Status info */}
                                {reminder.status === 'snoozed' && reminder.snoozeUntil && (
                                  <div className="mb-3">
                                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                      Snoozed until {formatDateTime(reminder.snoozeUntil)}
                                    </Badge>
                                  </div>
                                )}
                                
                                {reminder.status === 'completed' && reminder.completedAt && (
                                  <div className="mb-3">
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Completed {formatDateTime(reminder.completedAt)}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                  {reminder.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        onClick={() => markAsCompleted(reminder.id)}
                                        className="text-xs"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Complete
                                      </Button>
                                                                             <Button 
                                         size="sm" 
                                         variant="outline" 
                                         onClick={() => {
                                           setSnoozeReminderId(reminder.id);
                                           setShowSnoozeDialog(true);
                                         }}
                                         className="text-xs"
                                       >
                                         <Pause className="h-3 w-3 mr-1" />
                                         Snooze
                                       </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => dismissReminder(reminder.id)}
                                        className="text-xs"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Dismiss
                                      </Button>
                                    </>
                                  )}
                                  
                                  {reminder.status === 'snoozed' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => {
                                        setReminders(prev => prev.map(r => 
                                          r.id === reminder.id ? { ...r, status: 'pending', snoozeUntil: undefined } : r
                                        ));
                                        showToast('Reminder reactivated', 'success');
                                      }}
                                      className="text-xs"
                                    >
                                      <Bell className="h-3 w-3 mr-1" />
                                      Reactivate
                                    </Button>
                                  )}
                                  
                                  <Link href={`/reminders/${reminder.id}/edit`}>
                                    <Button size="sm" variant="ghost" className="text-xs">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => deleteReminder(reminder.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Star className="h-4 w-4 mr-2" />
                                        Mark Important
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                                             <div className="mb-4">
                         {activeTab === 'upcoming' && <Clock className="h-16 w-16 text-gray-400 mx-auto opacity-50" />}
                         {activeTab === 'overdue' && <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto opacity-50" />}
                         {activeTab === 'completed' && <CheckCircle className="h-16 w-16 text-gray-400 mx-auto opacity-50" />}
                         {activeTab === 'snoozed' && <Pause className="h-16 w-16 text-gray-400 mx-auto opacity-50" />}
                       </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {activeTab} reminders found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery || priorityFilter !== 'all'
                          ? 'Try adjusting your filters to see more reminders.'
                          : `You don't have any ${activeTab} reminders at the moment.`}
                      </p>
                      {(searchQuery || priorityFilter !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery('');
                            setPriorityFilter('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Snooze Dialog */}
      <Dialog open={showSnoozeDialog} onOpenChange={setShowSnoozeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snooze Reminder</DialogTitle>
            <DialogDescription>
              How long would you like to snooze this reminder?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={snoozeHours} onValueChange={setSnoozeHours}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">15 minutes</SelectItem>
                <SelectItem value="0.5">30 minutes</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">1 day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSnoozeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (snoozeReminderId) {
                snoozeReminder(snoozeReminderId, parseFloat(snoozeHours));
              }
            }}>
              Snooze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 