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

namespace TaskTrackerAPI.Data;

public static class KanbanBoardSeedData
{
    public static void SeedKanbanBoardData(ModelBuilder modelBuilder)
    {
        SeedBoardTemplates(modelBuilder);
        SeedBoardTemplateColumns(modelBuilder);
    }

    private static void SeedBoardTemplates(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoardTemplate>().HasData(
            // Basic Templates
            new BoardTemplate
            {
                Id = 1,
                Name = "Basic Kanban",
                Description = "Simple three-column board for basic task management",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = true,
                Category = "General",
                Tags = "kanban,basic,simple",
                LayoutConfiguration = "{\"theme\":\"default\",\"layout\":\"standard\"}",
                UsageCount = 0,
                AverageRating = null,
                RatingCount = 0,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 2,
                Name = "Software Development",
                Description = "Agile development board with bug tracking and code review columns",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = true,
                Category = "Development",
                Tags = "agile,development,software,scrum",
                LayoutConfiguration = "{\"theme\":\"developer\",\"layout\":\"extended\"}",
                UsageCount = 0,
                AverageRating = 4.5m,
                RatingCount = 12,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 3,
                Name = "Content Creation",
                Description = "Board designed for content creators with ideation, writing, and publishing phases",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = true,
                Category = "Creative",
                Tags = "content,writing,marketing,creative",
                LayoutConfiguration = "{\"theme\":\"creative\",\"layout\":\"workflow\"}",
                UsageCount = 0,
                AverageRating = 4.2m,
                RatingCount = 8,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 4,
                Name = "Project Management",
                Description = "Comprehensive project management board with detailed workflow stages",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = true,
                Category = "Business",
                Tags = "project,management,business,workflow",
                LayoutConfiguration = "{\"theme\":\"professional\",\"layout\":\"detailed\"}",
                UsageCount = 0,
                AverageRating = 4.7m,
                RatingCount = 15,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 5,
                Name = "Personal Tasks",
                Description = "Simple personal productivity board for daily task management",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = true,
                Category = "Personal",
                Tags = "personal,productivity,daily,tasks",
                LayoutConfiguration = "{\"theme\":\"minimal\",\"layout\":\"simple\"}",
                UsageCount = 0,
                AverageRating = 4.0m,
                RatingCount = 5,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 6,
                Name = "Marketing Campaign",
                Description = "Track marketing campaigns from ideation to launch and analysis",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = false,
                Category = "Marketing",
                Tags = "marketing,campaign,social,advertising",
                LayoutConfiguration = "{\"theme\":\"marketing\",\"layout\":\"campaign\"}",
                UsageCount = 0,
                AverageRating = 4.3m,
                RatingCount = 7,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 7,
                Name = "Bug Tracking",
                Description = "Dedicated board for tracking and resolving software bugs",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = false,
                Category = "Development",
                Tags = "bugs,testing,qa,development",
                LayoutConfiguration = "{\"theme\":\"bug-tracker\",\"layout\":\"priority\"}",
                UsageCount = 0,
                AverageRating = 4.6m,
                RatingCount = 11,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 8,
                Name = "Event Planning",
                Description = "Organize events from initial planning to post-event follow-up",
                CreatedByUserId = null, // System template
                IsPublic = true,
                IsDefault = false,
                Category = "Events",
                Tags = "events,planning,coordination,logistics",
                LayoutConfiguration = "{\"theme\":\"events\",\"layout\":\"timeline\"}",
                UsageCount = 0,
                AverageRating = 4.1m,
                RatingCount = 6,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Family & Household Templates
            new BoardTemplate
            {
                Id = 9,
                Name = "Simple To-Do",
                Description = "Basic task tracking with minimal columns",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = true,
                Category = "Personal",
                Tags = "minimal,simple,todo,basic",
                LayoutConfiguration = "{\"theme\":\"minimal\",\"layout\":\"simple\"}",
                UsageCount = 0,
                AverageRating = 4.2m,
                RatingCount = 8,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 10,
                Name = "Family Chores",
                Description = "Perfect for organizing household tasks and chores",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = true,
                Category = "Family",
                Tags = "household,chores,family,cleaning",
                LayoutConfiguration = "{\"theme\":\"family\",\"layout\":\"chores\"}",
                UsageCount = 0,
                AverageRating = 4.4m,
                RatingCount = 12,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 11,
                Name = "Weekly Cleaning",
                Description = "Organize weekly cleaning tasks by room and priority",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Family",
                Tags = "cleaning,weekly,household,maintenance",
                LayoutConfiguration = "{\"theme\":\"cleaning\",\"layout\":\"weekly\"}",
                UsageCount = 0,
                AverageRating = 4.0m,
                RatingCount = 5,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 12,
                Name = "Meal Planning",
                Description = "Plan meals, shopping, and cooking tasks",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Family",
                Tags = "meals,cooking,shopping,planning",
                LayoutConfiguration = "{\"theme\":\"cooking\",\"layout\":\"meal-plan\"}",
                UsageCount = 0,
                AverageRating = 4.3m,
                RatingCount = 9,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 13,
                Name = "Home Maintenance",
                Description = "Track home repairs and maintenance tasks",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Family",
                Tags = "maintenance,repairs,home,diy",
                LayoutConfiguration = "{\"theme\":\"maintenance\",\"layout\":\"repair\"}",
                UsageCount = 0,
                AverageRating = 4.1m,
                RatingCount = 7,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Education Templates
            new BoardTemplate
            {
                Id = 14,
                Name = "School Projects",
                Description = "Organize homework and school assignments",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Education",
                Tags = "school,homework,education,students",
                LayoutConfiguration = "{\"theme\":\"education\",\"layout\":\"homework\"}",
                UsageCount = 0,
                AverageRating = 4.2m,
                RatingCount = 6,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 15,
                Name = "Kids Activities",
                Description = "Track children's activities and commitments",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Education",
                Tags = "kids,activities,schedule,extracurricular",
                LayoutConfiguration = "{\"theme\":\"kids\",\"layout\":\"activities\"}",
                UsageCount = 0,
                AverageRating = 4.0m,
                RatingCount = 4,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 16,
                Name = "Reading Goals",
                Description = "Track family reading goals and book lists",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Education",
                Tags = "reading,books,education,goals",
                LayoutConfiguration = "{\"theme\":\"reading\",\"layout\":\"books\"}",
                UsageCount = 0,
                AverageRating = 4.1m,
                RatingCount = 5,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Health & Wellness Templates
            new BoardTemplate
            {
                Id = 17,
                Name = "Family Health",
                Description = "Track appointments, medications, and health goals",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Health",
                Tags = "health,medical,appointments,wellness",
                LayoutConfiguration = "{\"theme\":\"health\",\"layout\":\"medical\"}",
                UsageCount = 0,
                AverageRating = 4.2m,
                RatingCount = 8,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 18,
                Name = "Fitness Goals",
                Description = "Track family fitness activities and goals",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Health",
                Tags = "fitness,exercise,health,goals",
                LayoutConfiguration = "{\"theme\":\"fitness\",\"layout\":\"workout\"}",
                UsageCount = 0,
                AverageRating = 4.0m,
                RatingCount = 6,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Events & Planning Templates
            new BoardTemplate
            {
                Id = 19,
                Name = "Birthday Planning",
                Description = "Plan birthday parties and celebrations",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Events",
                Tags = "birthday,party,celebration,planning",
                LayoutConfiguration = "{\"theme\":\"party\",\"layout\":\"birthday\"}",
                UsageCount = 0,
                AverageRating = 4.3m,
                RatingCount = 7,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 20,
                Name = "Holiday Planning",
                Description = "Organize holiday preparations and traditions",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Events",
                Tags = "holiday,traditions,celebration,seasonal",
                LayoutConfiguration = "{\"theme\":\"holiday\",\"layout\":\"seasonal\"}",
                UsageCount = 0,
                AverageRating = 4.2m,
                RatingCount = 9,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new BoardTemplate
            {
                Id = 21,
                Name = "Vacation Planning",
                Description = "Plan family trips and vacations",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Events",
                Tags = "vacation,travel,planning,family",
                LayoutConfiguration = "{\"theme\":\"travel\",\"layout\":\"vacation\"}",
                UsageCount = 0,
                AverageRating = 4.4m,
                RatingCount = 11,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Financial Templates
            new BoardTemplate
            {
                Id = 22,
                Name = "Family Budget",
                Description = "Track family expenses and financial goals",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Financial",
                Tags = "budget,finance,money,expenses",
                LayoutConfiguration = "{\"theme\":\"finance\",\"layout\":\"budget\"}",
                UsageCount = 0,
                AverageRating = 4.1m,
                RatingCount = 6,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            // Seasonal Templates
            new BoardTemplate
            {
                Id = 23,
                Name = "Garden Planning",
                Description = "Plan and track gardening activities",
                CreatedByUserId = null,
                IsPublic = true,
                IsDefault = false,
                Category = "Seasonal",
                Tags = "garden,plants,seasonal,outdoor",
                LayoutConfiguration = "{\"theme\":\"garden\",\"layout\":\"seasonal\"}",
                UsageCount = 0,
                AverageRating = 4.0m,
                RatingCount = 5,
                PreviewImageUrl = null,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            }
        );
    }

    private static void SeedBoardTemplateColumns(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoardTemplateColumn>().HasData(
            // Basic Kanban Template (ID: 1) - 3 columns
            new BoardTemplateColumn
            {
                Id = 1,
                BoardTemplateId = 1,
                Name = "To Do",
                Description = "Tasks that need to be started",
                Order = 1,
                Color = "#6B7280",
                Icon = "clipboard",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 2,
                BoardTemplateId = 1,
                Name = "In Progress",
                Description = "Tasks currently being worked on",
                Order = 2,
                Color = "#3B82F6",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 3,
                BoardTemplateId = 1,
                Name = "Done",
                Description = "Completed tasks",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Software Development Template (ID: 2) - 6 columns
            new BoardTemplateColumn
            {
                Id = 4,
                BoardTemplateId = 2,
                Name = "Backlog",
                Description = "Feature requests and bug reports",
                Order = 1,
                Color = "#6B7280",
                Icon = "list",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 5,
                BoardTemplateId = 2,
                Name = "In Development",
                Description = "Features being coded",
                Order = 2,
                Color = "#F59E0B",
                Icon = "code",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 6,
                BoardTemplateId = 2,
                Name = "Code Review",
                Description = "Code awaiting review",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "eye",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 7,
                BoardTemplateId = 2,
                Name = "Testing",
                Description = "Features being tested",
                Order = 4,
                Color = "#EF4444",
                Icon = "bug",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 8,
                BoardTemplateId = 2,
                Name = "Deployment",
                Description = "Ready for deployment",
                Order = 5,
                Color = "#06B6D4",
                Icon = "upload",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 1,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 9,
                BoardTemplateId = 2,
                Name = "Done",
                Description = "Completed and deployed",
                Order = 6,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Content Creation Template (ID: 3) - 5 columns
            new BoardTemplateColumn
            {
                Id = 10,
                BoardTemplateId = 3,
                Name = "Ideas",
                Description = "Content ideas and concepts",
                Order = 1,
                Color = "#F59E0B",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 11,
                BoardTemplateId = 3,
                Name = "Research",
                Description = "Researching and gathering information",
                Order = 2,
                Color = "#3B82F6",
                Icon = "search",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 12,
                BoardTemplateId = 3,
                Name = "Writing",
                Description = "Content being written",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "edit",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 13,
                BoardTemplateId = 3,
                Name = "Review",
                Description = "Content under review",
                Order = 4,
                Color = "#EF4444",
                Icon = "eye",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 14,
                BoardTemplateId = 3,
                Name = "Published",
                Description = "Published content",
                Order = 5,
                Color = "#10B981",
                Icon = "globe",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Project Management Template (ID: 4) - 6 columns
            new BoardTemplateColumn
            {
                Id = 15,
                BoardTemplateId = 4,
                Name = "Planning",
                Description = "Project planning and requirements",
                Order = 1,
                Color = "#6B7280",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 16,
                BoardTemplateId = 4,
                Name = "In Progress",
                Description = "Tasks being executed",
                Order = 2,
                Color = "#3B82F6",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 5,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 17,
                BoardTemplateId = 4,
                Name = "Review",
                Description = "Work under review",
                Order = 3,
                Color = "#F59E0B",
                Icon = "eye",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 18,
                BoardTemplateId = 4,
                Name = "Testing",
                Description = "Quality assurance and testing",
                Order = 4,
                Color = "#EF4444",
                Icon = "shield",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 19,
                BoardTemplateId = 4,
                Name = "Approved",
                Description = "Approved and ready for deployment",
                Order = 5,
                Color = "#06B6D4",
                Icon = "checkmark",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 1,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 20,
                BoardTemplateId = 4,
                Name = "Completed",
                Description = "Project milestones completed",
                Order = 6,
                Color = "#10B981",
                Icon = "trophy",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Personal Tasks Template (ID: 5) - 3 columns
            new BoardTemplateColumn
            {
                Id = 21,
                BoardTemplateId = 5,
                Name = "Today",
                Description = "Tasks for today",
                Order = 1,
                Color = "#EF4444",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = 5,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 22,
                BoardTemplateId = 5,
                Name = "This Week",
                Description = "Tasks for this week",
                Order = 2,
                Color = "#F59E0B",
                Icon = "clock",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 23,
                BoardTemplateId = 5,
                Name = "Completed",
                Description = "Finished tasks",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Marketing Campaign Template (ID: 6) - 5 columns
            new BoardTemplateColumn
            {
                Id = 24,
                BoardTemplateId = 6,
                Name = "Ideation",
                Description = "Campaign ideas and brainstorming",
                Order = 1,
                Color = "#F59E0B",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 25,
                BoardTemplateId = 6,
                Name = "Planning",
                Description = "Campaign planning and strategy",
                Order = 2,
                Color = "#3B82F6",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 26,
                BoardTemplateId = 6,
                Name = "Creation",
                Description = "Creating campaign assets",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "edit",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 4,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 27,
                BoardTemplateId = 6,
                Name = "Launch",
                Description = "Campaign execution and launch",
                Order = 4,
                Color = "#EF4444",
                Icon = "rocket",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 28,
                BoardTemplateId = 6,
                Name = "Analysis",
                Description = "Campaign analysis and reporting",
                Order = 5,
                Color = "#10B981",
                Icon = "chart",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Bug Tracking Template (ID: 7) - 5 columns
            new BoardTemplateColumn
            {
                Id = 29,
                BoardTemplateId = 7,
                Name = "Reported",
                Description = "Newly reported bugs",
                Order = 1,
                Color = "#EF4444",
                Icon = "bug",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 30,
                BoardTemplateId = 7,
                Name = "Investigating",
                Description = "Bugs being investigated",
                Order = 2,
                Color = "#F59E0B",
                Icon = "search",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 31,
                BoardTemplateId = 7,
                Name = "Fixing",
                Description = "Bugs being fixed",
                Order = 3,
                Color = "#3B82F6",
                Icon = "wrench",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 32,
                BoardTemplateId = 7,
                Name = "Testing",
                Description = "Fixes being tested",
                Order = 4,
                Color = "#8B5CF6",
                Icon = "shield",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 33,
                BoardTemplateId = 7,
                Name = "Resolved",
                Description = "Fixed and verified bugs",
                Order = 5,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Event Planning Template (ID: 8) - 6 columns
            new BoardTemplateColumn
            {
                Id = 34,
                BoardTemplateId = 8,
                Name = "Concept",
                Description = "Event concept and initial planning",
                Order = 1,
                Color = "#F59E0B",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 35,
                BoardTemplateId = 8,
                Name = "Planning",
                Description = "Detailed event planning",
                Order = 2,
                Color = "#3B82F6",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 5,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 36,
                BoardTemplateId = 8,
                Name = "Preparation",
                Description = "Event preparation and setup",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "settings",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 4,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 37,
                BoardTemplateId = 8,
                Name = "Execution",
                Description = "Event day execution",
                Order = 4,
                Color = "#EF4444",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 38,
                BoardTemplateId = 8,
                Name = "Follow-up",
                Description = "Post-event follow-up tasks",
                Order = 5,
                Color = "#06B6D4",
                Icon = "mail",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 2,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 39,
                BoardTemplateId = 8,
                Name = "Completed",
                Description = "Event fully completed",
                Order = 6,
                Color = "#10B981",
                Icon = "trophy",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Simple To-Do Template (ID: 9) - 3 columns
            new BoardTemplateColumn
            {
                Id = 40,
                BoardTemplateId = 9,
                Name = "Tasks",
                Description = "Tasks that haven't been started yet",
                Order = 1,
                Color = "#8B5CF6",
                Icon = "clipboard",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 41,
                BoardTemplateId = 9,
                Name = "In Progress",
                Description = "Tasks currently being worked on",
                Order = 2,
                Color = "#3B82F6",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = 3,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 42,
                BoardTemplateId = 9,
                Name = "Completed",
                Description = "Tasks that have been finished",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Family Chores Template (ID: 10) - 4 columns
            new BoardTemplateColumn
            {
                Id = 43,
                BoardTemplateId = 10,
                Name = "Assigned",
                Description = "Chores assigned to family members",
                Order = 1,
                Color = "#6366F1",
                Icon = "user",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 44,
                BoardTemplateId = 10,
                Name = "In Progress",
                Description = "Chores currently being done",
                Order = 2,
                Color = "#F59E0B",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 45,
                BoardTemplateId = 10,
                Name = "Needs Review",
                Description = "Chores waiting for approval",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "eye",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 46,
                BoardTemplateId = 10,
                Name = "Complete",
                Description = "Chores that have been finished",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Weekly Cleaning Template (ID: 11) - 3 columns
            new BoardTemplateColumn
            {
                Id = 47,
                BoardTemplateId = 11,
                Name = "This Week",
                Description = "Cleaning tasks assigned for this week",
                Order = 1,
                Color = "#DC2626",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 48,
                BoardTemplateId = 11,
                Name = "In Progress",
                Description = "Cleaning tasks currently being done",
                Order = 2,
                Color = "#EA580C",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 49,
                BoardTemplateId = 11,
                Name = "Done",
                Description = "Cleaning tasks that have been finished",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Meal Planning Template (ID: 12) - 4 columns
            new BoardTemplateColumn
            {
                Id = 50,
                BoardTemplateId = 12,
                Name = "Meal Ideas",
                Description = "Meal ideas and recipes to try",
                Order = 1,
                Color = "#F59E0B",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 51,
                BoardTemplateId = 12,
                Name = "Shopping List",
                Description = "Ingredients to buy",
                Order = 2,
                Color = "#3B82F6",
                Icon = "shopping-cart",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 52,
                BoardTemplateId = 12,
                Name = "Prep & Cook",
                Description = "Meals currently being prepared",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "chef-hat",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 53,
                BoardTemplateId = 12,
                Name = "Served",
                Description = "Meals that have been served",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Home Maintenance Template (ID: 13) - 4 columns
            new BoardTemplateColumn
            {
                Id = 54,
                BoardTemplateId = 13,
                Name = "Needs Attention",
                Description = "Items that need maintenance or repair",
                Order = 1,
                Color = "#EF4444",
                Icon = "alert-triangle",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 55,
                BoardTemplateId = 13,
                Name = "Planning",
                Description = "Maintenance tasks being planned",
                Order = 2,
                Color = "#F59E0B",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 56,
                BoardTemplateId = 13,
                Name = "Working On",
                Description = "Maintenance tasks currently being worked on",
                Order = 3,
                Color = "#3B82F6",
                Icon = "wrench",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 57,
                BoardTemplateId = 13,
                Name = "Completed",
                Description = "Items that have been fixed or maintained",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // School Projects Template (ID: 14) - 4 columns
            new BoardTemplateColumn
            {
                Id = 58,
                BoardTemplateId = 14,
                Name = "Homework",
                Description = "Assignments that need to be started",
                Order = 1,
                Color = "#DC2626",
                Icon = "book",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 59,
                BoardTemplateId = 14,
                Name = "Working On",
                Description = "Assignments currently being worked on",
                Order = 2,
                Color = "#EA580C",
                Icon = "edit",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 60,
                BoardTemplateId = 14,
                Name = "Review & Submit",
                Description = "Assignments ready for review and submission",
                Order = 3,
                Color = "#9333EA",
                Icon = "eye",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 61,
                BoardTemplateId = 14,
                Name = "Submitted",
                Description = "Assignments that have been submitted",
                Order = 4,
                Color = "#059669",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Kids Activities Template (ID: 15) - 3 columns
            new BoardTemplateColumn
            {
                Id = 62,
                BoardTemplateId = 15,
                Name = "Upcoming",
                Description = "Activities scheduled for the future",
                Order = 1,
                Color = "#6366F1",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 63,
                BoardTemplateId = 15,
                Name = "Today",
                Description = "Activities happening today",
                Order = 2,
                Color = "#F59E0B",
                Icon = "play",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 64,
                BoardTemplateId = 15,
                Name = "Completed",
                Description = "Activities that have been completed",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Reading Goals Template (ID: 16) - 3 columns
            new BoardTemplateColumn
            {
                Id = 65,
                BoardTemplateId = 16,
                Name = "Want to Read",
                Description = "Books on the reading wishlist",
                Order = 1,
                Color = "#8B5CF6",
                Icon = "book",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 66,
                BoardTemplateId = 16,
                Name = "Currently Reading",
                Description = "Books currently being read",
                Order = 2,
                Color = "#3B82F6",
                Icon = "book-open",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 67,
                BoardTemplateId = 16,
                Name = "Finished",
                Description = "Books that have been completed",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Family Health Template (ID: 17) - 3 columns
            new BoardTemplateColumn
            {
                Id = 68,
                BoardTemplateId = 17,
                Name = "Schedule",
                Description = "Health appointments and tasks to schedule",
                Order = 1,
                Color = "#EF4444",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 69,
                BoardTemplateId = 17,
                Name = "Upcoming",
                Description = "Scheduled health appointments and tasks",
                Order = 2,
                Color = "#F59E0B",
                Icon = "clock",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 70,
                BoardTemplateId = 17,
                Name = "Completed",
                Description = "Completed health appointments and tasks",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Fitness Goals Template (ID: 18) - 3 columns
            new BoardTemplateColumn
            {
                Id = 71,
                BoardTemplateId = 18,
                Name = "Goals",
                Description = "Fitness goals to start working on",
                Order = 1,
                Color = "#6366F1",
                Icon = "target",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 72,
                BoardTemplateId = 18,
                Name = "Active",
                Description = "Fitness goals currently being worked on",
                Order = 2,
                Color = "#F59E0B",
                Icon = "activity",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 73,
                BoardTemplateId = 18,
                Name = "Achieved",
                Description = "Fitness goals that have been achieved",
                Order = 3,
                Color = "#10B981",
                Icon = "trophy",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Birthday Planning Template (ID: 19) - 4 columns
            new BoardTemplateColumn
            {
                Id = 74,
                BoardTemplateId = 19,
                Name = "Ideas",
                Description = "Birthday party ideas and concepts",
                Order = 1,
                Color = "#F59E0B",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 75,
                BoardTemplateId = 19,
                Name = "Planning",
                Description = "Birthday party tasks being planned",
                Order = 2,
                Color = "#3B82F6",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 76,
                BoardTemplateId = 19,
                Name = "Preparing",
                Description = "Birthday party preparations in progress",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "gift",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 77,
                BoardTemplateId = 19,
                Name = "Done",
                Description = "Birthday party tasks completed",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Holiday Planning Template (ID: 20) - 4 columns
            new BoardTemplateColumn
            {
                Id = 78,
                BoardTemplateId = 20,
                Name = "Traditions",
                Description = "Holiday traditions and ideas to plan",
                Order = 1,
                Color = "#DC2626",
                Icon = "star",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 79,
                BoardTemplateId = 20,
                Name = "Shopping",
                Description = "Holiday shopping and preparation tasks",
                Order = 2,
                Color = "#F59E0B",
                Icon = "shopping-cart",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 80,
                BoardTemplateId = 20,
                Name = "Preparing",
                Description = "Holiday preparations in progress",
                Order = 3,
                Color = "#3B82F6",
                Icon = "gift",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 81,
                BoardTemplateId = 20,
                Name = "Celebrated",
                Description = "Holiday traditions completed and celebrated",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Vacation Planning Template (ID: 21) - 4 columns
            new BoardTemplateColumn
            {
                Id = 82,
                BoardTemplateId = 21,
                Name = "Research",
                Description = "Vacation destinations and activities to research",
                Order = 1,
                Color = "#6366F1",
                Icon = "search",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 83,
                BoardTemplateId = 21,
                Name = "Booking",
                Description = "Vacation bookings and reservations to make",
                Order = 2,
                Color = "#F59E0B",
                Icon = "calendar",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 84,
                BoardTemplateId = 21,
                Name = "Preparing",
                Description = "Vacation preparations in progress",
                Order = 3,
                Color = "#8B5CF6",
                Icon = "luggage",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 85,
                BoardTemplateId = 21,
                Name = "Enjoyed",
                Description = "Vacation activities completed and enjoyed",
                Order = 4,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Family Budget Template (ID: 22) - 3 columns
            new BoardTemplateColumn
            {
                Id = 86,
                BoardTemplateId = 22,
                Name = "Planned",
                Description = "Expenses and financial goals to plan",
                Order = 1,
                Color = "#3B82F6",
                Icon = "calculator",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 87,
                BoardTemplateId = 22,
                Name = "Pending",
                Description = "Expenses pending payment or approval",
                Order = 2,
                Color = "#F59E0B",
                Icon = "clock",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 88,
                BoardTemplateId = 22,
                Name = "Paid",
                Description = "Expenses that have been paid",
                Order = 3,
                Color = "#10B981",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            },

            // Garden Planning Template (ID: 23) - 4 columns
            new BoardTemplateColumn
            {
                Id = 89,
                BoardTemplateId = 23,
                Name = "Planning",
                Description = "Garden plans and ideas to develop",
                Order = 1,
                Color = "#059669",
                Icon = "lightbulb",
                MappedStatus = TaskItemStatus.NotStarted,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 90,
                BoardTemplateId = 23,
                Name = "Planting",
                Description = "Seeds and plants being planted",
                Order = 2,
                Color = "#10B981",
                Icon = "seedling",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 91,
                BoardTemplateId = 23,
                Name = "Growing",
                Description = "Plants currently growing and being tended",
                Order = 3,
                Color = "#22C55E",
                Icon = "leaf",
                MappedStatus = TaskItemStatus.InProgress,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = false
            },
            new BoardTemplateColumn
            {
                Id = 92,
                BoardTemplateId = 23,
                Name = "Harvested",
                Description = "Plants that have been harvested or completed",
                Order = 4,
                Color = "#16A34A",
                Icon = "check",
                MappedStatus = TaskItemStatus.Completed,
                TaskLimit = null,
                IsCollapsible = true,
                IsDoneColumn = true
            }
        );
    }
} 