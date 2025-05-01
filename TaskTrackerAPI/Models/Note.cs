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

public class Note
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public NoteCategory Category { get; set; } = NoteCategory.General;
    
    public NoteFormat Format { get; set; } = NoteFormat.PlainText;
    
    public bool IsPinned { get; set; } = false;
    
    public bool IsArchived { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    [Required]
    public int UserId { get; set; }
    
    public int? TaskItemId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual TaskItem? TaskItem { get; set; }
}

public enum NoteCategory
{
    General,
    Personal,
    Work,
    Ideas,
    ToDo,
    Meeting,
    Research
}

public enum NoteFormat
{
    PlainText,
    Markdown,
    RichText,
    Html
} 