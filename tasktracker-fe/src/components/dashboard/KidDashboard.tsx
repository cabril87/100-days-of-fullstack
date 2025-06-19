'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  Trophy, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Gift, 
  Target,
  Crown,
  PartyPopper
} from 'lucide-react';
import { DashboardContentProps } from '@/lib/types';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/task';

interface KidDashboardProps extends DashboardContentProps {
  onTaskComplete: (taskId: number) => void;
  onRequestPermission: (action: string, description: string) => void;
}

export default function KidDashboard({ user, initialData, onTaskComplete, onRequestPermission }: KidDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialData?.recentTasks || []);
  const [stars, setStars] = useState(initialData?.stats?.totalPoints || 0);
  const [completedToday, setCompletedToday] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Age-appropriate greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setCurrentTimeOfDay('morning');
    else if (hour < 17) setCurrentTimeOfDay('afternoon');
    else setCurrentTimeOfDay('evening');
  }, []);

  // Fun level calculation for kids
  const getKidLevel = (points: number) => Math.floor(points / 50) + 1; // Lower threshold for kids
  const getLevelProgress = (points: number) => ((points % 50) / 50) * 100;

  // Age-appropriate achievements
  const getKidAchievements = () => {
    const achievements = [];
    if (completedToday >= 3) achievements.push({ icon: '⭐', title: 'Daily Star!', color: 'bg-yellow-100 text-yellow-800' });
    if (stars >= 100) achievements.push({ icon: '🏆', title: 'Trophy Winner!', color: 'bg-amber-100 text-amber-800' });
    if ((initialData?.stats?.streakDays || 0) >= 3) achievements.push({ icon: '🔥', title: 'Streak Hero!', color: 'bg-red-100 text-red-800' });
    if (stars >= 200) achievements.push({ icon: '👑', title: 'Star Champion!', color: 'bg-purple-100 text-purple-800' });
    if (completedToday >= 5) achievements.push({ icon: '💫', title: 'Super Helper!', color: 'bg-blue-100 text-blue-800' });
    return achievements;
  };

  // Fun greeting messages
  const getGreeting = () => {
    const greetings = {
      morning: [
        `🌅 Good morning, ${user?.firstName || 'Superstar'}!`,
        `☀️ Rise and shine, Champion!`,
        `🌻 Hello sunshine! Ready for adventure?`
      ],
      afternoon: [
        `🌞 Good afternoon, Hero!`,
        `🌈 What a beautiful day, ${user?.firstName || 'Star'}!`,
        `⭐ Afternoon power-up time!`
      ],
      evening: [
        `🌙 Good evening, ${user?.firstName || 'Moonbeam'}!`,
        `✨ Sparkly evening greetings!`,
        `🌟 Evening star power activated!`
      ]
    };
    
    const options = greetings[currentTimeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Handle task completion with celebration
  const handleTaskComplete = useCallback(async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true } : task
      ));
      
      setCompletedToday(prev => prev + 1);
      setStars(prev => prev + 10); // Kid-friendly point reward
      
      // Trigger celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      // Call parent handler
      onTaskComplete(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  }, [onTaskComplete]);

  // Permission request helper
  const handlePermissionRequest = (action: string) => {
    const descriptions = {
      'spend_points': `I want to spend ${Math.min(stars, 20)} stars on a reward!`,
      'create_task': 'I want to add a new task to help the family!',
      'join_activity': 'I want to join a family activity!',
      'extra_screen_time': 'Can I have 15 more minutes of screen time please?'
    };
    
    onRequestPermission(action, descriptions[action as keyof typeof descriptions] || action);
  };

  const kidLevel = getKidLevel(stars);
  const levelProgress = getLevelProgress(stars);
  const achievements = getKidAchievements();
  const incompleteTasks = tasks.filter(task => !task.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 p-4">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              Great Job!
            </div>
            <div className="text-2xl text-white drop-shadow-lg">
              +10 Stars! ⭐
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Kid-Friendly Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {getGreeting()}
          </h1>
          
          {/* Character Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                  {user?.firstName?.[0] || '🌟'}
                </AvatarFallback>
              </Avatar>
              {/* Level badge */}
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                Level {kidLevel}
              </Badge>
            </div>
          </div>

          {/* Star Progress */}
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-yellow-700">{stars} Stars</span>
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-yellow-700">
                    <span>Level {kidLevel}</span>
                    <span>Level {kidLevel + 1}</span>
                  </div>
                  <Progress value={levelProgress} className="h-3 bg-yellow-200" />
                  <p className="text-sm text-yellow-600">
                    {50 - (stars % 50)} more stars to level up! 🚀
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto fill-current" />
                <div className="text-3xl font-bold text-green-700">{completedToday}</div>
                <div className="text-green-600 font-medium">Tasks Done Today!</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Target className="h-12 w-12 text-blue-500 mx-auto" />
                <div className="text-3xl font-bold text-blue-700">{incompleteTasks.length}</div>
                <div className="text-blue-600 font-medium">Tasks To Do</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Crown className="h-12 w-12 text-purple-500 mx-auto fill-current" />
                <div className="text-3xl font-bold text-purple-700">{initialData?.stats?.streakDays || 0}</div>
                <div className="text-purple-600 font-medium">Day Streak! 🔥</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Trophy className="h-6 w-6" />
                Your Amazing Achievements!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {achievements.map((achievement, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={`text-lg px-4 py-2 ${achievement.color} animate-pulse`}
                  >
                    {achievement.icon} {achievement.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fun Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => handlePermissionRequest('spend_points')}
            className="h-20 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-lg"
            disabled={stars < 10}
          >
            <div className="text-center">
              <Gift className="h-6 w-6 mx-auto mb-1" />
              Get Reward
            </div>
          </Button>

          <Button 
            onClick={() => handlePermissionRequest('extra_screen_time')}
            className="h-20 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg"
          >
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-1" />
              More Time
            </div>
          </Button>

          <Button 
            onClick={() => handlePermissionRequest('create_task')}
            className="h-20 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg"
          >
            <div className="text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-1" />
              Help Family
            </div>
          </Button>

          <Button 
            onClick={() => handlePermissionRequest('join_activity')}
            className="h-20 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-lg"
          >
            <div className="text-center">
              <PartyPopper className="h-6 w-6 mx-auto mb-1" />
              Join Fun
            </div>
          </Button>
        </div>

        {/* My Tasks - Kid-Friendly Design */}
        <Card className="bg-white border-2 border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-xl">
              <Star className="h-6 w-6 fill-current" />
              My Super Tasks! 
              {incompleteTasks.length > 0 && (
                <Badge className="bg-indigo-500 text-white">
                  {incompleteTasks.length} to do
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {incompleteTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">All Done!</h3>
                <p className="text-green-500 text-lg">You completed all your tasks! You&apos;re amazing!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incompleteTasks.slice(0, 6).map((task) => (
                  <Card key={task.id} className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {task.priority && (
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                            )}
                            <Badge className="bg-yellow-100 text-yellow-800">
                              +10 ⭐
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleTaskComplete(task.id)}
                          size="lg"
                          className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold ml-4"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Done!
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Encouragement Message */}
        <Card className="bg-gradient-to-r from-rose-100 to-pink-100 border-rose-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Heart className="h-8 w-8 text-rose-500 mx-auto fill-current" />
              <p className="text-lg text-rose-700 font-medium">
                You&apos;re doing such a great job! Keep being awesome! 🌟
              </p>
              {user?.firstName && (
                <p className="text-rose-600">
                  {user.firstName}, you make your family so proud! 💖
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 