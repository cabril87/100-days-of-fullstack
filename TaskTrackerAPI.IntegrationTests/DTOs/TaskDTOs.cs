using System;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.IntegrationTests.DTOs
{
    public class TaskItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskItemStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int Priority { get; set; }
        public int UserId { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }

    public class CreateTaskItemDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; } = 0;
        public int? CategoryId { get; set; }
    }

    public class UpdateTaskItemDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskItemStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; }
        public int? CategoryId { get; set; }
    }
} 