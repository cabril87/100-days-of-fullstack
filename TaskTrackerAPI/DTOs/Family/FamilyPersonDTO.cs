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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.User;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyPersonDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public FamilyRelationship Relationship { get; set; }
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
}

public class FamilyPersonDetailDTO : FamilyPersonDTO
{
    public UserDTO? User { get; set; }
    public DateTime JoinedAt { get; set; }
    public int? UserId { get; set; }
    public List<string>? Permissions { get; set; }
}

public class CreateFamilyPersonDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;
    
    [Required]
    public int FamilyId { get; set; }
    
    public int? UserId { get; set; }
}

public class UpdateFamilyPersonDTO
{
    [StringLength(100, MinimumLength = 2)]
    public string? Name { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship? Relationship { get; set; }
    
    public int? UserId { get; set; }
} 