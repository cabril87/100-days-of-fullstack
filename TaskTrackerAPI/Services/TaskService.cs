using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskItemRepository _taskRepository;
        private readonly IMapper _mapper;
        private readonly ICategoryRepository _categoryRepository;
        
        public TaskService(ITaskItemRepository taskRepository, IMapper mapper, ICategoryRepository categoryRepository)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
            _categoryRepository = categoryRepository;
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
                Title = taskDto.Title,
                Description = taskDto.Description,
                Status = taskDto.Status,
                Priority = taskDto.Priority,
                DueDate = taskDto.DueDate,
                CategoryId = taskDto.CategoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            await _taskRepository.CreateTaskAsync(taskItem);
            
            // Handle tags if provided
            if (taskDto.Tags != null && taskDto.Tags.Any())
            {
                await _taskRepository.UpdateTaskTagsAsync(taskItem.Id, taskDto.Tags.Select(t => t.Id));
            }
            
            TaskItem? result = await _taskRepository.GetTaskByIdAsync(taskItem.Id, userId);
            return result != null ? _mapper.Map<TaskItemDTO>(result) : null;
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
                
            // Update properties
            existingTask.Title = taskDto.Title;
            existingTask.Description = taskDto.Description;
            existingTask.Status = taskDto.Status;
            existingTask.Priority = taskDto.Priority;
            existingTask.DueDate = taskDto.DueDate;
            existingTask.CategoryId = taskDto.CategoryId;
            existingTask.UpdatedAt = DateTime.UtcNow;
            
            await _taskRepository.UpdateTaskAsync(existingTask);
            
            // Handle tags if provided
            if (taskDto.Tags != null)
            {
                await _taskRepository.UpdateTaskTagsAsync(taskId, taskDto.Tags.Select(t => t.Id));
            }
            
            TaskItem? result = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            return result != null ? _mapper.Map<TaskItemDTO>(result) : null;
        }
        
        public async Task DeleteTaskAsync(int userId, int taskId)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            await _taskRepository.DeleteTaskAsync(taskId, userId);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByStatusAsync(int userId, TaskItemStatus status)
        {
            var tasks = await _taskRepository.GetTasksByStatusAsync(userId, status);
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
            
            var tasks = await _taskRepository.GetTasksByCategoryAsync(userId, categoryId);
            return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        }
        
        public async Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int userId, int tagId)
        {
            var tasks = await _taskRepository.GetTasksByTagAsync(userId, tagId);
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
        
        public async Task<TaskServiceStatisticsDTO> GetTaskStatisticsAsync(int userId)
        {
            IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
            DateTime today = DateTime.Today;
            DateTime endOfThisWeek = today.AddDays(7 - (int)today.DayOfWeek);
            DateTime endOfNextWeek = endOfThisWeek.AddDays(7);
            
            TaskServiceStatisticsDTO statistics = new TaskServiceStatisticsDTO
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
            foreach (var taskId in taskIds)
            {
                bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
                if (!isOwner)
                    continue;
                    
                var task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
                if (task != null)
                {
                    task.Status = TaskItemStatus.Completed;
                    task.UpdatedAt = DateTime.UtcNow;
                    await _taskRepository.UpdateTaskAsync(task);
                }
            }
        }
        
        public async Task UpdateTaskStatusAsync(int userId, int taskId, TaskItemStatus newStatus)
        {
            bool isOwner = await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isOwner)
                return;
                
            var task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
            if (task == null)
                return;
                
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
                
            var tags = await _taskRepository.GetTagsForTaskAsync(taskId);
            return _mapper.Map<IEnumerable<TagDTO>>(tags);
        }
    }
}