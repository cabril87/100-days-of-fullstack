using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs;

public class TaskAssignmentDTO
{
    [Required]
    public int TaskId { get; set; }
    
    [Required]
    public int AssignToUserId { get; set; }
    
    public bool RequiresApproval { get; set; } = false;
}

public class TaskApprovalDTO
{
    [Required]
    public int TaskId { get; set; }
    
    public string? ApprovalComment { get; set; }
}

public class FamilyTaskItemDTO : TaskItemDTO
{
    public int? AssignedByUserId { get; set; }
    public string? AssignedByUserName { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public bool RequiresApproval { get; set; }
    public bool IsApproved { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? FamilyId { get; set; }
    public string? FamilyName { get; set; }
}