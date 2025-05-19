'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { taskService } from '@/lib/services/taskService';
import { FamilyMember } from '@/lib/types/family';
import { Task } from '@/lib/types/task';
import { Loader2 } from 'lucide-react';

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
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTasks();
      loadMembers();
    }
  }, [isOpen, familyId]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await taskService.getTasks();
      if (response.data) {
        // Filter for unassigned tasks or tasks created by the current user
        const userId = localStorage.getItem('userId');
        const availableTasks = response.data.filter(
          task => !task.assignedTo || task.createdBy === userId
        );
        setTasks(availableTasks);
      } else {
        showToast('Failed to load tasks', 'error');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      // Ensure we have a valid token before making the request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showToast('You must be logged in to view family members', 'error');
        setLoadingMembers(false);
        return;
      }

      const response = await familyService.getFamily(familyId);
      if (response.data) {
        // Include all members, even if userId is not present 
        // This shows all members in the dropdown
        setMembers(response.data.members);
        
        // If there are no members, show a toast message
        if (response.data.members.length === 0) {
          showToast('This family has no members to assign tasks to', 'warning');
        }
      } else {
        showToast(response.error || 'Failed to load family members', 'error');
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      showToast('Error loading family members', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTask || !selectedMember) {
      showToast('Please select both a task and a family member', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Verify authentication before sending the request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showToast('You must be logged in to assign tasks', 'error');
        setIsLoading(false);
        return;
      }

      const response = await taskService.assignTaskToFamilyMember(
        familyId,
        {
          taskId: parseInt(selectedTask, 10),
          assignToUserId: selectedMember,
          requiresApproval
        }
      );

      if (response.status === 401) {
        // If we get a 401, don't immediately close the dialog
        // Give the user a chance to retry or login again
        showToast('Authentication issue. Please try again or refresh the page to log in.', 'error');
        setIsLoading(false);
        return;
      }

      if (response.status === 200 || response.status === 204) {
        showToast('Task assigned successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(response.error || 'Failed to assign task', 'error');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      showToast('Error assigning task to family member. Please ensure you are logged in.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTask('');
    setSelectedMember('');
    setRequiresApproval(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task to Family Member</DialogTitle>
          <DialogDescription>
            Select a task and a family member to assign it to.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task">Select Task</Label>
            {loadingTasks ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger id="task">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.length === 0 ? (
                    <SelectItem value="no-tasks" disabled>
                      No tasks available
                    </SelectItem>
                  ) : (
                    tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="member">Select Family Member</Label>
            {loadingMembers ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="Select a family member" />
                </SelectTrigger>
                <SelectContent>
                  {members.length === 0 ? (
                    <SelectItem value="no-members" disabled>
                      No family members available
                    </SelectItem>
                  ) : (
                    members.map((member) => (
                      <SelectItem 
                        key={member.id.toString()} 
                        value={member.userId ? member.userId.toString() : member.id.toString()}
                      >
                        {member.username || member.name || 'Unknown'} 
                        {member.email ? ` (${member.email})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="approval"
              checked={requiresApproval}
              onCheckedChange={(checked) => setRequiresApproval(checked as boolean)}
            />
            <Label htmlFor="approval">Requires approval when completed</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignTask}
            disabled={!selectedTask || !selectedMember || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 