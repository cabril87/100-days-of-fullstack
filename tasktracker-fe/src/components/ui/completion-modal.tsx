'use client';

import React from 'react';
import { Trophy, Star, Sparkles, Target, Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  xpEarned: number;
  newLevel?: number;
  achievements?: string[];
  streakDays?: number;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  xpEarned,
  newLevel,
  achievements = [],
  streakDays = 0
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Celebration Animation */}
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 animate-ping">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20"></div>
            </div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10 text-white animate-bounce" />
            </div>
            {/* Sparkle Effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Star className="absolute -bottom-2 -left-2 w-5 h-5 text-orange-400 animate-pulse delay-150" />
            <Sparkles className="absolute top-4 -left-4 w-4 h-4 text-yellow-300 animate-pulse delay-300" />
          </div>

          {/* Accessibility Components */}
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quest Completed! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 dark:text-gray-400 font-medium">
            &quot;{taskTitle}&quot; has been successfully completed
          </DialogDescription>

          {/* Main Content */}
          <div className="space-y-4">
            {/* XP and Level */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  +{xpEarned} XP
                </span>
              </div>
              
              {newLevel && (
                <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">Level Up! Now Level {newLevel}</span>
                </div>
              )}
              
              {streakDays > 0 && (
                <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                  <Flame className="w-5 h-5" />
                  <span className="font-semibold">{streakDays} Day Streak!</span>
                </div>
              )}
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">New Achievements!</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {achievements.map((achievement, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-sm font-medium shadow-lg"
                    >
                      🏆 {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Motivational Message */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                Outstanding work! 🌟
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep completing quests to unlock more achievements and level up!
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue Your Journey
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal; 