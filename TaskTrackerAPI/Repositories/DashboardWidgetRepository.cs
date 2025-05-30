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
    /// Repository implementation for managing dashboard widgets
    /// </summary>
    public class DashboardWidgetRepository : IDashboardWidgetRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardWidgetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DashboardWidget>> GetUserWidgetsAsync(int userId)
        {
            return await _context.DashboardWidgets
                .Where(w => w.UserId == userId)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();
        }

        public async Task<DashboardWidget?> GetByIdAsync(int id)
        {
            return await _context.DashboardWidgets
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<DashboardWidget> CreateAsync(DashboardWidget widget)
        {
            widget.CreatedAt = DateTime.UtcNow;
            widget.UpdatedAt = DateTime.UtcNow;

            _context.DashboardWidgets.Add(widget);
            await _context.SaveChangesAsync();
            return widget;
        }

        public async Task<DashboardWidget> UpdateAsync(DashboardWidget widget)
        {
            widget.UpdatedAt = DateTime.UtcNow;

            _context.DashboardWidgets.Update(widget);
            await _context.SaveChangesAsync();
            return widget;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var widget = await _context.DashboardWidgets.FindAsync(id);
            if (widget == null)
                return false;

            _context.DashboardWidgets.Remove(widget);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DashboardWidget>> GetWidgetsByTypeAsync(int userId, string widgetType)
        {
            return await _context.DashboardWidgets
                .Where(w => w.UserId == userId && w.WidgetType == widgetType)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdatePositionAsync(int id, string position)
        {
            var widget = await _context.DashboardWidgets.FindAsync(id);
            if (widget == null)
                return false;

            widget.Position = position;
            widget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateConfigurationAsync(int id, string configuration)
        {
            var widget = await _context.DashboardWidgets.FindAsync(id);
            if (widget == null)
                return false;

            widget.Configuration = configuration;
            widget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetWidgetCountAsync(int userId)
        {
            return await _context.DashboardWidgets
                .CountAsync(w => w.UserId == userId);
        }
    }
} 