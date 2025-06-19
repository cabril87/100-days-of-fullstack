/*
 * SavedSearch Model
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents a saved search query that users can reuse
/// </summary>
[Table("SavedSearches")]
public class SavedSearch
{
    /// <summary>
    /// Unique identifier for the saved search
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// User who created this saved search
    /// </summary>
    [Required]
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    /// <summary>
    /// Name/title for the saved search
    /// </summary>
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// The search query string
    /// </summary>
    [Required]
    [StringLength(500)]
    public required string Query { get; set; }

    /// <summary>
    /// Entity types to search (JSON serialized)
    /// </summary>
    [StringLength(200)]
    public string? EntityTypes { get; set; }

    /// <summary>
    /// Advanced filters (JSON serialized)
    /// </summary>
    [StringLength(2000)]
    public string? Filters { get; set; }

    /// <summary>
    /// Sort configuration (JSON serialized)
    /// </summary>
    [StringLength(500)]
    public string? Sort { get; set; }

    /// <summary>
    /// When this search was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When this search was last used
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// How many times this search has been used
    /// </summary>
    [Required]
    public int UsageCount { get; set; } = 0;

    /// <summary>
    /// Whether this search is shared with family members
    /// </summary>
    [Required]
    public bool IsPublic { get; set; } = false;

    /// <summary>
    /// Family context for the search (optional)
    /// </summary>
    [ForeignKey(nameof(Family))]
    public int? FamilyId { get; set; }

    // Navigation properties
    
    /// <summary>
    /// User who created this saved search
    /// </summary>
    public virtual User? User { get; set; }

    /// <summary>
    /// Family context for the search
    /// </summary>
    public virtual Family? Family { get; set; }
} 