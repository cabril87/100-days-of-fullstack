using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class Family
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    [Required]
    public int CreatedById { get; set; }
    
    // Navigation properties
    [ForeignKey("CreatedById")]
    public User? CreatedByUser { get; set; }
    
    public List<FamilyMember> Members { get; set; } = new();
    
    public virtual ICollection<User> PrimaryFamilyUsers { get; set; } = new List<User>();
}