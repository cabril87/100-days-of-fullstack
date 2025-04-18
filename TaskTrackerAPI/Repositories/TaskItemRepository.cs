// Repositories/TaskItemRepository.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class TaskItemRepository : ITaskItemRepository
{
    private readonly ApplicationDbContext _context;
    
    public TaskItemRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<TaskItem>> GetAllTasksAsync(int userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
            .ToListAsync();
    }
    
    public async Task<PagedResult<TaskItem>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
    {
        IQueryable<TaskItem> query = _context.Tasks
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
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
    
    public async Task<TaskItem?> GetTaskByIdAsync(int id, int userId)
    {
        return await _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }
    
    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();
        return task;
    }
    
    public async Task UpdateTaskAsync(TaskItem task)
    {
        // For in-memory database during tests, we need this modified approach
        var entry = _context.Tasks.Entry(task);
        if (entry.State == EntityState.Detached)
        {
            var existingTask = await _context.Tasks.FindAsync(task.Id);
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
    
    public async Task DeleteTaskAsync(int id, int userId)
    {
        TaskItem? task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
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
}