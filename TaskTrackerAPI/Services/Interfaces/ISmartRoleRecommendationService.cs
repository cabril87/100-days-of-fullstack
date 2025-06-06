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

using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for smart role recommendation service.
/// Provides methods for recommending family roles based on relationships and age groups.
/// </summary>
public interface ISmartRoleRecommendationService
{
    /// <summary>
    /// Gets the recommended family role based on relationship type and age group.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Recommended role name ("Admin", "Parent", or "Child")</returns>
    string GetRecommendedRole(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup);

    /// <summary>
    /// Gets the display name for a family relationship type.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <returns>Human-readable display name</returns>
    string GetRelationshipDisplayName(FamilyRelationshipType relationship);

    /// <summary>
    /// Gets the reasoning behind a role recommendation for display to users.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Human-readable explanation of the recommendation</returns>
    string GetRecommendationReasoning(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup);

    /// <summary>
    /// Validates if a relationship and age combination makes sense for family management.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Validation result with warnings if applicable</returns>
    SmartRoleValidationResultDTO ValidateRelationshipAgeCombo(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup);
} 