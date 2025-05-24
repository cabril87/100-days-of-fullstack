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
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Data;

public static class GamificationSeedData
{
    public static void SeedGamificationData(ModelBuilder modelBuilder)
    {
        // Remove SeedUserProgress since user progress is created dynamically
        SeedAchievements(modelBuilder);
        SeedBadges(modelBuilder);
        SeedRewards(modelBuilder);
        SeedChallenges(modelBuilder);
    }

    private static void SeedAchievements(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Achievement>().HasData(
            // ========== BRONZE TIER ACHIEVEMENTS (50 total) ==========
            // First Steps Category
            new Achievement { 
                Id = 1, Name = "First Steps", Description = "Complete your very first task", 
                Category = "First Steps", PointValue = 10,
                IconUrl = "/icons/achievements/bronze-first-task.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 2, Name = "Task Starter", Description = "Complete 5 tasks", 
                Category = "Progress", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-task-starter.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 3, Name = "Getting Started", Description = "Complete 10 tasks", 
                Category = "Progress", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-getting-started.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 4, Name = "Creator", Description = "Create your first task", 
                Category = "Creation", PointValue = 15,
                IconUrl = "/icons/achievements/bronze-creator.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 5, Name = "Organizer", Description = "Create your first category", 
                Category = "Organization", PointValue = 10,
                IconUrl = "/icons/achievements/bronze-organizer.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Time Management Category
            new Achievement { 
                Id = 6, Name = "Early Bird", Description = "Complete a task before 8 AM", 
                Category = "Time Management", PointValue = 20,
                IconUrl = "/icons/achievements/bronze-early-bird.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 7, Name = "Night Owl", Description = "Complete a task after 10 PM", 
                Category = "Time Management", PointValue = 15,
                IconUrl = "/icons/achievements/bronze-night-owl.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 8, Name = "Weekend Warrior", Description = "Complete 5 tasks on weekends", 
                Category = "Dedication", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-weekend-warrior.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 9, Name = "Lunch Break Hero", Description = "Complete 3 tasks during lunch break", 
                Category = "Time Management", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-lunch-hero.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 10, Name = "On Time", Description = "Complete 5 tasks before their due date", 
                Category = "Punctuality", PointValue = 40,
                IconUrl = "/icons/achievements/bronze-on-time.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Speed Category
            new Achievement { 
                Id = 11, Name = "Speed Runner", Description = "Complete a task in under 5 minutes", 
                Category = "Speed", PointValue = 15,
                IconUrl = "/icons/achievements/bronze-speed-runner.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 12, Name = "Quick Draw", Description = "Complete 3 tasks in under 10 minutes each", 
                Category = "Speed", PointValue = 35,
                IconUrl = "/icons/achievements/bronze-quick-draw.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 13, Name = "Flash", Description = "Complete 5 tasks in under 15 minutes total", 
                Category = "Speed", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-flash.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Consistency Category
            new Achievement { 
                Id = 14, Name = "Streak Starter", Description = "Complete tasks for 3 consecutive days", 
                Category = "Consistency", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-streak-start.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 15, Name = "Daily Dose", Description = "Complete at least 1 task every day for 5 days", 
                Category = "Consistency", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-daily-dose.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 16, Name = "Morning Routine", Description = "Complete morning tasks 5 days in a row", 
                Category = "Habits", PointValue = 45,
                IconUrl = "/icons/achievements/bronze-morning-routine.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Social Category
            new Achievement { 
                Id = 17, Name = "Team Player", Description = "Join your first family", 
                Category = "Social", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-team-player.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 18, Name = "Helpful", Description = "Complete 3 family tasks", 
                Category = "Collaboration", PointValue = 35,
                IconUrl = "/icons/achievements/bronze-helpful.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 19, Name = "Event Organizer", Description = "Create your first family event", 
                Category = "Social", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-event-organizer.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Learning & Growth
            new Achievement { 
                Id = 20, Name = "Experimenter", Description = "Try 3 different task priorities", 
                Category = "Learning", PointValue = 20,
                IconUrl = "/icons/achievements/bronze-experimenter.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 21, Name = "Focused", Description = "Complete your first focus session", 
                Category = "Focus", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-focused.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 22, Name = "Zen Master", Description = "Complete 5 focus sessions", 
                Category = "Focus", PointValue = 75,
                IconUrl = "/icons/achievements/bronze-zen-master.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Fun & Motivation  
            new Achievement { 
                Id = 23, Name = "Comeback Kid", Description = "Return after 7 days of inactivity", 
                Category = "Resilience", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-comeback-kid.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 24, Name = "Perfectionist", Description = "Complete 5 tasks with perfect quality", 
                Category = "Quality", PointValue = 60,
                IconUrl = "/icons/achievements/bronze-perfectionist.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 25, Name = "Multi-tasker", Description = "Work on 3 different categories in one day", 
                Category = "Versatility", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-multi-tasker.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Seasonal & Special
            new Achievement { 
                Id = 26, Name = "New Year Resolution", Description = "Complete 10 tasks in January", 
                Category = "Seasonal", PointValue = 100,
                IconUrl = "/icons/achievements/bronze-new-year.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 27, Name = "Spring Cleaning", Description = "Complete 15 organization tasks in March", 
                Category = "Seasonal", PointValue = 75,
                IconUrl = "/icons/achievements/bronze-spring-cleaning.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 28, Name = "Summer Vibes", Description = "Complete 20 tasks in summer months", 
                Category = "Seasonal", PointValue = 80,
                IconUrl = "/icons/achievements/bronze-summer-vibes.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Template & Efficiency
            new Achievement { 
                Id = 29, Name = "Template Master", Description = "Use task templates 10 times", 
                Category = "Efficiency", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-template-master.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 30, Name = "Automation Lover", Description = "Create 3 recurring tasks", 
                Category = "Automation", PointValue = 45,
                IconUrl = "/icons/achievements/bronze-automation.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Milestone Achievements
            new Achievement { 
                Id = 31, Name = "First Week", Description = "Use the app for 7 consecutive days", 
                Category = "Milestones", PointValue = 70,
                IconUrl = "/icons/achievements/bronze-first-week.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 32, Name = "Loyal User", Description = "Use the app for 30 days total", 
                Category = "Milestones", PointValue = 150,
                IconUrl = "/icons/achievements/bronze-loyal-user.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Productivity Patterns
            new Achievement { 
                Id = 33, Name = "Power Hour", Description = "Complete 5 tasks in one hour", 
                Category = "Productivity", PointValue = 80,
                IconUrl = "/icons/achievements/bronze-power-hour.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 34, Name = "Task Destroyer", Description = "Complete 20 tasks total", 
                Category = "Progress", PointValue = 100,
                IconUrl = "/icons/achievements/bronze-task-destroyer.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Priority Management
            new Achievement { 
                Id = 35, Name = "Priority Pro", Description = "Complete 10 high-priority tasks", 
                Category = "Priority", PointValue = 75,
                IconUrl = "/icons/achievements/bronze-priority-pro.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 36, Name = "Critical Thinker", Description = "Complete 5 critical priority tasks", 
                Category = "Priority", PointValue = 100,
                IconUrl = "/icons/achievements/bronze-critical-thinker.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Category Mastery
            new Achievement { 
                Id = 37, Name = "Category Creator", Description = "Create 5 different categories", 
                Category = "Organization", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-category-creator.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 38, Name = "Tag Master", Description = "Use 10 different tags", 
                Category = "Organization", PointValue = 40,
                IconUrl = "/icons/achievements/bronze-tag-master.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Reminders & Planning
            new Achievement { 
                Id = 39, Name = "Reminder Rookie", Description = "Set your first reminder", 
                Category = "Planning", PointValue = 15,
                IconUrl = "/icons/achievements/bronze-reminder-rookie.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 40, Name = "Planner", Description = "Set 10 reminders", 
                Category = "Planning", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-planner.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Notes & Documentation
            new Achievement { 
                Id = 41, Name = "Note Taker", Description = "Add notes to 5 tasks", 
                Category = "Documentation", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-note-taker.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 42, Name = "Detailed", Description = "Write notes longer than 100 characters", 
                Category = "Documentation", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-detailed.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Boards & Visualization
            new Achievement { 
                Id = 43, Name = "Board Creator", Description = "Create your first board", 
                Category = "Visualization", PointValue = 30,
                IconUrl = "/icons/achievements/bronze-board-creator.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 44, Name = "Visual Organizer", Description = "Move 10 tasks between board columns", 
                Category = "Visualization", PointValue = 40,
                IconUrl = "/icons/achievements/bronze-visual-organizer.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Challenge & Gamification
            new Achievement { 
                Id = 45, Name = "Challenge Accepted", Description = "Join your first challenge", 
                Category = "Challenges", PointValue = 25,
                IconUrl = "/icons/achievements/bronze-challenge-accepted.svg", 
                Difficulty = AchievementDifficulty.VeryEasy, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 46, Name = "Point Collector", Description = "Earn your first 100 points", 
                Category = "Gamification", PointValue = 0, // No extra points for collecting points
                IconUrl = "/icons/achievements/bronze-point-collector.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Exploration & Discovery
            new Achievement { 
                Id = 47, Name = "Explorer", Description = "Try every main feature once", 
                Category = "Exploration", PointValue = 100,
                IconUrl = "/icons/achievements/bronze-explorer.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 48, Name = "Feature Hunter", Description = "Use 5 different app features", 
                Category = "Exploration", PointValue = 50,
                IconUrl = "/icons/achievements/bronze-feature-hunter.svg", 
                Difficulty = AchievementDifficulty.Easy, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Personal Development
            new Achievement { 
                Id = 49, Name = "Self Improver", Description = "Complete 10 personal development tasks", 
                Category = "Development", PointValue = 75,
                IconUrl = "/icons/achievements/bronze-self-improver.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 50, Name = "Habit Builder", Description = "Complete the same type of task 7 days in a row", 
                Category = "Habits", PointValue = 80,
                IconUrl = "/icons/achievements/bronze-habit-builder.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== SILVER TIER ACHIEVEMENTS (50 total) ==========
            // Advanced Progress
            new Achievement { 
                Id = 51, Name = "Task Warrior", Description = "Complete 50 tasks", 
                Category = "Progress", PointValue = 150,
                IconUrl = "/icons/achievements/silver-task-warrior.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 52, Name = "Productive", Description = "Complete 100 tasks", 
                Category = "Progress", PointValue = 250,
                IconUrl = "/icons/achievements/silver-productive.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 53, Name = "Task Machine", Description = "Complete 25 tasks in one week", 
                Category = "Intensity", PointValue = 200,
                IconUrl = "/icons/achievements/silver-task-machine.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Speed Mastery
            new Achievement { 
                Id = 54, Name = "Lightning Fast", Description = "Complete 10 tasks in under 5 minutes each", 
                Category = "Speed", PointValue = 150,
                IconUrl = "/icons/achievements/silver-lightning-fast.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 55, Name = "Speed Demon", Description = "Complete 5 tasks within 30 minutes", 
                Category = "Speed", PointValue = 120,
                IconUrl = "/icons/achievements/silver-speed-demon.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 56, Name = "Rapid Fire", Description = "Complete 15 tasks in 2 hours", 
                Category = "Speed", PointValue = 180,
                IconUrl = "/icons/achievements/silver-rapid-fire.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Consistency Masters
            new Achievement { 
                Id = 57, Name = "Flame Keeper", Description = "Maintain a 14-day streak", 
                Category = "Consistency", PointValue = 200,
                IconUrl = "/icons/achievements/silver-flame-keeper.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 58, Name = "Dedicated", Description = "Complete tasks every day for 21 days", 
                Category = "Consistency", PointValue = 300,
                IconUrl = "/icons/achievements/silver-dedicated.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 59, Name = "Morning Champion", Description = "Complete morning tasks for 14 days straight", 
                Category = "Habits", PointValue = 250,
                IconUrl = "/icons/achievements/silver-morning-champion.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Time Management Excellence
            new Achievement { 
                Id = 60, Name = "Time Master", Description = "Complete tasks on time for 10 consecutive days", 
                Category = "Time Management", PointValue = 200,
                IconUrl = "/icons/achievements/silver-time-master.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 61, Name = "Punctuality Expert", Description = "Complete 50 tasks before their due date", 
                Category = "Punctuality", PointValue = 300,
                IconUrl = "/icons/achievements/silver-punctuality-expert.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 62, Name = "Early Bird Master", Description = "Complete 25 tasks before 8 AM", 
                Category = "Time Management", PointValue = 250,
                IconUrl = "/icons/achievements/silver-early-bird-master.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Collaboration & Social
            new Achievement { 
                Id = 63, Name = "Team Player", Description = "Complete 25 family tasks", 
                Category = "Collaboration", PointValue = 200,
                IconUrl = "/icons/achievements/silver-team-player.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 64, Name = "Family Hero", Description = "Help family members complete 15 tasks", 
                Category = "Collaboration", PointValue = 180,
                IconUrl = "/icons/achievements/silver-family-hero.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 65, Name = "Event Master", Description = "Organize 10 family events", 
                Category = "Social", PointValue = 300,
                IconUrl = "/icons/achievements/silver-event-master.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 66, Name = "Community Builder", Description = "Invite 5 people to join families", 
                Category = "Social", PointValue = 250,
                IconUrl = "/icons/achievements/silver-community-builder.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Quality & Excellence
            new Achievement { 
                Id = 67, Name = "Quality Control", Description = "Complete 25 tasks with perfect quality", 
                Category = "Quality", PointValue = 300,
                IconUrl = "/icons/achievements/silver-quality-control.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 68, Name = "Attention to Detail", Description = "Add detailed notes to 25 tasks", 
                Category = "Documentation", PointValue = 200,
                IconUrl = "/icons/achievements/silver-attention-detail.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 69, Name = "Reviewer", Description = "Review and update 20 completed tasks", 
                Category = "Quality", PointValue = 150,
                IconUrl = "/icons/achievements/silver-reviewer.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Innovation & Creativity
            new Achievement { 
                Id = 70, Name = "Innovator", Description = "Create 25 unique tasks", 
                Category = "Innovation", PointValue = 200,
                IconUrl = "/icons/achievements/silver-innovator.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 71, Name = "Template Creator", Description = "Create 10 task templates", 
                Category = "Efficiency", PointValue = 180,
                IconUrl = "/icons/achievements/silver-template-creator.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 72, Name = "System Builder", Description = "Create 15 categories and organize tasks", 
                Category = "Organization", PointValue = 220,
                IconUrl = "/icons/achievements/silver-system-builder.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Focus & Concentration
            new Achievement { 
                Id = 73, Name = "Focus Master", Description = "Complete 25 focus sessions", 
                Category = "Focus", PointValue = 250,
                IconUrl = "/icons/achievements/silver-focus-master.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 74, Name = "Deep Work", Description = "Complete 5 focus sessions over 2 hours each", 
                Category = "Focus", PointValue = 300,
                IconUrl = "/icons/achievements/silver-deep-work.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 75, Name = "Concentration Champion", Description = "Complete 100 tasks during focus sessions", 
                Category = "Focus", PointValue = 400,
                IconUrl = "/icons/achievements/silver-concentration-champion.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Seasonal & Events
            new Achievement { 
                Id = 76, Name = "Spring Productivity", Description = "Complete 75 tasks in spring", 
                Category = "Seasonal", PointValue = 300,
                IconUrl = "/icons/achievements/silver-spring-productivity.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 77, Name = "Summer Consistency", Description = "Maintain streaks throughout summer", 
                Category = "Seasonal", PointValue = 350,
                IconUrl = "/icons/achievements/silver-summer-consistency.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 78, Name = "Autumn Organizer", Description = "Reorganize and complete 50 tasks in fall", 
                Category = "Seasonal", PointValue = 275,
                IconUrl = "/icons/achievements/silver-autumn-organizer.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 79, Name = "Winter Warrior", Description = "Stay productive throughout winter", 
                Category = "Seasonal", PointValue = 400,
                IconUrl = "/icons/achievements/silver-winter-warrior.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Priority & Strategy
            new Achievement { 
                Id = 80, Name = "Priority Master", Description = "Complete 50 high-priority tasks", 
                Category = "Priority", PointValue = 300,
                IconUrl = "/icons/achievements/silver-priority-master.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 81, Name = "Strategic Thinker", Description = "Balance tasks across all priority levels", 
                Category = "Strategy", PointValue = 250,
                IconUrl = "/icons/achievements/silver-strategic-thinker.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 82, Name = "Crisis Manager", Description = "Complete 20 critical priority tasks", 
                Category = "Priority", PointValue = 400,
                IconUrl = "/icons/achievements/silver-crisis-manager.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Automation & Efficiency
            new Achievement { 
                Id = 83, Name = "Automation Expert", Description = "Set up 20 recurring tasks", 
                Category = "Automation", PointValue = 300,
                IconUrl = "/icons/achievements/silver-automation-expert.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 84, Name = "Efficiency Master", Description = "Use templates for 50 task creations", 
                Category = "Efficiency", PointValue = 250,
                IconUrl = "/icons/achievements/silver-efficiency-master.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 85, Name = "Time Saver", Description = "Save 10 hours using automation features", 
                Category = "Efficiency", PointValue = 500,
                IconUrl = "/icons/achievements/silver-time-saver.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Milestones & Loyalty
            new Achievement { 
                Id = 86, Name = "Regular User", Description = "Use the app for 90 consecutive days", 
                Category = "Milestones", PointValue = 450,
                IconUrl = "/icons/achievements/silver-regular-user.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 87, Name = "Dedicated User", Description = "Use the app for 6 months total", 
                Category = "Milestones", PointValue = 600,
                IconUrl = "/icons/achievements/silver-dedicated-user.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 88, Name = "Point Accumulator", Description = "Earn 1000 total points", 
                Category = "Gamification", PointValue = 0,
                IconUrl = "/icons/achievements/silver-point-accumulator.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Challenge & Competition
            new Achievement { 
                Id = 89, Name = "Challenge Warrior", Description = "Complete 10 different challenges", 
                Category = "Challenges", PointValue = 300,
                IconUrl = "/icons/achievements/silver-challenge-warrior.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 90, Name = "Competitor", Description = "Finish in top 3 of family leaderboard 5 times", 
                Category = "Competition", PointValue = 350,
                IconUrl = "/icons/achievements/silver-competitor.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 91, Name = "Leaderboard Climber", Description = "Improve leaderboard position 10 times", 
                Category = "Competition", PointValue = 250,
                IconUrl = "/icons/achievements/silver-leaderboard-climber.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Personal Development & Growth
            new Achievement { 
                Id = 92, Name = "Growth Mindset", Description = "Complete 50 learning/development tasks", 
                Category = "Development", PointValue = 300,
                IconUrl = "/icons/achievements/silver-growth-mindset.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 93, Name = "Skill Builder", Description = "Complete tasks in 10 different categories", 
                Category = "Versatility", PointValue = 250,
                IconUrl = "/icons/achievements/silver-skill-builder.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 94, Name = "Habit Master", Description = "Maintain 5 different habit streaks simultaneously", 
                Category = "Habits", PointValue = 400,
                IconUrl = "/icons/achievements/silver-habit-master.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Communication & Documentation
            new Achievement { 
                Id = 95, Name = "Communicator", Description = "Add comments to 50 family tasks", 
                Category = "Communication", PointValue = 200,
                IconUrl = "/icons/achievements/silver-communicator.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 96, Name = "Detailed Planner", Description = "Create tasks with comprehensive descriptions", 
                Category = "Planning", PointValue = 150,
                IconUrl = "/icons/achievements/silver-detailed-planner.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 97, Name = "Knowledge Keeper", Description = "Maintain detailed notes for 3 months", 
                Category = "Documentation", PointValue = 300,
                IconUrl = "/icons/achievements/silver-knowledge-keeper.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Visualization & Organization
            new Achievement { 
                Id = 98, Name = "Board Master", Description = "Create and maintain 10 active boards", 
                Category = "Visualization", PointValue = 250,
                IconUrl = "/icons/achievements/silver-board-master.svg", 
                Difficulty = AchievementDifficulty.Medium, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 99, Name = "Visual Thinker", Description = "Organize 500 tasks using boards", 
                Category = "Visualization", PointValue = 300,
                IconUrl = "/icons/achievements/silver-visual-thinker.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 100, Name = "Workspace Architect", Description = "Design the perfect productivity workspace", 
                Category = "Organization", PointValue = 350,
                IconUrl = "/icons/achievements/silver-workspace-architect.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== GOLD TIER ACHIEVEMENTS (50 total) ==========
            // Elite Progress
            new Achievement { 
                Id = 101, Name = "Champion", Description = "Complete 200 tasks", 
                Category = "Progress", PointValue = 400,
                IconUrl = "/icons/achievements/gold-champion.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 102, Name = "Task Master", Description = "Complete 300 tasks", 
                Category = "Progress", PointValue = 600,
                IconUrl = "/icons/achievements/gold-task-master.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 103, Name = "Productivity Beast", Description = "Complete 50 tasks in one week", 
                Category = "Intensity", PointValue = 500,
                IconUrl = "/icons/achievements/gold-productivity-beast.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 104, Name = "Marathon Runner", Description = "Complete 100 tasks in one month", 
                Category = "Endurance", PointValue = 750,
                IconUrl = "/icons/achievements/gold-marathon-runner.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 105, Name = "Unstoppable", Description = "Complete tasks every day for 50 days", 
                Category = "Consistency", PointValue = 800,
                IconUrl = "/icons/achievements/gold-unstoppable.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Speed Excellence
            new Achievement { 
                Id = 106, Name = "Rocket Speed", Description = "Complete 20 tasks in under 5 minutes each", 
                Category = "Speed", PointValue = 400,
                IconUrl = "/icons/achievements/gold-rocket-speed.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 107, Name = "Speed of Light", Description = "Complete 30 tasks in 1 hour", 
                Category = "Speed", PointValue = 600,
                IconUrl = "/icons/achievements/gold-speed-light.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 108, Name = "Time Warp", Description = "Complete 100 tasks in 4 hours", 
                Category = "Speed", PointValue = 800,
                IconUrl = "/icons/achievements/gold-time-warp.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Streak Masters
            new Achievement { 
                Id = 109, Name = "Campfire", Description = "Maintain a 30-day streak", 
                Category = "Consistency", PointValue = 600,
                IconUrl = "/icons/achievements/gold-campfire.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 110, Name = "Bonfire", Description = "Maintain a 60-day streak", 
                Category = "Consistency", PointValue = 900,
                IconUrl = "/icons/achievements/gold-bonfire.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 111, Name = "Wildfire", Description = "Maintain a 90-day streak", 
                Category = "Consistency", PointValue = 1200,
                IconUrl = "/icons/achievements/gold-wildfire.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Quality Masters
            new Achievement { 
                Id = 112, Name = "Perfectionist", Description = "Complete 50 tasks with perfect quality", 
                Category = "Quality", PointValue = 500,
                IconUrl = "/icons/achievements/gold-perfectionist.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 113, Name = "Quality Assurance", Description = "Maintain perfect quality for 30 days", 
                Category = "Quality", PointValue = 700,
                IconUrl = "/icons/achievements/gold-quality-assurance.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 114, Name = "Craftsman", Description = "Perfect 100 tasks with detailed notes", 
                Category = "Quality", PointValue = 800,
                IconUrl = "/icons/achievements/gold-craftsman.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Leadership & Social
            new Achievement { 
                Id = 115, Name = "Leader", Description = "Lead family productivity for 14 days", 
                Category = "Leadership", PointValue = 600,
                IconUrl = "/icons/achievements/gold-leader.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 116, Name = "Mentor", Description = "Help 10 family members achieve streaks", 
                Category = "Leadership", PointValue = 700,
                IconUrl = "/icons/achievements/gold-mentor.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 117, Name = "Community Champion", Description = "Build a family of 20+ active members", 
                Category = "Community", PointValue = 1000,
                IconUrl = "/icons/achievements/gold-community-champion.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Innovation & Creation
            new Achievement { 
                Id = 118, Name = "Master Creator", Description = "Create 100 unique tasks", 
                Category = "Creation", PointValue = 500,
                IconUrl = "/icons/achievements/gold-master-creator.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 119, Name = "System Architect", Description = "Design comprehensive productivity systems", 
                Category = "Organization", PointValue = 800,
                IconUrl = "/icons/achievements/gold-system-architect.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 120, Name = "Template Wizard", Description = "Create 50 helpful templates", 
                Category = "Efficiency", PointValue = 600,
                IconUrl = "/icons/achievements/gold-template-wizard.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Focus Excellence  
            new Achievement { 
                Id = 121, Name = "Deep Focus", Description = "Complete 100 focus sessions", 
                Category = "Focus", PointValue = 700,
                IconUrl = "/icons/achievements/gold-deep-focus.svg", 
                Difficulty = AchievementDifficulty.Hard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 122, Name = "Meditation Master", Description = "Complete 50 hours of focus time", 
                Category = "Focus", PointValue = 900,
                IconUrl = "/icons/achievements/gold-meditation-master.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 123, Name = "Zen Garden", Description = "Maintain focus sessions for 60 days", 
                Category = "Focus", PointValue = 1000,
                IconUrl = "/icons/achievements/gold-zen-garden.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Time Lordship
            new Achievement { 
                Id = 124, Name = "Time Lord", Description = "Master time across all dimensions", 
                Category = "Time Mastery", PointValue = 3000,
                IconUrl = "/icons/achievements/gold-time-lord.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 125, Name = "Chronos", Description = "Control time itself", 
                Category = "Time Mastery", PointValue = 5000,
                IconUrl = "/icons/achievements/gold-chronos.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 126, Name = "Temporal Sovereign", Description = "Rule over all time and space", 
                Category = "Time Mastery", PointValue = 8000,
                IconUrl = "/icons/achievements/gold-temporal-sovereign.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Competition Dominance
            new Achievement { 
                Id = 127, Name = "Champion of Champions", Description = "Win 50 competitions", 
                Category = "Competition", PointValue = 2500,
                IconUrl = "/icons/achievements/gold-champion-champions.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 128, Name = "Undefeated", Description = "Never lose a competition for a year", 
                Category = "Dominance", PointValue = 4000,
                IconUrl = "/icons/achievements/gold-undefeated.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 129, Name = "God Mode", Description = "Achieve impossible victory records", 
                Category = "Dominance", PointValue = 7500,
                IconUrl = "/icons/achievements/gold-god-mode.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Wisdom & Teaching
            new Achievement { 
                Id = 130, Name = "Productivity Sensei", Description = "Teach 100 people productivity", 
                Category = "Teaching", PointValue = 3000,
                IconUrl = "/icons/achievements/gold-productivity-sensei.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 131, Name = "Wisdom Keeper", Description = "Preserve and share ancient wisdom", 
                Category = "Wisdom", PointValue = 4500,
                IconUrl = "/icons/achievements/gold-wisdom-keeper.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 132, Name = "Enlightened One", Description = "Achieve productivity enlightenment", 
                Category = "Enlightenment", PointValue = 7500,
                IconUrl = "/icons/achievements/gold-enlightened-one.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== PLATINUM TIER ACHIEVEMENTS (30 total) ==========
            // Legendary Status
            new Achievement { 
                Id = 133, Name = "Legend", Description = "Complete 500 tasks", 
                Category = "Legend", PointValue = 1500,
                IconUrl = "/icons/achievements/platinum-legend.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 134, Name = "Myth", Description = "Complete 750 tasks", 
                Category = "Legend", PointValue = 2000,
                IconUrl = "/icons/achievements/platinum-myth.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 135, Name = "Epic", Description = "Complete 1000 tasks", 
                Category = "Legend", PointValue = 3000,
                IconUrl = "/icons/achievements/platinum-epic.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Speed Mastery
            new Achievement { 
                Id = 136, Name = "Speed Demon", Description = "Complete 50 tasks in a single day", 
                Category = "Speed Mastery", PointValue = 2000,
                IconUrl = "/icons/achievements/platinum-speed-demon.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 137, Name = "Velocity", Description = "Maintain extreme speed for 30 days", 
                Category = "Speed Mastery", PointValue = 2500,
                IconUrl = "/icons/achievements/platinum-velocity.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 138, Name = "Hypersonic", Description = "Achieve impossible speed records", 
                Category = "Speed Mastery", PointValue = 3000,
                IconUrl = "/icons/achievements/platinum-hypersonic.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Endurance Champions
            new Achievement { 
                Id = 139, Name = "Eternal Flame", Description = "Maintain a 180-day streak", 
                Category = "Endurance", PointValue = 3000,
                IconUrl = "/icons/achievements/platinum-eternal-flame.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 140, Name = "Immortal", Description = "Maintain a 365-day streak", 
                Category = "Endurance", PointValue = 5000,
                IconUrl = "/icons/achievements/platinum-immortal.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 141, Name = "Unbreakable", Description = "Never miss a day for 2 years", 
                Category = "Endurance", PointValue = 10000,
                IconUrl = "/icons/achievements/platinum-unbreakable.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Perfection Masters
            new Achievement { 
                Id = 142, Name = "Platinum Perfectionist", Description = "Perfect quality in 200 tasks", 
                Category = "Excellence", PointValue = 2000,
                IconUrl = "/icons/achievements/platinum-perfectionist.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 143, Name = "Flawless", Description = "Perfect everything you touch", 
                Category = "Excellence", PointValue = 3000,
                IconUrl = "/icons/achievements/platinum-flawless.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 144, Name = "Divine Quality", Description = "Transcend human quality limits", 
                Category = "Excellence", PointValue = 5000,
                IconUrl = "/icons/achievements/platinum-divine-quality.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Family Empire
            new Achievement { 
                Id = 145, Name = "Family Emperor", Description = "Lead 1000 family members", 
                Category = "Empire", PointValue = 15000,
                IconUrl = "/icons/achievements/platinum-family-emperor.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 146, Name = "Global Influence", Description = "Impact productivity worldwide", 
                Category = "Global", PointValue = 25000,
                IconUrl = "/icons/achievements/platinum-global-influence.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 147, Name = "Civilization Builder", Description = "Create new productive civilizations", 
                Category = "Legacy", PointValue = 50000,
                IconUrl = "/icons/achievements/platinum-civilization-builder.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Universal Creation
            new Achievement { 
                Id = 148, Name = "Universe Creator", Description = "Create productivity universes", 
                Category = "Creation God", PointValue = 20000,
                IconUrl = "/icons/achievements/platinum-universe-creator.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 149, Name = "Reality Architect", Description = "Design new realities", 
                Category = "Divine Creation", PointValue = 40000,
                IconUrl = "/icons/achievements/platinum-reality-architect.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 150, Name = "Multiverse Master", Description = "Control infinite universes", 
                Category = "Omnipotence", PointValue = 100000,
                IconUrl = "/icons/achievements/platinum-multiverse-master.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== ONYX TIER ACHIEVEMENT (5 total) ==========
            // Ultimate Transcendence
            new Achievement { 
                Id = 151, Name = "Transcendent", Description = "Transcend all known limits", 
                Category = "Transcendence", PointValue = 100000,
                IconUrl = "/icons/achievements/onyx-transcendent.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 152, Name = "Source Code", Description = "Become the source of all productivity", 
                Category = "Origin", PointValue = 250000,
                IconUrl = "/icons/achievements/onyx-source-code.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 153, Name = "One", Description = "Achieve unity with productivity itself", 
                Category = "Unity", PointValue = 500000,
                IconUrl = "/icons/achievements/onyx-one.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 154, Name = "Void Walker", Description = "Walk between realities", 
                Category = "Transcendence", PointValue = 750000,
                IconUrl = "/icons/achievements/onyx-void-walker.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Achievement { 
                Id = 155, Name = "The Absolute", Description = "Become the absolute form of productivity", 
                Category = "Absolute", PointValue = 1000000,
                IconUrl = "/icons/achievements/onyx-absolute.svg", 
                Difficulty = AchievementDifficulty.VeryHard, CreatedAt = new DateTime(2025, 1, 1) 
            }
        );
    }

    private static void SeedBadges(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Badge>().HasData(
            // ========== CHARACTER CLASS BADGES (20 total) ==========
            new Badge { 
                Id = 1, Name = "Warrior", Description = "Complete 25 tasks with high priority", 
                Category = "Character", IconUrl = "/icons/badges/character-warrior.svg", 
                Criteria = "Complete 25 high priority tasks", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "red-bronze", DisplayOrder = 1, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 2, Name = "Mage", Description = "Complete 20 learning or research tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-mage.svg", 
                Criteria = "Complete 20 learning tasks", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "blue-bronze", DisplayOrder = 2, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 3, Name = "Rogue", Description = "Complete 15 tasks ahead of schedule", 
                Category = "Character", IconUrl = "/icons/badges/character-rogue.svg", 
                Criteria = "Complete 15 tasks early", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "green-bronze", DisplayOrder = 3, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 4, Name = "Paladin", Description = "Help family members with 10 tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-paladin.svg", 
                Criteria = "Complete 10 family tasks", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "gold-bronze", DisplayOrder = 4, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 5, Name = "Archer", Description = "Complete 30 tasks with precision timing", 
                Category = "Character", IconUrl = "/icons/badges/character-archer.svg", 
                Criteria = "Complete 30 tasks on time", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "brown-bronze", DisplayOrder = 5, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 6, Name = "Assassin", Description = "Complete 20 tasks in stealth mode (early morning/late night)", 
                Category = "Character", IconUrl = "/icons/badges/character-assassin.svg", 
                Criteria = "Complete 20 tasks before 7 AM or after 11 PM", Rarity = "Rare", Tier = "bronze", PointValue = 150,
                ColorScheme = "black-bronze", DisplayOrder = 6, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== SILVER TIER CHARACTER BADGES ==========
            new Badge { 
                Id = 7, Name = "Elite Warrior", Description = "Complete 100 high priority tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-warrior-silver.svg", 
                Criteria = "Complete 100 high priority tasks", Rarity = "Rare", Tier = "silver", PointValue = 250,
                ColorScheme = "red-silver", DisplayOrder = 7, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 8, Name = "Archmage", Description = "Complete 75 learning tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-mage-silver.svg", 
                Criteria = "Complete 75 learning tasks", Rarity = "Rare", Tier = "silver", PointValue = 250,
                ColorScheme = "blue-silver", DisplayOrder = 8, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 9, Name = "Master Thief", Description = "Complete 50 tasks ahead of schedule", 
                Category = "Character", IconUrl = "/icons/badges/character-rogue-silver.svg", 
                Criteria = "Complete 50 tasks early", Rarity = "Rare", Tier = "silver", PointValue = 250,
                ColorScheme = "green-silver", DisplayOrder = 9, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 10, Name = "Crusader", Description = "Help family members with 50 tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-paladin-silver.svg", 
                Criteria = "Complete 50 family tasks", Rarity = "Rare", Tier = "silver", PointValue = 250,
                ColorScheme = "gold-silver", DisplayOrder = 10, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== GOLD TIER CHARACTER BADGES ==========
            new Badge { 
                Id = 11, Name = "Legendary Warrior", Description = "Complete 500 high priority tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-warrior-gold.svg", 
                Criteria = "Complete 500 high priority tasks", Rarity = "Epic", Tier = "gold", PointValue = 500,
                ColorScheme = "red-gold", DisplayOrder = 11, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 12, Name = "Grand Wizard", Description = "Complete 300 learning tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-mage-gold.svg", 
                Criteria = "Complete 300 learning tasks", Rarity = "Epic", Tier = "gold", PointValue = 500,
                ColorScheme = "blue-gold", DisplayOrder = 12, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 13, Name = "Shadow Master", Description = "Complete 200 tasks ahead of schedule", 
                Category = "Character", IconUrl = "/icons/badges/character-rogue-gold.svg", 
                Criteria = "Complete 200 tasks early", Rarity = "Epic", Tier = "gold", PointValue = 500,
                ColorScheme = "green-gold", DisplayOrder = 13, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 14, Name = "Divine Champion", Description = "Help family members with 200 tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-paladin-gold.svg", 
                Criteria = "Complete 200 family tasks", Rarity = "Epic", Tier = "gold", PointValue = 500,
                ColorScheme = "gold-gold", DisplayOrder = 14, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 15, Name = "Master Archer", Description = "Complete 400 tasks with perfect timing", 
                Category = "Character", IconUrl = "/icons/badges/character-archer-gold.svg", 
                Criteria = "Complete 400 tasks on time", Rarity = "Epic", Tier = "gold", PointValue = 500,
                ColorScheme = "brown-gold", DisplayOrder = 15, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 16, Name = "Night Emperor", Description = "Complete 150 stealth tasks", 
                Category = "Character", IconUrl = "/icons/badges/character-assassin-gold.svg", 
                Criteria = "Complete 150 tasks before 7 AM or after 11 PM", Rarity = "Legendary", Tier = "gold", PointValue = 750,
                ColorScheme = "black-gold", DisplayOrder = 16, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== STREAK BADGES (10 total) ==========
            new Badge { 
                Id = 17, Name = "Fire Starter", Description = "Maintain a 7-day task completion streak", 
                Category = "Streak", IconUrl = "/icons/badges/streak-fire-starter.svg", 
                Criteria = "7 day completion streak", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "orange-bronze", DisplayOrder = 17, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 18, Name = "Flame Keeper", Description = "Maintain a 14-day streak", 
                Category = "Streak", IconUrl = "/icons/badges/streak-flame-keeper.svg", 
                Criteria = "14 day completion streak", Rarity = "Common", Tier = "bronze", PointValue = 150,
                ColorScheme = "orange-bronze", DisplayOrder = 18, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 19, Name = "Inferno Master", Description = "Maintain a 30-day streak", 
                Category = "Streak", IconUrl = "/icons/badges/streak-inferno-master.svg", 
                Criteria = "30 day completion streak", Rarity = "Rare", Tier = "silver", PointValue = 300,
                ColorScheme = "orange-silver", DisplayOrder = 19, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 20, Name = "Eternal Flame", Description = "Maintain a 100-day streak", 
                Category = "Streak", IconUrl = "/icons/badges/streak-eternal-flame.svg", 
                Criteria = "100 day completion streak", Rarity = "Epic", Tier = "gold", PointValue = 1000,
                ColorScheme = "orange-gold", DisplayOrder = 20, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 21, Name = "Phoenix Rising", Description = "Return to complete tasks after a 30+ day break", 
                Category = "Streak", IconUrl = "/icons/badges/streak-phoenix-rising.svg", 
                Criteria = "Complete task after 30+ day break", Rarity = "Rare", Tier = "silver", PointValue = 200,
                ColorScheme = "phoenix-silver", DisplayOrder = 21, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== SPEED BADGES (8 total) ==========
            new Badge { 
                Id = 22, Name = "Quicksilver", Description = "Complete 10 tasks in under 5 minutes each", 
                Category = "Speed", IconUrl = "/icons/badges/speed-quicksilver.svg", 
                Criteria = "Complete 10 tasks under 5 minutes each", Rarity = "Common", Tier = "bronze", PointValue = 75,
                ColorScheme = "silver-bronze", DisplayOrder = 22, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 23, Name = "Lightning", Description = "Complete 25 tasks in under 10 minutes each", 
                Category = "Speed", IconUrl = "/icons/badges/speed-lightning.svg", 
                Criteria = "Complete 25 tasks under 10 minutes each", Rarity = "Rare", Tier = "silver", PointValue = 200,
                ColorScheme = "yellow-silver", DisplayOrder = 23, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 24, Name = "Speed Demon", Description = "Complete 50 tasks in under 15 minutes each", 
                Category = "Speed", IconUrl = "/icons/badges/speed-demon.svg", 
                Criteria = "Complete 50 tasks under 15 minutes each", Rarity = "Epic", Tier = "gold", PointValue = 400,
                ColorScheme = "red-gold", DisplayOrder = 24, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 25, Name = "Time Lord", Description = "Complete 100 tasks ahead of estimated time", 
                Category = "Speed", IconUrl = "/icons/badges/speed-time-lord.svg", 
                Criteria = "Complete 100 tasks ahead of estimated time", Rarity = "Legendary", Tier = "platinum", PointValue = 1000,
                ColorScheme = "time-platinum", DisplayOrder = 25, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== COLLABORATION BADGES (8 total) ==========
            new Badge { 
                Id = 26, Name = "Team Player", Description = "Complete 10 family tasks", 
                Category = "Social", IconUrl = "/icons/badges/social-team-player.svg", 
                Criteria = "Complete 10 family tasks", Rarity = "Common", Tier = "bronze", PointValue = 100,
                ColorScheme = "green-bronze", DisplayOrder = 26, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 27, Name = "Family Hero", Description = "Complete 50 family tasks", 
                Category = "Social", IconUrl = "/icons/badges/social-family-hero.svg", 
                Criteria = "Complete 50 family tasks", Rarity = "Rare", Tier = "silver", PointValue = 300,
                ColorScheme = "green-silver", DisplayOrder = 27, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 28, Name = "Unity Champion", Description = "Complete 150 family tasks", 
                Category = "Social", IconUrl = "/icons/badges/social-unity-champion.svg", 
                Criteria = "Complete 150 family tasks", Rarity = "Epic", Tier = "gold", PointValue = 750,
                ColorScheme = "green-gold", DisplayOrder = 28, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 29, Name = "Event Master", Description = "Create and complete 5 family events", 
                Category = "Social", IconUrl = "/icons/badges/social-event-master.svg", 
                Criteria = "Create and complete 5 family events", Rarity = "Rare", Tier = "silver", PointValue = 250,
                ColorScheme = "party-silver", DisplayOrder = 29, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== MILESTONE BADGES (10 total) ==========
            new Badge { 
                Id = 30, Name = "Centurion", Description = "Complete 100 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-centurion.svg", 
                Criteria = "Complete 100 total tasks", Rarity = "Common", Tier = "bronze", PointValue = 200,
                ColorScheme = "bronze-bronze", DisplayOrder = 30, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 31, Name = "Gladiator", Description = "Complete 500 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-gladiator.svg", 
                Criteria = "Complete 500 total tasks", Rarity = "Rare", Tier = "silver", PointValue = 500,
                ColorScheme = "bronze-silver", DisplayOrder = 31, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 32, Name = "Champion", Description = "Complete 1000 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-champion.svg", 
                Criteria = "Complete 1000 total tasks", Rarity = "Epic", Tier = "gold", PointValue = 1000,
                ColorScheme = "bronze-gold", DisplayOrder = 32, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 33, Name = "Legend", Description = "Complete 2500 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-legend.svg", 
                Criteria = "Complete 2500 total tasks", Rarity = "Legendary", Tier = "platinum", PointValue = 2500,
                ColorScheme = "bronze-platinum", DisplayOrder = 33, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 34, Name = "Immortal", Description = "Complete 5000 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-immortal.svg", 
                Criteria = "Complete 5000 total tasks", Rarity = "Legendary", Tier = "diamond", PointValue = 5000,
                ColorScheme = "rainbow-diamond", DisplayOrder = 34, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 35, Name = "Transcendent", Description = "Complete 10000 total tasks", 
                Category = "Milestone", IconUrl = "/icons/badges/milestone-transcendent.svg", 
                Criteria = "Complete 10000 total tasks", Rarity = "Legendary", Tier = "onyx", PointValue = 10000,
                ColorScheme = "cosmic-onyx", DisplayOrder = 35, CreatedAt = new DateTime(2025, 1, 1)
            },

            // ========== SPECIAL ACHIEVEMENTS (15 total) ==========
            new Badge { 
                Id = 36, Name = "First Blood", Description = "Complete your very first task", 
                Category = "Special", IconUrl = "/icons/badges/special-first-blood.svg", 
                Criteria = "Complete first task", Rarity = "Common", Tier = "bronze", PointValue = 50,
                ColorScheme = "red-bronze", DisplayOrder = 36, IsSpecial = true, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 37, Name = "Birthday Bash", Description = "Complete tasks on your birthday", 
                Category = "Special", IconUrl = "/icons/badges/special-birthday-bash.svg", 
                Criteria = "Complete task on birthday", Rarity = "Rare", Tier = "gold", PointValue = 500,
                ColorScheme = "party-gold", DisplayOrder = 37, IsSpecial = true, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 38, Name = "New Year's Resolution", Description = "Complete 31 tasks in January", 
                Category = "Special", IconUrl = "/icons/badges/special-new-year.svg", 
                Criteria = "Complete 31 tasks in January", Rarity = "Epic", Tier = "gold", PointValue = 365,
                ColorScheme = "fireworks-gold", DisplayOrder = 38, IsSpecial = true, CreatedAt = new DateTime(2025, 1, 1)
            },
            new Badge { 
                Id = 39, Name = "Valentine's Helper", Description = "Complete romantic/relationship tasks in February", 
                Category = "Special", IconUrl = "/icons/badges/special-valentine.svg", 
                Criteria = "Complete relationship tasks in February", Rarity = "Rare", Tier = "silver", PointValue = 200,
                ColorScheme = "love-silver", DisplayOrder = 39, IsSpecial = true, CreatedAt = new DateTime(2025, 1, 1)
            }
        );
    }

    private static void SeedRewards(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Reward>().HasData(
            // ========== CHARACTER CUSTOMIZATION REWARDS (20 total) ==========
            // Basic Customization
            new Reward { 
                Id = 1, Name = "Custom Avatar", Description = "Unlock avatar customization options", 
                Category = "Customization", PointCost = 100, MinimumLevel = 2, 
                IconPath = "/icons/rewards/custom-avatar.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 2, Name = "Theme Colors", Description = "Unlock premium theme color schemes", 
                Category = "Customization", PointCost = 150, MinimumLevel = 3, 
                IconPath = "/icons/rewards/theme-colors.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 3, Name = "Profile Backgrounds", Description = "Unlock beautiful profile backgrounds", 
                Category = "Customization", PointCost = 200, MinimumLevel = 4, 
                IconPath = "/icons/rewards/profile-backgrounds.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 4, Name = "Custom Fonts", Description = "Unlock premium typography options", 
                Category = "Customization", PointCost = 250, MinimumLevel = 5, 
                IconPath = "/icons/rewards/custom-fonts.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 5, Name = "Animated Avatars", Description = "Unlock animated avatar options", 
                Category = "Premium", PointCost = 500, MinimumLevel = 10, 
                IconPath = "/icons/rewards/animated-avatars.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 6, Name = "Particle Effects", Description = "Add magical particle effects", 
                Category = "Premium", PointCost = 800, MinimumLevel = 15, 
                IconPath = "/icons/rewards/particle-effects.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 7, Name = "Dynamic Themes", Description = "Themes that change with progress", 
                Category = "Premium", PointCost = 1000, MinimumLevel = 20, 
                IconPath = "/icons/rewards/dynamic-themes.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 8, Name = "Custom Sound Effects", Description = "Personalized audio feedback", 
                Category = "Audio", PointCost = 600, MinimumLevel = 12, 
                IconPath = "/icons/rewards/custom-sounds.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 9, Name = "Victory Fanfares", Description = "Epic completion celebrations", 
                Category = "Audio", PointCost = 750, MinimumLevel = 15, 
                IconPath = "/icons/rewards/victory-fanfares.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 10, Name = "Ambient Soundscapes", Description = "Focus-enhancing background audio", 
                Category = "Audio", PointCost = 400, MinimumLevel = 8, 
                IconPath = "/icons/rewards/ambient-sounds.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // Elite Customization
            new Reward { 
                Id = 11, Name = "Holographic Effects", Description = "Futuristic holographic interface", 
                Category = "Elite", PointCost = 2000, MinimumLevel = 30, 
                IconPath = "/icons/rewards/holographic-effects.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 12, Name = "Reality Distortion", Description = "Bend space and time in your interface", 
                Category = "Legendary", PointCost = 5000, MinimumLevel = 50, 
                IconPath = "/icons/rewards/reality-distortion.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 13, Name = "Quantum Interface", Description = "Multiple reality interface overlay", 
                Category = "Mythic", PointCost = 10000, MinimumLevel = 75, 
                IconPath = "/icons/rewards/quantum-interface.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 14, Name = "Cosmic Themes", Description = "Universe-spanning visual themes", 
                Category = "Cosmic", PointCost = 15000, MinimumLevel = 100, 
                IconPath = "/icons/rewards/cosmic-themes.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 15, Name = "Avatar Transcendence", Description = "Beyond physical avatar forms", 
                Category = "Transcendent", PointCost = 25000, MinimumLevel = 150, 
                IconPath = "/icons/rewards/avatar-transcendence.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== CHARACTER CLASS UNLOCKS (15 total) ==========
            new Reward { 
                Id = 16, Name = "Warrior Class", Description = "Unlock the Warrior character class", 
                Category = "Character", PointCost = 250, MinimumLevel = 5, 
                IconPath = "/icons/rewards/warrior-unlock.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 17, Name = "Mage Class", Description = "Unlock the Mage character class", 
                Category = "Character", PointCost = 400, MinimumLevel = 8, 
                IconPath = "/icons/rewards/mage-unlock.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 18, Name = "Guardian Class", Description = "Unlock the Guardian character class", 
                Category = "Character", PointCost = 600, MinimumLevel = 12, 
                IconPath = "/icons/rewards/guardian-unlock.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 19, Name = "Speedster Class", Description = "Unlock the Speedster character class", 
                Category = "Character", PointCost = 800, MinimumLevel = 15, 
                IconPath = "/icons/rewards/speedster-unlock.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 20, Name = "Healer Class", Description = "Unlock the Healer character class", 
                Category = "Character", PointCost = 1000, MinimumLevel = 18, 
                IconPath = "/icons/rewards/healer-unlock.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== PRODUCTIVITY BOOSTERS (10 total) ==========
            new Reward { 
                Id = 21, Name = "Priority Boost", Description = "Double points for next 5 high-priority tasks", 
                Category = "Boost", PointCost = 300, MinimumLevel = 6, Quantity = 10, 
                IconPath = "/icons/rewards/priority-boost.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 22, Name = "Streak Shield", Description = "Protect your streak for 3 days", 
                Category = "Boost", PointCost = 500, MinimumLevel = 10, Quantity = 5, 
                IconPath = "/icons/rewards/streak-shield.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 23, Name = "XP Multiplier", Description = "Double XP for 24 hours", 
                Category = "Boost", PointCost = 400, MinimumLevel = 8, Quantity = 10, 
                IconPath = "/icons/rewards/xp-multiplier.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 24, Name = "Focus Enhancer", Description = "Enhanced focus session benefits", 
                Category = "Boost", PointCost = 350, MinimumLevel = 7, Quantity = 15, 
                IconPath = "/icons/rewards/focus-enhancer.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 25, Name = "Speed Boost", Description = "Bonus points for fast completion", 
                Category = "Boost", PointCost = 250, MinimumLevel = 5, Quantity = 20, 
                IconPath = "/icons/rewards/speed-boost.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== DIGITAL COLLECTIBLES (10 total) ==========
            new Reward { 
                Id = 26, Name = "Golden Trophy", Description = "Rare digital trophy for your collection", 
                Category = "Collectible", PointCost = 2000, MinimumLevel = 30, Quantity = 1, 
                IconPath = "/icons/rewards/golden-trophy.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 27, Name = "Crystal Orb", Description = "Mystical crystal containing ancient wisdom", 
                Category = "Collectible", PointCost = 3000, MinimumLevel = 35, Quantity = 1, 
                IconPath = "/icons/rewards/crystal-orb.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 28, Name = "Phoenix Feather", Description = "Feather from the legendary Phoenix", 
                Category = "Collectible", PointCost = 5000, MinimumLevel = 50, Quantity = 1, 
                IconPath = "/icons/rewards/phoenix-feather.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 29, Name = "Dragon Scale", Description = "Scale from an ancient dragon", 
                Category = "Collectible", PointCost = 7500, MinimumLevel = 60, Quantity = 1, 
                IconPath = "/icons/rewards/dragon-scale.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Reward { 
                Id = 30, Name = "Cosmic Dust", Description = "Stardust from the birth of universe", 
                Category = "Cosmic", PointCost = 10000, MinimumLevel = 75, Quantity = 1, 
                IconPath = "/icons/rewards/cosmic-dust.svg", IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            }
        );
    }

    private static void SeedChallenges(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Challenge>().HasData(
            // ========== DAILY CHALLENGES (15 total) ==========
            new Challenge { 
                Id = 1, Name = "Daily Dynamo", Description = "Complete 5 tasks in a single day", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 50, ActivityType = "DailyCompletion", TargetCount = 5, 
                Difficulty = 2, PointsRequired = 0, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 2, Name = "Speed Racer", Description = "Complete 3 tasks within 30 minutes", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 75, ActivityType = "SpeedCompletion", TargetCount = 3, 
                Difficulty = 3, PointsRequired = 100, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 3, Name = "Early Bird Special", Description = "Complete 2 tasks before 9 AM", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 60, ActivityType = "EarlyCompletion", TargetCount = 2, 
                Difficulty = 2, PointsRequired = 50, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 4, Name = "Night Owl Challenge", Description = "Complete 3 tasks after 10 PM", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 55, ActivityType = "LateCompletion", TargetCount = 3, 
                Difficulty = 2, PointsRequired = 50, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 5, Name = "Perfect Day", Description = "Complete all tasks with perfect quality today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 100, ActivityType = "PerfectQuality", TargetCount = 1, 
                Difficulty = 3, PointsRequired = 200, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 6, Name = "Category Explorer", Description = "Complete tasks in 3 different categories today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 70, ActivityType = "CategoryDiversity", TargetCount = 3, 
                Difficulty = 2, PointsRequired = 75, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 7, Name = "Focus Warrior", Description = "Complete 2 focus sessions today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 80, ActivityType = "FocusSessions", TargetCount = 2, 
                Difficulty = 2, PointsRequired = 100, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 8, Name = "Priority Master", Description = "Complete 3 high-priority tasks today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 90, ActivityType = "HighPriority", TargetCount = 3, 
                Difficulty = 3, PointsRequired = 150, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 9, Name = "Social Butterfly", Description = "Complete 3 family tasks today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 85, ActivityType = "FamilyTasks", TargetCount = 3, 
                Difficulty = 2, PointsRequired = 100, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 10, Name = "Lightning Fast", Description = "Complete 10 tasks in under 2 hours", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 150, ActivityType = "SuperSpeed", TargetCount = 10, 
                Difficulty = 4, PointsRequired = 300, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 11, Name = "Organizer Supreme", Description = "Create 2 new categories and organize tasks", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 95, ActivityType = "Organization", TargetCount = 2, 
                Difficulty = 2, PointsRequired = 75, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 12, Name = "Template Creator", Description = "Create 1 task template today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 65, ActivityType = "TemplateCreation", TargetCount = 1, 
                Difficulty = 2, PointsRequired = 50, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 13, Name = "Note Taker", Description = "Add detailed notes to 5 tasks today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 75, ActivityType = "Documentation", TargetCount = 5, 
                Difficulty = 2, PointsRequired = 75, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 14, Name = "Board Master", Description = "Organize 10 tasks using boards today", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 80, ActivityType = "BoardUsage", TargetCount = 10, 
                Difficulty = 2, PointsRequired = 100, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 15, Name = "Reminder Pro", Description = "Set 5 reminders for future tasks", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 60, ActivityType = "ReminderSetting", TargetCount = 5, 
                Difficulty = 2, PointsRequired = 50, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== WEEKLY CHALLENGES (15 total) ==========
            new Challenge { 
                Id = 16, Name = "Weekly Warrior", Description = "Complete 25 tasks in a week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 200, ActivityType = "WeeklyCompletion", TargetCount = 25, 
                Difficulty = 3, PointsRequired = 500, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 17, Name = "Consistency King", Description = "Complete at least 1 task every day for a week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 250, ActivityType = "ConsistentDaily", TargetCount = 7, 
                Difficulty = 3, PointsRequired = 300, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 18, Name = "Speed Week", Description = "Complete 50 tasks in under 5 minutes each this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 400, ActivityType = "WeeklySpeed", TargetCount = 50, 
                Difficulty = 4, PointsRequired = 1000, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 19, Name = "Perfect Week", Description = "Complete all tasks with perfect quality for a week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 500, ActivityType = "WeeklyPerfection", TargetCount = 7, 
                Difficulty = 5, PointsRequired = 1500, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 20, Name = "Family Champion", Description = "Lead family leaderboard for a week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 350, ActivityType = "WeeklyLeader", TargetCount = 7, 
                Difficulty = 4, PointsRequired = 800, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 21, Name = "Focus Master", Description = "Complete 20 focus sessions this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 300, ActivityType = "WeeklyFocus", TargetCount = 20, 
                Difficulty = 3, PointsRequired = 600, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 22, Name = "Category Conqueror", Description = "Complete tasks in 10 different categories this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 275, ActivityType = "CategoryMastery", TargetCount = 10, 
                Difficulty = 3, PointsRequired = 400, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 23, Name = "Priority Pro", Description = "Complete 20 high-priority tasks this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 325, ActivityType = "WeeklyPriority", TargetCount = 20, 
                Difficulty = 3, PointsRequired = 500, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 24, Name = "Early Bird Week", Description = "Complete 15 tasks before 9 AM this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 280, ActivityType = "WeeklyEarly", TargetCount = 15, 
                Difficulty = 3, PointsRequired = 350, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 25, Name = "Collaboration Master", Description = "Help family complete 15 tasks this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 290, ActivityType = "WeeklyCollaboration", TargetCount = 15, 
                Difficulty = 3, PointsRequired = 400, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 26, Name = "Template Week", Description = "Create 5 task templates this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 220, ActivityType = "WeeklyTemplates", TargetCount = 5, 
                Difficulty = 2, PointsRequired = 250, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 27, Name = "Organization Week", Description = "Create 10 categories and organize perfectly", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 240, ActivityType = "WeeklyOrganization", TargetCount = 10, 
                Difficulty = 3, PointsRequired = 300, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 28, Name = "Board Architect", Description = "Create and organize 5 boards this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 260, ActivityType = "WeeklyBoards", TargetCount = 5, 
                Difficulty = 3, PointsRequired = 350, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 29, Name = "Documentation Week", Description = "Add comprehensive notes to 25 tasks", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 230, ActivityType = "WeeklyDocumentation", TargetCount = 25, 
                Difficulty = 2, PointsRequired = 200, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 30, Name = "Automation Week", Description = "Set up 10 recurring tasks this week", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 270, ActivityType = "WeeklyAutomation", TargetCount = 10, 
                Difficulty = 3, PointsRequired = 400, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },

            // ========== MONTHLY CHALLENGES (10 total) ==========
            new Challenge { 
                Id = 31, Name = "Monthly Master", Description = "Complete 100 tasks in a month", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 500, ActivityType = "MonthlyCompletion", TargetCount = 100, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 32, Name = "Streak Legend", Description = "Maintain a 30-day streak", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 750, ActivityType = "StreakMaintenance", TargetCount = 30, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 33, Name = "Monthly Perfectionist", Description = "Perfect quality for entire month", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 1000, ActivityType = "MonthlyPerfection", TargetCount = 30, 
                Difficulty = 5, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 34, Name = "Speed Month", Description = "Complete 200 tasks in under 5 minutes each", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 800, ActivityType = "MonthlySpeed", TargetCount = 200, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 35, Name = "Family Emperor", Description = "Lead family for entire month", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 900, ActivityType = "MonthlyDominance", TargetCount = 30, 
                Difficulty = 5, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 36, Name = "Focus Transcendence", Description = "Complete 100 focus sessions in a month", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 700, ActivityType = "MonthlyFocus", TargetCount = 100, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 37, Name = "System Architect", Description = "Create comprehensive productivity system", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 600, ActivityType = "MonthlySystemBuilding", TargetCount = 1, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 38, Name = "Innovation Master", Description = "Create 50 unique tasks and templates", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 650, ActivityType = "MonthlyInnovation", TargetCount = 50, 
                Difficulty = 3, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 39, Name = "Community Builder", Description = "Help 50 family members achieve their goals", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 850, ActivityType = "MonthlyCommunity", TargetCount = 50, 
                Difficulty = 4, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            },
            new Challenge { 
                Id = 40, Name = "Ultimate Achiever", Description = "Unlock 20 different achievements", 
                StartDate = new DateTime(2025, 1, 1), EndDate = new DateTime(2025, 12, 31), 
                PointReward = 1000, ActivityType = "AchievementUnlock", TargetCount = 20, 
                Difficulty = 5, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) 
            }
        );
    }
}