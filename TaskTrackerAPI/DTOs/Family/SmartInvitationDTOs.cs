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
/// DTO for smart family invitation requests with relationship context.
/// Provides enhanced invitation logic based on age and relationship types.
/// </summary>
public class SmartInvitationRequestDTO
{
    /// <summary>
    /// Gets or sets the email address of the person being invited.
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(320)] // Standard email max length
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the full name of the person being invited.
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the relationship type to the family admin.
    /// </summary>
    [Required]
    public FamilyRelationshipType RelationshipToAdmin { get; set; }

    /// <summary>
    /// Gets or sets the date of birth for age-based role recommendations.
    /// </summary>
    [Required]
    public DateTime DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets optional personal message for the invitation.
    /// </summary>
    [StringLength(500)]
    public string? PersonalMessage { get; set; }

    /// <summary>
    /// Gets or sets the ID of the family member they are related to (optional).
    /// </summary>
    public int? RelatedToMemberId { get; set; }

    /// <summary>
    /// Gets or sets the specific relationship to another family member (optional).
    /// </summary>
    public FamilyRelationshipType? RelationshipToMember { get; set; }

    /// <summary>
    /// Gets or sets whether this person should be considered for admin responsibilities.
    /// </summary>
    public bool WantsAdminRole { get; set; } = false;

    /// <summary>
    /// Gets or sets optional notes about this family member.
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for smart invitation validation results.
/// Contains recommendations, warnings, and validation status.
/// </summary>
public class SmartInvitationValidationDTO
{
    /// <summary>
    /// Gets or sets whether the invitation request is valid.
    /// </summary>
    [Required]
    public bool IsValid { get; set; }

