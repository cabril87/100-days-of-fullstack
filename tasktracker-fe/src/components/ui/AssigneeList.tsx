import React from 'react';
import { User, Users, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Assignee {
  id: number;
  name: string;
  email?: string;
  isCreator?: boolean;
}

interface AssigneeListProps {
  assignees: Assignee[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AssigneeList({ 
  assignees, 
  maxDisplay = 3, 
  size = 'md',
  className = '' 
}: AssigneeListProps) {
  if (!assignees || assignees.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 ${className}`}>
        <User className="h-4 w-4" />
        <span className="text-sm">Unassigned</span>
      </div>
    );
  }

  const displayedAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = assignees.length - maxDisplay;

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: 'w-6 h-6 text-xs',
      text: 'text-xs',
      gap: 'gap-1',
      padding: 'px-2 py-1'
    },
    md: {
      avatar: 'w-8 h-8 text-sm',
      text: 'text-sm',
      gap: 'gap-2',
      padding: 'px-3 py-1'
    },
    lg: {
      avatar: 'w-10 h-10 text-base',
      text: 'text-base',
      gap: 'gap-3',
      padding: 'px-4 py-2'
    }
  };

  const config = sizeConfig[size];

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      {/* Icon */}
      {assignees.length === 1 ? (
        <User className={`h-4 w-4 text-purple-600 dark:text-purple-400`} />
      ) : (
        <Users className={`h-4 w-4 text-purple-600 dark:text-purple-400`} />
      )}

      {/* Assignee Avatars */}
      <div className="flex -space-x-1">
        {displayedAssignees.map((assignee, index) => (
          <div
            key={assignee.id}
            className={`
              ${config.avatar} 
              ${getAvatarColor(assignee.name)}
              rounded-full 
              flex 
              items-center 
              justify-center 
              text-white 
              font-medium 
              border-2 
              border-white 
              dark:border-gray-800
              relative
              shadow-sm
              z-${10 - index}
            `}
            title={assignee.name}
          >
            {getInitials(assignee.name)}
            {assignee.isCreator && (
              <div 
                className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 bg-white dark:bg-gray-800 rounded-full p-0.5" 
                title="Task Creator"
              >
                <Crown className="h-full w-full" />
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className={`
            ${config.avatar}
            bg-gray-100 
            dark:bg-gray-700 
            rounded-full 
            flex 
            items-center 
            justify-center 
            text-gray-600 
            dark:text-gray-300 
            font-medium 
            border-2 
            border-white 
            dark:border-gray-800
            shadow-sm
          `}>
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Names */}
      <div className="flex flex-col min-w-0">
        <div className={`font-medium text-gray-900 dark:text-white ${config.text} truncate`}>
          {assignees.length === 1 ? (
            <span>
              {assignees[0].name}
              {assignees[0].isCreator && (
                <Crown className="inline h-3 w-3 ml-1 text-yellow-500" />
              )}
            </span>
          ) : (
            `${assignees.length} people assigned`
          )}
        </div>
        
        {assignees.length > 1 && (
          <div className={`text-gray-500 dark:text-gray-400 ${config.text} truncate`}>
            {displayedAssignees.map(a => a.name).join(', ')}
            {remainingCount > 0 && ` and ${remainingCount} more`}
          </div>
        )}
      </div>

      {/* Assignment Type Badge */}
      {assignees.length > 1 && (
        <Badge 
          variant="outline" 
          className="text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:bg-purple-900/20"
        >
          Team Task
        </Badge>
      )}
    </div>
  );
} 
