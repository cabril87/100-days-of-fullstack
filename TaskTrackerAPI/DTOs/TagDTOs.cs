using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs;

public class TagDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UserId { get; set; }
}

public class TagCreateDTO
{
    [Required]
    [StringLength(30)]
    public string Name { get; set; } = string.Empty;
}

public class TagUpdateDTO
{
    [Required]
    [StringLength(30)]
    public string Name { get; set; } = string.Empty;
}