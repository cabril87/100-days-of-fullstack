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
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for managing saved analytics filters
    /// </summary>
    public class SavedFilterRepository : ISavedFilterRepository
    {
        private readonly ApplicationDbContext _context;

        public SavedFilterRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SavedFilter>> GetUserFiltersAsync(int userId)
        {
            return await _context.SavedFilters
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<SavedFilter?> GetByIdAsync(int id)
        {
            return await _context.SavedFilters
                .Include(f => f.User)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<SavedFilter> CreateAsync(SavedFilter filter)
        {
            filter.CreatedAt = DateTime.UtcNow;
            filter.UpdatedAt = DateTime.UtcNow;

            _context.SavedFilters.Add(filter);
            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<SavedFilter> UpdateAsync(SavedFilter filter)
        {
            filter.UpdatedAt = DateTime.UtcNow;

            _context.SavedFilters.Update(filter);
            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var filter = await _context.SavedFilters.FindAsync(id);
            if (filter == null)
                return false;

            _context.SavedFilters.Remove(filter);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int userId, string name)
        {
            return await _context.SavedFilters
                .AnyAsync(f => f.UserId == userId && f.Name == name);
        }

        public async Task<IEnumerable<SavedFilter>> GetPublicFiltersAsync()
        {
            return await _context.SavedFilters
                .Where(f => f.IsPublic)
                .Include(f => f.User)
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<SavedFilter>> GetSharedFiltersAsync(int userId)
        {
            // Get filters shared with the user (this would require additional sharing logic)
            // For now, return public filters that aren't owned by the user
            return await _context.SavedFilters
                .Where(f => f.IsPublic && f.UserId != userId)
                .Include(f => f.User)
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }
    }
} 