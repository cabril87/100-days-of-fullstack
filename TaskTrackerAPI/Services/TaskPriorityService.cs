/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services
{
    public class TaskPriorityService : ITaskPriorityService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITaskItemRepository _taskRepository;
        private readonly ITaskService _taskService;

        public TaskPriorityService(ApplicationDbContext context, ITaskItemRepository taskRepository, ITaskService taskService)
        {
            _context = context;
            _taskRepository = taskRepository;
            _taskService = taskService;
        }

        /// <inheritdoc />
        public async Task<TaskItem?> GetHighestPriorityTaskAsync(string userId)
        {
            int userIdInt = int.Parse(userId);
            
            // Get incomplete tasks for the user
            List<TaskItem> tasks = await _context.Tasks
                .Where(t => t.UserId == userIdInt && 
                            t.Status != TaskItemStatus.Completed &&
                            t.Status != TaskItemStatus.Cancelled)
                .ToListAsync();
                
            return tasks
                .OrderByDescending(GetPriorityValue)
                .ThenBy(t => t.DueDate) // Earlier due date first
                .FirstOrDefault();
        }

        /// <inheritdoc />
        public async Task<List<TaskItem>> GetPrioritizedTasksAsync(string userId, int count)
        {
            int userIdInt = int.Parse(userId);
            
            // Get prioritized tasks for the user
            List<TaskItem> tasks = await _context.Tasks
                .Where(t => t.UserId == userIdInt && 
                            t.Status != TaskItemStatus.Completed &&
                            t.Status != TaskItemStatus.Cancelled)
                .ToListAsync();
                
            return tasks
                .OrderByDescending(GetPriorityValue)
                .ThenBy(t => t.DueDate) // Earlier due date first
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// Calculates a priority score for a task based on various factors
        /// </summary>
        private double GetPriorityValue(TaskItem task)
        {
            double priorityValue = 0;

            // Priority factor (High = 3, Medium = 2, Low = 1, default = 0)
            switch (task.Priority?.ToLower())
            {
                case "critical":
                    priorityValue += 4;
                    break;
                case "high":
                    priorityValue += 3;
                    break;
                case "medium":
                    priorityValue += 2;
                    break;
                case "low":
                    priorityValue += 1;
                    break;
                default:
                    priorityValue += 0;
                    break;
            }

            // Due date factor
            if (task.DueDate.HasValue)
            {
                TimeSpan timeUntilDue = task.DueDate.Value - DateTime.UtcNow;
                
                // Overdue tasks get highest priority
                if (timeUntilDue.TotalHours < 0)
                {
                    priorityValue += 5;
                }
                // Due within 24 hours
                else if (timeUntilDue.TotalHours < 24)
                {
                    priorityValue += 4;
                }
                // Due within 3 days
                else if (timeUntilDue.TotalDays < 3)
                {
                    priorityValue += 3;
                }
                // Due within a week
                else if (timeUntilDue.TotalDays < 7)
                {
                    priorityValue += 2;
                }
                // Due within two weeks
                else if (timeUntilDue.TotalDays < 14)
                {
                    priorityValue += 1;
                }
            }

            // Status factor - "In Progress" tasks get a boost
            if (task.Status == TaskItemStatus.InProgress)
            {
                priorityValue += 1;
            }

            return priorityValue;
        }

        /// <summary>
        /// Automatically adjusts the priority of a user's tasks based on due dates, completion patterns, and other factors
        /// </summary>
        /// <param name="userId">The ID of the user whose tasks to adjust</param>
        /// <returns>A summary of priority adjustments made</returns>
        public async Task<PriorityAdjustmentSummaryDTO> AutoAdjustTaskPrioritiesAsync(int userId)
        {
            // Get all incomplete tasks for the user
            IEnumerable<TaskItem> notStartedTasks = await _taskRepository.GetTasksByStatusAsync(userId, TaskItemStatus.NotStarted);
            IEnumerable<TaskItem> inProgressTasks = await _taskRepository.GetTasksByStatusAsync(userId, TaskItemStatus.InProgress);
            
            // Create a new list and add all items from both sources
            List<TaskItem> incompleteTasks = new List<TaskItem>();
            foreach (TaskItem task in notStartedTasks)
            {
                incompleteTasks.Add(task);
            }
            foreach (TaskItem task in inProgressTasks)
            {
                incompleteTasks.Add(task);
            }
            
            PriorityAdjustmentSummaryDTO summary = new PriorityAdjustmentSummaryDTO
            {
                TotalTasksEvaluated = incompleteTasks.Count(),
                TasksAdjusted = 0,
                UpgradedTasks = 0,
                DowngradedTasks = 0,
                AdjustmentTimestamp = DateTime.UtcNow
            };
            
            List<TaskPriorityAdjustmentDTO> adjustments = new List<TaskPriorityAdjustmentDTO>();
            
            foreach (TaskItem task in incompleteTasks)
            {
                TaskPriority calculatedPriority = CalculateIdealPriority(task);
                TaskPriority originalPriority = Enum.Parse<TaskPriority>(task.Priority);
                
                // If the calculated priority differs from the current priority, adjust it
                if (calculatedPriority != originalPriority)
                {
                    TaskItemDTO taskDto = new TaskItemDTO 
                    {
                        Id = task.Id,
                        Title = task.Title,
                        Description = task.Description,
                        Status = task.Status,
                        Priority = (int)calculatedPriority,
                        DueDate = task.DueDate,
                        CategoryId = task.CategoryId,
                        BoardId = task.BoardId,
                        Version = task.Version
                    };
                    
                    // Update the task priority
                    await _taskService.UpdateTaskAsync(userId, task.Id, taskDto);
                    
                    // Record the adjustment
                    adjustments.Add(new TaskPriorityAdjustmentDTO
                    {
                        TaskId = task.Id,
                        TaskTitle = task.Title,
                        PreviousPriority = originalPriority,
                        NewPriority = calculatedPriority,
                        AdjustmentReason = GetAdjustmentReason(task, calculatedPriority)
                    });
                    
                    summary.TasksAdjusted++;
                    
                    if ((int)calculatedPriority > (int)originalPriority)
                        summary.UpgradedTasks++;
                    else
                        summary.DowngradedTasks++;
                }
            }
            
            summary.Adjustments = adjustments;
            return summary;
        }

        /// <summary>
        /// Calculates the ideal priority for a task based on due date, completion patterns, and status
        /// </summary>
        private TaskPriority CalculateIdealPriority(TaskItem task)
        {
            // Default to the current priority if parsing fails
            if (!Enum.TryParse<TaskPriority>(task.Priority, out TaskPriority currentPriority))
            {
                currentPriority = TaskPriority.Medium;
            }
            
            // If no due date, don't change priority
            if (!task.DueDate.HasValue)
                return currentPriority;
                
            double daysUntilDue = (task.DueDate.Value - DateTime.UtcNow).TotalDays;
            
            // Overdue tasks should always be High priority
            if (daysUntilDue < 0)
                return TaskPriority.High;
                
            // Due today or tomorrow -> increase priority
            if (daysUntilDue < 1)
                return TaskPriority.High;
                
            // Due within 3 days -> at least Medium priority
            if (daysUntilDue < 3)
                return currentPriority < TaskPriority.Medium ? TaskPriority.Medium : currentPriority;
                
            // Due in more than 2 weeks and currently High priority -> reduce to Medium
            if (daysUntilDue > 14 && currentPriority == TaskPriority.High)
                return TaskPriority.Medium;
                
            // In all other cases, maintain the current priority
            return currentPriority;
        }

        /// <summary>
        /// Generates a human-readable reason for the priority adjustment
        /// </summary>
        private string GetAdjustmentReason(TaskItem task, TaskPriority newPriority)
        {
            TaskPriority currentPriority = Enum.Parse<TaskPriority>(task.Priority);
            
            if (!task.DueDate.HasValue)
                return "Manual adjustment based on task importance";
                
            double daysUntilDue = (task.DueDate.Value - DateTime.UtcNow).TotalDays;
            
            if (daysUntilDue < 0)
                return "Task is overdue";
                
            if (daysUntilDue < 1)
                return "Task is due today or tomorrow";
                
            if (daysUntilDue < 3 && newPriority > currentPriority)
                return "Task is due within 3 days";
                
            if (daysUntilDue > 14 && newPriority < currentPriority)
                return "Task due date is far in the future";
                
            return "Adjustment based on due date analysis";
        }
    }
} 