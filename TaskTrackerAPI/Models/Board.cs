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

namespace TaskTrackerAPI.Models;

public class Board
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public string Template { get; set; } = "default";
    
    public string? CustomLayout { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign key property
    [Required]
    public int UserId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    
    // Enhanced board relationships
    public virtual ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
    
    public virtual BoardSettings? Settings { get; set; }
} 