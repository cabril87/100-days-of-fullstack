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
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Comprehensive point calculation system for gamification
    /// </summary>
    public static class PointCalculationSystem
    {
        // Base point values - these are the foundation
        public static class BasePoints
        {
            public const int TaskCompletionBase = 15;           // Base points for any task
            public const int DailyLoginBase = 5;               // Base daily login (very low to encourage other activities)
            public const int FocusSessionBase = 2;             // Points per minute focused (2 * 25min = 50 points)
            public const int AchievementUnlockBase = 50;       // Base achievement unlock
            public const int BadgeEarnBase = 30;               // Base badge earning
            public const int FamilyTaskBase = 20;              // Family/collaborative tasks
            public const int ChallengeCompletionBase = 100;    // Challenge completion
            public const int StreakMaintenance = 10;           // Per day of streak maintained
        }

        // Difficulty multipliers - make harder tasks much more rewarding
        public static class DifficultyMultipliers
        {
            public const double Low = 0.8;          // 80% of base points
            public const double Medium = 1.0;       // 100% of base points
            public const double High = 1.5;         // 150% of base points
            public const double Critical = 2.0;     // 200% of base points
            public const double Expert = 2.5;       // 250% of base points (new tier)
        }

        // Priority multipliers - urgent tasks worth more
        public static class PriorityMultipliers
        {
            public const double Low = 0.9;          // 90% of calculated points
            public const double Medium = 1.0;       // 100% of calculated points
            public const double High = 1.3;         // 130% of calculated points
            public const double Urgent = 1.6;       // 160% of calculated points
            public const double Critical = 2.0;     // 200% of calculated points
        }

        // Streak multipliers - reward consistency heavily
        public static class StreakMultipliers
        {
            public static double GetStreakMultiplier(int streakDays)
            {
                return streakDays switch
                {
                    < 3 => 1.0,                      // No bonus for short streaks
                    < 7 => 1.1,                      // 10% bonus for 3-6 days
                    < 14 => 1.25,                    // 25% bonus for 1-2 weeks
                    < 30 => 1.5,                     // 50% bonus for 2-4 weeks
                    < 60 => 1.75,                    // 75% bonus for 1-2 months
                    < 100 => 2.0,                    // 100% bonus for 2-3 months
                    < 200 => 2.5,                    // 150% bonus for 3-6 months
                    < 365 => 3.0,                    // 200% bonus for 6-12 months
                    _ => 4.0                         // 300% bonus for 1+ years
                };
            }
        }

        // Time-based bonuses - reward good timing
        public static class TimeBonuses
        {
            public const double EarlyCompletion = 1.2;      // 20% bonus for completing before due date
            public const double OnTimeCompletion = 1.0;     // No bonus for on-time
            public const double LateCompletion = 0.7;       // 30% penalty for late completion
            public const double EarlyBird = 1.15;           // 15% bonus for tasks completed before 9 AM
            public const double NightOwl = 1.1;             // 10% bonus for tasks completed after 10 PM
        }

        // Focus session bonuses - reward deep work
        public static class FocusBonuses
        {
            public static double GetFocusMultiplier(int durationMinutes)
            {
                return durationMinutes switch
                {
                    < 15 => 0.5,                     // 50% penalty for very short sessions
                    < 25 => 0.8,                     // 20% penalty for short sessions
                    < 45 => 1.0,                     // Standard rate for normal sessions
                    < 60 => 1.2,                     // 20% bonus for longer sessions
                    < 90 => 1.5,                     // 50% bonus for deep work sessions
                    < 120 => 1.8,                    // 80% bonus for marathon sessions
                    _ => 2.0                         // 100% bonus for extreme focus
                };
            }

            public const double ConsistencyBonus = 1.3;     // 30% bonus for daily focus sessions
            public const double WeekendBonus = 1.1;         // 10% bonus for weekend focus
        }

        // Family collaboration bonuses
        public static class FamilyBonuses
        {
            public const double CollaborativeTask = 1.4;    // 40% bonus for tasks involving multiple family members
            public const double HelpingOthers = 1.3;        // 30% bonus for helping others complete tasks
            public const double FamilyChallenge = 1.6;      // 60% bonus for family-wide challenges
            public const double Mentoring = 1.5;            // 50% bonus for teaching/mentoring activities
        }

        // Achievement tier multipliers - make higher tier achievements MUCH more valuable
        public static class AchievementTierMultipliers
        {
            public const double Bronze = 1.0;               // Base achievement points
            public const double Silver = 2.0;               // 2x points for silver achievements
            public const double Gold = 4.0;                 // 4x points for gold achievements
            public const double Platinum = 8.0;             // 8x points for platinum achievements
            public const double Diamond = 15.0;             // 15x points for diamond achievements
            public const double Onyx = 25.0;                // 25x points for onyx achievements (legendary!)
        }

        // Consistency bonuses - reward regular engagement
        public static class ConsistencyBonuses
        {
            public static double GetWeeklyConsistencyMultiplier(int activeDaysThisWeek)
            {
                return activeDaysThisWeek switch
                {
                    < 3 => 0.9,                      // 10% penalty for low activity
                    < 5 => 1.0,                      // No bonus for moderate activity
                    < 7 => 1.15,                     // 15% bonus for high activity
                    _ => 1.3                         // 30% bonus for perfect week
                };
            }

            public static double GetMonthlyConsistencyMultiplier(int activeDaysThisMonth, int daysInMonth)
            {
                double activityRatio = (double)activeDaysThisMonth / daysInMonth;
                return activityRatio switch
                {
                    < 0.3 => 0.8,                    // 20% penalty for very low activity
                    < 0.5 => 0.9,                    // 10% penalty for low activity
                    < 0.7 => 1.0,                    // No bonus for moderate activity
                    < 0.9 => 1.2,                    // 20% bonus for high activity
                    _ => 1.5                         // 50% bonus for exceptional consistency
                };
            }
        }

        // Special event multipliers
        public static class SpecialEventMultipliers
        {
            public const double WeekendWarrior = 1.2;       // 20% bonus for weekend productivity
            public const double HolidayHustle = 1.5;        // 50% bonus for holiday productivity
            public const double NewYearResolution = 2.0;    // 100% bonus for January activities
            public const double BirthdayBonus = 1.8;        // 80% bonus on birthday
        }
    }

    /// <summary>
    /// Revised challenging tier system - requires real commitment
    /// </summary>
    public static class TierSystem
    {
        public static readonly Dictionary<string, TierInfo> Tiers = new()
        {
            ["bronze"] = new TierInfo 
            { 
                Name = "Bronze", 
                PointsRequired = 0, 
                Description = "Starting your productivity journey",
                EstimatedTimeToAchieve = "Immediate"
            },
            ["silver"] = new TierInfo 
            { 
                Name = "Silver", 
                PointsRequired = 750,           // ~2-3 weeks of consistent effort
                Description = "Building productive habits",
                EstimatedTimeToAchieve = "2-3 weeks"
            },
            ["gold"] = new TierInfo 
            { 
                Name = "Gold", 
                PointsRequired = 3000,          // ~2-3 months of consistent effort
                Description = "Established productivity master",
                EstimatedTimeToAchieve = "2-3 months"
            },
            ["platinum"] = new TierInfo 
            { 
                Name = "Platinum", 
                PointsRequired = 10000,         // ~6-8 months of dedicated effort
                Description = "Elite productivity champion",
                EstimatedTimeToAchieve = "6-8 months"
            },
            ["diamond"] = new TierInfo 
            { 
                Name = "Diamond", 
                PointsRequired = 30000,         // ~1.5-2 years of excellent habits
                Description = "Legendary productivity guru",
                EstimatedTimeToAchieve = "1.5-2 years"
            },
            ["onyx"] = new TierInfo 
            { 
                Name = "Onyx", 
                PointsRequired = 100000,        // ~3-5 years of mastery
                Description = "Transcendent productivity sage",
                EstimatedTimeToAchieve = "3-5 years"
            }
        };
    }

    public class TierInfo
    {
        public string Name { get; set; } = string.Empty;
        public int PointsRequired { get; set; }
        public string Description { get; set; } = string.Empty;
        public string EstimatedTimeToAchieve { get; set; } = string.Empty;
    }
} 