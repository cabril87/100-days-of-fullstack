// Controllers/TaskItemsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TaskItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TaskItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/TaskItems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasks(
        [FromQuery] TaskItemStatus? status = null,
        [FromQuery] int? categoryId = null)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var query = _context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);
        
        // Apply filters if provided
        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }
        
        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }
        
        var tasks = await query.ToListAsync();
        
        var taskDtos = new List<TaskItemDTO>();
        
        foreach (var t in tasks)
        {
            // Get tags for this task
            var taskTags = await _context.TaskTags
                .Include(tt => tt.Tag)
                .Where(tt => tt.TaskId == t.Id)
                .ToListAsync();
                
            var taskDto = new TaskItemDTO
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                Priority = t.Priority,
                UserId = t.UserId,
                CategoryId = t.CategoryId,
                CategoryName = t.Category?.Name,
                Tags = taskTags.Select(tt => new TagDTO 
                { 
                    Id = tt.Tag!.Id, 
                    Name = tt.Tag.Name, 
                    UserId = tt.Tag.UserId 
                }).ToList()
            };
            
            taskDtos.Add(taskDto);
        }
        
        return Ok(taskDtos);
    }

    // GET: api/TaskItems/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDTO>> GetTaskItem(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var taskItem = await _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (taskItem == null)
        {
            return NotFound();
        }
        
        // Get tags for this task
        var taskTags = await _context.TaskTags
            .Include(tt => tt.Tag)
            .Where(tt => tt.TaskId == taskItem.Id)
            .ToListAsync();

        var taskDto = new TaskItemDTO
        {
            Id = taskItem.Id,
            Title = taskItem.Title,
            Description = taskItem.Description,
            Status = taskItem.Status,
            DueDate = taskItem.DueDate,
            CreatedAt = taskItem.CreatedAt,
            UpdatedAt = taskItem.UpdatedAt,
            Priority = taskItem.Priority,
            UserId = taskItem.UserId,
            CategoryId = taskItem.CategoryId,
            CategoryName = taskItem.Category?.Name,
            Tags = taskTags.Select(tt => new TagDTO 
            { 
                Id = tt.Tag!.Id, 
                Name = tt.Tag.Name, 
                UserId = tt.Tag.UserId 
            }).ToList()
        };

        return taskDto;
    }

    // POST: api/TaskItems
    [HttpPost]
    public async Task<ActionResult<TaskItemDTO>> CreateTaskItem(TaskItemCreateDTO createDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        // Verify the category belongs to the user if provided
        if (createDto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == createDto.CategoryId.Value && c.UserId == userId);
                
            if (!categoryExists)
            {
                return BadRequest("Invalid category ID");
            }
        }
        
        // Create new task
        var taskItem = new TaskItem
        {
            Title = createDto.Title,
            Description = createDto.Description,
            Status = createDto.Status,
            DueDate = createDto.DueDate,
            Priority = createDto.Priority,
            CategoryId = createDto.CategoryId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Tasks.Add(taskItem);
        await _context.SaveChangesAsync();
        
        // Add tags if any
        if (createDto.TagIds.Count > 0)
        {
            // Verify all tags belong to the user
            var userTagIds = await _context.Tags
                .Where(t => t.UserId == userId && createDto.TagIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();
                
            // Only add valid tag relationships
            foreach (var tagId in userTagIds)
            {
                _context.TaskTags.Add(new TaskTag
                {
                    TaskId = taskItem.Id,
                    TagId = tagId
                });
            }
            
            await _context.SaveChangesAsync();
        }
        
        // Reload the task with related data
        await _context.Entry(taskItem).Reference(t => t.Category).LoadAsync();
        
        // Get tags for this task
        var taskTags = await _context.TaskTags
            .Include(tt => tt.Tag)
            .Where(tt => tt.TaskId == taskItem.Id)
            .ToListAsync();
            
        // Create response DTO
        var taskDto = new TaskItemDTO
        {
            Id = taskItem.Id,
            Title = taskItem.Title,
            Description = taskItem.Description,
            Status = taskItem.Status,
            DueDate = taskItem.DueDate,
            CreatedAt = taskItem.CreatedAt,
            UpdatedAt = taskItem.UpdatedAt,
            Priority = taskItem.Priority,
            UserId = taskItem.UserId,
            CategoryId = taskItem.CategoryId,
            CategoryName = taskItem.Category?.Name,
            Tags = taskTags.Select(tt => new TagDTO 
            { 
                Id = tt.Tag!.Id, 
                Name = tt.Tag.Name, 
                UserId = tt.Tag.UserId 
            }).ToList()
        };
        
        return CreatedAtAction(nameof(GetTaskItem), new { id = taskItem.Id }, taskDto);
    }

    // PUT: api/TaskItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskItem(int id, TaskItemUpdateDTO updateDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var taskItem = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            
        if (taskItem == null)
        {
            return NotFound();
        }
        
        // Verify the category belongs to the user if provided
        if (updateDto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == updateDto.CategoryId.Value && c.UserId == userId);
                
            if (!categoryExists)
            {
                return BadRequest("Invalid category ID");
            }
        }
        
        // Update properties if provided
        if (updateDto.Title != null)
            taskItem.Title = updateDto.Title;
            
        if (updateDto.Description != null)
            taskItem.Description = updateDto.Description;
            
        if (updateDto.Status.HasValue)
            taskItem.Status = updateDto.Status.Value;
            
        if (updateDto.DueDate.HasValue)
            taskItem.DueDate = updateDto.DueDate;
            
        if (updateDto.Priority.HasValue)
            taskItem.Priority = updateDto.Priority.Value;
            
        if (updateDto.CategoryId.HasValue)
            taskItem.CategoryId = updateDto.CategoryId;
            
        taskItem.UpdatedAt = DateTime.UtcNow;
        
        // Update tags if provided
        if (updateDto.TagIds != null)
        {
            // Get existing task-tag relationships
            var existingTaskTags = await _context.TaskTags
                .Where(tt => tt.TaskId == id)
                .ToListAsync();
                
            // Remove existing relationships
            _context.TaskTags.RemoveRange(existingTaskTags);
            
            // Verify all tags belong to the user
            var userTagIds = await _context.Tags
                .Where(t => t.UserId == userId && updateDto.TagIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();
                
            // Add new relationships
            foreach (var tagId in userTagIds)
            {
                _context.TaskTags.Add(new TaskTag
                {
                    TaskId = taskItem.Id,
                    TagId = tagId
                });
            }
        }
        
        await _context.SaveChangesAsync();
        
        return NoContent();
    }

    // DELETE: api/TaskItems/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var taskItem = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            
        if (taskItem == null)
        {
            return NotFound();
        }
        
        _context.Tasks.Remove(taskItem);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}