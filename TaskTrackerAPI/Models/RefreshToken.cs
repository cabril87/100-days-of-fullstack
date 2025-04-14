// Models/RefreshToken.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

// Models/RefreshToken.cs
public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public required string Token { get; set; }
    
    [Required]
    public DateTime ExpiryDate { get; set; }
    
    [Required]
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    
    // Change this line to make it nullable
    public string? RevokedByIp { get; set; }
    
    public bool IsExpired => DateTime.Now >= ExpiryDate;
    
    public bool IsActive => !IsExpired && RevokedByIp == null;
    
    [Required]
    public required int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}