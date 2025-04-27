namespace TaskTrackerAPI.Models
{
    public class GamificationSuggestion
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? RelevantId { get; set; }
        public int PotentialPoints { get; set; }
        public double RelevanceScore { get; set; }
        public int Points { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public int ActionId { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 