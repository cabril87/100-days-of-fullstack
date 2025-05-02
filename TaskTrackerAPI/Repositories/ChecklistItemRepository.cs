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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    public class ChecklistItemRepository : IChecklistItemRepository
    {
        private readonly ApplicationDbContext _context;

        public ChecklistItemRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChecklistItem>> GetChecklistItemsByTaskIdAsync(int taskId)
        {
            return await _context.ChecklistItems
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();
        }

        public async Task<ChecklistItem?> GetChecklistItemByIdAsync(int itemId)
        {
            return await _context.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == itemId);
        }

        public async Task<ChecklistItem> AddChecklistItemAsync(ChecklistItem item)
        {
            // If display order is not set, get the max order and add 1
            if (item.DisplayOrder == 0)
            {
                item.DisplayOrder = await GetMaxDisplayOrderForTaskAsync(item.TaskId) + 1;
            }
            
            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<ChecklistItem> UpdateChecklistItemAsync(ChecklistItem item)
        {
            item.UpdatedAt = DateTime.UtcNow;
            
            // If item is being marked as completed, set CompletedAt
            if (item.IsCompleted && !item.CompletedAt.HasValue)
            {
                item.CompletedAt = DateTime.UtcNow;
            }
            // If item is being marked as not completed, clear CompletedAt
            else if (!item.IsCompleted && item.CompletedAt.HasValue)
            {
                item.CompletedAt = null;
            }
            
            _context.ChecklistItems.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeleteChecklistItemAsync(int itemId)
        {
            ChecklistItem? item = await _context.ChecklistItems.FindAsync(itemId);
            if (item == null)
            {
                return false;
            }

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetMaxDisplayOrderForTaskAsync(int taskId)
        {
            // Get the maximum display order for items in this task
            int? maxOrder = await _context.ChecklistItems
                .Where(c => c.TaskId == taskId)
                .OrderByDescending(c => c.DisplayOrder)
                .Select(c => c.DisplayOrder)
                .FirstOrDefaultAsync();
                
            return maxOrder ?? 0;
        }
    }
} 