using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Response DTO for a collection of task items with pagination metadata
    
    public class TaskItemCollectionResponseDTO
    {
        
        /// Collection of task items
        
        public IEnumerable<TaskItemResponseDTO> Tasks { get; set; } = new List<TaskItemResponseDTO>();

        
        /// Total count of tasks (for pagination)
        
        public int TotalCount { get; set; }

        
        /// HATEOAS links for pagination
        
        public Dictionary<string, string> Links { get; set; } = new Dictionary<string, string>();
    }
} 