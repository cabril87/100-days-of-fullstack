'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserMinus, Users, UserCog, History } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { taskService } from '@/lib/services/taskService';
import { FamilyMember } from '@/lib/types/family';
import ConfirmDialog from './ConfirmDialog';

interface FamilyMemberManagerProps {
  familyId: string;
  isAdmin: boolean;
}

export default function FamilyMemberManager({ familyId, isAdmin }: FamilyMemberManagerProps) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [memberToUnassignTasks, setMemberToUnassignTasks] = useState<FamilyMember | null>(null);
  const { showToast } = useToast();
  
  useEffect(() => {
    loadFamilyMembers();
  }, [familyId]);
  
  const loadFamilyMembers = async () => {
    setLoading(true);
    try {
      const response = await familyService.getMembers(familyId);
      if (response.data) {
        setMembers(response.data);
      } else {
        showToast(response.error || 'Failed to load family members', 'error');
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      showToast('Error loading family members', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      const response = await familyService.removeMember(familyId, memberToRemove.id.toString());
      if (response.status === 200 || response.status === 204) {
        showToast(`${memberToRemove.user?.username || 'Member'} removed from family`, 'success');
        loadFamilyMembers();
      } else {
        showToast(response.error || 'Failed to remove family member', 'error');
      }
    } catch (error) {
      console.error('Error removing family member:', error);
      showToast('Error removing family member', 'error');
    } finally {
      setMemberToRemove(null);
    }
  };
  
  const handleUnassignAllTasks = async () => {
    if (!memberToUnassignTasks) return;
    
    try {
      const response = await taskService.unassignAllTasksFromMember(familyId, Number(memberToUnassignTasks.id));
      if (response.status === 200) {
        const tasksCount = response.data || 0;
        showToast(`Unassigned ${tasksCount} tasks from ${memberToUnassignTasks.user?.username || 'member'}`, 'success');
      } else {
        showToast(response.error || 'Failed to unassign tasks', 'error');
      }
    } catch (error) {
      console.error('Error unassigning tasks from member:', error);
      showToast('Error unassigning tasks', 'error');
    } finally {
      setMemberToUnassignTasks(null);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <CardDescription>Manage your family members</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Members</CardTitle>
        <CardDescription>Manage your family members</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No members in this family yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {member.user?.username || 'Unknown User'}
                    </h4>
                    <div className="text-sm text-gray-500 mt-1">
                      {member.user?.email}
                    </div>
                  </div>
                  <Badge>
                    {member.role?.name || 'Member'}
                  </Badge>
                </div>
                
                {isAdmin && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => setMemberToUnassignTasks(member)}
                    >
                      <History className="h-4 w-4 mr-1" />
                      Unassign Tasks
                    </Button>
                    
                    {member.role?.name !== 'Admin' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Confirm Remove Member Dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={`Are you sure you want to remove ${memberToRemove?.user?.username || 'this member'} from your family? All of their assigned tasks will be unassigned.`}
        confirmText="Remove"
        cancelText="Cancel"
        destructive={true}
      />
      
      {/* Confirm Unassign All Tasks Dialog */}
      <ConfirmDialog
        isOpen={!!memberToUnassignTasks}
        onClose={() => setMemberToUnassignTasks(null)}
        onConfirm={handleUnassignAllTasks}
        title="Unassign All Tasks"
        description={`Are you sure you want to unassign all tasks from ${memberToUnassignTasks?.user?.username || 'this member'}? The tasks will remain in the system but won't be assigned to anyone.`}
        confirmText="Unassign All"
        cancelText="Cancel"
      />
    </Card>
  );
} 