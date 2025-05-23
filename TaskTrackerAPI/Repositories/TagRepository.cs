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
// Repositories/TagRepository.cs
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class TagRepository : ITagRepository
{
    private readonly ApplicationDbContext _context;
    
    public TagRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Tag>> GetTagsForUserAsync(int userId)
    {
        return await _context.Tags
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }
    
    public async Task<Tag?> GetTagByIdAsync(int tagId, int userId)
    {
        return await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == tagId && t.UserId == userId);
    }
    
    public async Task<Tag> CreateTagAsync(Tag tag)
    {
        await _context.Tags.AddAsync(tag);
        await _context.SaveChangesAsync();
        return tag;
    }
    
    public async Task UpdateTagAsync(Tag tag)
    {
        _context.Tags.Update(tag);
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteTagAsync(int tagId, int userId)
    {
        Tag? tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == tagId && t.UserId == userId);
            
        if (tag != null)
        {
            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> IsTagOwnedByUserAsync(int tagId, int userId)
    {
        return await _context.Tags
            .AnyAsync(t => t.Id == tagId && t.UserId == userId);
    }
    
    public async Task<bool> IsTagUsedInTasksAsync(int tagId)
    {
        return await _context.TaskTags
            .AnyAsync(tt => tt.TagId == tagId);
    }
    
    public async Task<int> GetTagUsageCountAsync(int tagId)
    {
        return await _context.TaskTags
            .CountAsync(tt => tt.TagId == tagId);
    }
    
    public async Task<IEnumerable<Tag>> SearchTagsAsync(int userId, string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetTagsForUserAsync(userId);
        }
        
        searchTerm = searchTerm.ToLower();
        
        return await _context.Tags
            .Where(t => t.UserId == userId && t.Name.ToLower().Contains(searchTerm))
            .OrderBy(t => t.Name)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int tagId, int userId)
    {
        IEnumerable<int> taskIds = await _context.TaskTags
            .Where(tt => tt.TagId == tagId)
            .Select(tt => tt.TaskId)
            .ToListAsync();
            
        return await _context.Tasks
            .Include(t => t.Category)
            .Where(t => taskIds.Contains(t.Id) && t.UserId == userId)
            .ToListAsync();
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Tags.AnyAsync(t => t.Id == id);
    }
}