    /// <summary>
    /// Gets or sets the list of validation warnings.
    /// </summary>
    [Required]
    public List<string> Warnings { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the list of validation errors.
    /// </summary>
    [Required]
    public List<string> Errors { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the recommended family role based on relationship and age.
    /// </summary>
    [Required]
    [StringLength(50)]
    public string RecommendedRole { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the reasoning behind the role recommendation.
    /// </summary>
    [Required]
    [StringLength(500)]
    public string RecommendationReasoning { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the calculated age group based on date of birth.
    /// </summary>
    [Required]
    public FamilyMemberAgeGroup AgeGroup { get; set; }

    /// <summary>
    /// Gets or sets the display name for the relationship type.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string RelationshipDisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the family size limit will be exceeded.
    /// </summary>
    [Required]
    public bool WillExceedFamilyLimit { get; set; }

    /// <summary>
    /// Gets or sets the current family size.
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int CurrentFamilySize { get; set; }

    /// <summary>
    /// Gets or sets the maximum family size allowed.
    /// </summary>
    [Required]
    [Range(1, int.MaxValue)]
    public int MaxFamilySize { get; set; }
}

/// <summary>
/// DTO for smart invitation preview information.
/// Provides a preview of how the invitation will appear and its effects.
/// </summary>
public class SmartInvitationPreviewDTO
{
    /// <summary>
    /// Gets or sets the validation result for this invitation.
    /// </summary>
    [Required]
    public SmartInvitationValidationDTO Validation { get; set; } = new SmartInvitationValidationDTO();

    /// <summary>
    /// Gets or sets the preview of the invitation email content.
    /// </summary>
    [Required]
    [StringLength(2000)]
    public string EmailPreview { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the family composition after this invitation is accepted.
    /// </summary>
    [Required]
    public List<FamilyCompositionPreviewDTO> FamilyCompositionPreview { get; set; } = new List<FamilyCompositionPreviewDTO>();

    /// <summary>
    /// Gets or sets the estimated invitation acceptance probability (0-100%).
    /// </summary>
    [Required]
    [Range(0, 100)]
    public int AcceptanceProbability { get; set; }

    /// <summary>
    /// Gets or sets suggestions for improving the invitation.
    /// </summary>
    [Required]
    public List<string> ImprovementSuggestions { get; set; } = new List<string>();
}

/// <summary>
/// DTO for family composition preview after invitation acceptance.
/// Shows how the family structure will change.
/// </summary>
public class FamilyCompositionPreviewDTO
{
    /// <summary>
    /// Gets or sets the member name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the family role name.
    /// </summary>
    [Required]
    [StringLength(50)]
    public string RoleName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the relationship to admin.
    /// </summary>
    [Required]
    public FamilyRelationshipType RelationshipToAdmin { get; set; }

    /// <summary>
    /// Gets or sets the age group.
    /// </summary>
    [Required]
    public FamilyMemberAgeGroup AgeGroup { get; set; }

    /// <summary>
    /// Gets or sets whether this is the new member being invited.
    /// </summary>
    [Required]
    public bool IsNewMember { get; set; }

    /// <summary>
    /// Gets or sets whether this member has admin privileges.
    /// </summary>
    [Required]
    public bool HasAdminPrivileges { get; set; }
}

/// <summary>
/// DTO for the response after creating a smart invitation.
/// </summary>
public class SmartInvitationResponseDTO
{
    /// <summary>
    /// Gets or sets whether the invitation was created successfully.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the invitation ID if created successfully.
    /// </summary>
    public int? InvitationId { get; set; }

    /// <summary>
    /// Gets or sets the invitation token for acceptance.
    /// </summary>
    public string? InvitationToken { get; set; }

    /// <summary>
    /// Gets or sets the QR code URL for easy invitation sharing.
    /// </summary>
    public string? QrCodeUrl { get; set; }

    /// <summary>
    /// Gets or sets the role that was assigned to the invitation.
    /// </summary>
    public string AssignedRole { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the smart recommendation was used.
    /// </summary>
    public bool UsedSmartRecommendation { get; set; }

    /// <summary>
    /// Gets or sets any warning messages about the invitation.
    /// </summary>
    public List<string> Warnings { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the response message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the validation result that was used.
    /// </summary>
    public SmartInvitationValidationDTO? ValidationResult { get; set; }
}

/// <summary>
/// DTO for getting available relationship types with categories.
/// </summary>
public class RelationshipTypeDTO
{
    /// <summary>
    /// Gets or sets the relationship type enum value.
    /// </summary>
    public FamilyRelationshipType Type { get; set; }

    /// <summary>
    /// Gets or sets the display name for the relationship.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the category this relationship belongs to.
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the recommended role for adults with this relationship.
    /// </summary>
    public string RecommendedRoleForAdults { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the recommended role for children with this relationship.
    /// </summary>
    public string RecommendedRoleForChildren { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether this relationship type is commonly used.
    /// </summary>
    public bool IsCommon { get; set; } = true;
}

/// <summary>
/// DTO for bulk smart invitation operations.
/// </summary>
public class BulkSmartInvitationRequestDTO
{
    /// <summary>
    /// Gets or sets the family ID for all invitations.
    /// </summary>
    [Required]
    public int FamilyId { get; set; }

    /// <summary>
    /// Gets or sets the list of smart invitations to create.
    /// </summary>
    [Required]
    [MinLength(1)]
    public List<SmartInvitationRequestDTO> Invitations { get; set; } = new List<SmartInvitationRequestDTO>();

    /// <summary>
    /// Gets or sets whether to skip validation errors and create successful invitations only.
    /// </summary>
    public bool SkipValidationErrors { get; set; } = false;

    /// <summary>
    /// Gets or sets custom message to include in all invitation emails.
    /// </summary>
    [StringLength(1000)]
    public string? CustomMessage { get; set; }
}

/// <summary>
/// DTO for the response of bulk smart invitation operations.
/// </summary>
public class BulkSmartInvitationResponseDTO
{
    /// <summary>
    /// Gets or sets the number of invitations successfully created.
    /// </summary>
    public int SuccessfulInvitations { get; set; }

    /// <summary>
    /// Gets or sets the number of invitations that failed.
    /// </summary>
    public int FailedInvitations { get; set; }

    /// <summary>
    /// Gets or sets the list of successful invitation responses.
    /// </summary>
    public List<SmartInvitationResponseDTO> SuccessfulResults { get; set; } = new List<SmartInvitationResponseDTO>();

    /// <summary>
    /// Gets or sets the list of failed invitations with error details.
    /// </summary>
    public List<FailedInvitationDTO> FailedResults { get; set; } = new List<FailedInvitationDTO>();

    /// <summary>
    /// Gets or sets the overall operation message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO for failed invitation details in bulk operations.
/// </summary>
public class FailedInvitationDTO
{
    /// <summary>
    /// Gets or sets the email address that failed.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name that failed.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the list of error messages.
    /// </summary>
    public List<string> Errors { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the validation result if applicable.
    /// </summary>
    public SmartInvitationValidationDTO? ValidationResult { get; set; }
} 