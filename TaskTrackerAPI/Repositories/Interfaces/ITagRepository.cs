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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ITagRepository
{
    Task<IEnumerable<Tag>> GetTagsForUserAsync(int userId);
    Task<Tag?> GetTagByIdAsync(int tagId, int userId);
    Task<Tag> CreateTagAsync(Tag tag);
    Task UpdateTagAsync(Tag tag);
    Task DeleteTagAsync(int tagId, int userId);
    
    Task<bool> IsTagOwnedByUserAsync(int tagId, int userId);
    Task<bool> IsTagUsedInTasksAsync(int tagId);
    Task<int> GetTagUsageCountAsync(int tagId);
    Task<IEnumerable<Tag>> SearchTagsAsync(int userId, string searchTerm);
    
    Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int tagId, int userId);
}