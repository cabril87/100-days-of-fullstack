// Controllers/TagsController.cs
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
public class TagsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TagsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Tags
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTags()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var tags = await _context.Tags
            .Where(t => t.UserId == userId)
            .ToListAsync();

        var tagDtos = tags.Select(t => new TagDTO
        {
            Id = t.Id,
            Name = t.Name,
            UserId = t.UserId
        }).ToList();

        return Ok(tagDtos);
    }

    // GET: api/Tags/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TagDTO>> GetTag(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tag == null)
        {
            return NotFound();
        }

        var tagDto = new TagDTO
        {
            Id = tag.Id,
            Name = tag.Name,
            UserId = tag.UserId
        };

        return tagDto;
    }

    // GET: api/Tags/5/Tasks
    [HttpGet("{id}/Tasks")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByTag(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Verify the tag belongs to the user
        var tagExists = await _context.Tags
            .AnyAsync(t => t.Id == id && t.UserId == userId);

        if (!tagExists)
        {
            return NotFound();
        }

        // Get all tasks with this tag
        var taskIds = await _context.TaskTags
            .Where(tt => tt.TagId == id)
            .Select(tt => tt.TaskId)
            .ToListAsync();

        // Get the tasks that belong to the user and have the tag
        var tasks = await _context.Tasks
            .Include(t => t.Category)
            .Where(t => taskIds.Contains(t.Id) && t.UserId == userId)
            .ToListAsync();

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

    // POST: api/Tags
    [HttpPost]
    public async Task<ActionResult<TagDTO>> CreateTag(TagCreateDTO createDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Check if a tag with the same name already exists for this user
        var tagExists = await _context.Tags
            .AnyAsync(t => t.Name.ToLower() == createDto.Name.ToLower() && t.UserId == userId);

        if (tagExists)
        {
            return BadRequest("A tag with this name already exists");
        }

        var tag = new Tag
        {
            Name = createDto.Name,
            UserId = userId
        };

        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();

        var tagDto = new TagDTO
        {
            Id = tag.Id,
            Name = tag.Name,
            UserId = tag.UserId
        };

        return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, tagDto);
    }

    // PUT: api/Tags/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, TagUpdateDTO updateDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tag == null)
        {
            return NotFound();
        }

        // Check if another tag with the same name already exists for this user
        var tagExists = await _context.Tags
            .AnyAsync(t => t.Id != id && t.Name.ToLower() == updateDto.Name.ToLower() && t.UserId == userId);

        if (tagExists)
        {
            return BadRequest("Another tag with this name already exists");
        }

        tag.Name = updateDto.Name;

        _context.Entry(tag).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TagExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Tags/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tag == null)
        {
            return NotFound();
        }

        // Check if there are any task-tag associations for this tag
        var hasAssociatedTasks = await _context.TaskTags
            .AnyAsync(tt => tt.TagId == id);

        // If there are associations, we'll remove them first
        if (hasAssociatedTasks)
        {
            var taskTags = await _context.TaskTags
                .Where(tt => tt.TagId == id)
                .ToListAsync();

            _context.TaskTags.RemoveRange(taskTags);
        }

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TagExists(int id)
    {
        return _context.Tags.Any(e => e.Id == id);
    }
}