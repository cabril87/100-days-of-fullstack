'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Family } from '@/lib/types/family';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface FamilyCardProps {
  family: Family;
}

export default function FamilyCard({ family }: FamilyCardProps) {
  const router = useRouter();

  const handleClick = () => {
    console.log(`Navigating to family: ${family.id}`);
    // Ensure ID is a string and navigate to the correct route
    router.push(`/family/${family.id}`);
  };

  // Calculate task completion
  const completedTasks = family.members.reduce((sum, m) => sum + (m.completedTasks || 0), 0);
  const totalTasks = family.members.reduce(
    (sum, m) => sum + ((m.completedTasks || 0) + (m.pendingTasks || 0)), 
    0
  );
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{family.name}</span>
          <span className="text-sm font-normal text-gray-500">
            {family.members.length} {family.members.length === 1 ? 'member' : 'members'}
          </span>
        </CardTitle>
        <CardDescription>
          Created {formatDistanceToNow(new Date(family.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
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
                {member.username.slice(0, 2).toUpperCase()}
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
      <CardFooter className="bg-primary/5 flex justify-end pt-2">
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}