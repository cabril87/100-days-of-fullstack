'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar, Clock, Star, Users, Tag, Zap, Trophy, Target, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { taskService } from '@/lib/services/taskService';
import { CreateTaskDTO, CreateTaskFormData, TaskCreationModalProps } from '@/lib/types/task';
import { createTaskSchema } from '@/lib/schemas/task';

export default function TaskCreationModal({ user, family, onTaskCreated, trigger, isOpen: externalIsOpen, onOpenChange }: TaskCreationModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      estimatedTimeMinutes: 30,
      pointsValue: 10,
      familyId: family?.id,
      tags: []
    }
  });

  const watchedTags = form.watch('tags') || [];
  const watchedPoints = form.watch('pointsValue') || 10;
  const watchedPriority = form.watch('priority') || 'Medium';

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()];
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', newTags);
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true);

      const taskData: CreateTaskDTO = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
        categoryId: data.categoryId || undefined,
        estimatedTimeMinutes: data.estimatedTimeMinutes || undefined,
        pointsValue: data.pointsValue || 10,
        familyId: data.familyId || undefined,
        assignedToUserId: data.assignedToUserId || undefined,
        tags: data.tags && data.tags.length > 0 ? data.tags : undefined
      };

      const createdTask = await taskService.createTask(taskData);
      
      // Call success callback
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }

      // Reset form and close modal
      form.reset();
      setIsOpen(false);
      setTagInput('');

    } catch (error) {
      console.error('Failed to create task:', error);
      // Error handling could be enhanced with toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get priority styling
  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'from-red-500 via-orange-500 to-yellow-500';
      case 'High': return 'from-orange-500 via-amber-500 to-yellow-500';
      case 'Medium': return 'from-blue-500 via-purple-500 to-pink-500';
      case 'Low': return 'from-green-500 via-emerald-500 to-teal-500';
      default: return 'from-gray-500 via-slate-500 to-gray-600';
    }
  };

  // const getPriorityEmoji = (priority: string) => {
  //   switch (priority) {
  //     case 'Urgent': return '🔥';
  //     case 'High': return '⚡';
  //     case 'Medium': return '🎯';
  //     case 'Low': return '🌱';
  //     default: return '📋';
  //   }
  // };

  const getPointsTier = (points: number) => {
    if (points >= 100) return { tier: 'Legendary', emoji: '👑', color: 'from-yellow-400 to-orange-500' };
    if (points >= 50) return { tier: 'Epic', emoji: '💎', color: 'from-purple-500 to-pink-500' };
    if (points >= 25) return { tier: 'Rare', emoji: '🌟', color: 'from-blue-500 to-cyan-500' };
    if (points >= 10) return { tier: 'Common', emoji: '⭐', color: 'from-green-500 to-blue-500' };
    return { tier: 'Basic', emoji: '🔸', color: 'from-gray-400 to-gray-500' };
  };

  const pointsTier = getPointsTier(watchedPoints);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      {!trigger && externalIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="relative overflow-hidden group bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Create Task
              <Zap className="h-4 w-4" />
            </div>
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 border-2 border-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 dark:border-purple-700 shadow-2xl">
        {/* Header with Gamification Elements */}
        <DialogHeader className="relative space-y-3 sm:space-y-4">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-t-lg"></div>
          
          <DialogTitle className="relative flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full shadow-lg">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Create Epic Task</span>
              <span className="sm:hidden">Create Task</span>
            </span>
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-bounce" />
          </DialogTitle>
          
          <DialogDescription className="relative text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="hidden sm:inline">Create a new task to boost your productivity and earn awesome rewards!</span>
              <span className="sm:hidden">Create your task and earn rewards!</span>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 animate-pulse" />
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title with Enhanced Styling */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    Task Title *
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="🎯 What amazing task will you conquer?" 
                      {...field}
                      className="h-12 text-base sm:text-lg font-medium border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Description with Game-like Styling */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                    Quest Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="📝 Describe your epic quest in detail..."
                      className="min-h-[80px] sm:min-h-[100px] text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    ✨ Add context and instructions to make your quest crystal clear
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and Due Date with Enhanced Gamification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <div className={`w-3 h-3 bg-gradient-to-r ${getPriorityGradient(watchedPriority)} rounded-full animate-pulse`}></div>
                      Priority Level *
                    </FormLabel>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger className="h-12 text-base border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 transition-all duration-200 hover:border-orange-400 dark:hover:border-orange-600">
                           <SelectValue placeholder="🎯 Choose your challenge level" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 shadow-2xl rounded-lg max-h-60 overflow-y-auto">
                         <SelectItem value="Low" className="py-3 px-4 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center justify-between w-full gap-3">
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-md"></div>
                               <span className="font-medium text-gray-900 dark:text-gray-100">🌱 Low Priority</span>
                             </div>
                             <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600 text-xs">Chill</Badge>
                           </div>
                         </SelectItem>
                         <SelectItem value="Medium" className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center justify-between w-full gap-3">
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-md"></div>
                               <span className="font-medium text-gray-900 dark:text-gray-100">🎯 Medium Priority</span>
                             </div>
                             <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600 text-xs">Balanced</Badge>
                           </div>
                         </SelectItem>
                         <SelectItem value="High" className="py-3 px-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center justify-between w-full gap-3">
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-md"></div>
                               <span className="font-medium text-gray-900 dark:text-gray-100">⚡ High Priority</span>
                             </div>
                             <Badge className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 text-xs">Intense</Badge>
                           </div>
                         </SelectItem>
                         <SelectItem value="Urgent" className="py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center justify-between w-full gap-3">
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md animate-pulse"></div>
                               <span className="font-medium text-gray-900 dark:text-gray-100">🔥 Urgent Priority</span>
                             </div>
                             <Badge className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-800 dark:to-pink-800 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600 animate-pulse text-xs">CRITICAL</Badge>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Quest Deadline
                    </FormLabel>
                                         <FormControl>
                       <Input 
                         type="datetime-local"
                         className="h-12 text-base border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-600"
                         {...field}
                       />
                     </FormControl>
                    <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                      ⏰ Set a deadline to stay motivated!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time and Points with Epic Styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <FormField
                control={form.control}
                name="estimatedTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                      Quest Duration
                    </FormLabel>
                                         <FormControl>
                       <Input 
                         type="number"
                         min="1"
                         max="1440"
                         placeholder="30"
                         className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600"
                         {...field}
                         onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                       />
                     </FormControl>
                    <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                      ⚡ How long will this quest take? (minutes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                      Reward Points
                    </FormLabel>
                    <FormControl>
                                             <div className="relative">
                         <Input 
                           type="number"
                           min="1"
                           max="1000"
                           placeholder="10"
                           className="h-12 text-base border-2 border-yellow-200 dark:border-yellow-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20 pr-24 md:pr-28 transition-all duration-200 hover:border-yellow-400 dark:hover:border-yellow-600"
                           {...field}
                           onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                         />
                         <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                           <Badge className={`bg-gradient-to-r ${pointsTier.color} text-white font-bold px-2 py-1 text-xs whitespace-nowrap`}>
                             {pointsTier.emoji} {pointsTier.tier}
                           </Badge>
                         </div>
                       </div>
                    </FormControl>
                    <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                      🏆 Points you&apos;ll earn for conquering this quest!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Family Assignment with Game Styling */}
            {family && (
              <FormField
                control={form.control}
                name="assignedToUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      Quest Assignee
                    </FormLabel>
                                         <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                       <FormControl>
                         <SelectTrigger className="h-12 text-base border-2 border-cyan-200 dark:border-cyan-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 bg-gradient-to-r from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 transition-all duration-200 hover:border-cyan-400 dark:hover:border-cyan-600">
                           <SelectValue placeholder="👥 Assign this epic quest to..." />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-700 shadow-2xl rounded-lg">
                         <SelectItem value={user.id.toString()} className="py-3 px-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                               <span className="text-white text-xs font-bold">YOU</span>
                             </div>
                             <span className="font-medium text-gray-900 dark:text-gray-100">{user.displayName || user.firstName || user.username}</span>
                           </div>
                         </SelectItem>
                         {/* Family members would be loaded here */}
                       </SelectContent>
                     </Select>
                    <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                      🎭 Choose your hero for this quest!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Tags with Enhanced Gamification */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-pink-500" />
                    Quest Tags
                  </FormLabel>
                                       <div className="space-y-3">
                       <div className="flex flex-col sm:flex-row gap-2">
                         <Input
                           placeholder="🏷️ Add epic tags..."
                           value={tagInput}
                           onChange={(e) => setTagInput(e.target.value)}
                           onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                               handleAddTag();
                             }
                           }}
                           className="h-12 text-base border-2 border-pink-200 dark:border-pink-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 bg-gradient-to-r from-white to-pink-50 dark:from-gray-800 dark:to-pink-900/20 transition-all duration-200 hover:border-pink-400 dark:hover:border-pink-600 flex-1"
                         />
                         <Button 
                           type="button" 
                           variant="outline" 
                           onClick={handleAddTag}
                           className="h-12 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-pink-300 font-semibold transition-all duration-200 hover:scale-105 whitespace-nowrap"
                         >
                           Add ✨
                         </Button>
                       </div>
                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedTags.map((tag, index) => (
                          <Badge 
                            key={tag} 
                            className={`cursor-pointer transition-all duration-200 hover:scale-110 bg-gradient-to-r ${
                              index % 4 === 0 ? 'from-purple-500 to-pink-500' :
                              index % 4 === 1 ? 'from-blue-500 to-cyan-500' :
                              index % 4 === 2 ? 'from-green-500 to-emerald-500' :
                              'from-orange-500 to-red-500'
                            } text-white font-semibold px-3 py-1 hover:shadow-lg`}
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    🏆 Organize your quests with colorful tags!
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 h-12 font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-3 h-12 rounded-lg shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Creating Epic Quest...</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 animate-bounce" />
                      <span className="hidden sm:inline">Create Epic Task</span>
                      <span className="sm:hidden">Create Task</span>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 