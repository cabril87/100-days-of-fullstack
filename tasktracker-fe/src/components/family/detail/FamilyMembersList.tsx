'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Crown, Shield } from 'lucide-react';
import { FamilyMemberDTO } from '@/lib/types/family';

interface FamilyMembersListProps {
  familyMembers: FamilyMemberDTO[];
  familyName: string;
}

/**
 * Family Members List Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Card with CardHeader and CardContent
 * - Member items with flex layout and min-w-0
 * - Avatar: w-10 h-10 (40px) with gradient background
 * - Text with truncate classes
 * - Badges with responsive padding
 * - Responsive spacing and gaps
 * 
 * Total estimated width: Full width with overflow protection
 */
export default function FamilyMembersList({ familyMembers, familyName }: FamilyMembersListProps) {
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent':
        return <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />;
      case 'child':
        return <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
      default:
        return <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent':
        return 'bg-amber-100 text-amber-800';
      case 'child':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">
            Family Members ({Array.isArray(familyMembers) ? familyMembers.length : 0})
          </span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          All members of the {familyName} family
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 max-w-full overflow-hidden">
        {!Array.isArray(familyMembers) || familyMembers.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No family members found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 sm:p-4 border rounded-lg min-w-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="bg-gradient-to-br from-purple-500 to-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm sm:text-lg">
                      {String(member.user?.firstName || member.user?.username || member.role?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {String(member.user?.displayName || member.user?.firstName || member.user?.username || `${member.role?.name || 'Member'} User`)}
                      </p>
                      <div className="flex-shrink-0">
                        {getRoleIcon(member.role?.name || 'user')}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                      {String(member.user?.email || `Role: ${member.role?.name || 'Member'}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                  <Badge className={`${getRoleBadgeColor(member.role?.name || 'member')} font-semibold text-xs`}>
                    {member.role?.name || 'Member'}
                  </Badge>
                  {member.joinedAt && (
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 

