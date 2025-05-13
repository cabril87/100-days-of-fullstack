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

  const statusColors = {
    'todo': 'bg-brand-navy bg-opacity-20 text-brand-navy-dark',
    'in-progress': 'bg-brand-beige bg-opacity-30 text-brand-navy-dark',
    'done': 'bg-brand-navy-dark bg-opacity-20 text-brand-navy-dark',
  };

  const priorityColors = {
    'low': 'bg-brand-cream text-brand-navy-dark',
    'medium': 'bg-brand-beige bg-opacity-70 text-brand-navy-dark',
    'high': 'bg-brand-navy-dark bg-opacity-20 text-brand-navy-dark',
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'bg-gray-200';
  const priorityColor = task.priority ? (priorityColors[task.priority as keyof typeof priorityColors] || '') : '';

  return (
    <div className="task-item p-5 mb-4 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <div className="flex flex-wrap mt-2 gap-2">
            <div className={`status-badge ${statusColor}`}>
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'in-progress' ? 'In Progress' : 
               'Done'}
            </div>
            {task.priority && (
              <div className={`priority-badge ${priorityColor}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}
          </div>
          {isExpanded && (
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{task.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse task" : "Expand task"}
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
            className="text-brand-navy hover:text-brand-navy-dark p-2 rounded-full hover:bg-brand-navy/10 transition-colors"
            aria-label="Edit task"
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
            className="text-brand-navy-dark hover:text-brand-navy p-2 rounded-full hover:bg-brand-navy-dark/10 transition-colors"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-700">
              {task.dueDate ? (
                <>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></>
              ) : (
                'No due date'
              )}
            </span>
          </div>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(String(task.id), e.target.value)}
            className="text-sm border rounded-full py-1 px-3 bg-white focus:ring-brand-navy focus:border-brand-navy"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}
    </div>
  );
} 