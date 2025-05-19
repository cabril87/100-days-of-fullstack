'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, AlertCircle, Briefcase, UserCheck, Trash2, Lock } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { taskService } from '@/lib/services/taskService';
import { familyService } from '@/lib/services/familyService';
import { Task } from '@/lib/types/task';
import { formatDistanceToNow } from 'date-fns';
import ConfirmDialog from './ConfirmDialog';

interface FamilyTaskListProps {
  familyId: string;
  isAdmin: boolean;
}

export default function FamilyTaskList({ familyId, isAdmin }: FamilyTaskListProps) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskToRemove, setTaskToRemove] = useState<Task | null>(null);
  const [taskToApprove, setTaskToApprove] = useState<Task | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showToast } = useToast();
  
  useEffect(() => {
    // Check authentication state
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsAuthenticated(!!authToken);
    
    loadFamilyTasks();
  }, [familyId]);
  
  const loadFamilyTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getFamilyTasks(familyId);
      if (response.data) {
        setTasks(response.data);
      } else {
        showToast(response.error || 'Failed to load family tasks', 'error');
      }
    } catch (error) {
      console.error('Error loading family tasks:', error);
      showToast('Error loading family tasks', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnassignTask = async () => {
    if (!taskToRemove || !isAuthenticated) return;
    
    try {
      const response = await taskService.unassignTask(familyId, taskToRemove.id);
      if (response.status === 204) {
        // Use familyService for state synchronization
        await familyService.syncFamilyState(familyId, 'task unassignment');
        
        showToast('Task unassigned successfully', 'success');
        loadFamilyTasks();
      } else {
        showToast(response.error || 'Failed to unassign task', 'error');
      }
    } catch (error) {
      console.error('Error unassigning task:', error);
      showToast('Error unassigning task', 'error');
    } finally {
      setTaskToRemove(null);
    }
  };
  
  const handleApproveTask = async () => {
    if (!taskToApprove || !isAuthenticated) return;
    
    try {
      const response = await taskService.approveTask(familyId, taskToApprove.id, {
        taskId: taskToApprove.id,
        approved: true,
        feedback: ''
      });
      
      if (response.status === 204) {
        // Use familyService for state synchronization
        await familyService.syncFamilyState(familyId, 'task approval');
        
        showToast('Task approved successfully', 'success');
        loadFamilyTasks();
      } else {
        showToast(response.error || 'Failed to approve task', 'error');
      }
    } catch (error) {
      console.error('Error approving task:', error);
      showToast('Error approving task', 'error');
    } finally {
      setTaskToApprove(null);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family Tasks</CardTitle>
          <CardDescription>Tasks assigned to family members</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const needsApproval = (task: Task) => {
    return task.status.toLowerCase() === 'done' && 
           task.requiresApproval && 
           !task.approvedBy;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Tasks</CardTitle>
        <CardDescription>Tasks assigned to family members</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tasks have been assigned to family members yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      {getStatusIcon(task.status)}
                      <span>{task.status}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.requiresApproval && (
                      <Badge variant="outline" className="border-blue-300 text-blue-800">
                        Approval Required
                      </Badge>
                    )}
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mt-2 mb-3">{task.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm">
                    <UserCheck className="h-4 w-4 text-gray-500 mr-1" />
                    <span>Assigned to: </span>
                    <span className="font-medium ml-1">{task.assignedToName || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {needsApproval(task) && isAdmin && isAuthenticated && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => setTaskToApprove(task)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
                    {isAdmin && isAuthenticated && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setTaskToRemove(task)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Unassign
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {!isAuthenticated && (
        <CardFooter className="bg-gray-50 border-t">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center text-sm text-amber-700">
              <Lock className="h-4 w-4 mr-2" />
              <span>You're viewing data in demo mode. Sign in to access full functionality.</span>
            </div>
            <Button size="sm" asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        </CardFooter>
      )}
      
      {/* Confirm Unassign Dialog */}
      <ConfirmDialog
        isOpen={!!taskToRemove}
        onClose={() => setTaskToRemove(null)}
        onConfirm={handleUnassignTask}
        title="Unassign Task"
        description={`Are you sure you want to unassign "${taskToRemove?.title}" from this family member?`}
        confirmText="Unassign"
        cancelText="Cancel"
      />
      
      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={!!taskToApprove}
        onClose={() => setTaskToApprove(null)}
        onConfirm={handleApproveTask}
        title="Approve Task"
        description={`Confirm that "${taskToApprove?.title}" has been completed satisfactorily?`}
        confirmText="Approve"
        cancelText="Cancel"
      />
    </Card>
  );
} 