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
using Microsoft.Extensions.Logging;
using Microsoft.Data.SqlClient;

namespace TaskTrackerAPI.Repositories;

public class FamilyMemberRepository : IFamilyMemberRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyMemberRepository> _logger;

    public FamilyMemberRepository(ApplicationDbContext context, ILogger<FamilyMemberRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyMember>> GetAllAsync()
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .ToListAsync();
    }

    public async Task<FamilyMember?> GetByIdAsync(int id)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<FamilyMember?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<FamilyMember> CreateAsync(FamilyMember member)
    {
        _context.FamilyMembers.Add(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task<FamilyMember?> UpdateAsync(FamilyMember member)
    {
        _context.FamilyMembers.Update(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
    {
        FamilyMember? member = await _context.FamilyMembers.FindAsync(id);
        if (member == null)
            return false;

            // Clear any orphaned tasks - set a flag in case we need to handle notifications or logs
            int count = await _context.TaskItems
                .Where(t => t.AssignedToFamilyMemberId == id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(t => t.AssignedToFamilyMemberId, (int?)null)
                    .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
                    
            if (count > 0)
            {
                _logger.LogInformation("Unassigned {Count} tasks from family member {FamilyMemberId}", count, id);
            }

            // Use ExecuteDeleteAsync to delete the entity directly without loading it
            int rowsDeleted = await _context.FamilyMembers
                .Where(fm => fm.Id == id)
                .ExecuteDeleteAsync();

            return rowsDeleted > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting family member with ID {Id}", id);
            throw;
        }
    }

    public async Task<bool> ExistsByIdAsync(int id)
    {
        return await _context.FamilyMembers.AnyAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<FamilyMember>> GetByFamilyIdAsync(int familyId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .Where(m => m.FamilyId == familyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyMember>> GetByUserIdAsync(int userId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .Where(m => m.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByFamilyMemberIdAsync(int familyMemberId)
    {
        return await _context.TaskItems
            .Where(t => t.AssignedToFamilyMemberId == familyMemberId)
            .Include(t => t.Category)
            .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<FamilyMember> CreateFamilyMemberAsync(FamilyMember familyMember)
    {
        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();
        return familyMember;
    }

    public async Task<FamilyMember> UpdateFamilyMemberAsync(FamilyMember familyMember)
    {
        familyMember.UpdatedAt = DateTime.UtcNow;
        _context.FamilyMembers.Update(familyMember);
        await _context.SaveChangesAsync();
        return familyMember;
    }

    public async Task DeleteFamilyMemberAsync(FamilyMember familyMember)
    {
        try
        {
            // Clear any orphaned tasks
            int count = await _context.TaskItems
                .Where(t => t.AssignedToFamilyMemberId == familyMember.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(t => t.AssignedToFamilyMemberId, (int?)null)
                    .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
                    
            if (count > 0)
            {
                _logger.LogInformation("Unassigned {Count} tasks from family member {FamilyMemberId}", count, familyMember.Id);
            }
            
            // Use ExecuteDeleteAsync to delete directly
            await _context.FamilyMembers
                .Where(fm => fm.Id == familyMember.Id)
                .ExecuteDeleteAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting family member with ID {Id}", familyMember.Id);
            throw;
        }
    }

    public async Task<bool> IsFamilyMemberOwnedByUserAsync(int familyMemberId, int userId)
    {
        return await _context.FamilyMembers
            .AnyAsync(f => f.Id == familyMemberId && f.UserId == userId);
    }

    public async Task<FamilyMember?> GetMemberByIdAsync(int memberId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.Id == memberId);
    }

    public async Task<bool> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId)
    {
        TaskItem? task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null)
            return false;

        FamilyMember? familyMember = await _context.FamilyMembers.FirstOrDefaultAsync(f => f.Id == familyMemberId);
        if (familyMember == null)
            return false;

        // Verify that the task and family member belong to the same user
        if (task.UserId != familyMember.UserId)
            return false;

        task.AssignedToFamilyMemberId = familyMemberId;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        return true;
    }

} 
