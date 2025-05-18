'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types/family';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/hooks/useToast';

interface EditMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSuccess?: () => void;
}

interface Role {
  id: number;
  name: string;
}

// Sample roles - in a real app, these would come from an API
const ROLES: Role[] = [
  { id: 1, name: 'Member' },
  { id: 2, name: 'Contributor' },
  { id: 3, name: 'Manager' }
];

export default function EditMemberDialog({ isOpen, onClose, member, onSuccess }: EditMemberDialogProps) {
  const [name, setName] = useState(member.username);
  const [email, setEmail] = useState(member.email || '');
  const [roleId, setRoleId] = useState(member.role.id.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      const response = await familyService.updateFamilyMember(
        member.id, 
        { 
          name, 
          email: email || undefined,
          role: roleId 
        }
      );

      if (response.error) {
        showToast(response.error, 'error');
      } else {
        showToast('Member updated successfully', 'success');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      showToast('Failed to update member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>
            Update information for {member.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={roleId} 
                onValueChange={setRoleId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}