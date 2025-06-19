/*
 * SearchHistory Model
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents a search history entry for analytics and suggestions
/// </summary>
[Table("SearchHistory")]
public class SearchHistory
{
    /// <summary>
    /// Unique identifier for the search history entry
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// User who performed the search (optional for anonymous searches)
    /// </summary>
    [ForeignKey(nameof(User))]
    public int? UserId { get; set; }

    /// <summary>
    /// The search query string
    /// </summary>
    [Required]
    [StringLength(500)]
    public required string Query { get; set; }

    /// <summary>
    /// Entity types that were searched (JSON serialized)
    /// </summary>
    [StringLength(200)]
    public string? EntityTypes { get; set; }

    /// <summary>
    /// Filters that were applied (JSON serialized)
    /// </summary>
    [StringLength(2000)]
    public string? Filters { get; set; }

    /// <summary>
    /// When the search was performed
    /// </summary>
    [Required]
    public DateTime SearchedAt { get; set; }

    /// <summary>
    /// How long the search took to execute (in milliseconds)
    /// </summary>
    [Required]
    public long ExecutionTimeMs { get; set; }

    /// <summary>
    /// Total number of results returned
    /// </summary>
    [Required]
    public int ResultCount { get; set; }

    /// <summary>
    /// Whether the user clicked on any results
    /// </summary>
    [Required]
    public bool HasClicks { get; set; } = false;

    /// <summary>
    /// Family context for the search (optional)
    /// </summary>
    [ForeignKey(nameof(Family))]
    public int? FamilyId { get; set; }

    /// <summary>
    /// IP address of the search request (for analytics)
    /// </summary>
    [StringLength(45)] // IPv6 length
    public string? IpAddress { get; set; }

    /// <summary>
    /// User agent of the search request
    /// </summary>
    [StringLength(500)]
    public string? UserAgent { get; set; }

    // Navigation properties
    
    /// <summary>
    /// User who performed the search
    /// </summary>
    public virtual User? User { get; set; }

    /// <summary>
    /// Family context for the search
    /// </summary>
    public virtual Family? Family { get; set; }
} 