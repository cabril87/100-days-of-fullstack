'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Clock, 
  Target, 
  CheckCircle2, 
  Trophy,
  Sparkles
} from 'lucide-react';
import { FocusSession } from '@/lib/types/focus';
import { Task } from '@/lib/types/task';
import { cn } from '@/lib/utils';

interface SessionCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: FocusSession | null;
  task: Task | null;
  onComplete: (completion: {
    sessionQualityRating?: number;
    completionNotes?: string;
    taskProgressAfter?: number;
    taskCompletedDuringSession?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function SessionCompletionDialog({
  isOpen,
  onClose,
  session,
  task,
  onComplete,
  isLoading = false
}: SessionCompletionDialogProps) {
  const [qualityRating, setQualityRating] = useState<number>(4);
  const [completionNotes, setCompletionNotes] = useState('');
  const [taskProgress, setTaskProgress] = useState<number>(
    task?.progressPercentage || session?.taskProgressBefore || 0
  );
  const [taskCompleted, setTaskCompleted] = useState(false);

  const handleComplete = async () => {
    await onComplete({
      sessionQualityRating: qualityRating,
      completionNotes: completionNotes.trim() || undefined,
      taskProgressAfter: taskCompleted ? 100 : taskProgress,
      taskCompletedDuringSession: taskCompleted
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getQualityLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Great';
      case 5: return 'Excellent';
      default: return 'Good';
    }
  };

  const getQualityColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-yellow-600';
      case 4: return 'text-blue-600';
      case 5: return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  if (!session || !task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Focus Session Complete!
          </DialogTitle>
          <DialogDescription>
            Great work! Let's capture what you accomplished during this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-800">Session Summary</h3>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(session.durationMinutes)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">Task:</span>
                <p className="text-green-800 truncate">{task.title}</p>
              </div>
              <div>
                <span className="text-green-600 font-medium">Started:</span>
                <p className="text-green-800">
                  {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Session Quality Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">How was your focus quality?</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setQualityRating(rating)}
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        qualityRating >= rating
                          ? "text-amber-400 hover:text-amber-500"
                          : "text-gray-300 hover:text-gray-400"
                      )}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                <Badge variant="outline" className={getQualityColor(qualityRating)}>
                  {getQualityLabel(qualityRating)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Task Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Task Progress</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={taskCompleted}
                  onCheckedChange={setTaskCompleted}
                  id="task-completed"
                />
                <Label htmlFor="task-completed" className="text-sm">
                  Mark as completed
                </Label>
              </div>
            </div>
            
            {!taskCompleted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {taskProgress}%</span>
                  <span className="text-gray-500">
                    Started at {session.taskProgressBefore}%
                  </span>
                </div>
                <Slider
                  value={[taskProgress]}
                  onValueChange={(value) => setTaskProgress(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <Progress value={taskProgress} className="h-2" />
              </div>
            )}

            {taskCompleted && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Task will be marked as 100% complete!</span>
                </div>
              </div>
            )}
          </div>

          {/* Completion Notes */}
          <div className="space-y-3">
            <Label htmlFor="completion-notes" className="text-base font-medium">
              What did you accomplish? (Optional)
            </Label>
            <Textarea
              id="completion-notes"
              placeholder="Describe what you worked on, any breakthroughs, or next steps..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Completing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Complete Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 