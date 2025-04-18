using System;

namespace TaskTrackerAPI.DTOs
{
    public class CategoryActivityDTO
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TaskCount { get; set; }
        public int CompletedTaskCount { get; set; }
        public DateTime LastActivityDate { get; set; }
        public double CompletionRate { get; set; }
    }
} 