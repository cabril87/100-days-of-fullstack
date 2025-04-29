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

namespace TaskTrackerAPI.Services
{
    public class TaskPriorityService : ITaskPriorityService
    {
        private readonly ApplicationDbContext _context;

        public TaskPriorityService(ApplicationDbContext context)
        {
            _context = context;
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
    }
} 