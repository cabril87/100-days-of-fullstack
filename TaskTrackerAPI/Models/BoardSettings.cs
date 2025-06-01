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
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents configuration settings for a Kanban board
/// </summary>
public class BoardSettings
{
    /// <summary>
    /// Unique identifier for the settings
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Reference to the board these settings belong to
    /// </summary>
    [Required]
    public int BoardId { get; set; }

    /// <summary>
    /// Whether work-in-progress limits are enforced
    /// </summary>
    public bool EnableWipLimits { get; set; } = false;

    /// <summary>
    /// Whether to show subtasks on the board
    /// </summary>
    public bool ShowSubtasks { get; set; } = true;

    /// <summary>
    /// Whether to enable swim lanes for grouping tasks
    /// </summary>
    public bool EnableSwimLanes { get; set; } = false;

    /// <summary>
    /// Default view mode for tasks (compact, detailed, card)
    /// </summary>
    [Required]
    [StringLength(20)]
    public string DefaultTaskView { get; set; } = "detailed";

    /// <summary>
    /// Whether drag and drop is enabled
    /// </summary>
    public bool EnableDragDrop { get; set; } = true;

    /// <summary>
    /// Whether to show task IDs on cards
    /// </summary>
    public bool ShowTaskIds { get; set; } = false;

    /// <summary>
    /// Whether to enable task timer functionality
    /// </summary>
    public bool EnableTaskTimer { get; set; } = true;

    /// <summary>
    /// Whether to show progress bars on task cards
    /// </summary>
    public bool ShowProgressBars { get; set; } = true;

    /// <summary>
    /// Whether to show avatars for assigned users
    /// </summary>
    public bool ShowAvatars { get; set; } = true;

    /// <summary>
    /// Whether to show due dates on task cards
    /// </summary>
    public bool ShowDueDates { get; set; } = true;

    /// <summary>
    /// Whether to show priority indicators
    /// </summary>
    public bool ShowPriority { get; set; } = true;

    /// <summary>
    /// Whether to show task categories/tags
    /// </summary>
    public bool ShowCategories { get; set; } = true;

    /// <summary>
    /// Whether to auto-refresh the board
    /// </summary>
    public bool AutoRefresh { get; set; } = true;

    /// <summary>
    /// Auto-refresh interval in seconds (0 = disabled)
    /// </summary>
    public int AutoRefreshInterval { get; set; } = 30;

    /// <summary>
    /// Whether to enable real-time collaboration features
    /// </summary>
    public bool EnableRealTimeCollaboration { get; set; } = true;

    /// <summary>
    /// Whether to show notifications for board changes
    /// </summary>
    public bool ShowNotifications { get; set; } = true;

    /// <summary>
    /// Whether to enable keyboard shortcuts
    /// </summary>
    public bool EnableKeyboardShortcuts { get; set; } = true;

    /// <summary>
    /// Theme preference for the board (light, dark, auto, custom)
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Theme { get; set; } = "auto";

    /// <summary>
    /// Custom theme configuration (JSON)
    /// </summary>
    [Column(TypeName = "ntext")]
    public string? CustomThemeConfig { get; set; }

    /// <summary>
    /// Swim lane grouping field (assignee, priority, category, etc.)
    /// </summary>
    [StringLength(50)]
    public string? SwimLaneGroupBy { get; set; }

    /// <summary>
    /// Default sorting field for tasks within columns
    /// </summary>
    [StringLength(50)]
    public string DefaultSortBy { get; set; } = "created";

    /// <summary>
    /// Default sorting direction (asc, desc)
    /// </summary>
    [StringLength(4)]
    public string DefaultSortDirection { get; set; } = "desc";

    /// <summary>
    /// Whether to show column task counts
    /// </summary>
    public bool ShowColumnCounts { get; set; } = true;

    /// <summary>
    /// Whether to show board statistics
    /// </summary>
    public bool ShowBoardStats { get; set; } = true;

    /// <summary>
    /// Whether to enable gamification elements
    /// </summary>
    public bool EnableGamification { get; set; } = true;

    /// <summary>
    /// Whether this board is archived
    /// </summary>
    public bool IsArchived { get; set; } = false;

    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Last update timestamp
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Reference to the parent board
    /// </summary>
    [ForeignKey(nameof(BoardId))]
    public virtual Board? Board { get; set; }
} 