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

public class TemplateMarketplace
{
    public int Id { get; set; }
    
    [Required]
    public int TemplateId { get; set; }
    
    [Required]
    public int CreatedBy { get; set; }
    
    public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? Tags { get; set; }
    
    public bool IsFeatured { get; set; } = false;
    
    public bool IsApproved { get; set; } = false;
    
    public DateTime? ApprovedDate { get; set; }
    
    public int? ApprovedBy { get; set; }
    
    public decimal Price { get; set; } = 0.0m;
    
    public bool IsFree { get; set; } = true;
    
    [StringLength(100)]
    public string? Version { get; set; }
    
    [StringLength(2000)]
    public string? ChangeLog { get; set; }
    
    public int MinimumRating { get; set; } = 0;
    
    public DateTime? LastUpdated { get; set; }
    
    // Navigation properties
    public virtual TaskTemplate? Template { get; set; }
    
    public virtual User? Creator { get; set; }
    
    public virtual User? Approver { get; set; }
} 