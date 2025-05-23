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
// Models/Tag.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class Tag
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(30)]
    public required string Name { get; set; }
    
    [Required]
    public required int UserId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}