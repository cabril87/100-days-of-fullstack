import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task as TaskType } from '@/lib/types/task';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTemplates } from '@/lib/providers/TemplateProvider';

interface TaskProps {
  task: TaskType;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskType) => void;
  showCategories?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export function Task({ task, onStatusChange, onDelete, onEdit, showCategories = false, selectionMode = false, isSelected = false, onToggleSelection }: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { categories } = useTemplates();
  const router = useRouter();

  // Handle task click - navigate to details or toggle selection
  const handleTaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMode && onToggleSelection) {
      onToggleSelection();
    } else {
      // Navigate to task details
      router.push(`/tasks/${task.id}`);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return '#6b7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };
  
  const getStatusIcon = () => {
    if (task.status === 'done') {
        return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
    } else if (task.status === 'in-progress') {
        return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    } else {
        return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  let statusColor = '';
  if (task.status === 'todo') {
    statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
  } else if (task.status === 'in-progress') {
    statusColor = 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
  } else {
    statusColor = 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
  }

  let priorityColor = '';
  if (task.priority === 'high') {
    priorityColor = 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
  } else if (task.priority === 'medium') {
    priorityColor = 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
  } else {
    priorityColor = 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
  }

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  // Get gradient background based on task status and priority
  const getTaskGradient = () => {
    if (isOverdue) {
      return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
    }
    
    switch (task.status) {
      case 'done':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'in-progress':
        if (task.priority === 'high') {
          return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
        } else if (task.priority === 'medium') {
          return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
        } else {
          return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
        }
      case 'todo':
      default:
        if (task.priority === 'high') {
          return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
        } else if (task.priority === 'medium') {
          return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
        } else {
          return 'bg-gradient-to-r from-slate-500 to-gray-600 text-white';
        }
    }
  };

  return (
    <div 
      className={`task-item backdrop-blur-sm backdrop-filter ${getTaskGradient()} ${isExpanded ? 'scale-[1.01]' : ''} ${isSelected ? 'ring-2 ring-white ring-opacity-50 shadow-2xl' : 'shadow-xl'} hover:shadow-2xl hover:scale-[1.02]`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      <div className="flex items-start gap-3 relative">
        {/* Selection checkbox */}
        {selectionMode && (
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              aria-label={`Select task ${task.title}`}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
          </div>
        )}

        {/* Left side content */}
        <div 
          className={`task-content flex-1 ${selectionMode ? 'cursor-pointer' : 'cursor-pointer'}`} 
          onClick={handleTaskClick}
        >
          <h3 className="task-title">
            {task.title}
          </h3>
          {task.description && (
            <p className={`task-description ${isExpanded ? '' : 'line-clamp-2'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="status-badge bg-white/20 text-white backdrop-blur-sm shadow-sm">
              {getStatusIcon()}
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'in-progress' ? 'In Progress' : 
               'Done'}
            </div>
            {task.priority && (
              <div className="priority-badge bg-white/20 text-white backdrop-blur-sm shadow-sm">
                {task.priority === 'high' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {task.priority === 'medium' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {task.priority === 'low' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {typeof task.priority === 'string' 
                  ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`
                  : `${String(task.priority)} Priority`}
              </div>
            )}
            
            {/* Show category badge if showCategories is true and task has a category */}
            {showCategories && task.categoryId && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-white/20 text-white border-white/30"
              >
                <div 
                  className="w-2 h-2 rounded-full bg-white" 
                />
                {getCategoryName(task.categoryId)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-xs text-white/80 gap-3">
          {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-white font-bold animate-pulse' : 'text-white/80'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due: '}
                  {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
            {task.createdAt && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              )}
            </div>
        </div>
        
        {/* Right side actions */}
        <div className={`task-actions flex-shrink-0 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="task-action-btn bg-white/20 text-white hover:bg-white/30"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit</span>
          </button>
          
          <button
            className="task-action-btn bg-white/20 text-white hover:bg-white/30"
            onClick={() => onStatusChange(String(task.id), task.status === 'done' ? 'todo' : 'done')}
            aria-label={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.status === 'done' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Incomplete</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Complete</span>
              </>
            )}
          </button>
          
          <button 
            className={`task-action-btn bg-white/20 text-white hover:bg-white/30 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!isDeleting) {
                setIsDeleting(true);
              onDelete(String(task.id));
              }
            }}
            disabled={isDeleting}
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .task-item {
          border-radius: 12px;
          border: 1px solid rgba(229, 231, 235, 0.5);
          padding: 16px;
          margin-bottom: 16px;
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }
        
        .task-content {
          flex: 1;
        }
        
        .task-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 6px;
        }
        
        .task-description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .status-badge, .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
          margin-left: 12px;
        }
        
        .task-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
} 