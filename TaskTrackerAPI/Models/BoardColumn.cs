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
/// Represents a custom column in a Kanban board
/// </summary>
public class BoardColumn
{
    /// <summary>
    /// Unique identifier for the column
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Reference to the parent board
    /// </summary>
    [Required]
    public int BoardId { get; set; }

    /// <summary>
    /// Display name of the column
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the column
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Order position of the column (0-based)
    /// </summary>
    [Required]
    public int Order { get; set; }

    /// <summary>
    /// Hex color code for the column
    /// </summary>
    [Required]
    [StringLength(7, MinimumLength = 7)] // #RRGGBB format
    public string Color { get; set; } = "#6B7280"; // Default gray

    /// <summary>
    /// Optional icon identifier for the column
    /// </summary>
    [StringLength(50)]
    public string? Icon { get; set; }

    /// <summary>
    /// Task status that this column maps to
    /// </summary>
    [Required]
    public TaskItemStatus MappedStatus { get; set; }

    /// <summary>
    /// Work-in-progress limit for this column (null = no limit)
    /// </summary>
    public int? TaskLimit { get; set; }

    /// <summary>
    /// Whether this column can be collapsed in the UI
    /// </summary>
    public bool IsCollapsible { get; set; } = true;

    /// <summary>
    /// Whether this column is hidden from view
    /// </summary>
    public bool IsHidden { get; set; } = false;

    /// <summary>
    /// Whether tasks in this column are considered "done" for analytics
    /// </summary>
    public bool IsDoneColumn { get; set; } = false;

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