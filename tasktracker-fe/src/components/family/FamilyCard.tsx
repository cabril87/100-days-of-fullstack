'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Family } from '@/lib/types/family';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/hooks/useToast';

interface FamilyCardProps {
  family: Family;
  onRefresh?: () => void;
}

export default function FamilyCard({ family, onRefresh }: FamilyCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle visibility changes using IntersectionObserver
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Create an observer to detect when card becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Card is now visible
          const timeHidden = Date.now() - lastVisible;
          
          // If it was hidden for more than 2 seconds, refresh when visible again
          // This helps with stale data after page navigation
          if (timeHidden > 2000) {
            console.log(`FamilyCard ${family.id} visible after being hidden for ${timeHidden}ms, refreshing`);
            handleRefresh();
          }
          
          // Update last visible timestamp
          setLastVisible(Date.now());
        }
      });
    }, { threshold: 0.1 }); // Consider visible when 10% of card is in view
    
    // Start observing
    observer.observe(cardRef.current);
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [family.id, lastVisible]);
  
  // Handle card click
  const handleCardClick = () => {
    router.push(`/family/${family.id}`);
  };
  
  // Handle refresh click
  const handleRefresh = async (e?: React.MouseEvent) => {
    // Prevent event from bubbling up to the card click handler
    if (e) {
      e.stopPropagation();
    }
    
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      }
      showToast('Family refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing family:', error);
      showToast('Failed to refresh family', 'error');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(family.createdAt), { addSuffix: true });
  
  // Calculate completion progress
  const totalTasks = family.members?.reduce((sum, member) => 
    sum + (member.completedTasks || 0) + (member.pendingTasks || 0), 0) || 0;
  const completedTasks = family.members?.reduce((sum, member) => 
    sum + (member.completedTasks || 0), 0) || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
      ref={cardRef}
    >
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{family.name}</span>
          <span className="text-sm font-normal text-gray-500">
            {family.members.length} {family.members.length === 1 ? 'member' : 'members'}
          </span>
        </CardTitle>
        <CardDescription>
          Created {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600 mb-4 line-clamp-2">
          {family.description || 'No description provided'}
        </p>
        
        {/* Task Progress */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs">
            <span>Task Completion</span>
            <span>
              {completedTasks} / {totalTasks}
            </span>
          </div>
          <Progress className="h-2" value={progressPercentage} />
        </div>
        
        <div className="flex -space-x-2 overflow-hidden">
          {family.members.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="border-2 border-white h-8 w-8">
              <AvatarImage src={`https://avatar.vercel.sh/${member.username}`} />
              <AvatarFallback className="text-xs">
                {member.username?.slice(0, 2)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          ))}
          {family.members.length > 5 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 border-2 border-white text-xs font-medium">
              +{family.members.length - 5}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-primary/5 flex justify-between pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Refresh
        </Button>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}