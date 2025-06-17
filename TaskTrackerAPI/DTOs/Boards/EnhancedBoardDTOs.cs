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
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.DTOs.Boards
{
    /// <summary>
    /// Enhanced DTO for board column information with advanced features
    /// </summary>
    public class EnhancedBoardColumnDTO
    {
        public int Id { get; set; }
        public int BoardId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Order { get; set; }
        public string Color { get; set; } = "#6B7280";
        public string? Icon { get; set; }
        public TaskItemStatusDTO MappedStatus { get; set; }
        public int? TaskLimit { get; set; }
        public bool IsCollapsible { get; set; } = true;
        public bool IsHidden { get; set; } = false;
        public bool IsDoneColumn { get; set; } = false;
        public int TaskCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating a new enhanced board column
    /// </summary>
    public class CreateEnhancedBoardColumnDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int Order { get; set; }

        [Required]
        [StringLength(7, MinimumLength = 7)]
        public string Color { get; set; } = "#6B7280";

        [StringLength(50)]
        public string? Icon { get; set; }

        [Required]
        public TaskItemStatusDTO MappedStatus { get; set; }

        public int? TaskLimit { get; set; }
        public bool IsCollapsible { get; set; } = true;
        public bool IsDoneColumn { get; set; } = false;
    }

    /// <summary>
    /// DTO for updating an enhanced board column
    /// </summary>
    public class UpdateEnhancedBoardColumnDTO
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public int? Order { get; set; }

        [StringLength(7, MinimumLength = 7)]
        public string? Color { get; set; }

        [StringLength(50)]
        public string? Icon { get; set; }

        public TaskItemStatusDTO? MappedStatus { get; set; }
        public int? TaskLimit { get; set; }
        public bool? IsCollapsible { get; set; }
        public bool? IsHidden { get; set; }
        public bool? IsDoneColumn { get; set; }
    }

    /// <summary>
    /// DTO for reordering board columns
    /// </summary>
    public class ColumnOrderDTO
    {
        [Required]
        public int ColumnId { get; set; }

        [Required]
        public int NewOrder { get; set; }
    }

    /// <summary>
    /// DTO for board settings
    /// </summary>
    public class BoardSettingsDTO
    {
        public int Id { get; set; }
        public int BoardId { get; set; }
        public bool EnableWipLimits { get; set; } = false;
        public bool ShowSubtasks { get; set; } = true;
        public bool EnableSwimLanes { get; set; } = false;
        public string DefaultTaskView { get; set; } = "detailed";
        public bool EnableDragDrop { get; set; } = true;
        public bool ShowTaskIds { get; set; } = false;
        public bool EnableTaskTimer { get; set; } = true;
        public bool ShowProgressBars { get; set; } = true;
        public bool ShowAvatars { get; set; } = true;
        public bool ShowDueDates { get; set; } = true;
        public bool ShowPriority { get; set; } = true;
        public bool ShowCategories { get; set; } = true;
        public bool AutoRefresh { get; set; } = true;
        public int AutoRefreshInterval { get; set; } = 30;
        public bool EnableRealTimeCollaboration { get; set; } = true;
        public bool ShowNotifications { get; set; } = true;
        public bool EnableKeyboardShortcuts { get; set; } = true;
        public string Theme { get; set; } = "auto";
        public string? CustomThemeConfig { get; set; }
        public string? SwimLaneGroupBy { get; set; }
        public string DefaultSortBy { get; set; } = "created";
        public string DefaultSortDirection { get; set; } = "desc";
        public bool ShowColumnCounts { get; set; } = true;
        public bool ShowBoardStats { get; set; } = true;
        public bool EnableGamification { get; set; } = true;
        public bool IsArchived { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for updating board settings
    /// </summary>
    public class UpdateBoardSettingsDTO
    {
        public bool? EnableWipLimits { get; set; }
        public bool? ShowSubtasks { get; set; }
        public bool? EnableSwimLanes { get; set; }
        
        [StringLength(20)]
        public string? DefaultTaskView { get; set; }
        
        public bool? EnableDragDrop { get; set; }
        public bool? ShowTaskIds { get; set; }
        public bool? EnableTaskTimer { get; set; }
        public bool? ShowProgressBars { get; set; }
        public bool? ShowAvatars { get; set; }
        public bool? ShowDueDates { get; set; }
        public bool? ShowPriority { get; set; }
        public bool? ShowCategories { get; set; }
        public bool? AutoRefresh { get; set; }
        
        [Range(0, 300)]
        public int? AutoRefreshInterval { get; set; }
        
        public bool? EnableRealTimeCollaboration { get; set; }
        public bool? ShowNotifications { get; set; }
        public bool? EnableKeyboardShortcuts { get; set; }
        
        [StringLength(20)]
        public string? Theme { get; set; }
        
        public string? CustomThemeConfig { get; set; }
        
        [StringLength(50)]
        public string? SwimLaneGroupBy { get; set; }
        
        [StringLength(50)]
        public string? DefaultSortBy { get; set; }
        
        [StringLength(4)]
        public string? DefaultSortDirection { get; set; }
        
        public bool? ShowColumnCounts { get; set; }
        public bool? ShowBoardStats { get; set; }
        public bool? EnableGamification { get; set; }
        public bool? IsArchived { get; set; }
    }

    /// <summary>
    /// DTO for board template information
    /// </summary>
    public class BoardTemplateDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CreatedByUserId { get; set; }
        public string? CreatedByUsername { get; set; }
        public bool IsPublic { get; set; } = false;
        public bool IsDefault { get; set; } = false;
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public string LayoutConfiguration { get; set; } = "{}";
        public int UsageCount { get; set; } = 0;
        public decimal? AverageRating { get; set; }
        public int RatingCount { get; set; } = 0;
        public string? PreviewImageUrl { get; set; }
        public List<BoardTemplateColumnDTO> DefaultColumns { get; set; } = new List<BoardTemplateColumnDTO>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for board template column information
    /// </summary>
    public class BoardTemplateColumnDTO
    {
        public int Id { get; set; }
        public int BoardTemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Order { get; set; }
        public string Color { get; set; } = "#6B7280";
        public string? Icon { get; set; }
        public TaskItemStatusDTO MappedStatus { get; set; }
        public int? TaskLimit { get; set; }
        public bool IsCollapsible { get; set; } = true;
        public bool IsDoneColumn { get; set; } = false;
    }

    /// <summary>
    /// DTO for creating a new board template
    /// </summary>
    public class CreateBoardTemplateDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        public bool IsPublic { get; set; } = false;

        [StringLength(50)]
        public string? Category { get; set; }

        [StringLength(500)]
        public string? Tags { get; set; }

        public string LayoutConfiguration { get; set; } = "{}";

        [StringLength(500)]
        public string? PreviewImageUrl { get; set; }

        public List<CreateBoardTemplateColumnDTO> DefaultColumns { get; set; } = new List<CreateBoardTemplateColumnDTO>();
    }

    /// <summary>
    /// DTO for creating board template columns
    /// </summary>
    public class CreateBoardTemplateColumnDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int Order { get; set; }

        [Required]
        [StringLength(7, MinimumLength = 7)]
        public string Color { get; set; } = "#6B7280";

        [StringLength(50)]
        public string? Icon { get; set; }

        [Required]
        public TaskItemStatusDTO MappedStatus { get; set; }

        public int? TaskLimit { get; set; }
        public bool IsCollapsible { get; set; } = true;
        public bool IsDoneColumn { get; set; } = false;
    }

    /// <summary>
    /// DTO for creating a board from a template
    /// </summary>
    public class CreateBoardFromTemplateDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string BoardName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? BoardDescription { get; set; }

        public bool IncludeSettings { get; set; } = true;
        public bool IncludeSampleTasks { get; set; } = false;
    }

    /// <summary>
    /// DTO for saving a board as a template
    /// </summary>
    public class SaveBoardAsTemplateDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        public bool IsPublic { get; set; } = false;

        [StringLength(50)]
        public string? Category { get; set; }

        [StringLength(500)]
        public string? Tags { get; set; }

        public bool IncludeSettings { get; set; } = true;
        public bool IncludeTasks { get; set; } = false;

        [StringLength(500)]
        public string? PreviewImageUrl { get; set; }
    }

    /// <summary>
    /// DTO for bulk task operations
    /// </summary>
    public class BulkMoveTasksDTO
    {
        [Required]
        public List<int> TaskIds { get; set; } = new List<int>();

        [Required]
        public int TargetColumnId { get; set; }

        public TaskItemStatusDTO? TargetStatus { get; set; }
        public int? TargetPosition { get; set; }
    }

    /// <summary>
    /// Enhanced DTO for comprehensive board details with statistics
    /// </summary>
    public class SuperEnhancedBoardDetailDTO : BoardDetailDTO
    {
        public BoardSettingsDTO? Settings { get; set; }
        public List<EnhancedBoardColumnDTO> Columns { get; set; } = new List<EnhancedBoardColumnDTO>();
        public BoardStatisticsDTO? Statistics { get; set; }
        public bool IsCustomBoard { get; set; } = false;
        public int? TemplateId { get; set; }
        public string? TemplateName { get; set; }
    }

    /// <summary>
    /// DTO for board statistics and analytics
    /// </summary>
    public class BoardStatisticsDTO
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int PendingTasks { get; set; }
        public int OverdueTasks { get; set; }
        public decimal CompletionPercentage { get; set; }
        public Dictionary<string, int> TasksByColumn { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> TasksByPriority { get; set; } = new Dictionary<string, int>();
        public decimal AverageCycleTime { get; set; } // In hours
        public decimal AverageLeadTime { get; set; } // In hours
        public int TasksCompletedThisWeek { get; set; }
        public int TasksCompletedThisMonth { get; set; }
        public List<string> Bottlenecks { get; set; } = new List<string>();
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
} 