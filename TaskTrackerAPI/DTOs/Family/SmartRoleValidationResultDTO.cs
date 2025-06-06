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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Family;

/// <summary>
/// Model representing the result of smart role validation for family members.
/// Contains recommendations and warnings for relationship-age combinations.
/// </summary>
public class SmartRoleValidationResultDTO
{
    /// <summary>
    /// Gets or sets whether the relationship-age combination is valid.
    /// </summary>
    [Required]
    public bool IsValid { get; set; }

    /// <summary>
    /// Gets or sets the list of warning messages for unusual combinations.
    /// </summary>
    [Required]
    public List<string> Warnings { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the recommended family role based on the combination.
    /// </summary>
    [Required]
    [StringLength(50)]
    public string RecommendedRole { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the reasoning behind the recommendation.
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Reasoning { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timestamp when this validation was performed.
    /// </summary>
    [Required]
    public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the relationship type that was validated.
    /// </summary>
    [Required]
    public FamilyRelationshipType RelationshipType { get; set; }

    /// <summary>
    /// Gets or sets the age group that was validated.
    /// </summary>
    [Required]
    public FamilyMemberAgeGroup AgeGroup { get; set; }
} 