namespace TaskTrackerAPI.DTOs.Tags
{
    public class TagResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public bool IsBuiltIn { get; set; }
    }
} 