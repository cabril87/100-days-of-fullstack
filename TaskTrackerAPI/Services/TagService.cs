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
// Services/TagService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using AutoMapper;
using TaskDto = TaskTrackerAPI.DTOs.Tasks.TagDto;

namespace TaskTrackerAPI.Services;

public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    private readonly ILogger<TagService> _logger;
    private readonly IMapper _mapper;
    
    public TagService(ITagRepository tagRepository, ILogger<TagService> logger, IMapper mapper)
    {
        _tagRepository = tagRepository;
        _logger = logger;
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
    
    /// <summary>
    /// Find existing tags by name or create new ones if they don't exist
    /// </summary>
    /// <param name="userId">User ID for tag ownership</param>
    /// <param name="tagNames">List of tag names to find or create</param>
    /// <returns>List of tag IDs</returns>
    public async Task<List<int>> FindOrCreateTagsByNamesAsync(int userId, List<string> tagNames)
    {
        if (tagNames == null || !tagNames.Any())
        {
            return new List<int>();
        }
        
        List<int> tagIds = new List<int>();
        
        // Get all existing tags for the user
        IEnumerable<Tag> existingTags = await _tagRepository.GetTagsForUserAsync(userId);
        Dictionary<string, Tag> existingTagsDict = existingTags.ToDictionary(t => t.Name.ToLowerInvariant(), t => t);
        
        foreach (string tagName in tagNames)
        {
            if (string.IsNullOrWhiteSpace(tagName))
            {
                continue; // Skip empty tag names
            }
            
            string normalizedTagName = tagName.Trim();
            string lowerTagName = normalizedTagName.ToLowerInvariant();
            
            // Check if tag already exists (case-insensitive)
            if (existingTagsDict.TryGetValue(lowerTagName, out Tag? existingTag))
            {
                _logger.LogDebug("Found existing tag '{TagName}' with ID {TagId} for user {UserId}", 
                    existingTag.Name, existingTag.Id, userId);
                tagIds.Add(existingTag.Id);
            }
            else
            {
                // Create new tag
                try
                {
                    _logger.LogInformation("Creating new tag '{TagName}' for user {UserId}", normalizedTagName, userId);
                    
                    var newTag = new Tag
                    {
                        Name = normalizedTagName,
                        UserId = userId
                    };
                    
                    await _tagRepository.CreateTagAsync(newTag);
                    
                    // Add to our tracking dictionary to avoid duplicates in the same request
                    existingTagsDict[lowerTagName] = newTag;
                    tagIds.Add(newTag.Id);
                    
                    _logger.LogInformation("Successfully created tag '{TagName}' with ID {TagId} for user {UserId}", 
                        newTag.Name, newTag.Id, userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create tag '{TagName}' for user {UserId}", normalizedTagName, userId);
                    // Continue processing other tags instead of failing the entire operation
                }
            }
        }
        
        return tagIds;
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
    private TaskItemDTO MapToTaskItemDto(TaskItem task)
    {
        return new TaskItemDTO
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = _mapper.Map<TaskItemStatusDTO>(task.Status),
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            Priority = int.Parse(task.Priority),
            UserId = task.UserId,
            CategoryId = task.CategoryId,
            CategoryName = task.Category?.Name ?? string.Empty,
            // Note: Tags are not included here to avoid circular references
            // They would be loaded separately if needed
            Tags = new List<TaskTrackerAPI.DTOs.Tasks.TagDto>()
        };
    }
}