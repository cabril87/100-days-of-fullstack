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

namespace TaskTrackerAPI.Models;

public class Invitation
{
    public int Id { get; set; }
    
    [Required]
    public string Token { get; set; } = string.Empty;
    
    [Required]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public int FamilyId { get; set; }
    
    public int RoleId { get; set; }
    
    [Required]
    public int CreatedById { get; set; }
    
    public string? Message { get; set; }
    
    public bool IsAccepted { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime ExpiresAt { get; set; }
    
    // Navigation properties
    public Family Family { get; set; } = null!;
    
    public FamilyRole Role { get; set; } = null!;
    
    public User CreatedBy { get; set; } = null!;
}