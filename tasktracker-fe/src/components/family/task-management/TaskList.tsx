'use client';

import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TimeProgressBar } from '@/components/ui/TimeProgressBar';
import { AssigneeList } from '@/components/ui/AssigneeList';
import {
  Calendar,
  Target,
  Circle
} from 'lucide-react';
import { FamilyTaskItemDTO } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';

interface TaskListProps {
  filteredTasks: FamilyTaskItemDTO[];
  isBatchMode: boolean;
  selectedTasks: Set<number>;
  familyMembers: FamilyMemberDTO[];
  onSelectTask: (taskId: number, checked: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getMemberAvatar: (memberId: number) => FamilyMemberDTO | undefined;
  formatTaskTitle: (title: string) => string;
}

/**
 * Task List Component - OVERFLOW SAFE
 * 
 * OVERFLOW FIXES APPLIED:
 * - CardContent: p-3 sm:p-4 md:p-6 (responsive padding)
 * - Task items: max-w-full overflow-hidden
 * - Text elements: truncate classes
 * - Flex layouts: min-w-0 and proper flex properties
 * - Responsive spacing: gap-2 sm:gap-3
 * - Mobile-first design: text-xs sm:text-sm
 * 
 * iPhone 12 Pro (390px) safe: All elements properly contained
 */
export default function TaskList({
  filteredTasks,
  isBatchMode,
  selectedTasks,
  onSelectTask,
  getPriorityColor,
  getPriorityIcon,
  getMemberAvatar,
  formatTaskTitle
}: TaskListProps) {
  return (
    <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 max-w-full overflow-hidden">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => {
          const assignedMember = task.assignedToFamilyMemberId ? getMemberAvatar(task.assignedToFamilyMemberId) : null;
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

          return (
            <div
              key={task.id}
              className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors max-w-full overflow-hidden ${!isBatchMode ? 'cursor-pointer' : ''
                } ${selectedTasks.has(task.id) ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
              onClick={() => !isBatchMode && (window.location.href = `/tasks/${task.id}`)}
            >
              {/* Checkbox for batch mode */}
              {isBatchMode && (
                <Checkbox
                  checked={selectedTasks.has(task.id)}
                  onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 mt-1"
                />
              )}

              <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                {/* Task Header */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}></div>
                  <h3 className={`font-medium text-xs sm:text-sm truncate flex-1 min-w-0 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                    {formatTaskTitle(task.title)}
                  </h3>
                  {isOverdue && <Badge variant="destructive" className="text-xs flex-shrink-0">Overdue</Badge>}
                </div>

                {/* Time Progress Bar - Hidden in Batch Mode */}
                {!isBatchMode && task.dueDate && !task.isCompleted && (
                  <div className="w-full max-w-full overflow-hidden">
                    <TimeProgressBar
                      dueDate={task.dueDate}
                      isCompleted={task.isCompleted}
                    />
                  </div>
                )}

                {/* Task Metadata */}
                {isBatchMode ? (
                  /* Batch Mode: Minimal Info */
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 min-w-0">
                    <span className="truncate">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    {task.pointsValue && (
                      <span className="text-purple-600 font-medium flex-shrink-0">⭐ {task.pointsValue}</span>
                    )}
                  </div>
                ) : (
                  /* Normal Mode: Full metadata */
                  <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 min-w-0 flex-wrap">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getPriorityIcon(task.priority)}
                      <span className="truncate">{task.priority}</span>
                    </div>
                    
                                         {task.pointsValue && (
                       <div className="flex items-center gap-1 flex-shrink-0">
                         <span className="text-purple-600 font-medium">⭐ {task.pointsValue}</span>
                       </div>
                     )}
                  </div>
                )}
              </div>

                             {/* Assignee Display */}
               <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                 {assignedMember ? (
                   <AssigneeList
                     assignees={[{
                       id: assignedMember.id,
                       name: assignedMember.user?.firstName || assignedMember.user?.username || 'Member',
                       isCreator: false
                     }]}
                     maxDisplay={1}
                     size="sm"
                     className="flex-shrink-0"
                   />
                 ) : (
                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                     <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                   </div>
                 )}
               </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-base sm:text-lg font-medium mb-2">No family tasks found</h3>
          <p className="text-xs sm:text-sm max-w-md mx-auto">
            {isBatchMode 
              ? "No tasks match your search criteria. Try adjusting your search terms."
              : "Create your first family task to get started with collaborative task management!"
            }
          </p>
        </div>
      )}
    </CardContent>
  );
} 