namespace TaskTrackerAPI.Models
{
    public class GamificationSuggestion
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? RelevantId { get; set; }
        public int PotentialPoints { get; set; }
        public double RelevanceScore { get; set; }
        public int Points { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public int ActionId { get; set; }
    }
} 