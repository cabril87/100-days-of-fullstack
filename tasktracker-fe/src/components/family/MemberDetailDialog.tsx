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
import { Loader2, CheckCircle, Clock, BarChart4, UserX } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { FamilyMember } from '@/lib/types/family';
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    if (isOpen && memberId) {
      loadMemberDetails();
    }
  }, [isOpen, memberId]);

  const loadMemberDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get member details
      const response = await familyService.getFamilyMemberDetails(memberId);
      
      if (response.data) {
        console.log("Member details received:", JSON.stringify(response.data, null, 2));
        setMember(response.data as FamilyMember);
        
        // For now, we'll use the member data to generate stats
        // In a real app, you might have a separate API endpoint for detailed stats
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
        <DialogContent>
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
        <DialogContent>
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
        <DialogContent>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View detailed statistics for this family member
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={`https://avatar.vercel.sh/${member.username || member.user?.username || 'user'}`} />
            <AvatarFallback>
              {(member.username || member.user?.username || 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold">{member.username || member.user?.username || 'User'}</h3>
          <p className="text-sm text-gray-500">{member.email || member.user?.email || 'No email available'}</p>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>Member since {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}</span>
          </div>
          <div className="mt-2 inline-flex bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
            {member.role?.name || member.relationship || 'Unknown'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <Card className="p-3 bg-green-50 border-green-100">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-2xl font-bold">{stats.completedTasks}</span>
              <span className="text-xs text-gray-500">Completed</span>
            </div>
          </Card>
          
          <Card className="p-3 bg-amber-50 border-amber-100">
            <div className="flex flex-col items-center">
              <Clock className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-2xl font-bold">{stats.pendingTasks}</span>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm font-medium">{stats.completionRate.toFixed(0)}%</span>
          </div>
          <Progress className="h-2" value={stats.completionRate} />
        </div>

        {stats.streak > 0 && (
          <div className="mt-4 bg-purple-50 p-3 rounded-md flex items-center">
            <BarChart4 className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <span className="text-sm font-medium text-purple-700">{stats.streak} day streak!</span>
              <p className="text-xs text-purple-600">Consistent task completion</p>
            </div>
          </div>
        )}

        {member.lastActivityDate && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Last activity: {formatDistanceToNow(new Date(member.lastActivityDate), { addSuffix: true })}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 