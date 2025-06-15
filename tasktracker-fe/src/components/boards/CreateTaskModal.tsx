'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskItemStatus, TaskPriority, CreateTaskItemDTO } from '../../lib/types/task';
import { CreateTaskModalProps } from '../../lib/types/board';
import { FamilyDTO, FamilyMemberDTO } from '../../lib/types/family-invitation';
import { taskService } from '../../lib/services/taskService';
import { familyInvitationService } from '../../lib/services/familyInvitationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';
import {
  CalendarIcon,
  Plus,
  X,
  Star,
  Target,
  Clock,
  Tag,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import { format } from 'date-fns';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskItemStatus),
  dueDate: z.date().optional(),
  points: z.number().min(0).max(1000).optional(),
  tags: z.array(z.string()).optional(),
  familyId: z.number().optional(),
  assignedToUserId: z.number().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  onTaskCreated,
  defaultStatus = TaskItemStatus.NotStarted,
  boardId,
  suggestedColumn
}) => {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [families, setFamilies] = useState<FamilyDTO[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      status: defaultStatus,
      points: 10,
      tags: [],
      familyId: undefined,
      assignedToUserId: undefined,
    },
  });

  // Load families when modal opens
  useEffect(() => {
    if (open) {
      loadFamilies();
    }
  }, [open]);

  const loadFamilies = async () => {
    try {
      setLoadingFamilies(true);
      const userFamilies = await familyInvitationService.getAllFamilies();
      setFamilies(userFamilies || []);
    } catch (error) {
      console.error('Failed to load families:', error);
      setFamilies([]);
    } finally {
      setLoadingFamilies(false);
    }
  };

  const loadFamilyMembers = async (familyId: number) => {
    try {
      setLoadingMembers(true);
      const members = await familyInvitationService.getFamilyMembers(familyId);
      setFamilyMembers(members || []);
    } catch (error) {
      console.error('Failed to load family members:', error);
      setFamilyMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleFamilyChange = (familyId: string) => {
    const numericFamilyId = familyId === "personal" ? undefined : Number(familyId);
    form.setValue('familyId', numericFamilyId);
    form.setValue('assignedToUserId', undefined); // Reset assignment when family changes
    
    if (numericFamilyId) {
      loadFamilyMembers(numericFamilyId);
    } else {
      setFamilyMembers([]);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Use suggestedColumn status if available, otherwise use defaultStatus
      const initialStatus = suggestedColumn?.status ?? defaultStatus;
      console.log('🎯 CreateTaskModal: Resetting form with status:', initialStatus, 'type:', typeof initialStatus, 'suggestedColumn:', suggestedColumn);
      console.log('🎯 CreateTaskModal: defaultStatus:', defaultStatus, 'type:', typeof defaultStatus);
      // Ensure we're using the numeric enum value, not string
      const numericStatus = typeof initialStatus === 'string' 
        ? TaskItemStatus[initialStatus as keyof typeof TaskItemStatus] 
        : initialStatus;
      console.log('🎯 Converted status:', numericStatus, 'type:', typeof numericStatus);
      
      form.reset({
        title: '',
        description: '',
        priority: TaskPriority.Medium,
        status: numericStatus,
        points: 10,
        tags: [],
        familyId: undefined,
        assignedToUserId: undefined,
      });
      setTagInput('');
      setFamilyMembers([]); // Reset family members when modal opens
      
      // Force the form to update the status field with proper enum value
      setTimeout(() => {
        // Ensure we're setting the numeric enum value, not string
        const numericStatus = typeof initialStatus === 'string' 
          ? TaskItemStatus[initialStatus as keyof typeof TaskItemStatus] 
          : initialStatus;
        console.log('🎯 Setting numeric status:', numericStatus, 'from:', initialStatus);
        form.setValue('status', numericStatus);
      }, 0);
    }
  }, [open, defaultStatus, suggestedColumn, form]);

  const handleSubmit = async (data: CreateTaskFormData) => {
    try {
      setLoading(true);

      const createTaskDto: CreateTaskItemDTO = {
        title: data.title,
        description: data.description || '',
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate?.toISOString(),
        points: data.points || 0,
        tags: data.tags || [],
        boardId: boardId,
        // Add family-related fields if family is selected
        ...(data.familyId && {
          familyId: data.familyId,
          ...(data.assignedToUserId && { assignedToUserId: data.assignedToUserId })
        })
      };

      await taskService.createTask(createTaskDto);
      
      // Create more descriptive success message based on family/assignment
      let successMessage = '🎯 Quest created successfully!';
      let description = `"${data.title}" has been added to your board`;
      
      if (data.familyId) {
        const selectedFamily = families.find(f => f.id === data.familyId);
        if (data.assignedToUserId) {
          const assignedMember = familyMembers.find(m => m.user?.id === data.assignedToUserId);
          description = `"${data.title}" has been assigned to ${assignedMember?.user?.username || 'family member'} in ${selectedFamily?.name || 'family'}`;
          successMessage = '🏠 Family Quest assigned successfully!';
        } else {
          description = `"${data.title}" has been added as a family quest for ${selectedFamily?.name || 'family'}`;
          successMessage = '🏠 Family Quest created successfully!';
        }
      }
      
      toast.success(successMessage, { description });

      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.getValues('tags')?.includes(tag)) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const watchedTags = form.watch('tags') || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-transparent bg-clip-padding shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 via-blue-200/50 to-indigo-200/50 dark:from-purple-700/50 dark:via-blue-700/50 dark:to-indigo-700/50 rounded-lg -z-10"></div>
        
        <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 -m-6 mb-4 rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-cyan-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <DialogTitle className="flex items-center space-x-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg">
                <Target className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                ✨ Create New Quest
              </span>
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-lg mt-2 font-medium">
              🚀 Forge a new epic quest! Fill in the details and assign it to the appropriate column to begin your adventure.
              {suggestedColumn && (
                <div className="mt-2 text-sm bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                  📍 <strong>Suggested Column:</strong> {suggestedColumn.alias || suggestedColumn.name}
                  {suggestedColumn.description && (
                    <div className="text-xs mt-1 opacity-90">{suggestedColumn.description}</div>
                  )}
                </div>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>⚡ Quest Title</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your epic quest title..."
                      className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-700 dark:text-purple-300 font-semibold">📝 Quest Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your epic quest adventure and objectives..."
                      className="min-h-[80px] resize-none border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-700 dark:text-purple-300 font-semibold">🔥 Quest Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                              <FormControl>
                          <SelectTrigger className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80">
                            <SelectValue placeholder="Select quest priority" />
                          </SelectTrigger>
                        </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskPriority.Low}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Low</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskPriority.Medium}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskPriority.High}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span>High</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  console.log('🎯 Status field value:', field.value, 'type:', typeof field.value);
                  console.log('🎯 TaskItemStatus.NotStarted:', TaskItemStatus.NotStarted, 'toString():', TaskItemStatus.NotStarted.toString());
                  return (
                  <FormItem>
                    <FormLabel className="text-purple-700 dark:text-purple-300 font-semibold">
                      🎯 Quest Status
                      {suggestedColumn && (
                        <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                          (Suggested: {suggestedColumn.alias || suggestedColumn.name})
                        </span>
                      )}
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value) as TaskItemStatus)} 
                      value={field.value?.toString()}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80">
                          <SelectValue 
                            placeholder={
                              suggestedColumn 
                                ? `📋 ${suggestedColumn.alias || suggestedColumn.name}` 
                                : "Select quest status"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskItemStatus.NotStarted.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span>📋 {suggestedColumn?.status === TaskItemStatus.NotStarted ? (suggestedColumn.alias || 'To Do') : 'To Do'}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskItemStatus.InProgress.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>⚡ {suggestedColumn?.status === TaskItemStatus.InProgress ? (suggestedColumn.alias || 'In Progress') : 'In Progress'}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskItemStatus.Pending.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span>⏸️ {suggestedColumn?.status === TaskItemStatus.Pending ? (suggestedColumn.alias || 'Pending') : 'Pending'}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskItemStatus.OnHold.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span>⏸️ On Hold</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskItemStatus.Completed.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>🏆 {suggestedColumn?.status === TaskItemStatus.Completed ? (suggestedColumn.alias || 'Completed') : 'Completed'}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                  );
                }}
              />
            </div>

            {/* Family and Assignment Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="familyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                      🏠 Quest Family
                    </FormLabel>
                    <Select
                      onValueChange={handleFamilyChange}
                      value={field.value ? field.value.toString() : "personal"}
                      disabled={loadingFamilies}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80">
                          <SelectValue placeholder={loadingFamilies ? "Loading families..." : "Select family"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>👤 Personal Quest</span>
                          </div>
                        </SelectItem>
                        {families.map((family) => (
                          <SelectItem key={family.id} value={family.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span>🏠 {family.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Family Member Assignment - Only show if family is selected */}
              {form.watch('familyId') && (
                <FormField
                  control={form.control}
                  name="assignedToUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                        👥 Assign To
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "unassigned" ? undefined : Number(value))}
                        value={field.value ? field.value.toString() : "unassigned"}
                        disabled={loadingMembers}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80">
                            <SelectValue placeholder={loadingMembers ? "Loading members..." : "Select family member"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-500" />
                              <span>🎯 Anyone (Unassigned)</span>
                            </div>
                          </SelectItem>
                          {familyMembers.map((member) => (
                            <SelectItem key={member.id} value={member.user?.id?.toString() || member.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span>👤 {member.user?.username || member.user?.firstName || 'Family Member'}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Due Date and Points Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>⏰ Quest Deadline</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full pl-3 text-left font-normal border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>⭐ Quest Points</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="10"
                        className="h-12 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold">
                    <Tag className="h-4 w-4 text-cyan-500" />
                    <span>🏷️ Quest Tags</span>
                  </FormLabel>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a quest tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 h-10 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-gray-800/80"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim()}
                        className="h-10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

                          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-purple-200 dark:border-purple-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  ❌ Cancel Quest
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold shadow-lg shadow-emerald-500/25 border-0"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      🔮 Forging Quest...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      ✨ Create Epic Quest
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 