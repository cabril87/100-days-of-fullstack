// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public required string Email { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    [Required]
    public required string Salt { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    [Required]
    public required string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation property for user's tasks
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // Navigation property for user's boards
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    // Navigation property for user's family members
    public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();

    public int? PrimaryFamilyId { get; set; }
    
    [ForeignKey("PrimaryFamilyId")]
    public virtual Family? PrimaryFamily { get; set; }
    
    public virtual ICollection<UserDevice> Devices { get; set; } = new List<UserDevice>();

    public FamilyMemberAgeGroup AgeGroup { get; set; } = FamilyMemberAgeGroup.Adult;

    
}

public enum FamilyMemberAgeGroup
{
    Child,    // Under 13
    Teen,     // 13-17 
    Adult     // 18+
}