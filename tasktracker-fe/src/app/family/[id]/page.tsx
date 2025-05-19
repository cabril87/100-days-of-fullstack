'use client';

import React, { useState, useEffect, use } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, UserPlus, Shield, UserCog, UserX, Trash2, PencilLine, Bell, ArrowLeft,
  FileText, ClipboardList, Home, AlertTriangle, RefreshCw, Search, Users, MoreHorizontal
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
import AssignTaskDialog from '@/components/family/AssignTaskDialog';
import FamilyTaskList from '@/components/family/FamilyTaskList';
import MemberDetailDialog from '@/components/family/MemberDetailDialog';
import { UserLookupDialog } from '@/components/family';

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
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [memberToView, setMemberToView] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'tasks'>('members');
  const { deleteFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();
  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);

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

  // Reload family data
  const reloadFamilyData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await familyService.refreshFamily(id.toString(), true);
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

  // Handle family deletion
  const handleDeleteFamily = async () => {
    if (!family) return;
    
    const success = await deleteFamily(family.id.toString());
    if (success) {
      setIsDeleteDialogOpen(false);
      router.push('/family');
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!family || !memberToRemove) return;
    
    try {
      const response = await familyService.removeMember(
        family.id.toString(), 
        memberToRemove.id.toString()
      );
      if (response.status === 204 || response.status === 200) {
        showToast(`${memberToRemove.username || 'Member'} has been removed from the family`, 'success');
        
        // Use the new syncFamilyState function to ensure data consistency
        await familyService.syncFamilyState(family.id.toString(), 'member removal');
        
        // Update the family data
        reloadFamilyData();
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
    
    // Debug info to help troubleshoot admin detection
    console.log(`Current user ID from localStorage: ${currentUserId}`);
    console.log(`Family members:`, family.members);
    
    // First try to match by userId
    let currentMember = family.members.find(member => 
      member.userId && member.userId.toString() === currentUserId
    );
    
    // If not found by userId, try by id (some backends use different fields)
    if (!currentMember) {
      currentMember = family.members.find(member => 
        member.id && member.id.toString() === currentUserId
      );
    }
    
    // If still not found, check if any member has admin role
    // This is useful for demo environments or first-time setup
    if (!currentMember) {
      console.log("Current user not found in family members");
      // For demo purposes, check if the user is the only member or if there's only an admin
      if (family.members.length === 1) {
        currentMember = family.members[0];
        console.log("Using the only family member as current user");
      }
    }
    
    if (!currentMember) {
      console.log("No matching member found for current user");
      return false;
    }
    
    if (!currentMember.role) {
      console.log("Member has no role information");
      return false;
    }
    
    const isAdminRole = 
      (currentMember.role.name && currentMember.role.name.toLowerCase() === 'admin') || 
      (currentMember.role.permissions && Array.isArray(currentMember.role.permissions) && 
        (currentMember.role.permissions.includes('admin') || 
         currentMember.role.permissions.includes('manage_family')));
    
    console.log(`User admin status: ${isAdminRole}`);
    return isAdminRole;
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
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-10 w-10 text-red-400" />
          </div>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Family</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={reloadFamilyData} variant="outline" className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => router.push('/family')} variant="default">
              Return to Dashboard
            </Button>
          </div>
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
          {/* {userIsAdmin && ( */}
            <>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button variant="outline" onClick={() => setIsUserLookupOpen(true)}>
                <Search className="h-4 w-4 mr-2" />
                Find User
              </Button>
              <Button variant="outline" onClick={() => setIsAssignTaskDialogOpen(true)}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/family/${family.id}/settings`)}>
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit Family
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Family
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          {/* // )} */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMembers}</div>
            <p className="text-sm text-gray-500">
              {totalMembers === 1 ? 'Person' : 'People'} in your family
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-sm text-gray-500">
              {completedTasks} completed, {pendingTasks} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</div>
            <Progress value={completionPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'members' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Family Members
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'tasks' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <ClipboardList className="h-4 w-4 inline-block mr-2" />
              Family Tasks
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'members' && (
            <div className="divide-y">
              {family.members.map((member) => (
                <div key={member.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={`https://avatar.vercel.sh/${member.username || 'user'}`} />
                      <AvatarFallback>{((member.username || member.name || 'UN')?.slice(0, 2)).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.username || member.name || 'Unknown User'}</h3>
                        {member.role?.name?.toLowerCase() === 'admin' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.email || (member.user?.email) || 'No email available'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMemberToView(member)}
                    >
                      View Details
                    </Button>
                    
                    {userIsAdmin && member.role?.name.toLowerCase() !== 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
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
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <FamilyTaskList 
              familyId={family.id.toString()} 
              isAdmin={userIsAdmin} 
            />
          )}
        </div>
      </div>
      
      {/* Add your invite dialog, confirm dialog, and other dialogs here */}
      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        familyId={family.id.toString()}
        onSuccess={() => {
          reloadFamilyData();
          showToast('Invitation sent successfully!', 'success');
        }}
      />
      
      <UserLookupDialog
        isOpen={isUserLookupOpen}
        onClose={() => setIsUserLookupOpen(false)} 
        specificFamilyId={family.id.toString()}
        onInviteSuccess={() => {
          reloadFamilyData();
          showToast('User has been invited to the family!', 'success');
        }}
      />
      
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteFamily}
        title="Delete Family"
        description={`Are you sure you want to delete ${family.name}? This action cannot be undone and all family data will be permanently lost.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={`Are you sure you want to remove ${memberToRemove?.username || 'this member'} from your family? They will lose access to all family features.`}
        confirmText="Remove"
        cancelText="Cancel"
      />
      
      {memberToEdit && (
        <EditMemberDialog
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          member={memberToEdit}
          onSuccess={() => {
            reloadFamilyData();
          }}
        />
      )}
      
      {memberToView && (
        <MemberDetailDialog
          isOpen={!!memberToView}
          onClose={() => setMemberToView(null)}
          memberId={memberToView.id.toString()}
          familyId={family.id.toString()}
        />
      )}
      
      <AssignTaskDialog
        isOpen={isAssignTaskDialogOpen}
        onClose={() => setIsAssignTaskDialogOpen(false)}
        familyId={family.id.toString()}
        onSuccess={() => {
          reloadFamilyData();
          setActiveTab('tasks'); // Switch to tasks tab after assignment
          showToast('Task assigned successfully!', 'success');
        }}
      />
    </div>
  );
}