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
using AutoMapper;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Exceptions;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace TaskTrackerAPI.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskItemRepository _taskRepository;
        private readonly IMapper _mapper;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IChecklistItemRepository _checklistItemRepository;
        private readonly ITaskSyncService _taskSyncService;
        
        public TaskService(
            ITaskItemRepository taskRepository, 
            IMapper mapper, 
            ICategoryRepository categoryRepository,
            IChecklistItemRepository checklistItemRepository,
            ITaskSyncService taskSyncService)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
            _categoryRepository = categoryRepository;
            _checklistItemRepository = checklistItemRepository;
            _taskSyncService = taskSyncService;
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetAllTasksAsync(int userId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        }
        
        public async Task<PagedResult<TaskItemDTO>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
        {
            PagedResult<TaskItem> pagedTasks = await _taskRepository.GetPagedTasksAsync(userId, paginationParams);
            
            List<TaskItemDTO> mappedTasks = _mapper.Map<List<TaskItemDTO>>(pagedTasks.Items);
            
            PagedResult<TaskItemDTO> result = new PagedResult<TaskItemDTO>(
                mappedTasks,
                pagedTasks.TotalCount,
                pagedTasks.PageNumber,
                pagedTasks.PageSize
            );
            
            return result;
        }
        
        public async Task<TaskItemDTO?> GetTaskByIdAsync(int userId, int taskId)
        {
            TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            return task != null ? _mapper.Map<TaskItemDTO>(task) : null;
        }
        
        public async Task<TaskItemDTO?> CreateTaskAsync(int userId, TaskItemDTO taskDto)
        {
            // Validate category ownership if a category is provided
            if (taskDto.CategoryId.HasValue)
            {
                bool isCategoryOwned = await _categoryRepository.IsCategoryOwnedByUserAsync(taskDto.CategoryId.Value, userId);
                if (!isCategoryOwned)
                {
                    throw new UnauthorizedAccessException("You do not have access to the specified category");
                }
            }
            
            TaskItem taskItem = new TaskItem
            {
                Title = taskDto.Title ?? string.Empty,
                Description = taskDto.Description ?? string.Empty,
                Status = taskDto.Status,
                Priority = taskDto.Priority.ToString(),
                DueDate = taskDto.DueDate,
                CategoryId = taskDto.CategoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Version = 1
            };
            
            await _taskRepository.CreateTaskAsync(taskItem);
            
            // Handle tags if provided
            if (taskDto.Tags != null && taskDto.Tags.Any())
            {
                await _taskRepository.UpdateTaskTagsAsync(taskItem.Id, taskDto.Tags.Select(t => t.Id));
            }
            
            TaskItem? result = await _taskRepository.GetTaskByIdAsync(taskItem.Id, userId);
            if (result != null)
            {
                TaskItemDTO resultDto = _mapper.Map<TaskItemDTO>(result);
                
                // Notify via SignalR
                await _taskSyncService.NotifyTaskCreatedAsync(userId, resultDto);
                
                return resultDto;
            }
            
            return null;
        }
        
        public async Task<TaskItemDTO?> UpdateTaskAsync(int userId, int taskId, TaskItemDTO taskDto)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return null;
                
            // Validate category ownership if a category is provided
            if (taskDto.CategoryId.HasValue)
            {
                bool isCategoryOwned = await _categoryRepository.IsCategoryOwnedByUserAsync(taskDto.CategoryId.Value, userId);
                if (!isCategoryOwned)
                {
                    throw new UnauthorizedAccessException("You do not have access to the specified category");
                }
            }
                
            TaskItem? existingTask = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            if (existingTask == null)
                return null;
                
            // Store previous state for SignalR notification
            TaskItemDTO previousState = _mapper.Map<TaskItemDTO>(existingTask);
                
            // Check version for optimistic concurrency
            if (taskDto.Version > 0 && taskDto.Version != existingTask.Version)
            {
                // Version mismatch - handle conflict
                TaskConflictDTO conflict = new TaskConflictDTO
                {
                    TaskId = taskId,
                    ClientVersion = taskDto.Version,
                    ServerVersion = existingTask.Version,
                    ClientChanges = taskDto,
                    ServerState = previousState,
                    ConflictTime = DateTime.UtcNow
                };
                
                // Identify conflicting fields
                if (taskDto.Title != previousState.Title) conflict.ConflictingFields.Add("title");
                if (taskDto.Description != previousState.Description) conflict.ConflictingFields.Add("description");
                if (taskDto.Status != previousState.Status) conflict.ConflictingFields.Add("status");
                if (taskDto.Priority != previousState.Priority) conflict.ConflictingFields.Add("priority");
                if (taskDto.DueDate != previousState.DueDate) conflict.ConflictingFields.Add("dueDate");
                
                // Notify about the conflict
                await _taskSyncService.NotifyTaskConflictAsync(userId, conflict);
                
                // Return null to indicate conflict
                throw new ConcurrencyException("Task was modified by another user", conflict);
            }
                
            // Update properties
            existingTask.Title = taskDto.Title ?? string.Empty;
            existingTask.Description = taskDto.Description ?? string.Empty;
            existingTask.Status = taskDto.Status;
            existingTask.Priority = taskDto.Priority.ToString();
            existingTask.DueDate = taskDto.DueDate;
            existingTask.CategoryId = taskDto.CategoryId;
            existingTask.UpdatedAt = DateTime.UtcNow;
            existingTask.Version++; // Increment version for optimistic concurrency
            
            await _taskRepository.UpdateTaskAsync(existingTask);
            
            // Handle tags if provided
            if (taskDto.Tags != null)
            {
                await _taskRepository.UpdateTaskTagsAsync(taskId, taskDto.Tags.Select(t => t.Id));
            }
            
            TaskItem? result = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            if (result != null)
            {
                TaskItemDTO resultDto = _mapper.Map<TaskItemDTO>(result);
                
                // Notify via SignalR
                await _taskSyncService.NotifyTaskUpdatedAsync(userId, resultDto, previousState);
                
                return resultDto;
            }
            
            return null;
        }
        
        public async Task DeleteTaskAsync(int userId, int taskId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            // Get board ID for notification before deleting
            TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            int? boardId = task?.BoardId;
            
            await _taskRepository.DeleteTaskAsync(taskId, userId);
            
            // Notify via SignalR
            await _taskSyncService.NotifyTaskDeletedAsync(userId, taskId, boardId);
        }
        
        public async Task<bool> IsTaskOwnedByUserAsync(int taskId, int userId)
        {
            return await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByStatusAsync(int userId, TaskItemStatus status)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksByStatusAsync(userId, status);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByCategoryAsync(int userId, int categoryId)
        {
            // Validate category ownership
            bool isCategoryOwned = await _categoryRepository.IsCategoryOwnedByUserAsync(categoryId, userId);
            if (!isCategoryOwned)
            {
                throw new UnauthorizedAccessException("You do not have access to the specified category");
            }
            
            IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksByCategoryAsync(userId, categoryId);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int userId, int tagId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksByTagAsync(userId, tagId);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByDueDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<TaskItem> filteredTasks = allTasks.Where(t => 
                t.DueDate.HasValue && t.DueDate.Value >= startDate && t.DueDate.Value <= endDate);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(filteredTasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetOverdueTasksAsync(int userId)
        {
            DateTime today = DateTime.Today;
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<TaskItem> overdueTasks = allTasks.Where(t => 
                t.DueDate.HasValue && t.DueDate.Value < today && t.Status != TaskItemStatus.Completed);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(overdueTasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetDueTodayTasksAsync(int userId)
        {
            DateTime today = DateTime.Today;
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<TaskItem> dueTodayTasks = allTasks.Where(t => 
                t.DueDate.HasValue && t.DueDate.Value.Date == today);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(dueTodayTasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetDueThisWeekTasksAsync(int userId)
        {
            DateTime today = DateTime.Today;
            DateTime endOfWeek = today.AddDays(7 - (int)today.DayOfWeek);
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<TaskItem> dueThisWeekTasks = allTasks.Where(t => 
                t.DueDate.HasValue && t.DueDate.Value >= today && t.DueDate.Value <= endOfWeek);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(dueThisWeekTasks);
        }
        
        public async Task<TimeRangeTaskStatisticsDTO> GetTaskStatisticsAsync(int userId)
        {
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            DateTime today = DateTime.Today;
            DateTime endOfThisWeek = today.AddDays(7 - (int)today.DayOfWeek);
            DateTime endOfNextWeek = endOfThisWeek.AddDays(7);
            
            TimeRangeTaskStatisticsDTO statistics = new TimeRangeTaskStatisticsDTO
            {
                TotalTasks = allTasks.Count(),
                CompletedTasksCount = allTasks.Count(t => t.Status == TaskItemStatus.Completed),
                InProgressTasksCount = allTasks.Count(t => t.Status == TaskItemStatus.InProgress),
                OtherStatusTasksCount = allTasks.Count(t => 
                    t.Status != TaskItemStatus.Completed && t.Status != TaskItemStatus.InProgress),
                OverdueTasksCount = allTasks.Count(t => 
                    t.DueDate.HasValue && t.DueDate.Value < today && t.Status != TaskItemStatus.Completed),
                DueTodayCount = allTasks.Count(t => 
                    t.DueDate.HasValue && t.DueDate.Value.Date == today),
                DueThisWeekCount = allTasks.Count(t => 
                    t.DueDate.HasValue && t.DueDate.Value > today && t.DueDate.Value <= endOfThisWeek),
                DueNextWeekCount = allTasks.Count(t => 
                    t.DueDate.HasValue && t.DueDate.Value > endOfThisWeek && t.DueDate.Value <= endOfNextWeek)
            };
            
            // Group tasks by category
            Dictionary<string, int> tasksByCategory = allTasks
                .Where(t => t.Category != null && !string.IsNullOrEmpty(t.Category.Name))
                .GroupBy(t => t.Category!.Name)
                .ToDictionary(g => g.Key ?? "Uncategorized", g => g.Count());
            statistics.TasksByCategory = tasksByCategory;
            
            // For tag statistics, we'll need to process each task
            Dictionary<string, int> tasksByTag = new Dictionary<string, int>();
            foreach (TaskItem task in allTasks.Where(t => t?.Id != null))
            {
                IEnumerable<Tag> tags = await _taskRepository.GetTagsForTaskAsync(task.Id);
                foreach (Tag tag in tags.Where(t => !string.IsNullOrEmpty(t.Name)))
                {
                    string tagName = tag.Name ?? "Unnamed";
                    if (tasksByTag.ContainsKey(tagName))
                        tasksByTag[tagName]++;
                    else
                        tasksByTag[tagName] = 1;
                }
            }
            statistics.TasksByTag = tasksByTag;
            
            // Get recently modified tasks
            statistics.RecentlyModifiedTasks = _mapper.Map<List<TaskItemDTO>>(
                allTasks.OrderByDescending(t => t.UpdatedAt).Take(5));
                
            // Get recently completed tasks
            statistics.RecentlyCompletedTasks = _mapper.Map<List<TaskItemDTO>>(
                allTasks.Where(t => t.Status == TaskItemStatus.Completed)
                        .OrderByDescending(t => t.UpdatedAt)
                        .Take(5));
                
            return statistics;
        }
        
        public async Task CompleteTasksAsync(int userId, List<int> taskIds)
        {
            foreach (int taskId in taskIds)
            {
                // Log the task we're trying to update
                bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
                if (!isOwner)
                {
                    // Instead of throwing, we'll skip this task
                    continue;
                }
                
                TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
                if (task == null)
                {
                    // Skip this task if not found
                    continue;
                }
                
                task.Status = TaskItemStatus.Completed;
                task.UpdatedAt = DateTime.UtcNow;
                
                await _taskRepository.UpdateTaskAsync(task);
            }
        }
        
        public async Task UpdateTaskStatusAsync(int userId, int taskId, TaskItemStatus newStatus)
        {
            // First verify the user owns the task
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return; // Don't throw an exception, just return silently
            
            // Then get the task to update it
            TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            if (task == null)
                return; // Don't throw an exception, just return silently
            
            // Update and save
            task.Status = newStatus;
            task.UpdatedAt = DateTime.UtcNow;
            
            await _taskRepository.UpdateTaskAsync(task);
        }
        
        public async Task AddTagToTaskAsync(int userId, int taskId, int tagId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            await _taskRepository.AddTagToTaskAsync(taskId, tagId);
        }
        
        public async Task RemoveTagFromTaskAsync(int userId, int taskId, int tagId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            await _taskRepository.RemoveTagFromTaskAsync(taskId, tagId);
        }
        
        public async Task UpdateTaskTagsAsync(int userId, int taskId, IEnumerable<int> tagIds)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            await _taskRepository.UpdateTaskTagsAsync(taskId, tagIds);
        }
        
        public async Task<IEnumerable<TagDTO>> GetTagsForTaskAsync(int userId, int taskId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return new List<TagDTO>();
                
            IEnumerable<Tag> tags = await _taskRepository.GetTagsForTaskAsync(taskId);
            return _mapper.Map<IEnumerable<TagDTO>>(tags);
        }
        
        public async Task<TaskAssignmentDTO?> AssignTaskAsync(int userId, CreateTaskAssignmentDTO assignmentDto)
        {
            // Verify task ownership
            bool isTaskOwned = await IsTaskOwnedByUserAsync(assignmentDto.TaskId, userId);
            if (!isTaskOwned)
            {
                throw new UnauthorizedAccessException($"User {userId} does not own task {assignmentDto.TaskId}");
            }

            // Create the assignment entity
            TaskAssignment assignment = new TaskAssignment
            {
                TaskId = assignmentDto.TaskId,
                AssignedToUserId = assignmentDto.AssignedToUserId,
                AssignedByUserId = userId,
                AssignedAt = DateTime.UtcNow,
                Notes = assignmentDto.Notes,
                IsAccepted = false
            };

            // In a real implementation, this would be saved to a repository
            // For now, we'll just return a mapped DTO
            return _mapper.Map<TaskAssignmentDTO>(assignment);
        }
        
        public async Task<List<TaskAssignmentDTO>> BatchAssignTasksAsync(int userId, BatchAssignmentRequestDTO batchAssignmentDto)
        {
            List<TaskAssignmentDTO> results = new List<TaskAssignmentDTO>();

            foreach (int taskId in batchAssignmentDto.TaskIds)
            {
                // Create assignment for each task
                CreateTaskAssignmentDTO singleAssignment = new CreateTaskAssignmentDTO
                {
                    TaskId = taskId,
                    AssignedToUserId = batchAssignmentDto.AssignedToUserId,
                    Notes = batchAssignmentDto.Notes
                };

                try
                {
                    TaskAssignmentDTO? assignment = await AssignTaskAsync(userId, singleAssignment);
                    if (assignment != null)
                    {
                        results.Add(assignment);
                    }
                }
                catch (UnauthorizedAccessException)
                {
                    // Skip tasks that the user doesn't own
                    continue;
                }
                catch (Exception)
                {
                    // Skip tasks that fail for other reasons
                    continue;
                }
            }

            return results;
        }
        
        public async Task<List<TaskStatusUpdateResponseDTO>> BatchUpdateTaskStatusAsync(int userId, BatchStatusUpdateRequestDTO batchUpdateDto)
        {
            if (batchUpdateDto == null || batchUpdateDto.TaskIds == null || !batchUpdateDto.TaskIds.Any())
            {
                return new List<TaskStatusUpdateResponseDTO>();
            }

            List<TaskStatusUpdateResponseDTO> results = new List<TaskStatusUpdateResponseDTO>();
            TaskItemStatus newStatus = batchUpdateDto.Status;

            foreach (int taskId in batchUpdateDto.TaskIds)
            {
                try
                {
                    // Check if user owns the task
                    bool isOwned = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
                    if (!isOwned)
                    {
                        continue; // Skip this task
                    }

                    // Get the current task
                    TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
                    if (task == null)
                    {
                        continue; // Skip if task not found
                    }

                    // Only update if the status is different
                    if (task.Status == newStatus)
                    {
                        continue;
                    }

                    // Record the previous status
                    TaskItemStatus previousStatus = task.Status;

                    // Update the task status
                    task.Status = newStatus;
                    task.UpdatedAt = DateTime.UtcNow;
                    task.Version++; // Increment version for optimistic concurrency

                    // If completing, set completed date
                    if (newStatus == TaskItemStatus.Completed && previousStatus != TaskItemStatus.Completed)
                    {
                        task.CompletedAt = DateTime.UtcNow;
                        task.IsCompleted = true;
                    }
                    // If moving from completed to something else, clear completed date
                    else if (previousStatus == TaskItemStatus.Completed && newStatus != TaskItemStatus.Completed)
                    {
                        task.CompletedAt = null;
                        task.IsCompleted = false;
                    }

                    await _taskRepository.UpdateTaskAsync(task);

                    TaskStatusUpdateResponseDTO response = new TaskStatusUpdateResponseDTO
                    {
                        TaskId = taskId,
                        PreviousStatus = previousStatus,
                        NewStatus = newStatus,
                        UpdatedAt = DateTime.UtcNow
                    };

                    results.Add(response);
                }
                catch (Exception)
                {
                    // Skip failed tasks and continue with the batch
                    continue;
                }
            }

            // Notify via SignalR about the batch update if any task was updated
            if (results.Count > 0)
            {
                await _taskSyncService.NotifyTaskBatchUpdateAsync(userId, results);
            }

            return results;
        }
        
        // Checklist operations
        public async Task<IEnumerable<ChecklistItemDTO>> GetChecklistItemsAsync(int userId, int taskId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return new List<ChecklistItemDTO>();
                
            IEnumerable<ChecklistItem> checklistItems = await _checklistItemRepository.GetChecklistItemsByTaskIdAsync(taskId);
            return _mapper.Map<IEnumerable<ChecklistItemDTO>>(checklistItems);
        }
        
        public async Task<ChecklistItemDTO?> AddChecklistItemAsync(int userId, ChecklistItemDTO checklistItemDto)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(checklistItemDto.TaskId, userId);
            if (!isOwner)
                return null;
                
            ChecklistItem checklistItem = _mapper.Map<ChecklistItem>(checklistItemDto);
            
            // Set creation metadata
            checklistItem.CreatedAt = DateTime.UtcNow;
            
            // Add the checklist item
            ChecklistItem addedItem = await _checklistItemRepository.AddChecklistItemAsync(checklistItem);
            
            return _mapper.Map<ChecklistItemDTO>(addedItem);
        }
        
        public async Task<bool> UpdateChecklistItemAsync(int userId, ChecklistItemDTO checklistItemDto)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(checklistItemDto.TaskId, userId);
            if (!isOwner)
                return false;
                
            // Get the existing item
            ChecklistItem? existingItem = await _checklistItemRepository.GetChecklistItemByIdAsync(checklistItemDto.Id);
            if (existingItem == null)
                return false;
                
            // Ensure the item belongs to the specified task
            if (existingItem.TaskId != checklistItemDto.TaskId)
                return false;
                
            // Update the item
            existingItem.Text = checklistItemDto.Text;
            existingItem.IsCompleted = checklistItemDto.IsCompleted;
            existingItem.DisplayOrder = checklistItemDto.DisplayOrder;
            
            // Set the completion date if the item is being marked as completed
            if (checklistItemDto.IsCompleted && !existingItem.IsCompleted)
            {
                existingItem.CompletedAt = DateTime.UtcNow;
            }
            // Clear the completion date if the item is being marked as not completed
            else if (!checklistItemDto.IsCompleted && existingItem.IsCompleted)
            {
                existingItem.CompletedAt = null;
            }
            
            await _checklistItemRepository.UpdateChecklistItemAsync(existingItem);
            
            return true;
        }
        
        public async Task<bool> DeleteChecklistItemAsync(int userId, int taskId, int itemId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return false;
                
            // Get the item and verify it belongs to the task
            ChecklistItem? item = await _checklistItemRepository.GetChecklistItemByIdAsync(itemId);
            if (item == null || item.TaskId != taskId)
                return false;
                
            return await _checklistItemRepository.DeleteChecklistItemAsync(itemId);
        }
    }
}