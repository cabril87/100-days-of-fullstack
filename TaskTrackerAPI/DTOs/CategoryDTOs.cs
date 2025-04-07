using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs;

public class CategoryDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int UserId { get; set; }
}

public class CategoryCreateDTO
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}

public class CategoryUpdateDTO
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}