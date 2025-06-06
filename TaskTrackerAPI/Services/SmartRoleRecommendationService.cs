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
using System.ComponentModel;
using System.Reflection;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for providing smart role recommendations based on family relationships and age groups.
/// Implements business logic for mapping relationship types to appropriate family roles.
/// </summary>
public class SmartRoleRecommendationService : ISmartRoleRecommendationService
{
    private readonly ILogger<SmartRoleRecommendationService> _logger;

    /// <summary>
    /// Initializes a new instance of the SmartRoleRecommendationService class.
    /// </summary>
    /// <param name="logger">Logger instance for audit and diagnostic purposes</param>
    public SmartRoleRecommendationService(ILogger<SmartRoleRecommendationService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets the recommended family role based on relationship type and age group.
    /// Implements smart logic for role assignment based on family dynamics.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Recommended role name ("Admin", "Parent", or "Child")</returns>
    public string GetRecommendedRole(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup)
    {
        try
        {
            string recommendedRole = relationship switch
            {
                // === PRIMARY CAREGIVERS (Full Admin Rights) ===
                FamilyRelationshipType.Parent or
                FamilyRelationshipType.Stepparent or
                FamilyRelationshipType.Guardian or
                FamilyRelationshipType.FosterParent => ageGroup == FamilyMemberAgeGroup.Adult ? "Admin" : "Parent",

                // === LIFE PARTNERS (Full Admin Rights if Adult) ===
                FamilyRelationshipType.Spouse or
                FamilyRelationshipType.Partner => ageGroup == FamilyMemberAgeGroup.Adult ? "Admin" : "Parent",

                // === TRUSTED ADULTS (Parent Role) ===
                FamilyRelationshipType.Grandparent or
                FamilyRelationshipType.Aunt or
                FamilyRelationshipType.Uncle or
                FamilyRelationshipType.MotherInLaw or
                FamilyRelationshipType.FatherInLaw or
                FamilyRelationshipType.Godparent or
                FamilyRelationshipType.Caregiver => "Parent",

                // === CHILDREN (Child Role) ===
                FamilyRelationshipType.Child or
                FamilyRelationshipType.Stepchild or
                FamilyRelationshipType.FosterChild or
                FamilyRelationshipType.Grandchild or
                FamilyRelationshipType.Godchild => "Child",

                // === SIBLINGS (Age-Based) ===
                FamilyRelationshipType.Sibling or
                FamilyRelationshipType.Stepsister or
                FamilyRelationshipType.Stepbrother or
                FamilyRelationshipType.HalfSister or
                FamilyRelationshipType.HalfBrother => ageGroup switch
                {
                    FamilyMemberAgeGroup.Child => "Child",
                    FamilyMemberAgeGroup.Teen => "Child", // Teens get child permissions in family
                    FamilyMemberAgeGroup.Adult => "Parent",
                    _ => "Child" // Default fallback for any undefined age groups
                },

                // === EXTENDED FAMILY (Age-Based) ===
                FamilyRelationshipType.Cousin or
                FamilyRelationshipType.Nephew or
                FamilyRelationshipType.Niece or
                FamilyRelationshipType.SisterInLaw or
                FamilyRelationshipType.BrotherInLaw or
                FamilyRelationshipType.DaughterInLaw or
                FamilyRelationshipType.SonInLaw => ageGroup switch
                {
                    FamilyMemberAgeGroup.Child => "Child",
                    FamilyMemberAgeGroup.Teen => "Child",
                    FamilyMemberAgeGroup.Adult => "Parent",
                    _ => "Child" // Default fallback for any undefined age groups
                },

                // === FAMILY FRIENDS & OTHERS (Conservative Permissions) ===
                FamilyRelationshipType.FamilyFriend => ageGroup == FamilyMemberAgeGroup.Adult ? "Parent" : "Child",

                // === DEFAULT (Age-Based Fallback) ===
                FamilyRelationshipType.Other or
                _ => ageGroup switch
                {
                    FamilyMemberAgeGroup.Child => "Child",
                    FamilyMemberAgeGroup.Teen => "Child",
                    FamilyMemberAgeGroup.Adult => "Parent",
                    _ => "Child" // Default fallback for any undefined age groups
                }
            };

            _logger.LogInformation("Smart role recommendation: {Relationship} + {AgeGroup} = {RecommendedRole}",
                relationship, ageGroup, recommendedRole);

            return recommendedRole;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role recommendation for relationship {Relationship} and age group {AgeGroup}",
                relationship, ageGroup);
            
            // Fallback to safe defaults
            return ageGroup == FamilyMemberAgeGroup.Adult ? "Parent" : "Child";
        }
    }

