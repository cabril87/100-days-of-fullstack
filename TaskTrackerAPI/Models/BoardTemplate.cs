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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents a reusable board template with predefined columns and settings
/// </summary>
public class BoardTemplate
{
    /// <summary>
    /// Unique identifier for the template
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Display name of the template
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the template and its intended use
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// User who created this template (null for system templates)
    /// </summary>
    public int? CreatedByUserId { get; set; }

    /// <summary>
    /// Whether this template is available to all users
    /// </summary>
    public bool IsPublic { get; set; } = false;

    /// <summary>
    /// Whether this is a system default template
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Template category for organization
    /// </summary>
    [StringLength(50)]
    public string? Category { get; set; }

    /// <summary>
    /// Tags for template search and filtering
    /// </summary>
    [StringLength(500)]
    public string? Tags { get; set; }

    /// <summary>
    /// JSON configuration for board layout and settings
    /// </summary>
    [Column(TypeName = "ntext")]
    public string LayoutConfiguration { get; set; } = "{}";

    /// <summary>
    /// Number of times this template has been used
    /// </summary>
    public int UsageCount { get; set; } = 0;

    /// <summary>
    /// Average rating from users (1-5 scale)
    /// </summary>
    [Column(TypeName = "decimal(3,2)")]
    public decimal? AverageRating { get; set; }

    /// <summary>
    /// Number of ratings received
    /// </summary>
    public int RatingCount { get; set; } = 0;

    /// <summary>
    /// Preview image URL for the template
    /// </summary>
    [StringLength(500)]
    public string? PreviewImageUrl { get; set; }

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
    /// User who created this template
    /// </summary>
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User? CreatedBy { get; set; }

    /// <summary>
    /// Default columns for this template
    /// </summary>
    public virtual ICollection<BoardTemplateColumn> DefaultColumns { get; set; } = new List<BoardTemplateColumn>();
}

/// <summary>
/// Represents a default column definition in a board template
/// </summary>
public class BoardTemplateColumn
{
    /// <summary>
    /// Unique identifier for the template column
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Reference to the parent board template
    /// </summary>
    [Required]
    public int BoardTemplateId { get; set; }

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
    /// Whether tasks in this column are considered "done" for analytics
    /// </summary>
    public bool IsDoneColumn { get; set; } = false;

    // Navigation properties

    /// <summary>
    /// Reference to the parent board template
    /// </summary>
    [ForeignKey(nameof(BoardTemplateId))]
    public virtual BoardTemplate? BoardTemplate { get; set; }
} 