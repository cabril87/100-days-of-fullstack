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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ShieldAlert, Shield, ShieldCheck, User } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { FamilyMember } from '@/lib/types/family';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

interface EditMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSuccess: () => void;
}

export default function EditMemberDialog({
  isOpen,
  onClose,
  member,
  onSuccess,
}: EditMemberDialogProps) {
  const [username, setUsername] = useState(member?.username || '');
  const [email, setEmail] = useState(member?.email || '');
  const [selectedRoleId, setSelectedRoleId] = useState<number>(member?.role?.id || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (member) {
      setUsername(member.username || '');
      setEmail(member.email || '');
      setSelectedRoleId(member.role?.id || 0);
    }
  }, [member]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      // In a real app, you would fetch roles from your API
      // For now, we'll use a mock set of roles
      setRoles([
        {
          id: 1,
          name: 'Admin',
          description: 'Full access to all family settings and member management',
          permissions: ['admin', 'manage_family', 'manage_members', 'assign_tasks', 'view_tasks']
        },
        {
          id: 2,
          name: 'Parent',
          description: 'Can manage tasks and view all family activity',
          permissions: ['manage_members', 'assign_tasks', 'view_tasks']
        },
        {
          id: 3,
          name: 'Child',
          description: 'Can view and complete assigned tasks',
          permissions: ['view_tasks', 'update_own_tasks']
        },
        {
          id: 4,
          name: 'Guest',
          description: 'Limited access to family activities',
          permissions: ['view_tasks']
        }
      ]);
    } catch (error) {
      console.error('Error loading roles:', error);
      showToast('Error loading roles', 'error');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    if (!member) return;
    
    setIsSubmitting(true);
    try {
      // Update member details
      const response = await familyService.updateMemberRole(
        member.familyId?.toString() || '',
        member.id.toString(),
        selectedRoleId
      );
      
      if (response.status === 200 || response.status === 204) {
        // Get the family ID from the member if available (assuming member.familyId exists)
        const familyId = member.familyId?.toString() || '';
        
        if (familyId) {
          // Sync family state to ensure data consistency
          await familyService.syncFamilyState(familyId, 'role update');
        }
        
        showToast('Member updated successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(response.error || 'Failed to update member', 'error');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      showToast('Error updating member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'parent':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'child':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPermissionsList = (permissions: string[]) => {
    return permissions.map(p => 
      p.split('_')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ')
    ).join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>
            Update the details and role for this family member
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Username cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="role">Role</Label>
              <Popover>
                <PopoverTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">About Roles</h4>
                    <p className="text-sm text-gray-500">
                      Roles determine what actions a member can perform in your family.
                      Choose carefully as some roles grant significant permissions.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {loadingRoles ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={selectedRoleId.toString()}
                onValueChange={(value) => setSelectedRoleId(parseInt(value))}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center">
                        {getRoleIcon(role.name)}
                        <span className="ml-2">{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Role description */}
          {selectedRoleId && roles.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex items-center mb-2">
                {getRoleIcon(roles.find(r => r.id === selectedRoleId)?.name || '')}
                <span className="font-medium ml-2">
                  {roles.find(r => r.id === selectedRoleId)?.name || 'Unknown Role'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {roles.find(r => r.id === selectedRoleId)?.description || ''}
              </p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Permissions: </span>
                {getPermissionsList(roles.find(r => r.id === selectedRoleId)?.permissions || [])}
              </div>
            </div>
          )}

          {selectedRoleId === 1 && (
            <div className="bg-red-50 p-3 rounded-md border border-red-100">
              <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800">Admin Role Warning</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Admins have full control over your family settings, including the ability to remove members
                and delete the family. Only assign this role to people you fully trust.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRoleId === member?.role?.id}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}