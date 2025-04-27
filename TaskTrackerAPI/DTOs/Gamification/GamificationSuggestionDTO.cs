using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    public class GamificationSuggestionDetailDTO
    {
        public int Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string SuggestionType { get; set; } = string.Empty;
        
        public int Priority { get; set; }
        
        public int? RequiredPoints { get; set; }
        
        public bool IsCompleted { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
} 