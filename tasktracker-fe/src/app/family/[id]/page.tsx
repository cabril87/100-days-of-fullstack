'use client';

import React, { useState, useEffect, use } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, UserPlus, Shield, UserCog, UserX, Trash2, PencilLine, Bell, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import InviteMemberDialog from '@/components/family/InviteMemberDialog';
import ConfirmDialog from '@/components/family/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { Family, FamilyMember } from '@/lib/types/family';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EditMemberDialog from '@/components/family/EditMemberDialog';
import { Progress } from '@/components/ui/progress';

// Define a specific props interface to ensure we receive the id parameter
interface FamilyDetailPageProps {
  params: {
    id: string;
  };
}

export default function FamilyDetailPage({ params }: FamilyDetailPageProps) {
  const resolvedParams = use(params as any);
  const {id} = resolvedParams as {id: string};
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const { deleteFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();

  console.log("Family detail page loaded with ID:", id);

  // Load specific family by ID
  useEffect(() => {
    async function loadFamilyData() {
      if (!id) {
        router.push('/family');
        return;
      }
      
      console.log("Fetching family with ID:", id);
      try {
        setLoading(true);
        const response = await familyService.getFamily(id);
        console.log("Family response:", response);
        
        if (response.data) {
          setFamily(response.data);
        } else if (response.error) {
          setError(response.error);
          showToast(response.error, 'error');
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load family';
        console.error("Failed to load family:", err);
        setError(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadFamilyData();
  }, [id, router, showToast]);

  // Handle family deletion
  const handleDeleteFamily = async () => {
    if (!family) return;
    
    const success = await deleteFamily(family.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      router.push('/family');
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!family || !memberToRemove) return;
    
    try {
      const response = await familyService.removeMember(family.id, memberToRemove.id);
      if (response.status === 204 || response.status === 200) {
        showToast(`${memberToRemove.username} has been removed from the family`, 'success');
        // Update the family data by removing the member
        setFamily(prev => {
          if (!prev) return null;
          return {
            ...prev,
            members: prev.members.filter(m => m.id !== memberToRemove.id)
          };
        });
      } else if (response.error) {
        showToast(response.error, 'error');
      }
    } catch (error) {
      showToast('Failed to remove member', 'error');
    } finally {
      setMemberToRemove(null);
    }
  };

  // Check if user is admin for this family
  const isAdmin = () => {
    if (!family) return false;
    
    const currentUserId = localStorage.getItem('userId') || '';
    const currentMember = family.members.find(member => member.userId === currentUserId);
    
    if (!currentMember) return false;
    
    return currentMember.role.name.toLowerCase() === 'admin' || 
           currentMember.role.permissions.includes('admin') ||
           currentMember.role.permissions.includes('manage_family');
  };

  // Reload family data
  const reloadFamilyData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await familyService.getFamily(id);
      if (response.data) {
        setFamily(response.data);
      } else if (response.error) {
        setError(response.error);
        showToast(response.error, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load family';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // If still loading
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // If no family exists
  if (!family) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Family Not Found</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            The family you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild size="lg">
            <Link href="/family">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If there's an error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Family</h1>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.push('/family')} className="mt-4" variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMembers = family.members.length;
  const completedTasks = family.members.reduce((sum, member) => sum + (member.completedTasks || 0), 0);
  const pendingTasks = family.members.reduce((sum, member) => sum + (member.pendingTasks || 0), 0);
  const totalTasks = completedTasks + pendingTasks;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const createdTimeAgo = formatDistanceToNow(new Date(family.createdAt), { addSuffix: true });
  const userIsAdmin = isAdmin();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/family">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{family.name}</h1>
          <p className="text-gray-500">Created {createdTimeAgo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userIsAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/family/settings/${family.id}`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Family Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Family Overview</CardTitle>
          <CardDescription>Key statistics and information about {family.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Members</span>
              <span className="text-3xl font-bold">{totalMembers}</span>
              <span className="text-xs text-gray-500">Active family members</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Task Completion</span>
              <span className="text-3xl font-bold">{completedTasks} / {totalTasks}</span>
              <span className="text-xs text-gray-500">Completed tasks</span>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-500">{completionPercentage.toFixed(0)}%</span>
              </div>
              <Progress className="h-2 mb-2" value={completionPercentage} />
              <span className="text-xs text-gray-500">{pendingTasks} tasks remaining</span>
            </div>
          </div>
          
          {family.description && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600">{family.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                {family.members.length} {family.members.length === 1 ? 'member' : 'members'} in your family
              </CardDescription>
            </div>
            {userIsAdmin && (
              <Button size="sm" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {family.members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members found. Invite someone to join your family!</p>
              </div>
            ) : (
              <div className="divide-y">
                {family.members.map((member) => {
                  const isCurrentUserAdmin = userIsAdmin;
                  const isMemberAdmin = member.role.name.toLowerCase() === 'admin' || 
                                       member.role.permissions.includes('admin');
                  const canEdit = isCurrentUserAdmin && (!isMemberAdmin || userIsAdmin);
                  
                  return (
                    <div key={member.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${member.username}`} />
                          <AvatarFallback>
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.username}</p>
                            {isMemberAdmin && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{member.email || 'No email available'}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}</span>
                            {(member.completedTasks || member.pendingTasks) && (
                              <span>•</span>
                            )}
                            {member.completedTasks != null && member.completedTasks > 0 && (
                              <span className="text-green-500">{member.completedTasks} completed</span>
                            )}
                            {member.pendingTasks != null && member.pendingTasks > 0 && (
                              <span className="text-amber-500">{member.pendingTasks} pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <PencilLine className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setMemberToEdit(member)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Member
                            </DropdownMenuItem>
                            {!isMemberAdmin && (
                              <DropdownMenuItem 
                                onClick={() => setMemberToRemove(member)}
                                className="text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      {userIsAdmin && (
        <InviteMemberDialog 
          isOpen={isInviteDialogOpen} 
          onClose={() => setIsInviteDialogOpen(false)} 
          familyId={family.id}
          onSuccess={reloadFamilyData}
        />
      )}

      {/* Delete Family Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteFamily}
        title="Delete Family"
        description={`Are you sure you want to delete "${family.name}"? This action cannot be undone and all family data will be permanently lost.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Remove Member Dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={`Are you sure you want to remove ${memberToRemove?.username} from your family? They will lose access to all family features.`}
        confirmText="Remove"
        cancelText="Cancel"
      />

      {/* Edit Member Dialog */}
      {memberToEdit && (
        <EditMemberDialog
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          member={memberToEdit}
          onSuccess={reloadFamilyData}
        />
      )}
    </div>
  );
}