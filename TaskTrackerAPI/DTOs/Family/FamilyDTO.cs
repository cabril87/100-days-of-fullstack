using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs;

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