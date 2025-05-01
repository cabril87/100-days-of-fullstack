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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface IChecklistItemRepository
    {
        Task<IEnumerable<ChecklistItem>> GetChecklistItemsByTaskIdAsync(int taskId);
        Task<ChecklistItem?> GetChecklistItemByIdAsync(int itemId);
        Task<ChecklistItem> AddChecklistItemAsync(ChecklistItem item);
        Task<ChecklistItem> UpdateChecklistItemAsync(ChecklistItem item);
        Task<bool> DeleteChecklistItemAsync(int itemId);
        Task<int> GetMaxDisplayOrderForTaskAsync(int taskId);
    }
} 