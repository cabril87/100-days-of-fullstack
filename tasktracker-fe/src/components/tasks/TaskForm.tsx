import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '@/lib/types/task';
import { taskSchema } from '@/lib/schemas/taskSchema';
import { useEffect, useState } from 'react';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryManager } from './CategoryManager';

// Helper functions to map between API enum values and form string values
const mapApiStatusToFormStatus = (status: string): TaskStatus => {
  switch (status) {
    case 'NotStarted': return TaskStatus.Todo;
    case 'InProgress': return TaskStatus.InProgress;
    case 'Completed': return TaskStatus.Done;
    // For any other value, return a valid default
    default: 
      if (status === TaskStatus.Todo || status === TaskStatus.InProgress || status === TaskStatus.Done) {
        return status as TaskStatus;
      }
      return TaskStatus.Todo;
  }
};

const mapApiPriorityToFormPriority = (priority: string | number | undefined): TaskPriority => {
  // Handle numeric priority values from API
  if (typeof priority === 'number') {
    switch (priority) {
      case 0: return TaskPriority.Low;
      case 1: return TaskPriority.Medium;
      case 2: return TaskPriority.High;
      default: return TaskPriority.Medium;
    }
  }
  
  // Handle string priority values
  const priorityString = String(priority || '').toLowerCase();
  switch (priorityString) {
    case 'low': return TaskPriority.Low;
    case 'high': return TaskPriority.High;
    case 'medium':
    default: return TaskPriority.Medium;
  }
};

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  onError?: (error: string | null) => void;
  initialData?: TaskFormData;
  isSubmitting?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, onError, initialData, isSubmitting: externalIsSubmitting }: TaskFormProps) {
  const isEditMode = !!task;
  const [error, setError] = useState<string | null>(null);
  const [originalValues, setOriginalValues] = useState<TaskFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [useTime, setUseTime] = useState<boolean>(false);
  const [formInitialized, setFormInitialized] = useState<boolean>(false);
  const { updateTask } = useTasks();
  const { categories } = useTemplates();

  // Function to extract time from a date string (if it contains time)
  const extractTimeFromDateString = (dateString?: string | null): string | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;

      // Only return time if it's not midnight (00:00)
      const hours = date.getHours();
      const minutes = date.getMinutes();
      if (hours === 0 && minutes === 0) return null;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  };
  
  // Process task data to ensure consistent format
  const processTaskData = (task: Task): TaskFormData => {
    // Extract time from dueDate if it exists
    const dueTime = extractTimeFromDateString(task.dueDate);
    
    // If there's a time component, enable the time checkbox
    if (dueTime) {
      setUseTime(true);
    }
    
    // Extract just the date part (YYYY-MM-DD) if a date exists
    let dueDateOnly = null;
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      if (!isNaN(date.getTime())) {
        dueDateOnly = date.toISOString().split('T')[0];
      }
    }

    return {
      title: task.title,
      description: task.description,
      status: mapApiStatusToFormStatus(task.status),
      dueDate: dueDateOnly,
      dueTime: dueTime,
      priority: mapApiPriorityToFormPriority(task.priority),
      categoryId: task.categoryId,
    };
  };
  
  const defaultValues: TaskFormData = initialData || (task 
    ? processTaskData(task)
    : {
        title: '',
        description: '',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        dueDate: null,
        dueTime: null
      });
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting, isDirty, dirtyFields }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues
  });

  // Use either external or form submission state
  const isSubmittingState = externalIsSubmitting !== undefined ? externalIsSubmitting : formIsSubmitting;

  // Store the original values for comparison and reset form when task changes or initialData changes
  useEffect(() => {
    // Only initialize the form once for each set of props
    if (formInitialized) {
      return;
    }
    
    if (task) {
      console.log('TaskForm: Initializing form with task:', task);
      const processedData = processTaskData(task);
      console.log('TaskForm: Processed form data:', processedData);
      
      // Check if the task has a time component
      const hasTime = processedData.dueTime && processedData.dueTime !== '00:00';
      setUseTime(!!hasTime);
      
      setOriginalValues(processedData);
      reset(processedData);
      setFormInitialized(true);
    } else if (initialData) {
      console.log('TaskForm: Initializing form with initial data:', initialData);
      setOriginalValues(initialData);
      reset(initialData);
      
      // Check if the initial data has a time component
      const hasTime = initialData.dueTime && initialData.dueTime !== '00:00';
      setUseTime(!!hasTime);
      setFormInitialized(true);
    } else {
      const newTaskDefaults = {
        title: '',
        description: '',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        dueDate: null,
        dueTime: null
      };
      setOriginalValues(null);
      reset(newTaskDefaults);
      setUseTime(false);
      setFormInitialized(true);
    }
  }, [task, initialData, reset, formInitialized]);

  useEffect(() => {
    // Report errors up to parent component if provided
    if (onError && error) {
      onError(error);
    }
  }, [error, onError]);

  // Combine date and time into a single ISO date string
  const combineDateAndTime = (date: string | null, time: string | null): string | null => {
    if (!date) return null;
    
    if (!time) {
      // If no time is specified, use 00:00 (start of day)
      return `${date}T00:00:00`;
    }
    
    // Combine date and time
    return `${date}T${time}:00`;
  };

  const submitHandler = async (data: TaskFormData) => {
    console.log('TaskForm: Form submitted with data:', data);
    console.log('TaskForm: Dirty fields:', dirtyFields);
    
    // Clear previous errors
    setError(null);
    
    // Debug log all task fields with their types
    console.log('TaskForm DEBUG: Task data types:', {
      title: typeof data.title,
      description: typeof data.description,
      status: typeof data.status, 
      priority: typeof data.priority,
      dueDate: typeof data.dueDate,
      dueTime: typeof data.dueTime,
      categoryId: typeof data.categoryId,
    });
    
    console.log('TaskForm DEBUG: Form values from watch:', watch());
    
    try {
      // Combine date and time for API submission
      const combinedData = { ...data };
      
      // If we have a date, ensure it's properly formatted with time
      if (combinedData.dueDate) {
        // Only include time if the checkbox is checked, otherwise set time to 00:00
        const timeToUse = useTime ? combinedData.dueTime || '00:00' : null;
        const isoDateString = combineDateAndTime(combinedData.dueDate, timeToUse);
        combinedData.dueDate = isoDateString;
      }
      
      if (isEditMode && originalValues && task) {
      // Create an object with only the changed fields when editing
      const changedData = {} as TaskFormData;
      
      // Only include fields that have actually changed
      if (dirtyFields.title) changedData.title = data.title;
      if (dirtyFields.description) changedData.description = data.description;
      if (dirtyFields.status) changedData.status = data.status;
      if (dirtyFields.priority) changedData.priority = data.priority;
        if (dirtyFields.categoryId) changedData.categoryId = data.categoryId;
        
        // Handle date and time together
        if (dirtyFields.dueDate || dirtyFields.dueTime) {
          changedData.dueDate = combinedData.dueDate;
        }
      
      // Ensure title is always present
      if (!changedData.title && task) changedData.title = task.title;
      
      console.log('TaskForm: Submitting only changed fields:', changedData);
      
      // Add debug information with PascalCase properties to suggest to server
      const debugData: Record<string, any> = {};
      
      if (changedData.title !== undefined) debugData.Title = changedData.title;
      if (changedData.description !== undefined) debugData.Description = changedData.description;
      
      // Map status string to numeric value
      if (changedData.status !== undefined) {
        let statusValue = 0; // default to NotStarted
        switch (changedData.status) {
          case TaskStatus.Todo: statusValue = 0; break;
          case TaskStatus.InProgress: statusValue = 1; break;
          case TaskStatus.Done: statusValue = 2; break;
        }
        debugData.Status = statusValue;
      }
      
      // Map priority string to numeric value
      if (changedData.priority !== undefined) {
        let priorityValue = 1; // default to Medium
        switch (changedData.priority) {
          case TaskPriority.Low: priorityValue = 0; break;
          case TaskPriority.Medium: priorityValue = 1; break;
          case TaskPriority.High: priorityValue = 2; break;
        }
        debugData.Priority = priorityValue;
      }
      
        if (changedData.dueDate !== undefined) {
          debugData.DueDate = changedData.dueDate;
        }
        
        // Category ID
        if (changedData.categoryId !== undefined) {
          debugData.CategoryId = changedData.categoryId;
        }
        
        console.log('TaskForm: Debug data with PascalCase keys:', debugData);
        
        // Submit only the changed fields to the update function
        console.log('TaskForm: Updating task with ID:', task.id);
        try {
            const result = await updateTask(String(task.id), changedData);
          
            if (result) {
            console.log('TaskForm: Task updated successfully:', result);
      onSubmit(changedData);
          } else {
            setError('Failed to update task. Please try again later.');
            console.error('TaskForm: updateTask returned null or undefined');
          }
        } catch (err) {
          console.error('TaskForm: Error updating task:', err);
          setError('An error occurred while updating the task. Please try again.');
        }
    } else {
        // Submit the full data for new tasks
        console.log('TaskForm: Creating new task');
        onSubmit(combinedData);
      }
    } catch (err) {
      console.error('TaskForm: Error in form submission:', err);
      setError('An error occurred. Please check your inputs and try again.');
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (value === 'none') {
      setValue('categoryId', undefined, { shouldDirty: true });
    } else {
      setValue('categoryId', value ? parseInt(value) : undefined, { shouldDirty: true });
    }
  };

  // Get category name
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'None';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'None';
  };

  return (
    <form onSubmit={handleSubmit(submitHandler as any)} className="space-y-6 text-black">
      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg shadow-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy dark:focus:ring-brand-beige dark:focus:border-brand-beige transition-colors bg-white/80 dark:bg-white/10 backdrop-blur-sm"
          >
            <option value={TaskStatus.Todo}>To Do</option>
            <option value={TaskStatus.InProgress}>In Progress</option>
            <option value={TaskStatus.Done}>Done</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy dark:focus:ring-brand-beige dark:focus:border-brand-beige transition-colors bg-white/80 dark:bg-white/10 backdrop-blur-sm"
          >
            <option value={TaskPriority.Low}>Low</option>
            <option value={TaskPriority.Medium}>Medium</option>
            <option value={TaskPriority.High}>High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Select 
              value={watch('categoryId')?.toString() || 'none'} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map(category => (
                  <SelectItem 
                    key={category.id} 
                    value={String(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CategoryManager 
            buttonLabel="Manage" 
            buttonSize="sm"
            onCategorySelect={(categoryId) => {
              setValue('categoryId', categoryId, { shouldDirty: true });
            }}
          />
        </div>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
        )}
      </div>

        <div className="space-y-1">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due Date
        </label>
        <div className="flex items-center gap-4">
        <input
          type="date"
          id="dueDate"
          {...register('dueDate')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy dark:focus:ring-brand-beige dark:focus:border-brand-beige transition-colors bg-white/80 dark:bg-white/10 backdrop-blur-sm"
          />
          
          <div className="flex items-center">
              <input
                type="checkbox"
              id="use-time"
                checked={useTime}
              onChange={(e) => setUseTime(e.target.checked)}
              className="mr-2 h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
              />
            <label htmlFor="use-time" className="text-sm text-gray-700 dark:text-gray-300">
              Include time
              </label>
          </div>
        </div>
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
        )}
          </div>
          
      {useTime && (
        <div className="space-y-1 pl-6 border-l-2 border-brand-navy/20 dark:border-brand-beige/20">
              <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Time
              </label>
              <input
                type="time"
                id="dueTime"
                {...register('dueTime')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy dark:focus:ring-brand-beige dark:focus:border-brand-beige transition-colors bg-white/80 dark:bg-white/10 backdrop-blur-sm"
              />
              {errors.dueTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueTime.message}</p>
              )}
            </div>
          )}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmittingState}
          className="px-4 py-2 bg-brand-navy text-white rounded-lg shadow-sm hover:bg-brand-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmittingState ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 