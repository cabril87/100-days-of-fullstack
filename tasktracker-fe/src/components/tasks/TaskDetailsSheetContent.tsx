'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Star,
  Trophy,
  Calendar,
  Flag,
  User,
  Save,
  Edit
} from 'lucide-react';
import { Task } from '@/lib/types/task';
import { TaskDetailsSheetContentProps } from '@/lib/types/component-props';

export default function TaskDetailsSheetContent({ 
  task, 
  isEditing, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onClose,
  familyMembers 
}: TaskDetailsSheetContentProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = () => {
    onSaveEdit(editedTask);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format for datetime-local input
  };

  if (isEditing) {
    return (
      <div className="space-y-8 px-4">
        {/* Enterprise Header with XP Preview */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quest Configuration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your epic adventure</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <Star className="h-4 w-4" />
              <span className="font-bold">{editedTask.pointsValue || 10} XP</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Quest Title
            </label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-medium border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
              placeholder="Enter your epic quest title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Quest Description
            </label>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 resize-none"
              placeholder="Describe the epic adventure that awaits..."
            />
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Flag className="h-3 w-3 text-red-500" />
                Quest Priority
              </label>
              <Select
                value={editedTask.priority || 'Medium'}
                onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Urgent') => 
                  setEditedTask(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low Priority</SelectItem>
                  <SelectItem value="Medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="High">🟠 High Priority</SelectItem>
                  <SelectItem value="Urgent">🔴 Urgent Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="h-3 w-3 text-blue-500" />
                Quest Deadline
              </label>
              <Input
                type="datetime-local"
                value={formatDate(editedTask.dueDate)}
                onChange={(e) => setEditedTask(prev => ({ 
                  ...prev, 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
              />
            </div>
          </div>

          {/* Gamification Rewards Section */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quest Rewards</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure XP and time investment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Star className="h-3 w-3 text-amber-500" />
                  Experience Points
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={editedTask.pointsValue || 10}
                    onChange={(e) => setEditedTask(prev => ({ 
                      ...prev, 
                      pointsValue: parseInt(e.target.value) || 10 
                    }))}
                    className="border-2 border-amber-200 dark:border-amber-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 pl-8"
                  />
                  <Star className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Activity className="h-3 w-3 text-green-500" />
                  Time Investment
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    value={editedTask.estimatedTimeMinutes || 30}
                    onChange={(e) => setEditedTask(prev => ({ 
                      ...prev, 
                      estimatedTimeMinutes: parseInt(e.target.value) || 30 
                    }))}
                    className="border-2 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 pl-8"
                  />
                  <Activity className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-green-500" />
                </div>
                <p className="text-xs text-gray-500">Minutes required to complete</p>
              </div>
            </div>
          </div>

          {/* Enhanced Family & Team Assignment */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quest Assignment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure family and member assignment</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Family Context Display */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Quest Context
                </label>
                <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white/50 dark:bg-gray-800/50">
                  {editedTask.familyId ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            🏠 Family Quest
                          </span>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                            {familyMembers.find(m => m.familyId === editedTask.familyId)?.family?.name || 'Family Task'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Shared with {familyMembers.filter(m => m.familyId === editedTask.familyId).length} family members
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            👤 Personal Quest
                          </span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                            Individual
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Private quest for personal achievement
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Assignee Selection */}
              {familyMembers && familyMembers.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Quest Assignee
                  </label>
                  <Select
                    value={editedTask.assignedToUserId?.toString() || 'unassigned'}
                    onValueChange={(value) => setEditedTask(prev => ({ 
                      ...prev, 
                      assignedToUserId: value === 'unassigned' ? undefined : parseInt(value)
                    }))}
                  >
                    <SelectTrigger className="h-14 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200">
                      <SelectValue>
                        {(() => {
                          const assignee = familyMembers.find(member => member.userId === editedTask.assignedToUserId);
                          if (!assignee) {
                            return (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold text-gray-500">🎯 Unassigned</div>
                                  <div className="text-xs text-gray-400">No one assigned to this quest</div>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">
                                  👤 {assignee.user.firstName || assignee.user.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {assignee.family?.name ? `🏠 ${assignee.family.name}` : 'Personal Assignment'}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-3 py-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-500">🎯 Unassigned</div>
                            <div className="text-xs text-gray-400">No one assigned</div>
                          </div>
                        </div>
                      </SelectItem>
                      {familyMembers.filter(member => member.userId).map(member => (
                        <SelectItem key={member.userId} value={member.userId!.toString()}>
                          <div className="flex items-center gap-3 py-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                👤 {member.user.firstName || member.user.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {member.family?.name ? `🏠 ${member.family.name} Member` : 'Individual User'}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enterprise Action Buttons */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Quest Configuration
            </Button>
            <Button
              variant="outline"
              onClick={onCancelEdit}
              className="px-8 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode (existing task details display)
  return (
    <div className="space-y-8 ">
      {/* Enterprise Quest Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Epic Quest</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {task.title}
                </h3>
              </div>
            </div>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg ml-6 transform hover:scale-105 transition-transform duration-200">
            <Star className="h-6 w-6" />
            <div className="text-center">
              <div className="text-2xl font-bold">{task.pointsValue || 10}</div>
              <div className="text-xs font-medium opacity-90">XP REWARD</div>
            </div>
          </div>
        </div>

        {/* Quest Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md ${
            task.isCompleted 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
          }`}>
            {task.isCompleted ? (
              <Trophy className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {task.isCompleted ? 'QUEST COMPLETED' : 'QUEST IN PROGRESS'}
            </span>
          </div>
        </div>
      </div>

      {/* Quest Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border border-red-200/50 dark:border-red-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md">
                <Flag className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quest Priority</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-md ${
              task.priority === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
              task.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
              task.priority === 'Urgent' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' :
              'bg-gradient-to-r from-green-500 to-green-600 text-white'
            }`}>
              {task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : task.priority === 'Urgent' ? '🚨' : '🟢'}
              {task.priority || 'Medium'} Priority
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quest Deadline</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {task.dueDate ? (
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <span>⏰</span>
                  No deadline set
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200/50 dark:border-green-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quest Assignment</span>
            </div>
            <div className="space-y-3">
              {/* Family Context */}
              <div className="flex items-center gap-2 text-sm">
                {task.familyId ? (
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                    <span>🏠</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {familyMembers.find(m => m.familyId === task.familyId)?.family?.name || 'Family Quest'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                    <span>👤</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">Personal Quest</span>
                  </div>
                )}
              </div>
              
              {/* Assignee */}
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {task.assignedToUserName ? (
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>{task.assignedToUserName}</span>
                    {task.familyId && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Family Member)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>🎯</span>
                    Unassigned
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border border-purple-200/50 dark:border-purple-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Time Investment</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                {task.estimatedTimeMinutes || 30} minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Gamification Dashboard */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-8 rounded-2xl border border-amber-200/50 dark:border-amber-700/50 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-xl shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quest Metrics Dashboard</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your epic progress and rewards</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800/30 dark:to-orange-800/30 p-6 rounded-xl shadow-md border border-amber-300/50 dark:border-amber-600/50 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                <Star className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded-full">POTENTIAL</span>
            </div>
            <div className="text-4xl font-bold text-amber-700 dark:text-amber-300 mb-1">
              {task.pointsValue || 10}
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold">XP Reward Value</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800/30 dark:to-green-800/30 p-6 rounded-xl shadow-md border border-emerald-300/50 dark:border-emerald-600/50 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-200 dark:bg-emerald-800 px-2 py-1 rounded-full">
                {task.isCompleted ? 'EARNED' : 'PENDING'}
              </span>
            </div>
            <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              {task.isCompleted ? task.pointsValue || 10 : 0}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">XP Points Earned</div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/30 dark:to-indigo-800/30 p-6 rounded-xl shadow-md border border-blue-300/50 dark:border-blue-600/50 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">ESTIMATE</span>
            </div>
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-1">
              {task.estimatedTimeMinutes || 30}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Minutes Required</div>
          </div>
        </div>

        {/* Progress Indicator */}
        {task.isCompleted && (
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-3 text-white">
              <Trophy className="h-6 w-6" />
              <span className="text-lg font-bold">🎉 QUEST COMPLETED! REWARDS CLAIMED! 🎉</span>
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>

      {/* Enterprise Action Buttons */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <Button
            onClick={onStartEdit}
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
          >
            <Edit className="h-5 w-5 mr-2" />
            Modify Quest Configuration
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
            size="lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 