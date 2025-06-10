/*
 * Error Modal Component
 * Reusable modal for displaying error messages with proper styling
 * Copyright (c) 2025 Carlos Abril Jr
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Network } from 'lucide-react';

export interface ErrorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  details?: {
    taskId?: number;
    taskTitle?: string;
    userId?: number;
    totalTasksInDB?: number;
    taskIdsInDB?: number[];
    createdTaskData?: {
      id: number;
      title: string;
      description?: string;
      priority: string;
      isCompleted: boolean;
    };
  };
  type?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  message,
  details,
  type = 'error',
  showDetails = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-red-50 dark:bg-red-900/20';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-900 dark:text-red-100';
      case 'warning':
        return 'text-yellow-900 dark:text-yellow-100';
      case 'info':
        return 'text-blue-900 dark:text-blue-100';
      default:
        return 'text-red-900 dark:text-red-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${getIconBg()}`}>
              {getIcon()}
            </div>
            <DialogTitle className={`text-lg font-semibold ${getTextColor()}`}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* Details Section */}
        {showDetails && details && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Debug Information
              </span>
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              {details.taskId && (
                <div className="flex justify-between">
                  <span>Task ID:</span>
                  <span className="font-mono">{details.taskId}</span>
                </div>
              )}
              
              {details.taskTitle && (
                <div className="flex justify-between">
                  <span>Task Title:</span>
                  <span className="font-mono">&quot;{details.taskTitle}&quot;</span>
                </div>
              )}
              
              {details.userId && (
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono">{details.userId}</span>
                </div>
              )}
              
              {details.totalTasksInDB !== undefined && (
                <div className="flex justify-between">
                  <span>Tasks in Database:</span>
                  <span className="font-mono">{details.totalTasksInDB}</span>
                </div>
              )}
              
              {details.taskIdsInDB && details.taskIdsInDB.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span>Task IDs in DB:</span>
                  <span className="font-mono text-xs break-all">
                    [{details.taskIdsInDB.join(', ')}]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {type === 'error' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Possible Solutions
              </span>
            </div>
            
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page and try again</li>
              <li>• Check backend logs for errors</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        )}

        {type === 'warning' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Recommended Actions
              </span>
            </div>
            
            <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
              <li>• <strong>Refresh the page</strong> - Your task might already be saved</li>
              <li>• Database transactions can take a moment to complete</li>
              <li>• Check your task list after refreshing</li>
              <li>• If the task doesn&apos;t appear, try creating it again</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[80px]"
          >
            Close
          </Button>
          
          {(type === 'error' || type === 'warning') && (
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="min-w-[80px]"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal; 