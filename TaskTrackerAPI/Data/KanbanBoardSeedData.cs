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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
                MappedStatus = TaskItemStatus.Pending,
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
            }
        );
    }
} 