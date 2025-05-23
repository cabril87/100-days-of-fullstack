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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository for managing family activity records
/// </summary>
public class FamilyActivityRepository : IFamilyActivityRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyActivityRepository> _logger;

    public FamilyActivityRepository(
        ApplicationDbContext context,
        ILogger<FamilyActivityRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FamilyActivity>> GetAllByFamilyIdAsync(int familyId)
    {
        return await _context.FamilyActivities
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.Timestamp)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<FamilyActivity?> GetByIdAsync(int id)
    {
        return await _context.FamilyActivities
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    /// <inheritdoc />
    public async Task<FamilyActivity> CreateAsync(FamilyActivity activity)
    {
        await _context.FamilyActivities.AddAsync(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetFilteredAsync(
        int familyId,
        FamilyActivityFilterDTO filter)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId);

        // Apply filters
        if (filter.ActorId.HasValue)
        {
            query = query.Where(a => a.ActorId == filter.ActorId);
        }

        if (filter.TargetId.HasValue)
        {
            query = query.Where(a => a.TargetId == filter.TargetId);
        }

        if (!string.IsNullOrEmpty(filter.ActionType))
        {
            query = query.Where(a => a.ActionType == filter.ActionType);
        }

        if (!string.IsNullOrEmpty(filter.EntityType))
        {
            query = query.Where(a => a.EntityType == filter.EntityType);
        }

        if (filter.EntityId.HasValue)
        {
            query = query.Where(a => a.EntityId == filter.EntityId);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= filter.StartDate);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= filter.EndDate);
        }

        // Get total count for pagination
        int totalCount = await query.CountAsync();

        // Apply pagination
        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> SearchAsync(
        int familyId,
        string searchTerm,
        int pageNumber = 1,
        int pageSize = 20)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId && (
                a.Description != null && 
                EF.Functions.Like(a.Description, $"%{searchTerm}%")
            ));

        int totalCount = await query.CountAsync();

        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByActorIdAsync(
        int familyId,
        int userId,
        int pageNumber = 1,
        int pageSize = 20)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId && a.ActorId == userId);

        int totalCount = await query.CountAsync();

        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByTargetIdAsync(
        int familyId,
        int userId,
        int pageNumber = 1,
        int pageSize = 20)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId && a.TargetId == userId);

        int totalCount = await query.CountAsync();

        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByActionTypeAsync(
        int familyId,
        string actionType,
        int pageNumber = 1,
        int pageSize = 20)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId && a.ActionType == actionType);

        int totalCount = await query.CountAsync();

        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByEntityAsync(
        int familyId,
        string entityType,
        int entityId,
        int pageNumber = 1,
        int pageSize = 20)
    {
        IQueryable<FamilyActivity> query = _context.FamilyActivities
            .Where(a => a.FamilyId == familyId && a.EntityType == entityType && a.EntityId == entityId);

        int totalCount = await query.CountAsync();

        List<FamilyActivity> activities = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(a => a.Actor)
            .Include(a => a.Target)
            .ToListAsync();

        return (activities, totalCount);
    }
} 