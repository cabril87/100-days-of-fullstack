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
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace TaskTrackerAPI.Repositories;

public class FamilyRoleRepository : IFamilyRoleRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyRoleRepository> _logger;

    public FamilyRoleRepository(ApplicationDbContext context, ILogger<FamilyRoleRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyRole>> GetAllAsync()
    {
        return await _context.FamilyRoles
            .Include(r => r.Permissions)
            .ToListAsync();
    }

    public async Task<FamilyRole?> GetByIdAsync(int id)
    {
        return await _context.FamilyRoles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<FamilyRole?> GetByNameAsync(string name)
    {
        return await _context.FamilyRoles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<FamilyRole> CreateAsync(FamilyRole role)
    {
        _context.FamilyRoles.Add(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<FamilyRole?> UpdateAsync(FamilyRole role)
    {
        _context.FamilyRoles.Update(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        FamilyRole? role = await _context.FamilyRoles.FindAsync(id);
        if (role == null)
        {
            return false;
        }

        _context.FamilyRoles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsByIdAsync(int id)
    {
        return await _context.FamilyRoles.AnyAsync(r => r.Id == id);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.FamilyRoles.AnyAsync(r => r.Name == name);
    }

    public async Task<List<FamilyRolePermission>> GetPermissionsAsync(int roleId)
    {
        return await _context.FamilyRolePermissions
            .Where(p => p.RoleId == roleId)
            .ToListAsync();
    }

     public async Task<bool> AddPermissionAsync(FamilyRolePermission permission)
    {
        _context.FamilyRolePermissions.Add(permission);
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> RemovePermissionAsync(int permissionId)
    {
        FamilyRolePermission? permission = await _context.FamilyRolePermissions.FindAsync(permissionId);
        if (permission == null)
        {
            return false;
        }

        _context.FamilyRolePermissions.Remove(permission);
        await _context.SaveChangesAsync();
        return true;
    }



    public async Task<FamilyRole?> GetDefaultRoleAsync()
    {
        return await _context.FamilyRoles
            .FirstOrDefaultAsync(r => r.IsDefault)
            ?? await _context.FamilyRoles.FirstOrDefaultAsync();
    }
}