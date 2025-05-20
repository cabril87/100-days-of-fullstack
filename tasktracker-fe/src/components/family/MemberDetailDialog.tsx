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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, CheckCircle, Clock, BarChart4, UserX, 
  UserCog, Star, Calendar, Award, Activity, AlertCircle
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { FamilyMember } from '@/lib/types/family';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MemberStats {
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  lastActivity?: string;
  assignedTasks: number;
  streak: number;
}

interface MemberDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  familyId: string;
}

export default function MemberDetailDialog({
  isOpen,
  onClose,
  memberId,
  familyId
}: MemberDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isCreator, setIsCreator] = useState(false);
  const [familyDetails, setFamilyDetails] = useState<any>(null);

  useEffect(() => {
    if (isOpen && memberId) {
      loadMemberDetails();
      loadFamilyDetails();
    }
  }, [isOpen, memberId]);

  const loadFamilyDetails = async () => {
    try {
      const response = await familyService.getFamily(familyId);
      if (response.data) {
        setFamilyDetails(response.data);
        
        // Check if this member is the creator of the family
        // Look for owner/creator info in various possible fields
        const familyData = response.data;
        
        // Convert memberId to string to ensure consistent comparison
        const memberIdStr = memberId.toString();
        
        // Check if we can identify the creator from the family data
        if (familyData.members && familyData.members.length > 0) {
          // Look for admin or creator role in members
          const adminMember = familyData.members.find(m => 
            m.role?.name?.toLowerCase() === 'admin' || 
            m.role?.name?.toLowerCase() === 'creator' || 
            m.role?.name?.toLowerCase() === 'owner'
          );
          
          if (adminMember && adminMember.id.toString() === memberIdStr) {
            setIsCreator(true);
          }
          
          // If this is the first member (index 0), they might be the creator
          if (familyData.members[0].id.toString() === memberIdStr) {
            setIsCreator(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading family details:', error);
    }
  };

  const loadMemberDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await familyService.getFamilyMemberDetails(memberId);
      
      if (response.data) {
        setMember(response.data as FamilyMember);
        
        const statsData: MemberStats = {
          completedTasks: response.data.completedTasks || 0,
          pendingTasks: response.data.pendingTasks || 0,
          completionRate: calculateCompletionRate(response.data.completedTasks || 0, response.data.pendingTasks || 0),
          lastActivity: response.data.lastActivityDate,
          assignedTasks: (response.data.completedTasks || 0) + (response.data.pendingTasks || 0),
          streak: response.data.streak || 0
        };
        
        setStats(statsData);
      } else {
        setError(response.error || 'Failed to load member details');
        showToast(response.error || 'Failed to load member details', 'error');
      }
    } catch (error) {
      console.error('Error loading member details:', error);
      setError('Error loading member details');
      showToast('Error loading member details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = (completed: number, pending: number): number => {
    const total = completed + pending;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Member Details</DialogTitle>
            <DialogDescription>
              Please wait while we load the member details...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error Loading Member</DialogTitle>
            <DialogDescription>
              {error.includes('not found') ? 
                'This member may have been removed or you don\'t have access.' : 
                'There was a problem loading the member details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-6">
            <div className="text-center">
              <UserX className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!member || !stats) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Member Not Found</DialogTitle>
            <DialogDescription>
              The requested member details could not be found.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-6">
            <div className="text-center">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground">The member may have been removed from this family.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span>Member Profile</span>
            {member.role?.name?.toLowerCase() === 'admin' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Star className="h-3 w-3 mr-1" /> Admin
              </span>
            )}
            {isCreator && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" /> Creator
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this family member
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="flex flex-col">
            {isCreator && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  This member is the creator of the family and cannot be removed or have their role changed.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50 p-6 rounded-lg mb-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={`https://avatar.vercel.sh/${member.username || member.user?.username || 'user'}`} />
                <AvatarFallback className="text-xl">
              {(member.username || member.user?.username || 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold">{member.username || member.user?.username || member.name || 'User'}</h3>
                <p className="text-muted-foreground">{member.email || member.user?.email || 'No email available'}</p>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <div className="inline-flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                  </div>
                  
                  {member.lastActivityDate && (
                    <div className="inline-flex items-center text-sm text-slate-600">
                      <Activity className="h-4 w-4 mr-1" />
                      Active {formatDistanceToNow(new Date(member.lastActivityDate), { addSuffix: true })}
                    </div>
                  )}
          </div>
          </div>
        </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'details')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <div className="flex flex-col items-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                      <span className="text-3xl font-bold">{stats.completedTasks}</span>
                      <span className="text-sm text-green-700">Completed Tasks</span>
            </div>
          </Card>
          
                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
            <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-amber-500 mb-2" />
                      <span className="text-3xl font-bold">{stats.pendingTasks}</span>
                      <span className="text-sm text-amber-700">Pending Tasks</span>
            </div>
          </Card>
        </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Task Completion Rate</span>
                    <span className="font-medium">{stats.completionRate.toFixed(0)}%</span>
          </div>
                  <Progress 
                    className="h-3 rounded-full" 
                    value={stats.completionRate} 
                    style={{
                      background: 'linear-gradient(to right, rgb(229, 231, 235), rgb(209, 213, 219))'
                    }}
                  />
        </div>

        {stats.streak > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
            <div>
                      <span className="text-lg font-medium text-purple-700">{stats.streak} day streak!</span>
                      <p className="text-sm text-purple-600">Consistently completing tasks</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{member.username || member.user?.username || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{member.email || member.user?.email || 'Not available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium">{member.role?.name || 'Member'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Relationship:</span>
                      <span className="font-medium">{member.relationship || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                
                {member.user && (
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">User Account Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-medium">{member.user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-medium">{member.user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{member.user.email}</span>
                      </div>
            </div>
          </div>
        )}

                <div className="text-xs text-gray-400 pt-2">
                  <div>Member ID: {memberId}</div>
                  <div>Family ID: {familyId}</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <Separator className="my-2" />
        
        <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {member?.user && !isCreator && (
            <Button 
              variant="outline"
              onClick={() => {
                if (member.user) {
                  familyService.updateFamilyMember(
                    memberId, 
                    {
                      name: member.user.username || member.user.displayName,
                      email: member.user.email,
                      role: member.role?.name || 'Member'
                    }
                  )
                  .then(() => {
                    showToast('Member data updated successfully', 'success');
                    familyService.syncFamilyState(familyId, 'member update');
                    onClose();
                    window.location.reload();
                  })
                  .catch(err => {
                    console.error("Error updating member:", err);
                    showToast('Failed to update member data', 'error');
                  });
                }
              }}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Fix Data
            </Button>
          )}
          
          {!isCreator ? (
            <Button 
              variant="destructive"
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove ${member.username || 'this member'}?`)) {
                  Promise.all([
                    familyService.deleteFamilyMember(memberId),
                    familyService.removeMember(familyId, memberId),
                    familyService.syncFamilyState(familyId, 'member removal')
                  ])
                  .then(() => {
                    showToast('Member removed successfully', 'success');
                    onClose();
                    window.location.reload();
                  })
                  .catch(err => {
                    console.error("Error removing member:", err);
                    showToast('Failed to remove member', 'error');
                  });
                }
              }}
            >
              <UserX className="h-4 w-4 mr-2" />
              Remove
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="opacity-50 cursor-not-allowed"
              title="Family creators cannot be removed"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Cannot Remove Creator
            </Button>
          )}
          
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 