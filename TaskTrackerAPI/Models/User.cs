// Models/User.cs
using System.ComponentModel.DataAnnotations;

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
    // In User.cs
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}