    /// <summary>
    /// Gets the display name for a family relationship type using the Description attribute.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <returns>Human-readable display name</returns>
    public string GetRelationshipDisplayName(FamilyRelationshipType relationship)
    {
        try
        {
            FieldInfo? fieldInfo = relationship.GetType().GetField(relationship.ToString());
            if (fieldInfo != null)
            {
                DescriptionAttribute? attribute = fieldInfo.GetCustomAttribute<DescriptionAttribute>();
                if (attribute != null)
                {
                    return attribute.Description;
                }
            }

            // Fallback to enum name
            return relationship.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting display name for relationship {Relationship}", relationship);
            return relationship.ToString();
        }
    }

    /// <summary>
    /// Gets the reasoning behind a role recommendation for display to users.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Human-readable explanation of the recommendation</returns>
    public string GetRecommendationReasoning(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup)
    {
        try
        {
            string recommendedRole = GetRecommendedRole(relationship, ageGroup);
            string relationshipName = GetRelationshipDisplayName(relationship);

            return recommendedRole switch
            {
                "Admin" => $"{relationshipName} relationships typically have full family management responsibilities as primary caregivers.",
                "Parent" => $"{relationshipName} relationships are trusted with task management and member oversight but not full admin privileges.",
                "Child" => $"{relationshipName} relationships are assigned tasks but have limited management permissions for safety.",
                _ => "Standard permissions based on age and relationship type."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation reasoning for {Relationship} and {AgeGroup}",
                relationship, ageGroup);
            return "Role recommended based on family relationship and age.";
        }
    }

    /// <summary>
    /// Validates if a relationship and age combination makes sense for family management.
    /// </summary>
    /// <param name="relationship">The family relationship type</param>
    /// <param name="ageGroup">The age group of the family member</param>
    /// <returns>Validation result with warnings if applicable</returns>
    public SmartRoleValidationResultDTO ValidateRelationshipAgeCombo(FamilyRelationshipType relationship, FamilyMemberAgeGroup ageGroup)
    {
        try
        {
            List<string> warnings = new List<string>();

            // Check for unusual age-relationship combinations
            switch (relationship)
            {
                case FamilyRelationshipType.Parent:
                case FamilyRelationshipType.Stepparent:
                case FamilyRelationshipType.Guardian:
                    if (ageGroup == FamilyMemberAgeGroup.Child)
                    {
                        warnings.Add("A child in a parent role is unusual. Please verify the relationship.");
                    }
                    else if (ageGroup == FamilyMemberAgeGroup.Teen)
                    {
                        warnings.Add("A teen parent will have limited family management permissions.");
                    }
                    break;

                case FamilyRelationshipType.Grandparent:
                    if (ageGroup == FamilyMemberAgeGroup.Child || ageGroup == FamilyMemberAgeGroup.Teen)
                    {
                        warnings.Add("A young grandparent is unusual. Please verify the relationship and age.");
                    }
                    break;

                case FamilyRelationshipType.Child:
                case FamilyRelationshipType.Stepchild:
                    if (ageGroup == FamilyMemberAgeGroup.Adult)
                    {
                        warnings.Add("An adult child will have limited permissions in the family hierarchy.");
                    }
                    break;

                case FamilyRelationshipType.Spouse:
                case FamilyRelationshipType.Partner:
                    if (ageGroup != FamilyMemberAgeGroup.Adult)
                    {
                        warnings.Add("Spouse/partner relationships typically involve adults.");
                    }
                    break;
            }

            return new SmartRoleValidationResultDTO
            {
                IsValid = true,
                Warnings = warnings,
                RecommendedRole = GetRecommendedRole(relationship, ageGroup),
                Reasoning = GetRecommendationReasoning(relationship, ageGroup)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating relationship-age combination for {Relationship} and {AgeGroup}",
                relationship, ageGroup);

            return new SmartRoleValidationResultDTO
            {
                IsValid = false,
                Warnings = new List<string> { "Unable to validate relationship and age combination." },
                RecommendedRole = "Child",
                Reasoning = "Default role assigned due to validation error."
            };
        }
    }
} 