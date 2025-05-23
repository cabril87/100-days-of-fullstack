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
// Services/Interfaces/ITagService.cs
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ITagService
{
    // Basic CRUD operations
    Task<IEnumerable<TagDTO>> GetAllTagsAsync(int userId);
    Task<TagDTO?> GetTagByIdAsync(int tagId, int userId);
    Task<TagDTO> CreateTagAsync(int userId, TagCreateDTO tagDto);
    Task<TagDTO?> UpdateTagAsync(int tagId, int userId, TagUpdateDTO tagDto);
    Task<bool> DeleteTagAsync(int tagId, int userId);
    
    // Additional operations
    Task<bool> IsTagOwnedByUserAsync(int tagId, int userId);
    Task<int> GetTagUsageCountAsync(int tagId, int userId);
    Task<IEnumerable<TagDTO>> SearchTagsAsync(int userId, string searchTerm);
    
    // Task relationship operations
    Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int tagId, int userId);
    Task<Dictionary<string, int>> GetTagStatisticsAsync(int userId);
}