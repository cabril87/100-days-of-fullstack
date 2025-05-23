'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Briefcase, UserCheck, Trash2, Lock, Archive } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { taskService } from '@/lib/services/taskService';
import { familyService } from '@/lib/services/familyService';
import { Task } from '@/lib/types/task';
import { formatDistanceToNow } from 'date-fns';
import ConfirmDialog from './ConfirmDialog';
import { Spinner } from '@/components/ui/spinner';

interface FamilyTaskListProps {
  familyId: string;
  isAdmin: boolean;
  familyMembers?: Array<{ 
    id: string | number; 
    username?: string; 
    name?: string; 
    role?: { name?: string };
  }>;
  filterOptions?: {
    memberFilter?: string;
    statusFilter?: string;
    searchQuery?: string;
  };
}

export default function FamilyTaskList({ familyId, isAdmin, familyMembers = [], filterOptions }: FamilyTaskListProps) {
  // Define all state hooks first
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [taskToUnassign, setTaskToUnassign] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToApprove, setTaskToApprove] = useState<Task | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get context hooks second
  const { showToast } = useToast();
  
  // Define all memo hooks
  const filteredTasks = React.useMemo(() => {
    if (!tasks || !filterOptions) return tasks || [];

    console.log('[FamilyTaskList] Filtering tasks with options:', filterOptions);
    console.log('[FamilyTaskList] Available familyMembers:', familyMembers);
    
    // Special handling for admin selection
    const isAdminFilter = filterOptions.memberFilter && familyMembers.some(member => 
      member.id.toString() === filterOptions.memberFilter?.toString() && 
      ((member.username?.toLowerCase() === 'admin') || 
       (member.role?.name?.toLowerCase() === 'admin'))
    );

    return tasks.filter(task => {
      // Filter by member if selected
      if (filterOptions.memberFilter && filterOptions.memberFilter !== "all") {
        console.log(
          `[FamilyTaskList] Checking task "${task.title}" for member ${filterOptions.memberFilter}:`,
          `assignedTo="${task.assignedTo}"`,
          `assignedToName="${task.assignedToName}"`
        );
        
        // Convert IDs to strings for comparison
        const memberFilterStr = filterOptions.memberFilter.toString();
        const assignedToStr = task.assignedTo?.toString() || '';
        
        // Check exact match of IDs
        const exactIdMatch = assignedToStr === memberFilterStr;
        
        // Check if member name is included
        const nameMatch = task.assignedToName?.toLowerCase().includes(filterOptions.memberFilter.toLowerCase()) || false;
        
        // Also check if member ID is included in the name (in case it's stored as a different format)
        const nameIdMatch = task.assignedToName?.includes(memberFilterStr) || false;
        
        // Find the selected member
        const selectedMember = familyMembers.find(m => m.id.toString() === memberFilterStr);
        
        // Check if the task is assigned to this member by username match
        const usernameMatch = selectedMember && selectedMember.username && 
          task.assignedToName?.toLowerCase().includes(selectedMember.username.toLowerCase());
          
        // Check if the task is assigned by name match  
        const fullNameMatch = selectedMember && selectedMember.name && 
          task.assignedToName?.toLowerCase().includes(selectedMember.name.toLowerCase());
          
        // Special case: Check if the task is explicitly assigned to admin
        const adminMatch = selectedMember && 
            ((selectedMember.username?.toLowerCase() === 'admin') || 
             (selectedMember.name?.toLowerCase() === 'admin')) && 
            task.assignedToName?.toLowerCase().includes('admin');
            
        // Special case for admin user - treat "admin" user as having access to all tasks
        const adminFallbackAccess = isAdminFilter;
        
        console.log(`[FamilyTaskList] Match results: exactIdMatch=${exactIdMatch}, nameMatch=${nameMatch}, nameIdMatch=${nameIdMatch}, usernameMatch=${usernameMatch}, fullNameMatch=${fullNameMatch}, adminMatch=${adminMatch}, adminFallbackAccess=${adminFallbackAccess}`);
        
        if (!exactIdMatch && !nameMatch && !nameIdMatch && !usernameMatch && !fullNameMatch && !adminMatch && !adminFallbackAccess) {
          return false;
        }
      }
      
      // Filter by status if selected
      if (filterOptions.statusFilter && filterOptions.statusFilter !== "all") {
        const taskStatus = task.status?.toLowerCase() || 'notstarted';
        const filterStatus = filterOptions.statusFilter.toLowerCase();
        
        console.log(`[FamilyTaskList] Status check: taskStatus="${taskStatus}", filterStatus="${filterStatus}"`);
        
        // Special handling for the new tab system
        if (filterStatus === 'active') {
          // Check if the task is active (not done)
          if (taskStatus === 'done' || taskStatus === 'completed') {
            return false;
          }
        } else if (filterStatus === 'done' || filterStatus === 'completed') {
          // Check if the task is done/completed
          if (taskStatus !== 'done' && taskStatus !== 'completed') {
            return false;
          }
        }
        // Handle common status variations
        else if (filterStatus === 'todo' && (taskStatus === 'notstarted' || taskStatus === 'not started' || taskStatus === 'to do')) {
          // Match "todo" filter with various initial status formats
          return true;
        } else if (filterStatus === 'notstarted' && (taskStatus === 'todo' || taskStatus === 'to do' || taskStatus === 'not started')) {
          // Match "notstarted" filter with various initial status formats
          return true;
        } else if (taskStatus !== filterStatus) {
          return false;
        }
      }
      
      // Filter by search query
      if (filterOptions.searchQuery) {
        const query = filterOptions.searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query) || false;
        const matchesDescription = task.description?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      return true;
    });
  }, [tasks, filterOptions, familyMembers]);

  const filteredUnassignedTasks = React.useMemo(() => {
    if (!unassignedTasks || !filterOptions) return unassignedTasks || [];
    
    console.log('[FamilyTaskList] Filtering unassigned tasks with options:', filterOptions);
    
    return unassignedTasks.filter(task => {
      // Only apply status and search filters to unassigned tasks
      // Filter by status if selected
      if (filterOptions.statusFilter && filterOptions.statusFilter !== "all") {
        if (task.status?.toLowerCase() !== filterOptions.statusFilter.toLowerCase()) {
          return false;
        }
      }
      
      // Filter by search query
      if (filterOptions.searchQuery) {
        const query = filterOptions.searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query) || false;
        const matchesDescription = task.description?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      return true;
    });
  }, [unassignedTasks, filterOptions]);
  
  // Define all utility functions with useCallback
  const getPriorityColor = useCallback((priority: string) => {
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
  }, []);
  
  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  }, []);
  
  const needsApproval = useCallback((task: Task) => {
    return task.status.toLowerCase() === 'done' && 
           task.requiresApproval && 
           !task.approvedBy;
  }, []);
  
  const getTaskKey = useCallback((task: Task, section: string) => {
    return `${section}-${task.id}-${Date.now()}`;
  }, []);
  
  // Define all handler functions with useCallback
  const loadFamilyTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Try using familyService first, which has enhanced auth handling
      console.log(`[FamilyTaskList] Loading tasks for family ${familyId} using familyService`);
      const response = await familyService.getFamilyTasks(familyId);
      
      if (response.data) {
        console.log(`[FamilyTaskList] Successfully loaded ${response.data.length} tasks`);
        
        // Log details about each task for debugging
        response.data.forEach(task => {
          console.log(`[FamilyTaskList] Task: ${task.id} - "${task.title}" - assignedTo: ${task.assignedTo}, assignedToName: ${task.assignedToName}`);
        });
        
        // Split into assigned and unassigned tasks
        const assigned = response.data.filter(task => task.assignedToName);
        const unassigned = response.data.filter(task => !task.assignedToName);
        
        console.log(`[FamilyTaskList] Split into ${assigned.length} assigned tasks and ${unassigned.length} unassigned tasks`);
        
        setTasks(assigned);
        setUnassignedTasks(unassigned);
      } else if (response.error) {
        console.error(`[FamilyTaskList] Error from familyService:`, response.error);
        
        // Fall back to taskService as a backup
        console.log(`[FamilyTaskList] Falling back to taskService`);
        const fallbackResponse = await taskService.getFamilyTasks(familyId);
        
        if (fallbackResponse.data) {
          const assigned = fallbackResponse.data.filter(task => task.assignedToName);
          const unassigned = fallbackResponse.data.filter(task => !task.assignedToName);
          
          setTasks(assigned);
          setUnassignedTasks(unassigned);
      } else {
          showToast(fallbackResponse.error || 'Failed to load family tasks', 'error');
        }
      }
    } catch (error) {
      console.error('[FamilyTaskList] Error loading family tasks:', error);
      showToast('Error loading family tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [familyId, showToast]);
  
  const handleUnassignTask = useCallback(async () => {
    if (!taskToUnassign || !isAuthenticated) return;
    
    try {
      const response = await taskService.unassignTask(familyId, taskToUnassign.id);
      if (response.status === 200 || response.status === 204) {
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
      setTaskToUnassign(null);
    }
  }, [familyId, taskToUnassign, isAuthenticated, showToast, loadFamilyTasks]);
  
  const handleDeleteTask = useCallback(async () => {
    if (!taskToDelete || !isAuthenticated) return;
    
    try {
      const response = await taskService.deleteFamilyTask(familyId, taskToDelete.id);
      if (response.status === 200 || response.status === 204) {
        // Use familyService for state synchronization
        await familyService.syncFamilyState(familyId, 'task deletion');
        
        showToast('Task deleted successfully', 'success');
        loadFamilyTasks();
      } else {
        showToast(response.error || 'Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Error deleting task', 'error');
    } finally {
      setTaskToDelete(null);
    }
  }, [familyId, taskToDelete, isAuthenticated, showToast, loadFamilyTasks]);
  
  const handleApproveTask = useCallback(async () => {
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
  }, [familyId, taskToApprove, isAuthenticated, showToast, loadFamilyTasks]);
  
  // Always define renderTaskItem even if we don't use it, to maintain hook order
  const renderTaskItem = useCallback((task: Task, section: string, isUnassigned = false) => (
    <div 
      key={getTaskKey(task, section)} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
      onClick={() => {
        // Navigate to task detail page if the task has an ID
        if (task.id) {
          window.location.href = `/tasks/${task.id}`;
        }
      }}
      style={{ cursor: 'pointer' }}
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
          {!isUnassigned ? (
            <>
                    <UserCheck className="h-4 w-4 text-gray-500 mr-1" />
                    <span>Assigned to: </span>
              <span className="font-medium ml-1">
                {task.assignedToName || 'Unknown'}
              </span>
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Unassigned</span>
            </>
          )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {needsApproval(task) && isAdmin && isAuthenticated && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the parent onClick from firing
                setTaskToApprove(task);
              }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
          {isAdmin && isAuthenticated && !isUnassigned && (
                      <Button 
                        size="sm" 
                        variant="outline" 
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the parent onClick from firing
                setTaskToUnassign(task);
              }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Unassign
                      </Button>
                    )}
          
          {isAdmin && isAuthenticated && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the parent onClick from firing
                setTaskToDelete(task);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
                  </div>
                </div>
    </div>
  ), [getTaskKey, getStatusIcon, getPriorityColor, needsApproval, isAdmin, isAuthenticated, setTaskToApprove, setTaskToUnassign, setTaskToDelete]);
  
  // Define all effects last
  useEffect(() => {
    // Check authentication state
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsAuthenticated(!!authToken);
    
    loadFamilyTasks();
  }, [familyId, loadFamilyTasks]);

  // Conditional rendering for loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
              </div>
  );
  }
  
  return (
    <>
      {/* Assigned Tasks Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>Tasks assigned to family members</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tasks have been assigned to family members yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => renderTaskItem(task, 'assigned'))}
          </div>
        )}
      </CardContent>
      </Card>
      
      {/* Unassigned Tasks Card */}
      {filteredUnassignedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Tasks</CardTitle>
            <CardDescription>Tasks not yet assigned to any family member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUnassignedTasks.map(task => renderTaskItem(task, 'unassigned', true))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
        isOpen={!!taskToUnassign}
        onClose={() => setTaskToUnassign(null)}
        onConfirm={handleUnassignTask}
        title="Unassign Task"
        description={`Are you sure you want to unassign "${taskToUnassign?.title}" from this family member? The task will remain in the system and will move to the unassigned pool.`}
        confirmText="Unassign"
        cancelText="Cancel"
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
      />
      
      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={!!taskToApprove}
        onClose={() => setTaskToApprove(null)}
        onConfirm={handleApproveTask}
        title="Approve Task"
        description={`Are you sure you want to approve "${taskToApprove?.title}"? This will mark the task as approved.`}
        confirmText="Approve"
        cancelText="Cancel"
      />
    </>
  );
} 