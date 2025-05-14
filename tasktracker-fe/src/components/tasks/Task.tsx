import { useState } from 'react';
import { Task as TaskType } from '@/lib/types/task';

interface TaskProps {
  task: TaskType;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskType) => void;
}

export function Task({ task, onStatusChange, onDelete, onEdit }: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const statusColors = {
    'todo': 'bg-gradient-to-r from-brand-navy/20 to-brand-navy/10 text-brand-navy-dark border-brand-navy border-opacity-20',
    'in-progress': 'bg-gradient-to-r from-brand-beige/30 to-brand-beige/20 text-brand-navy-dark border-brand-beige border-opacity-40',
    'done': 'bg-gradient-to-r from-brand-navy-dark/20 to-brand-navy-dark/10 text-brand-navy-dark border-brand-navy-dark border-opacity-20',
  };

  const priorityColors = {
    'low': 'bg-gradient-to-r from-brand-cream/50 to-brand-cream/30 text-brand-navy-dark border-brand-navy border-opacity-10',
    'medium': 'bg-gradient-to-r from-brand-beige/60 to-brand-beige/40 text-brand-navy-dark border-brand-beige border-opacity-40',
    'high': 'bg-gradient-to-r from-brand-navy-dark/20 to-brand-navy/10 text-brand-navy-dark border-brand-navy-dark border-opacity-20',
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'bg-gray-200';
  const priorityColor = task.priority ? (priorityColors[task.priority as keyof typeof priorityColors] || '') : '';

  // Format date for better display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Check if there's a time component other than midnight
      const hasTimeComponent = 
        date.getHours() !== 0 || 
        date.getMinutes() !== 0;
      
      // Format with date and time if time component exists
      if (hasTimeComponent) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      
      // Otherwise just format the date
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get appropriate icon for task status
  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'done':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

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
        <div className="flex-1 pr-10 relative">
          {/* Status indicator dot */}
          <div 
            className={`absolute -left-4 top-1.5 h-2 w-2 rounded-full transition-colors duration-300 ${
              task.status === 'todo' ? 'bg-brand-navy' : 
              task.status === 'in-progress' ? 'bg-brand-beige' : 
              'bg-green-500'
            }`}
            style={{ opacity: isHovering ? 0.9 : 0.6 }}
          ></div>
          
          {/* Overdue badge */}
          {isOverdue && (
            <div className="mb-2 flex">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Overdue
              </span>
            </div>
          )}
          
          <h3 className="font-medium text-lg mb-2 tracking-tight text-brand-navy-dark dark:text-cream">{task.title}</h3>
          
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
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </div>
            )}
          </div>
          
          {task.dueDate && (
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
          )}
          
          {isExpanded && (
            <div 
              className="mt-4 text-gray-700 dark:text-gray-200 text-sm leading-relaxed rounded-lg bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-white/10"
              style={{ 
                animation: 'fadeIn 0.3s ease-in-out',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No description provided</p>
              )}
            </div>
          )}
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="icon-button text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10"
            aria-label={isExpanded ? "Collapse task" : "Expand task"}
            style={{ transition: 'all 0.2s ease' }}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="icon-button text-brand-navy hover:text-brand-navy-dark hover:bg-brand-navy/10 dark:text-brand-beige dark:hover:text-white dark:hover:bg-brand-beige/20"
            aria-label="Edit task"
            style={{ transition: 'all 0.2s ease' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            onClick={() => {
              console.log('Task component: Delete button clicked for task ID:', task.id);
              onDelete(String(task.id));
            }}
            className="icon-button text-brand-navy-dark hover:text-red-600 hover:bg-red-50 dark:text-brand-beige dark:hover:text-red-400 dark:hover:bg-red-900/30"
            aria-label="Delete task"
            style={{ transition: 'all 0.2s ease' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div 
          className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center"
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          <div className="flex items-center space-x-4">
            {task.createdAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            )}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                Updated: {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(String(task.id), e.target.value)}
            className="text-sm border rounded-full py-1.5 px-3.5 bg-white/80 dark:bg-white/10 focus:ring-brand-navy focus:border-brand-navy dark:focus:ring-brand-beige dark:focus:border-brand-beige backdrop-blur-sm shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}

      {/* Style for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 