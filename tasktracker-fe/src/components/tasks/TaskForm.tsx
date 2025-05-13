import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '@/lib/types/task';
import { taskSchema } from '@/lib/schemas/taskSchema';
import { useEffect, useState } from 'react';
import { useTasks } from '@/lib/providers/TaskProvider';

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

const mapApiPriorityToFormPriority = (priority: any): TaskPriority => {
  if (typeof priority === 'number') {
    switch (priority) {
      case 0: return TaskPriority.Low;
      case 1: return TaskPriority.Medium;
      case 2: return TaskPriority.High;
      default: return TaskPriority.Medium;
    }
  }
  // Make sure we return a valid literal type
  if (priority === TaskPriority.Low || priority === TaskPriority.Medium || priority === TaskPriority.High) {
    return priority;
  }
  return TaskPriority.Medium;
};

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  onError?: (error: string | null) => void;
}

export function TaskForm({ task, onSubmit, onCancel, onError }: TaskFormProps) {
  const isEditMode = !!task;
  const [originalValues, setOriginalValues] = useState<TaskFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useTime, setUseTime] = useState(false);
  const { updateTask } = useTasks();

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
      dueTime: task.dueTime || dueTime,
      priority: mapApiPriorityToFormPriority(task.priority)
    };
  };
  
  const defaultValues: TaskFormData = task 
    ? processTaskData(task)
    : {
        title: '',
        description: '',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        dueDate: null,
        dueTime: null
      };
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, dirtyFields }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues
  });

  // Store the original values for comparison and reset form when task changes
  useEffect(() => {
    if (task) {
      console.log('TaskForm: Initializing form with task:', task);
      const processedData = processTaskData(task);
      console.log('TaskForm: Processed form data:', processedData);
      
      // Check if the task has a time component
      const hasTime = processedData.dueTime && processedData.dueTime !== '00:00';
      setUseTime(!!hasTime);
      
      setOriginalValues(processedData);
      reset(processedData);
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
    }
  }, [task, reset]);

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
        
        if (changedData.dueDate !== undefined) debugData.DueDate = changedData.dueDate;
        
        console.log('TaskForm: DEBUG - PascalCase equivalent:', debugData);
        console.log('TaskForm: DEBUG - Submitting to onSubmit handler');
        
        try {
          // Use the TaskProvider's updateTask method directly if possible
          if (updateTask) {
            const result = await updateTask(String(task.id), changedData);
            if (result) {
              onSubmit(changedData);
            } else {
              // Get any error message from the TaskProvider
              const taskError = document.querySelector('[data-error="task-provider"]');
              if (taskError) {
                setError(taskError.textContent || 'Failed to update task');
              } else {
                setError('Failed to update task. Please try again.');
              }
            }
          } else {
            // Fall back to the provided onSubmit handler
            onSubmit(changedData);
          }
        } catch (err) {
          console.error('TaskForm: Error updating task:', err);
          setError(err instanceof Error ? err.message : 'Failed to update task');
        }
      } else {
        // When creating new task, submit all data
        console.log('TaskForm: DEBUG - Creating new task with full data');
        onSubmit(combinedData);
      }
      
      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      console.error('TaskForm: Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      if (onError) onError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Watch all fields for debugging purposes
  const watchedFields = watch();
  const watchedDueDate = watch('dueDate');

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
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={TaskStatus.Todo}>To Do</option>
            <option value={TaskStatus.InProgress}>In Progress</option>
            <option value={TaskStatus.Done}>Done</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={TaskPriority.Low}>Low</option>
            <option value={TaskPriority.Medium}>Medium</option>
            <option value={TaskPriority.High}>High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
          {watchedDueDate && !useTime && (
            <p className="mt-1 text-xs text-gray-500">Tasks without specific time will default to start of day (12:00 AM)</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                id="useTimeCheckbox"
                checked={useTime}
                onChange={() => setUseTime(!useTime)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!watchedDueDate}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="useTimeCheckbox" className="font-medium text-gray-900">
                Set specific time
              </label>
              <p className="text-gray-500">Check to specify a due time</p>
            </div>
          </div>
          
          {useTime && watchedDueDate && (
            <div className="mt-3">
              <label htmlFor="dueTime" className="block text-sm font-medium text-gray-900">
                Due Time
              </label>
              <input
                type="time"
                id="dueTime"
                {...register('dueTime')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.dueTime && (
                <p className="mt-1 text-sm text-red-600">{errors.dueTime.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (isEditMode && !isDirty)}
          className={`px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            !isDirty && isEditMode 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isEditMode ? (isDirty ? 'Update Task' : 'No Changes') : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 