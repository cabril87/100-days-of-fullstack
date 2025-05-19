'use client';

import React, { useState } from 'react';
import { FamilyMember } from '@/lib/types/family';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; 
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Shield, UserX, UserCog } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFamily } from '@/lib/providers/FamilyContext';
import ConfirmDialog from '@/components/family/ConfirmDialog';
import EditMemberDialog from '@/components/family/EditMemberDialog'; 

interface MembersListProps {
  members: FamilyMember[];
  isAdmin: boolean;
  familyId: string;
  onMembersChanged?: () => void;
}

export default function MembersList({ members, isAdmin, familyId, onMembersChanged }: MembersListProps) {
  const { removeMember, updateMemberRole } = useFamily();
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  
  // Sort members by role (admin first) and then by join date
  const sortedMembers = [...members].sort((a, b) => {
    // Add null checks for role property
    const aRole = a.role || { name: 'Unknown', permissions: [] as string[] };
    const bRole = b.role || { name: 'Unknown', permissions: [] as string[] };
    
    // Admin roles first
    const aIsAdmin = aRole.name?.toLowerCase() === 'admin' || aRole.permissions?.includes('admin');
    const bIsAdmin = bRole.name?.toLowerCase() === 'admin' || bRole.permissions?.includes('admin');
    
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    
    // Then sort by join date (newest first)
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    const success = await removeMember(memberToRemove.id.toString());
    if (success && onMembersChanged) {
      onMembersChanged();
    }
    setMemberToRemove(null);
  };

  const getInitials = (username: string | undefined) => {
    if (!username) return 'UN';
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {sortedMembers.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500">No members found. Invite someone to join your family!</p>
        </div>
      ) : (
        <div className="divide-y">
          {sortedMembers.map((member) => (
            <div key={member.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${member.username}`} />
                  <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.username}</div>
                  <div className="text-sm text-gray-500">{member.email || 'No email available'}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="text-xs font-medium">
                      {member.role?.name || 'Unknown'}
                    </Badge>
                    {member.role?.name?.toLowerCase() === 'admin' && (
                      <Shield className="ml-1 h-3 w-3 text-blue-600" />
                    )}
                    <span className="text-xs text-gray-400 ml-2">
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {isAdmin && member.role?.name?.toLowerCase() !== 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setMemberToEdit(member)}>
                      <UserCog className="mr-2 h-4 w-4" />
                      Edit Member
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setMemberToRemove(member)}
                      className="text-red-600"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Removal confirmation dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={`Are you sure you want to remove ${memberToRemove?.username} from your family? They will lose access to all family features.`}
        confirmText="Remove"
        cancelText="Cancel"
      />

      {/* Edit member dialog */}
      {memberToEdit && (
        <EditMemberDialog
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          member={memberToEdit}
          onSuccess={() => {
            setMemberToEdit(null);
            if (onMembersChanged) {
              onMembersChanged();
            }
          }}
        />
      )}
    </div>
  );
}