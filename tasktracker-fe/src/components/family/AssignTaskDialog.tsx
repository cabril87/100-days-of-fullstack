'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, Plus, ListTodo, User, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { taskService } from '@/lib/services/taskService';
import { TaskStatus, TaskPriority, TaskFormData, Task } from '@/lib/types/task';
import { ApiResponse } from '@/lib/types/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/providers/AuthContext';
import { Family, FamilyMember } from '@/lib/types/family';

// Custom interface for the form that includes the family assignment fields
interface FamilyTaskFormData extends TaskFormData {
  familyId?: number;
  assigneeId?: number;
}

// New task assignment form schema
const taskAssignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  memberId: z.string().min(1, 'Please select a family member'),
});

// Existing task assignment schema
const existingTaskAssignmentSchema = z.object({
  taskId: z.string().min(1, 'Please select a task'),
  familyId: z.string().min(1, 'Please select a family'),
  memberId: z.string().min(1, 'Please select a family member'),
});

type TaskAssignmentFormData = z.infer<typeof taskAssignmentSchema>;
type ExistingTaskAssignmentFormData = z.infer<typeof existingTaskAssignmentSchema>;

interface AssignTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onSuccess: () => void;
}

export default function AssignTaskDialog({
  isOpen,
  onClose,
  familyId,
  onSuccess,
}: AssignTaskDialogProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [existingTasks, setExistingTasks] = useState<Task[]>([]);
  const [availableFamilies, setAvailableFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [isFamiliesLoading, setIsFamiliesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new-task');
  const { showToast } = useToast();
  const { user } = useAuth();

  // Setup form with validation for new tasks
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskAssignmentFormData>({
    resolver: zodResolver(taskAssignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  // Setup form for existing task assignment
  const {
    register: registerExisting,
    handleSubmit: handleSubmitExisting,
    setValue: setValueExisting,
    reset: resetExisting,
    formState: { errors: errorsExisting },
  } = useForm<ExistingTaskAssignmentFormData>({
    resolver: zodResolver(existingTaskAssignmentSchema),
  });

  // Fetch family members and tasks when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (familyId) {
        // Default family for the "New Task" tab
        loadFamilyMembers(familyId);
      }
      loadExistingTasks();
      loadAvailableFamilies();
    }
  }, [isOpen, familyId]);

  // Load family members when a family is selected in the existing task tab
  useEffect(() => {
    if (selectedFamilyId) {
      loadFamilyMembers(selectedFamilyId);
    }
  }, [selectedFamilyId]);

  const loadAvailableFamilies = async () => {
    try {
      setIsFamiliesLoading(true);
      const response = await familyService.getAllFamilies();
      if (response.data) {
        setAvailableFamilies(response.data);
      } else if (response.error) {
        showToast(response.error, 'error');
      }
    } catch (error) {
      console.error('Failed to load families:', error);
      showToast('Failed to load families', 'error');
    } finally {
      setIsFamiliesLoading(false);
    }
  };

  const loadFamilyMembers = async (fid: string) => {
    try {
      setIsMembersLoading(true);
      console.log(`[AssignTaskDialog] Loading family members for family ID: ${fid}`);
      
      // First get basic family data
      const response = await familyService.getFamily(fid);
      
      if (response.data && response.data.members) {
        console.log('[AssignTaskDialog] Basic family members data:', response.data.members);
        
        // Use the same approach as the FamilyDetailPage
        const enhancedMembersData = await Promise.all(
          response.data.members.map(async (member) => {
            try {
              // Get detailed data for each member
              const memberResponse = await familyService.getFamilyMemberDetails(member.id.toString());
              if (memberResponse.data) {
                console.log(`[AssignTaskDialog] Got detailed data for member ${member.id}:`, memberResponse.data);
                
                return {
                  ...member,
                  // If the detailed response has a user object, use that data
                  username: memberResponse.data.user?.username || member.username,
                  email: memberResponse.data.user?.email || member.email,
                  user: memberResponse.data.user || member.user,
                  // Keep existing member data for other fields
                  id: member.id,
                  role: member.role
                };
              }
              return member;
            } catch (error) {
              console.error(`[AssignTaskDialog] Error fetching details for member ${member.id}:`, error);
              return member;
            }
          })
        );
        
        // Process enhanced member data to ensure usernames are properly set
        const processedMembers = enhancedMembersData.map(member => {
          // Create a better display name that looks for username in multiple places
          if (!member.username || member.username === 'Unknown' || member.username.startsWith('Member ')) {
            // Check user object first
            if (member.user) {
              if (member.user.username) {
                member.username = member.user.username;
              } else if (member.user.displayName) {
                member.username = member.user.displayName;
              } else if (member.user.firstName || member.user.lastName) {
                member.username = `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();
              }
            }
            
            // If still no username, try other fields
            if (!member.username || member.username === 'Unknown' || member.username.startsWith('Member ')) {
              member.username = member.name || member.email || `Member ${member.id}`;
            }
          }
          
          console.log(`[AssignTaskDialog] Final processed member ${member.id}:`, member);
          return member;
        });
        
        setMembers(processedMembers);
      } else if (response.error) {
        showToast(response.error, 'error');
      }
    } catch (error) {
      console.error('[AssignTaskDialog] Failed to load family members:', error);
      showToast('Failed to load family members', 'error');
    } finally {
      setIsMembersLoading(false);
    }
  };

  const loadExistingTasks = async () => {
    try {
      setIsTasksLoading(true);
      const response = await taskService.getTasks();
      if (response.data) {
        // Filter out tasks that are already completed or assigned
        const availableTasks = response.data.filter(task => 
          task.status !== 'done' && !task.assignedTo
        );
        setExistingTasks(availableTasks);
      } else if (response.error) {
        showToast(response.error, 'error');
      }
    } catch (error) {
      console.error('Failed to load existing tasks:', error);
      showToast('Failed to load existing tasks', 'error');
    } finally {
      setIsTasksLoading(false);
    }
  };

  const onSubmitNewTaskForm = async (data: TaskAssignmentFormData) => {
    try {
      setIsLoading(true);

      // Map string priority to numeric value that C# backend expects
      let priorityValue = 1; // Medium default
      if (data.priority === 'low') priorityValue = 0;
      if (data.priority === 'high') priorityValue = 2;
      
      console.log('[AssignTaskDialog] Starting two-step task creation and assignment');
      
      // STEP 1: Create a task with the generic taskitems endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token') || '';
      const csrfToken = familyService.getCsrfToken?.() || '';
      
      // Create a basic task first
      const taskData = {
        Title: data.title,
        Description: data.description || '',
        Status: 0, // NotStarted/Todo = 0 in C# enum
        Priority: priorityValue,
        DueDate: data.dueDate
      };
      
      console.log('[AssignTaskDialog] Step 1: Creating task with data:', taskData);
      
      try {
        // Create the task first
        const createResponse = await fetch(`${apiUrl}/v1/taskitems`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-CSRF-TOKEN': csrfToken,
            'X-XSRF-TOKEN': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify(taskData)
        });
        
        console.log('[AssignTaskDialog] Task creation response status:', createResponse.status);
        
        if (createResponse.ok) {
          // Parse the response to get the created task ID
          const createdTask = await createResponse.json();
          console.log('[AssignTaskDialog] Task created successfully:', createdTask);
          
          if (createdTask && createdTask.id) {
            // STEP 2: Assign the task to the family member
            console.log(`[AssignTaskDialog] Step 2: Assigning task ${createdTask.id} to member ${data.memberId}`);
            
            const assignmentData = {
              taskId: createdTask.id,
              assignToUserId: data.memberId,
              requiresApproval: false
            };
            
            const assignResponse = await fetch(`${apiUrl}/v1/family/${familyId}/tasks/assign`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                'X-CSRF-TOKEN': csrfToken,
                'X-XSRF-TOKEN': csrfToken
              },
              credentials: 'include',
              body: JSON.stringify(assignmentData)
            });
            
            console.log('[AssignTaskDialog] Assignment response status:', assignResponse.status);
            
            if (assignResponse.ok) {
              showToast('Task created and assigned successfully!', 'success');
              onSuccess();
              handleClose();
              return;
            } else {
              console.error('[AssignTaskDialog] Failed to assign task:', await assignResponse.text());
              showToast('Task created but assignment failed. Please try again.', 'warning');
            }
          } else {
            console.error('[AssignTaskDialog] Created task has no ID:', createdTask);
            showToast('Task was created but could not be assigned. Please try again.', 'warning');
          }
        } else {
          console.error('[AssignTaskDialog] Failed to create task:', await createResponse.text());
          showToast('Failed to create task. Please try again.', 'error');
        }
      } catch (error) {
        console.error('[AssignTaskDialog] Error in two-step task creation:', error);
        showToast('Failed to create or assign task. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Failed to assign task:', error);
      showToast('Failed to assign task. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitExistingTaskForm = async (data: ExistingTaskAssignmentFormData) => {
    try {
      setIsLoading(true);
      
      // Get selected member information to verify relationship
      const selectedMember = members.find(m => m.id.toString() === data.memberId);
      if (!selectedMember) {
        showToast('Selected member not found in family', 'error');
        setIsLoading(false);
        return;
      }

      console.log('[AssignTaskDialog] Selected member for assignment:', selectedMember);
      
      // Verify that we have permissions to assign tasks in this family
      // This is checked server-side too, but checking early avoids failed requests
      try {
        const userRole = selectedMember.role?.name?.toLowerCase() || '';
        const isUserAdmin = userRole === 'admin' || userRole === 'owner' || userRole === 'creator';
        
        if (!isUserAdmin) {
          console.log('[AssignTaskDialog] Checking family permissions:', userRole);
          const familyResponse = await familyService.getFamily(familyId);
          if (familyResponse.data) {
            const currentFamily = familyResponse.data;
            const currentUser = currentFamily.members.find(m => 
              m.userId === (user?.id?.toString() || '') || 
              m.username === user?.username
            );
            
            if (currentUser) {
              const currentUserRole = currentUser.role?.name?.toLowerCase() || '';
              console.log('[AssignTaskDialog] Current user role in family:', currentUserRole);
              
              if (currentUserRole !== 'admin' && currentUserRole !== 'owner' && currentUserRole !== 'creator') {
                showToast('You do not have permission to assign tasks in this family. Only family administrators can assign tasks.', 'error');
                setIsLoading(false);
                return;
              }
            }
          }
        }
      } catch (permError) {
        console.error('[AssignTaskDialog] Error checking permissions:', permError);
        // Continue anyway, the server will enforce permissions
      }
      
      // Use the task assignment DTO
      const assignmentData = {
        taskId: Number(data.taskId),
        assignToUserId: data.memberId,
        requiresApproval: false
      };
      
      console.log('[AssignTaskDialog] Sending task assignment data:', assignmentData);
      
      // Try refreshing the auth token first before making the assignment request
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      let freshToken = '';
      
      try {
        console.log('[AssignTaskDialog] Attempting to refresh auth token before task assignment');
        const refreshResponse = await fetch(`${apiUrl}/v1/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          try {
            const refreshData = await refreshResponse.json();
            if (refreshData?.token) {
              console.log('[AssignTaskDialog] Successfully refreshed token');
              freshToken = refreshData.token;
              localStorage.setItem('token', freshToken);
            }
          } catch (e) {
            console.error('[AssignTaskDialog] Error parsing refresh token response:', e);
          }
        } else {
          console.log('[AssignTaskDialog] Token refresh returned:', refreshResponse.status);
        }
      } catch (refreshError) {
        console.error('[AssignTaskDialog] Error refreshing token:', refreshError);
      }
      
      // Provide detailed error handling and more context to the user
      let errorMessage = '';
      
      // First try using the familyService implementation
      try {
        console.log('[AssignTaskDialog] Attempting assignment via family service');
        const response = await familyService.assignTaskToMember(
          familyId,
          data.taskId,
          data.memberId
        );
        
        console.log('[AssignTaskDialog] Family service response:', response);
        
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          // Success!
          showToast('Task assigned successfully!', 'success');
          onSuccess?.();
          onClose();
          return;
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'You do not have permission to assign tasks in this family. Only family administrators can assign tasks.';
          throw new Error(errorMessage);
        } else if (response.status === 404) {
          errorMessage = 'The member or task was not found. Please refresh the page and try again.';
          throw new Error(errorMessage);  
        } else {
          console.error('[AssignTaskDialog] Error using family service:', new Error(response.error || 'Unknown error'));
        }
      } catch (serviceError) {
        console.error('[AssignTaskDialog] Error with family service:', serviceError);
        
        if (errorMessage) {
          showToast(errorMessage, 'error');
        setIsLoading(false);
        return;
      }
      }
      
      // If we get here, try direct API fetch with refreshed token
      try {
        console.log('[AssignTaskDialog] Making direct request to:', `${apiUrl}/v1/family/${familyId}/tasks/assign`);
        
        // Get CSRF token
        const csrfToken = familyService.getCsrfToken();
        
        // Use the fresh token if available, or fall back to stored token
        const authToken = freshToken || localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        
        // Extract the member's user ID from the selected member object (ensuring we have the right ID format)
        const userId = selectedMember.user?.id || selectedMember.userId || data.memberId;
        console.log('[AssignTaskDialog] Using member user ID for assignment:', userId);
        
        // Set request headers with all possible auth combinations
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'X-XSRF-TOKEN': csrfToken,
          'X-CSRF-TOKEN': csrfToken,
        };
        
        console.log('[AssignTaskDialog] Request headers:', headers);
        
        // Include enhanced assignment data with both member ID and user ID to increase chances of success
        const enhancedData = {
          taskId: Number(data.taskId),
          assignToUserId: userId,
          // Required fields based on backend validation
          UserId: userId,
          MemberId: data.memberId,
          // Additional fields
          familyMemberId: data.memberId,
          requiresApproval: false,
          familyId: Number(familyId)
        };
        
        // Make the direct fetch request
        const response = await fetch(`${apiUrl}/v1/family/${familyId}/tasks/assign`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(enhancedData)
        });
        
        console.log('[AssignTaskDialog] Assignment response status:', response.status);
        
        if (response.ok) {
          // Success!
          showToast('Task assigned successfully!', 'success');
          onSuccess?.();
          onClose();
          return;
        }
        
        // If we got a 401, try one more approach with a different endpoint format
        if (response.status === 401 || response.status === 403) {
          console.log('[AssignTaskDialog] Permission error, cannot assign tasks');
          showToast('You do not have permission to assign tasks in this family. Only family administrators can assign tasks.', 'error');
          setIsLoading(false);
          return;
        }
        
        if (response.status === 404) {
          console.log('[AssignTaskDialog] Still getting 404, trying alternative endpoint format');
          
          // Try alternative endpoint format
          const altResponse = await fetch(`${apiUrl}/v1/family-tasks/assign?familyId=${familyId}`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(enhancedData)
          });
          
          if (altResponse.ok) {
            // Success with alternative endpoint!
            showToast('Task assigned successfully!', 'success');
            onSuccess?.();
            onClose();
            return;
          }
        }
        
        // If all else fails, try the task service method as a last resort
        const taskServiceResponse = await taskService.assignTaskToFamilyMember(
          familyId, 
          enhancedData
        );
        
        if (taskServiceResponse.status === 200 || taskServiceResponse.status === 201 || taskServiceResponse.status === 204) {
          // Success with task service!
          showToast('Task assigned successfully!', 'success');
          onSuccess?.();
        onClose();
          return;
        }
        
        // Try to extract better error message from response
        let responseMessage = 'All assignment methods failed';
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.error) {
            responseMessage = errorData.message || errorData.error;
          }
        } catch (parseError) {
          // Unable to parse error message from JSON
        }
        
        throw new Error(responseMessage);
      } catch (fetchError) {
        console.error('[AssignTaskDialog] Error with direct fetch:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error('[AssignTaskDialog] Error:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to assign task',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFamilyChange = (familyId: string) => {
    setSelectedFamilyId(familyId);
    setValueExisting('familyId', familyId);
    // Reset member selection when family changes
    setValueExisting('memberId', '');
  };

  const handleClose = () => {
    reset();
    resetExisting();
    setSelectedFamilyId('');
    setActiveTab('new-task');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Create a new task or assign an existing one to a family member.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-task" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="existing-task" className="flex items-center">
              <ListTodo className="h-4 w-4 mr-2" />
              Use Existing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-task">
            <form onSubmit={handleSubmit(onSubmitNewTaskForm)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Task Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter task title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter task details"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
              <Select
                    defaultValue="medium"
                    onValueChange={(value) => setValue('priority', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberId">
                  Assign To <span className="text-red-500">*</span>
                </Label>
                {isMembersLoading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading members...</span>
                  </div>
                ) : (
                  <Select onValueChange={(value) => setValue('memberId', value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {members.length > 0 ? members.map((member) => {
                        return (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.username}
                          </SelectItem>
                        );
                      }) : (
                        <SelectItem value="none" disabled>
                          No members available
                    </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {errors.memberId && (
                  <p className="text-sm text-red-500">{errors.memberId.message}</p>
                )}
              </div>

              <div className="text-xs text-gray-500 flex items-center mt-2">
                <User className="h-3 w-3 mr-1" />
                Task will be created by: {user?.username || user?.email || 'You'}
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create & Assign
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="existing-task">
            <form onSubmit={handleSubmitExisting(onSubmitExistingTaskForm)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskId">
                  Select Task <span className="text-red-500">*</span>
                </Label>
                {isTasksLoading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading tasks...</span>
                  </div>
                ) : (
                  <Select onValueChange={(value) => setValueExisting('taskId', value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select an existing task" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[200px]">
                      {existingTasks.length > 0 ? (
                        existingTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No available tasks found
                        </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
                {errorsExisting.taskId && (
                  <p className="text-sm text-red-500">{errorsExisting.taskId.message}</p>
            )}
          </div>

              <div className="space-y-2">
                <Label htmlFor="familyId">
                  Select Family <span className="text-red-500">*</span>
                </Label>
                {isFamiliesLoading ? (
                  <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading families...</span>
              </div>
            ) : (
              <Select
                    onValueChange={(value) => handleFamilyChange(value)}
              >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a family" />
                </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {availableFamilies.length > 0 ? (
                        availableFamilies.map((family) => (
                          <SelectItem key={family.id} value={family.id.toString()}>
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-2 text-gray-500" />
                              {family.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No families available
                    </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {errorsExisting.familyId && (
                  <p className="text-sm text-red-500">{errorsExisting.familyId.message}</p>
                )}
              </div>

              {selectedFamilyId && (
                <div className="space-y-2">
                  <Label htmlFor="existingMemberId">
                    Assign To <span className="text-red-500">*</span>
                  </Label>
                  {isMembersLoading ? (
                    <div className="flex items-center space-x-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading members...</span>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => setValueExisting('memberId', value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select family member" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {members.length > 0 ? members.map((member) => {
                          return (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.username}
                            </SelectItem>
                          );
                        }) : (
                          <SelectItem value="none" disabled>
                            No members available
                      </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
                  {errorsExisting.memberId && (
                    <p className="text-sm text-red-500">{errorsExisting.memberId.message}</p>
            )}
          </div>
              )}

              <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
                  type="submit" 
                  disabled={isLoading || existingTasks.length === 0 || !selectedFamilyId}
          >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign Existing Task
          </Button>
        </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 