// Services/TagService.cs
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    private readonly ILogger<TagService> _logger;
    
    public TagService(ITagRepository tagRepository, ILogger<TagService> logger)
    {
        _tagRepository = tagRepository;
        _logger = logger;
    }
    
    public async Task<IEnumerable<TagDTO>> GetAllTagsAsync(int userId)
    {
        IEnumerable<Tag> tags = await _tagRepository.GetTagsForUserAsync(userId);
        
        return tags.Select(MapToTagDto);
    }
    
    public async Task<TagDTO?> GetTagByIdAsync(int tagId, int userId)
    {
        Tag? tag = await _tagRepository.GetTagByIdAsync(tagId, userId);
        
        if (tag == null)
        {
            return null;
        }
        
        return MapToTagDto(tag);
    }
    
    public async Task<TagDTO> CreateTagAsync(int userId, TagCreateDTO tagDto)
    {
        // Check if a tag with the same name already exists for this user
        IEnumerable<Tag> existingTags = await _tagRepository.GetTagsForUserAsync(userId);
        
        if (existingTags.Any(t => t.Name.Equals(tagDto.Name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"A tag with the name '{tagDto.Name}' already exists");
        }
        
        Tag tag = new Tag
        {
            Name = tagDto.Name,
            UserId = userId
        };
        
        await _tagRepository.CreateTagAsync(tag);
        
        return MapToTagDto(tag);
    }
    
    public async Task<TagDTO?> UpdateTagAsync(int tagId, int userId, TagUpdateDTO tagDto)
    {
        Tag? tag = await _tagRepository.GetTagByIdAsync(tagId, userId);
        
        if (tag == null)
        {
            return null;
        }
        
        // Check if the new name would conflict with an existing tag
        if (!string.IsNullOrEmpty(tagDto.Name) && 
            !tagDto.Name.Equals(tag.Name, StringComparison.OrdinalIgnoreCase))
        {
            IEnumerable<Tag> existingTags = await _tagRepository.GetTagsForUserAsync(userId);
            
            if (existingTags.Any(t => t.Id != tagId && 
                                 t.Name.Equals(tagDto.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"A tag with the name '{tagDto.Name}' already exists");
            }
            
            tag.Name = tagDto.Name;
        }
        
        await _tagRepository.UpdateTagAsync(tag);
        
        return MapToTagDto(tag);
    }
    
    public async Task<bool> DeleteTagAsync(int tagId, int userId)
    {
        // Check if the tag exists and belongs to the user
        if (!await _tagRepository.IsTagOwnedByUserAsync(tagId, userId))
        {
            return false;
        }
        
        // Check if there are tasks using this tag
        bool isUsed = await _tagRepository.IsTagUsedInTasksAsync(tagId);
        
        // If used, just warn in the logs but still delete
        // This is different from categories, as tags can be removed without orphaning tasks
        if (isUsed)
        {
            _logger.LogWarning("Deleting tag ID {TagId} that is used by tasks", tagId);
        }
        
        await _tagRepository.DeleteTagAsync(tagId, userId);
        return true;
    }
    
    public async Task<bool> IsTagOwnedByUserAsync(int tagId, int userId)
    {
        return await _tagRepository.IsTagOwnedByUserAsync(tagId, userId);
    }
    
    public async Task<int> GetTagUsageCountAsync(int tagId, int userId)
    {
        // Verify ownership first
        if (!await _tagRepository.IsTagOwnedByUserAsync(tagId, userId))
        {
            throw new UnauthorizedAccessException("You do not have access to this tag");
        }
        
        return await _tagRepository.GetTagUsageCountAsync(tagId);
    }
    
    public async Task<IEnumerable<TagDTO>> SearchTagsAsync(int userId, string searchTerm)
    {
        IEnumerable<Tag> tags = await _tagRepository.SearchTagsAsync(userId, searchTerm);
        
        return tags.Select(MapToTagDto);
    }
    
    public async Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int tagId, int userId)
    {
        // Verify ownership first
        if (!await _tagRepository.IsTagOwnedByUserAsync(tagId, userId))
        {
            throw new UnauthorizedAccessException("You do not have access to this tag");
        }
        
        IEnumerable<TaskItem> tasks = await _tagRepository.GetTasksByTagAsync(tagId, userId);
        
        return tasks.Select(MapToTaskItemDto);
    }
    
    public async Task<Dictionary<string, int>> GetTagStatisticsAsync(int userId)
    {
        Dictionary<string, int> statistics = new Dictionary<string, int>();
        
        IEnumerable<Tag> tags = await _tagRepository.GetTagsForUserAsync(userId);
        
        foreach (Tag tag in tags)
        {
            int usageCount = await _tagRepository.GetTagUsageCountAsync(tag.Id);
            statistics[tag.Name] = usageCount;
        }
        
        return statistics;
    }
    
    // Helper method to map Tag to TagDTO
    private static TagDTO MapToTagDto(Tag tag)
    {
        return new TagDTO
        {
            Id = tag.Id,
            Name = tag.Name,
            UserId = tag.UserId
        };
    }
    
    // Helper method to map TaskItem to TaskItemDTO
    private static TaskItemDTO MapToTaskItemDto(TaskItem task)
    {
        return new TaskItemDTO
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            Priority = task.Priority,
            UserId = task.UserId,
            CategoryId = task.CategoryId,
            CategoryName = task.Category?.Name,
            // Note: Tags are not included here to avoid circular references
            // They would be loaded separately if needed
            Tags = new List<TagDTO>()
        };
    }
}