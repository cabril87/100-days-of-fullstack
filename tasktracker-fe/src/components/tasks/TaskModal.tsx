'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '@/lib/types/task';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task;
  title: string;
}

export function TaskModal({ isOpen, onClose, onSuccess, task, title }: TaskModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setConflictError(null); // Clear any conflict errors when opening
    } else {
      // Delay hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setConflictError(null); // Clear errors when closing
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleSuccess = () => {
    setConflictError(null);
    onSuccess();
  };
  
  const handleFormError = (error: string | null) => {
    // Check if this is a version conflict
    if (error && (error.includes('Version conflict') || error.includes('was modified by another user'))) {
      setConflictError(error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {conflictError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{conflictError}</p>
              </div>
              <p className="mt-2 text-sm ml-8">The task has been refreshed with the latest version. Your changes were not saved.</p>
            </div>
          )}
          
          <TaskForm 
            task={task}
            onSubmit={handleSuccess}
            onCancel={onClose}
            onError={handleFormError}
          />
        </div>
      </div>
    </div>
  );
} 