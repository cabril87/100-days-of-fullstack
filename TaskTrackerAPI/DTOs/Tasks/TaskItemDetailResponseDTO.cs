using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Response DTO for a single task item with detailed information
    
    public class TaskItemDetailResponseDTO
    {
        
        /// The task item details
        
        public TaskItemResponseDTO Task { get; set; } = new TaskItemResponseDTO();

        
        /// HATEOAS links
        
        public Dictionary<string, string> Links { get; set; } = new Dictionary<string, string>();
    }
} 