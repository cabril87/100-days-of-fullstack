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
    'todo': 'bg-gray-200',
    'in-progress': 'bg-blue-200',
    'done': 'bg-green-200',
  };

  const priorityColors = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800',
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'bg-gray-200';
  const priorityColor = task.priority ? (priorityColors[task.priority as keyof typeof priorityColors] || '') : '';

  return (
    <div className="border rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <div className="flex flex-wrap mt-1 gap-2">
            <div className={`text-xs inline-block px-2 py-1 rounded ${statusColor} font-medium`}>
              {task.status}
            </div>
            {task.priority && (
              <div className={`text-xs inline-block px-2 py-1 rounded ${priorityColor} font-medium`}>
                {task.priority}
              </div>
            )}
          </div>
          {isExpanded && (
            <p className="mt-2 text-gray-600 text-sm">{task.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
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
            className="text-blue-500 hover:text-blue-700"
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            onClick={() => onDelete(String(task.id))}
            className="text-red-500 hover:text-red-700"
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
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
          </div>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(String(task.id), e.target.value)}
            className="text-sm border rounded p-1"
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