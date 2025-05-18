'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Family } from '@/lib/types/family';
import { Users, CheckCircle, Clock } from 'lucide-react';

interface FamilyStatsProps {
  family: Family;
}

export default function FamilyStats({ family }: FamilyStatsProps) {
  // Calculate stats
  const totalMembers = family.members.length;
  
  // Calculate total completed and pending tasks
  const completedTasks = family.members.reduce((sum, member) => sum + (member.completedTasks || 0), 0);
  const pendingTasks = family.members.reduce((sum, member) => sum + (member.pendingTasks || 0), 0);
  
  // Calculate active members (members who have completed at least one task)
  const activeMembers = family.members.filter(member => 
    (member.completedTasks && member.completedTasks > 0) || 
    (member.pendingTasks && member.pendingTasks > 0)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Family Members</p>
              <h3 className="text-2xl font-bold">{totalMembers}</h3>
              <p className="text-xs text-gray-500">
                {activeMembers} active {activeMembers === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <h3 className="text-2xl font-bold">{completedTasks}</h3>
              <p className="text-xs text-gray-500">
                Total tasks completed by family
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <h3 className="text-2xl font-bold">{pendingTasks}</h3>
              <p className="text-xs text-gray-500">
                Tasks awaiting completion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}