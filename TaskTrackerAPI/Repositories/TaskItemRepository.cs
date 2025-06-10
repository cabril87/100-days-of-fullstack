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
// Repositories/TaskItemRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Repositories;

public class TaskItemRepository : ITaskItemRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TaskItemRepository> _logger;

    public TaskItemRepository(ApplicationDbContext context, ILogger<TaskItemRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskItem>> GetAllTasksAsync(int userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                Version = t.Version,
                FamilyId = t.FamilyId,
                BoardId = t.BoardId,
                ApprovedAt = t.ApprovedAt,
                ApprovedByUserId = t.ApprovedByUserId,
                AssignedByUserId = t.AssignedByUserId,
                AssignedToFamilyMemberId = t.AssignedToFamilyMemberId,
                AssignedToId = t.AssignedToId,
                EstimatedTimeMinutes = t.EstimatedTimeMinutes,
                // Don't include AssignedToName to avoid the error
            })
            .ToListAsync();
    }

    public async Task<PagedResult<TaskItem>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
    {
        IQueryable<TaskItem> query = _context.Tasks
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                Version = t.Version,
                FamilyId = t.FamilyId,
                BoardId = t.BoardId,
                ApprovedAt = t.ApprovedAt,
                ApprovedByUserId = t.ApprovedByUserId,
                AssignedByUserId = t.AssignedByUserId,
                AssignedToFamilyMemberId = t.AssignedToFamilyMemberId,
                AssignedToId = t.AssignedToId,
                EstimatedTimeMinutes = t.EstimatedTimeMinutes,
                // Don't include AssignedToName to avoid the error
            })
            .AsQueryable();

        int count = await query.CountAsync();

        List<TaskItem> items = await query
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync();

        return new PagedResult<TaskItem>(
            items,
            count,
            paginationParams.PageNumber,
            paginationParams.PageSize
        );
    }

    /// <summary>
    /// Verifies task exists and is owned by user
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="userId">User ID</param>
    /// <returns>Task if found and owned by user, null otherwise</returns>
    public async Task<TaskItem?> GetTaskByIdAndUserIdAsync(int id, int userId)
    {
        return await _context.Tasks
            .Where(t => t.Id == id && t.UserId == userId)
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Gets a task by ID and user ID (interface implementation)
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="userId">User ID</param>
    /// <returns>Task with all properties mapped</returns>
    public async Task<TaskItem?> GetTaskByIdAsync(int id, int userId)
    {
        return await _context.Tasks
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                Version = t.Version,
                FamilyId = t.FamilyId,
                BoardId = t.BoardId,
                ApprovedAt = t.ApprovedAt,
                ApprovedByUserId = t.ApprovedByUserId,
                AssignedByUserId = t.AssignedByUserId,
                AssignedToFamilyMemberId = t.AssignedToFamilyMemberId,
                AssignedToId = t.AssignedToId,
                EstimatedTimeMinutes = t.EstimatedTimeMinutes
                // Explicitly excluding AssignedToName which doesn't exist in DB
            })
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Creates a new task
    /// </summary>
    /// <param name="task">Task to create</param>
    /// <returns>Created task</returns>
    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();
        return task;
    }

    /// <summary>
    /// Updates an existing task
    /// </summary>
    /// <param name="task">Task to update</param>
    /// <returns>Task completion</returns>
    public async Task UpdateTaskAsync(TaskItem task)
    {
        // For in-memory database during tests, we need this modified approach
        EntityEntry<TaskItem> entry = _context.Tasks.Entry(task);
        if (entry.State == EntityState.Detached)
        {
            TaskItem? existingTask = await _context.Tasks.FindAsync(task.Id);
            if (existingTask != null)
            {
                _context.Entry(existingTask).CurrentValues.SetValues(task);
            }
            else
            {
                _context.Tasks.Attach(task);
                entry.State = EntityState.Modified;
            }
        }
        else
        {
            // Normal approach for SQL Server
            _context.Tasks.Update(task);
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletes a task item
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="userId">User ID</param>
    /// <returns>Task completion</returns>
    /// <exception cref="InvalidOperationException">Thrown when task is not found or not owned by user</exception>
    public async Task DeleteTaskAsync(int id, int userId)
    {
        try
        {
            _logger.LogInformation("🗑️ Starting task deletion for Task ID: {TaskId}, User ID: {UserId}", id, userId);

            // First verify task exists and is owned by user (simple query for existence check)
            TaskItem? taskExists = await GetTaskByIdAndUserIdAsync(id, userId);
            
            if (taskExists == null)
            {
                _logger.LogWarning("❌ Task deletion failed: Task {TaskId} not found or not owned by user {UserId}", id, userId);
                throw new InvalidOperationException($"Task with ID {id} not found or not owned by user {userId}");
            }

            _logger.LogInformation("✅ Task verification passed: {TaskTitle} (ID: {TaskId}) owned by user {UserId}", taskExists.Title, id, userId);

            // Load task with all related entities for deletion
            TaskItem? taskToDelete = await _context.Tasks
                .Include(t => t.ChecklistItems)
                .Include(t => t.TaskTags)
                .Where(t => t.Id == id && t.UserId == userId)
                .FirstOrDefaultAsync();

            if (taskToDelete == null)
            {
                _logger.LogError("⚠️ Task disappeared between verification and deletion: Task {TaskId}", id);
                throw new InvalidOperationException($"Task {id} was deleted by another process");
            }

            _logger.LogInformation("🔄 Deleting task and related entities: ChecklistItems({ChecklistCount}), TaskTags({TagCount})", 
                taskToDelete.ChecklistItems?.Count ?? 0, 
                taskToDelete.TaskTags?.Count ?? 0);

            // Enterprise deletion - Entity Framework handles cascade deletes based on configuration
            _context.Tasks.Remove(taskToDelete);
            
            // Save changes with proper error handling
            int changesCount = await _context.SaveChangesAsync();
            
            if (changesCount == 0)
            {
                _logger.LogWarning("⚠️ No changes were saved during task deletion for Task {TaskId}", id);
                throw new InvalidOperationException($"Task {id} deletion failed - no database changes occurred");
            }
            
            _logger.LogInformation("🎉 Task deletion completed successfully! Task ID: {TaskId}, Database changes: {ChangesCount}", id, changesCount);
        }
        catch (InvalidOperationException)
        {
            // Re-throw business logic exceptions (these are expected)
            throw;
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "💥 Database error occurred while deleting task {TaskId} for user {UserId}", id, userId);
            throw new InvalidOperationException($"Database error deleting task {id}. This may be due to foreign key constraints.", dbEx);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "💥 Unexpected error occurred while deleting task {TaskId} for user {UserId}", id, userId);
            throw new InvalidOperationException($"Failed to delete task {id}. Please try again later.", ex);
        }
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByStatusAsync(int userId, TaskItemStatus status)
    {
        return await _context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Status == status)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByCategoryAsync(int userId, int categoryId)
    {
        return await _context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.CategoryId == categoryId)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int userId, int tagId)
    {
        IEnumerable<int> taskIds = await _context.TaskTags
            .Where(tt => tt.TagId == tagId)
            .Select(tt => tt.TaskId)
            .ToListAsync();

        return await _context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && taskIds.Contains(t.Id))
            .ToListAsync();
    }

    public async Task<bool> IsTaskOwnedByUserAsync(int taskId, int userId)
    {
        return await _context.Tasks
            .AnyAsync(t => t.Id == taskId && t.UserId == userId);
    }

    public async Task AddTagToTaskAsync(int taskId, int tagId)
    {
        bool exists = await _context.TaskTags
            .AnyAsync(tt => tt.TaskId == taskId && tt.TagId == tagId);

        if (!exists)
        {
            TaskTag taskTag = new TaskTag
            {
                TaskId = taskId,
                TagId = tagId
            };

            await _context.TaskTags.AddAsync(taskTag);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveTagFromTaskAsync(int taskId, int tagId)
    {
        TaskTag? taskTag = await _context.TaskTags
            .FirstOrDefaultAsync(tt => tt.TaskId == taskId && tt.TagId == tagId);

        if (taskTag != null)
        {
            _context.TaskTags.Remove(taskTag);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateTaskTagsAsync(int taskId, IEnumerable<int> tagIds)
    {
        // Get existing task-tag relationships
        List<TaskTag> existingTaskTags = await _context.TaskTags
            .Where(tt => tt.TaskId == taskId)
            .ToListAsync();

        // Remove existing relationships
        _context.TaskTags.RemoveRange(existingTaskTags);

        // Add new relationships
        foreach (int tagId in tagIds)
        {
            await _context.TaskTags.AddAsync(new TaskTag
            {
                TaskId = taskId,
                TagId = tagId
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Tag>> GetTagsForTaskAsync(int taskId)
    {
        return await _context.TaskTags
            .Where(tt => tt.TaskId == taskId)
            .Select(tt => tt.Tag!)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetSharedTaskByIdAsync(int taskId)
    {
        return await _context.Tasks
            .Where(t => t.Id == taskId)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                FamilyId = t.FamilyId,
                Family = t.Family,
                AssignedToFamilyMemberId = t.AssignedToFamilyMemberId,
                AssignedToFamilyMember = t.AssignedToFamilyMemberId != null ? new FamilyMember
                {
                    Id = t.AssignedToFamilyMember!.Id,
                    FamilyId = t.AssignedToFamilyMember.FamilyId,
                    UserId = t.AssignedToFamilyMember.UserId,
                    Role = t.AssignedToFamilyMember.Role,
                    User = t.AssignedToFamilyMember.User
                } : null,
                AssignedByUserId = t.AssignedByUserId,
                AssignedByUser = t.AssignedByUser,
                ApprovedByUserId = t.ApprovedByUserId,
                ApprovedByUser = t.ApprovedByUser,
                RequiresApproval = t.RequiresApproval,
                // Explicitly do not include AssignedToName to avoid the error
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId)
    {
        return await _context.Tasks
            .Where(t => t.AssignedToFamilyMemberId == familyMemberId)
            .OrderBy(t => t.DueDate)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                FamilyId = t.FamilyId,
                AssignedByUserId = t.AssignedByUserId,
                AssignedByUser = t.AssignedByUser,
                // Don't include AssignedToName to avoid the error
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetFamilyTasksAsync(int familyId)
    {
        return await _context.Tasks
            .Where(t => t.FamilyId == familyId)
            .OrderBy(t => t.DueDate)
            .Select(t => new TaskItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                Category = t.Category,
                FamilyId = t.FamilyId,
                AssignedToFamilyMemberId = t.AssignedToFamilyMemberId,
                AssignedToFamilyMember = t.AssignedToFamilyMember != null ? new FamilyMember
                {
                    Id = t.AssignedToFamilyMember.Id,
                    FamilyId = t.AssignedToFamilyMember.FamilyId,
                    UserId = t.AssignedToFamilyMember.UserId,
                    Role = t.AssignedToFamilyMember.Role,
                    User = t.AssignedToFamilyMember.User
                } : null,
                AssignedByUserId = t.AssignedByUserId,
                AssignedByUser = t.AssignedByUser,
                // Don't include AssignedToName to avoid the error
            })
            .ToListAsync();
    }

    public async Task<bool> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int assignedByUserId, bool requiresApproval)
    {
        // First check if task and family member exist
        bool taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
        if (!taskExists)
            return false;

        FamilyMember? familyMember = await _context.FamilyMembers
            .Include(fm => fm.Family)
            .FirstOrDefaultAsync(fm => fm.Id == familyMemberId);

        if (familyMember == null)
            return false;
        
        // Use ExecuteUpdateAsync to avoid loading the entity with AssignedToName issues
        int rowsAffected = await _context.Tasks
            .Where(t => t.Id == taskId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.AssignedToFamilyMemberId, familyMemberId)
                .SetProperty(t => t.FamilyId, familyMember.FamilyId)
                .SetProperty(t => t.AssignedByUserId, assignedByUserId)
                .SetProperty(t => t.RequiresApproval, requiresApproval)
                // Removed AssignedToName property since it doesn't exist in DB
                .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
            
        return rowsAffected > 0;
    }

    public async Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId)
    {
        // Use ExecuteUpdateAsync to avoid loading the entity with AssignedToName
        int rowsAffected = await _context.Tasks
            .Where(t => t.Id == taskId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.AssignedToFamilyMemberId, (int?)null)
                .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
            
        return rowsAffected > 0;
    }

    public async Task<bool> ApproveTaskAsync(int taskId, int approverUserId, string? comment)
    {
        TaskItem? task = await _context.Tasks.FindAsync(taskId);
        if (task == null || !task.RequiresApproval)
            return false;

        task.ApprovedByUserId = approverUserId;
        task.ApprovedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        // You might want to store the comment in a separate table if needed

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsUserFamilyTaskOwnerAsync(int taskId, int userId)
    {
        TaskItem? task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
            return false;

        return task.UserId == userId || task.AssignedByUserId == userId;
    }

    public async Task<IEnumerable<TaskItem>> GetTasksWithUpcomingDeadlinesAsync(DateTime start, DateTime end)
    {
        return await _context.Tasks
            .Where(t => 
                t.DueDate.HasValue && 
                t.DueDate >= start && 
                t.DueDate <= end &&
                !t.IsCompleted)
            .Include(t => t.User)
            .Select(t => new TaskItem 
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                User = t.User,
                Version = t.Version,
                FamilyId = t.FamilyId,
                BoardId = t.BoardId,
                ApprovedAt = t.ApprovedAt,
                ApprovedByUserId = t.ApprovedByUserId,
                AssignedByUserId = t.AssignedByUserId,
                // Don't include AssignedToName to avoid the error
            })
            .ToListAsync();
    }
}