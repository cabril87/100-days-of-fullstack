'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target, Save, X, Sparkles, Plus, CheckCircle, Clock, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskFormData, TaskCategory } from '@/lib/types/task';
import { useTemplates } from '@/lib/providers/TemplateProvider';

// Priority options with colors and icons
const priorityOptions = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800', icon: '🟢', number: 0 },
  { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100 text-blue-800', icon: '🔵', number: 1 },
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800', icon: '🔴', number: 2 }
];

// Estimated time options
const estimatedTimeOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' }
];

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<TaskFormData>;
}

interface NewTaskState {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedTimeMinutes: number;
  categoryId?: number;
}

export function TaskForm({ onSubmit, onCancel, isSubmitting = false, initialData }: TaskFormProps) {
  const { categories, getCategories, createCategory, loading: categoriesLoading } = useTemplates();
  
  // Helper function to convert priority number to string
  const getPriorityString = (priority?: number): 'low' | 'medium' | 'high' => {
    switch (priority) {
      case 0: return 'low';
      case 2: return 'high';
      default: return 'medium';
    }
  };
  
  const [newTask, setNewTask] = useState<NewTaskState>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: getPriorityString(initialData?.priority),
    dueDate: initialData?.dueDate || '',
    estimatedTimeMinutes: 60,
    categoryId: initialData?.categoryId,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      getCategories();
    }
  }, [categories.length, getCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      // Convert to TaskFormData format
      const priorityOption = priorityOptions.find(p => p.value === newTask.priority);
      const formData: TaskFormData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        status: 'todo',
        priority: priorityOption?.number || 1,
        dueDate: newTask.dueDate || null,
        categoryId: newTask.categoryId,
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const isFormValid = () => {
    return newTask.title.trim().length > 0;
  };

  const formatDueDate = (date: string) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return dueDate.toLocaleDateString();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: 'folder'
      });
      
      if (created) {
        setNewTask(prev => ({ ...prev, categoryId: created.id }));
        setNewCategoryName('');
        setShowCategoryManager(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <Plus className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create New Task
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-600 opacity-[0.05] rounded-full blur-xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
          
          <div className="relative z-10 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{option.icon}</span>
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

              {/* Category Selection */}
              <div>
                <Label htmlFor="task-category" className="text-sm font-semibold text-gray-800 mb-2 block">
                  Category (Optional)
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={newTask.categoryId?.toString() || 'none'}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, categoryId: value === 'none' ? undefined : parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color || '#6b7280' }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategoryManager(!showCategoryManager)}
                    className="px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Category Manager */}
                {showCategoryManager && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Create New Category</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Color:</Label>
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateCategory}
                          disabled={!newCategoryName.trim() || categoriesLoading}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                          Create
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCategoryManager(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create Task
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Preview Section */}
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
                {/* Task Preview Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex-1">{newTask.title}</h4>
                    <div className="flex items-center gap-1 ml-2">
                      {newTask.priority === 'high' && <Flame className="h-4 w-4 text-red-500" />}
                      {newTask.priority === 'medium' && <Zap className="h-4 w-4 text-blue-500" />}
                      {newTask.priority === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                  
                  {newTask.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {newTask.description}
                    </p>
                  )}
                  
                  {/* Task Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600">Priority:</span>
                      <div className={`px-2 py-1 rounded-lg font-medium text-xs ${priorityOptions.find(p => p.value === newTask.priority)?.color}`}>
                        {priorityOptions.find(p => p.value === newTask.priority)?.icon} {newTask.priority.charAt(0).toUpperCase() + newTask.priority.slice(1)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {estimatedTimeOptions.find(t => t.value === newTask.estimatedTimeMinutes)?.label}
                      </span>
                    </div>
                    
                    {newTask.categoryId && categories.find(c => c.id === newTask.categoryId) && (
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Category:</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categories.find(c => c.id === newTask.categoryId)?.color }}
                          />
                          <span className="font-medium text-gray-800 text-xs">
                            {categories.find(c => c.id === newTask.categoryId)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {newTask.dueDate && (
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm col-span-2">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium text-gray-800">{formatDueDate(newTask.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Metrics */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Task Insights
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Completion:</span>
                      <span className="font-medium">{estimatedTimeOptions.find(t => t.value === newTask.estimatedTimeMinutes)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority Level:</span>
                      <span className="font-medium">{newTask.priority.charAt(0).toUpperCase() + newTask.priority.slice(1)}</span>
                    </div>
                    {newTask.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days Until Due:</span>
                        <span className="font-medium">
                          {(() => {
                            const days = Math.ceil((new Date(newTask.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return days >= 0 ? `${days} day${days !== 1 ? 's' : ''}` : 'Overdue';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium mb-2">Enter task details</p>
                <p className="text-xs">Fill in the form to see your task preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 