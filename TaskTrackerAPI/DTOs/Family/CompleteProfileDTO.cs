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
using System.ComponentModel.DataAnnotations;


namespace TaskTrackerAPI.DTOs.Family;

public class CompleteProfileDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public FamilyRelationshipDTO Relationship { get; set; }
    
    [Required]
    [Range(1, 120)]
    public int Age { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    [StringLength(500)]
    public string? Bio { get; set; }
    
    [Required]
    public bool AcceptTerms { get; set; }
}

public class RejectMemberDTO
{
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
} 