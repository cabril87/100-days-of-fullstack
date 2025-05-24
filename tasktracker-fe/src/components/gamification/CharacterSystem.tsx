'use client';

import React, { useState, useEffect } from 'react';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  User, 
  Crown, 
  Star, 
  Trophy,
  ChevronRight,
  Plus,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Sword,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserTier, getTierProgress, achievementTiers } from '@/lib/constants/achievementIcons';
import { gamificationService } from '@/lib/services/gamificationService';

interface CharacterSystemProps {
  className?: string;
  compact?: boolean;
}

// Character classes with different abilities and aesthetics
const characterClasses = {
  explorer: {
    name: 'Explorer',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Masters of discovery and planning',
    abilities: ['Task Planning', 'Time Management', 'Goal Setting']
  },
  warrior: {
    name: 'Warrior',
    icon: Sword,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Fierce task completers and streak maintainers',
    abilities: ['Task Completion', 'Streak Mastery', 'Challenge Crushing']
  },
  mage: {
    name: 'Mage',
    icon: Wand2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Wielders of productivity magic',
    abilities: ['Automation', 'Efficiency', 'Innovation']
  },
  guardian: {
    name: 'Guardian',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Protectors and supporters of family productivity',
    abilities: ['Family Support', 'Collaboration', 'Mentoring']
  },
  speedster: {
    name: 'Speedster',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Lightning-fast task completion specialists',
    abilities: ['Speed Completion', 'Multi-tasking', 'Quick Actions']
  },
  healer: {
    name: 'Healer',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Restorers of motivation and productivity',
    abilities: ['Motivation Boost', 'Recovery', 'Well-being']
  }
};

export function CharacterSystem({
  className,
  compact = false
}: CharacterSystemProps) {
  const { userProgress } = useGamification();
  const [characterData, setCharacterData] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState('explorer');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch character data from API
  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setIsLoading(true);
        const characterProgress = await gamificationService.getCharacterProgress();
        setCharacterData({
          level: characterProgress.characterLevel,
          xp: characterProgress.characterXP,
          xpToNext: 1000, // This should come from API based on level
          characterClass: characterProgress.currentCharacterClass,
          unlockedCharacters: characterProgress.unlockedCharacters,
          availableCharacters: [], // This should come from API
          lockedCharacters: [], // This should come from API
          badges: userProgress?.badgesEarned || 0,
          achievements: userProgress?.tasksCompleted || 0
        });
        setSelectedCharacter(characterProgress.currentCharacterClass);
      } catch (error) {
        console.error('Failed to fetch character data:', error);
        // Fallback to basic data
        setCharacterData({
          level: 1,
          xp: 0,
          xpToNext: 1000,
          characterClass: 'explorer',
          unlockedCharacters: ['explorer'],
          availableCharacters: [],
          lockedCharacters: ['warrior', 'mage', 'guardian', 'speedster', 'healer'],
          badges: userProgress?.badgesEarned || 0,
          achievements: userProgress?.tasksCompleted || 0
        });
        setSelectedCharacter('explorer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, [userProgress]);
  
  const currentTier = getUserTier(userProgress?.totalPoints || 0);
  const tierProgress = getTierProgress(userProgress?.totalPoints || 0, currentTier.name.toLowerCase());
  
  const currentClass = characterClasses[selectedCharacter as keyof typeof characterClasses];
  
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={`/characters/${selectedCharacter}.png`} />
          <AvatarFallback className={cn(currentClass.color, currentClass.bgColor)}>
            <currentClass.icon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{currentClass.name}</span>
            <Badge variant="outline" className="text-xs">
              Lv.{characterData?.level || 1}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <currentTier.icon className="h-3 w-3" />
            <span>{currentTier.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Character Profile
        </CardTitle>
        <CardDescription>
          Your productivity avatar and progression
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Character */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`/characters/${selectedCharacter}.png`} />
            <AvatarFallback className={cn(currentClass.color, currentClass.bgColor)}>
              <currentClass.icon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{currentClass.name}</h3>
              <Badge className={cn("text-xs", currentTier.color, currentTier.bgColor)}>
                <currentTier.icon className="h-3 w-3 mr-1" />
                {currentTier.name}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{currentClass.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Level {characterData?.level || 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span>{characterData?.achievements || 0} Achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Experience Progress</span>
            <span className="text-gray-600">
              {characterData?.xp.toLocaleString() || 0} / {characterData?.xpToNext.toLocaleString() || 1000} XP
            </span>
          </div>
          <Progress 
            value={(characterData?.xp / characterData?.xpToNext) * 100 || 0} 
            className="h-3"
          />
          <p className="text-xs text-gray-600">
            {characterData?.xpToNext - characterData?.xp} XP needed for Level {characterData?.level + 1}
          </p>
        </div>

        {/* Abilities */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Class Abilities</h4>
          <div className="grid grid-cols-1 gap-2">
            {currentClass.abilities.map((ability, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  currentClass.color.replace('text-', 'bg-')
                )} />
                <span>{ability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Character Collection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Character Collection</h4>
            <span className="text-xs text-gray-600">
              {characterData?.unlockedCharacters.length || 0}/{Object.keys(characterClasses).length} Unlocked
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(characterClasses).map(([key, charClass]) => {
              const isUnlocked = characterData?.unlockedCharacters.includes(key);
              const isSelected = key === selectedCharacter;
              
              return (
                <div
                  key={key}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all cursor-pointer",
                    isSelected && "ring-2 ring-blue-500 ring-offset-2",
                    isUnlocked && "border-green-200 bg-green-50",
                    !isUnlocked && "border-gray-200 bg-gray-50 opacity-50"
                  )}
                  onClick={() => isUnlocked && setSelectedCharacter(key)}
                >
                  <div className="text-center">
                    <Avatar className="h-10 w-10 mx-auto mb-2">
                      <AvatarFallback className={cn(
                        isUnlocked ? [charClass.color, charClass.bgColor] : ['text-gray-400', 'bg-gray-100']
                      )}>
                        <charClass.icon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <h5 className="text-xs font-medium truncate">{charClass.name}</h5>
                    {isSelected && (
                      <Badge className="text-xs mt-1 bg-blue-100 text-blue-700">
                        Active
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge className="text-xs mt-1 bg-gray-100 text-gray-500">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{characterData?.badges || 0}</div>
            <div className="text-xs text-gray-600">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(tierProgress)}%</div>
            <div className="text-xs text-gray-600">Tier Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 