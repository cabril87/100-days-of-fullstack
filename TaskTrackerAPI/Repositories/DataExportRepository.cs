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
    /// Repository implementation for managing data export requests
    /// </summary>
    public class DataExportRepository : IDataExportRepository
    {
        private readonly ApplicationDbContext _context;

        public DataExportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DataExportRequest>> GetUserExportRequestsAsync(int userId)
        {
            return await _context.DataExportRequests
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<DataExportRequest?> GetByIdAsync(int id)
        {
            return await _context.DataExportRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<DataExportRequest> CreateAsync(DataExportRequest exportRequest)
        {
            exportRequest.CreatedAt = DateTime.UtcNow;
            exportRequest.Status = "pending";

            _context.DataExportRequests.Add(exportRequest);
            await _context.SaveChangesAsync();
            return exportRequest;
        }

        public async Task<DataExportRequest> UpdateAsync(DataExportRequest exportRequest)
        {
            _context.DataExportRequests.Update(exportRequest);
            await _context.SaveChangesAsync();
            return exportRequest;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var exportRequest = await _context.DataExportRequests.FindAsync(id);
            if (exportRequest == null)
                return false;

            _context.DataExportRequests.Remove(exportRequest);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DataExportRequest>> GetPendingRequestsAsync()
        {
            return await _context.DataExportRequests
                .Where(r => r.Status == "pending")
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<DataExportRequest>> GetExpiredRequestsAsync(DateTime expirationDate)
        {
            return await _context.DataExportRequests
                .Where(r => r.CreatedAt < expirationDate && r.Status == "completed")
                .ToListAsync();
        }

        public async Task<bool> UpdateStatusAsync(int id, string status, string? errorMessage = null)
        {
            var exportRequest = await _context.DataExportRequests.FindAsync(id);
            if (exportRequest == null)
                return false;

            exportRequest.Status = status;
            exportRequest.ErrorMessage = errorMessage;

            if (status == "completed")
                exportRequest.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetFilePathAsync(int id, string filePath)
        {
            var exportRequest = await _context.DataExportRequests.FindAsync(id);
            if (exportRequest == null)
                return false;

            exportRequest.FilePath = filePath;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 