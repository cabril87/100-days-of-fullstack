import { useState } from 'react';
import { Task as TaskType } from '@/lib/types/task';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/lib/providers/TemplateProvider';

interface TaskProps {
  task: TaskType;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskType) => void;
  showCategories?: boolean;
}

export function Task({ task, onStatusChange, onDelete, onEdit, showCategories = false }: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { categories } = useTemplates();

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

  return (
    <div 
      className={`task-item backdrop-blur-sm backdrop-filter ${isExpanded ? 'scale-[1.01]' : ''} ${isHovering ? 'bg-white/95 dark:bg-navy/95' : 'bg-white/90 dark:bg-navy/90'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        boxShadow: isExpanded 
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1)' 
          : '0 2px 10px -5px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex justify-between items-start relative">
        {/* Left side content */}
        <div className="task-content" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className="task-title">
            {task.title}
          </h3>
          {task.description && (
            <p className={`task-description ${isExpanded ? '' : 'line-clamp-2'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <div className={`status-badge ${statusColor} backdrop-blur-sm shadow-sm`}>
              {getStatusIcon()}
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'in-progress' ? 'In Progress' : 
               'Done'}
            </div>
            {task.priority && (
              <div className={`priority-badge ${priorityColor} backdrop-blur-sm shadow-sm`}>
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
                className="flex items-center gap-1"
                style={{ 
                  backgroundColor: `${getCategoryColor(task.categoryId)}20`,
                  color: getCategoryColor(task.categoryId),
                  borderColor: `${getCategoryColor(task.categoryId)}40`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                />
                {getCategoryName(task.categoryId)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-3">
          {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}`}>
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
        <div className={`task-actions ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="task-action-btn"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit</span>
          </button>
          
          <button
            className={`task-action-btn ${task.status === 'done' ? 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300' : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'}`}
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
            className={`task-action-btn text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          padding-right: 100px;
        }
        
        .task-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 6px;
        }
        
        .dark .task-title {
          color: #F3F4F6;
        }
        
        .task-description {
          font-size: 0.9375rem;
          color: #4B5563;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .dark .task-description {
          color: #D1D5DB;
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
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .task-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }
        
        .dark .task-action-btn {
          background-color: rgba(15, 23, 42, 0.8);
        }
        
        .task-action-btn:hover {
          background-color: rgba(255, 255, 255, 1);
        }
        
        .dark .task-action-btn:hover {
          background-color: rgba(30, 41, 59, 0.8);
        }
      `}</style>
    </div>
  );
} 