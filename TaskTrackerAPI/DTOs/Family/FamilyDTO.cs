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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDTO CreatedBy { get; set; } = null!;
    public List<FamilyMemberDTO> Members { get; set; } = new();
}

public class FamilyCreateDTO
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class FamilyUpdateDTO
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
}