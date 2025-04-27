using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// DTO for updating a task's status
    /// </summary>
    public class TaskStatusUpdateRequestDTO
    {
        [Required]
        public TaskItemStatus Status { get; set; }
    }

    /// <summary>
    /// DTO for task status update response
    /// </summary>
    public class TaskStatusUpdateResponseDTO
    {
        public int TaskId { get; set; }
        public TaskItemStatus PreviousStatus { get; set; }
        public TaskItemStatus NewStatus { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for batch completion of tasks
    /// </summary>
    public class BatchCompleteRequestDTO
    {
        [Required]
        public List<int> TaskIds { get; set; } = new List<int>();
    }
} 