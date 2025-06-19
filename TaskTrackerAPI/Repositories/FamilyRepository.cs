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

namespace TaskTrackerAPI.Repositories;

public class FamilyRepository : IFamilyRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyRepository> _logger;

    public FamilyRepository(ApplicationDbContext context, ILogger<FamilyRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Family>> GetAllAsync()
    {
        return await _context.Families
            .Include(f => f.Members)
            .ToListAsync();
    }

    public async Task<Family?> GetByIdAsync(int id)
    {
        return await _context.Families
            .Include(f => f.Members)
                .ThenInclude(m => m.Role)
                    .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<Family>> GetByUserIdAsync(int userId)
    {
        return await _context.Families
            .Where(f => f.Members.Any(m => m.UserId == userId))
            .Include(f => f.Members)
                .ThenInclude(m => m.Role)
                    .ThenInclude(r => r.Permissions)
            .ToListAsync();
    }

    public async Task<Family> CreateAsync(Family family)
    {
        _context.Families.Add(family);
        await _context.SaveChangesAsync();
        return family;
    }

    public async Task<Family?> UpdateAsync(Family family)
    {
        _context.Families.Update(family);
        await _context.SaveChangesAsync();
        return family;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Attempting to delete family with ID: {FamilyId}", id);

            // First verify the family exists
            Family? family = await _context.Families.FindAsync(id);
            if (family == null)
            {
                _logger.LogWarning("Family with ID {FamilyId} not found for deletion", id);
                return false;
            }

            // Use the execution strategy to properly handle transactions with retries
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Delete any associated records first to avoid foreign key constraint violations
                    var familyMembers = await _context.FamilyMembers.Where(m => m.FamilyId == id).ToListAsync();
                    if (familyMembers.Any())
                    {
                        _context.FamilyMembers.RemoveRange(familyMembers);
                    }

                    // Now delete the family
                    _context.Families.Remove(family);

                    // Create audit log entry
                    _context.AuditLogs.Add(new AuditLog
                    {
                        EntityType = "Family",
                        EntityId = id,
                        Action = "Delete",
                        Timestamp = DateTime.UtcNow,
                        UserId = family.CreatedById,
                        Details = $"Family '{family.Name}' was deleted"
                    });

                    // Save changes
                    await _context.SaveChangesAsync();

                    // Commit transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation("Successfully deleted family with ID: {FamilyId}", id);
                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during family delete transaction for ID {FamilyId}", id);
                    await transaction.RollbackAsync();
                    return false;
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception deleting family with ID {FamilyId}", id);
            return false;
        }
    }

    public async Task<bool> AddMemberAsync(int familyId, int userId, int roleId)
    {
        // Check if user is already a member
        bool isAlreadyMember = await _context.FamilyMembers
            .AnyAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (isAlreadyMember)
        {
            return false;
        }

        FamilyMember member = new FamilyMember
        {
            FamilyId = familyId,
            UserId = userId,
            RoleId = roleId,
            JoinedAt = DateTime.UtcNow
        };

        _context.FamilyMembers.Add(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(int familyId, int userId)
    {
        FamilyMember? member = await _context.FamilyMembers
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (member == null)
            return false;

        _context.FamilyMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateMemberRoleAsync(int familyId, int userId, int roleId)
    {
        FamilyMember? member = await _context.FamilyMembers
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (member == null)
            return false;

        member.RoleId = roleId;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<FamilyMember>> GetMembersAsync(int familyId)
    {
        return await _context.FamilyMembers
            .Include(m => m.Role)
                .ThenInclude(r => r.Permissions)
            .Include(m => m.User)
            .Where(m => m.FamilyId == familyId)
            .ToListAsync();
    }

    public async Task<bool> FamilyExistsAsync(int familyId)
    {
        return await _context.Families.AnyAsync(f => f.Id == familyId);
    }

    public async Task<bool> IsMemberAsync(int familyId, int userId)
    {
        return await _context.FamilyMembers
            .AnyAsync(m => m.FamilyId == familyId && m.UserId == userId);
    }

    public async Task<bool> HasPermissionAsync(int familyId, int userId, string permission)
    {
        // Special case: Always allow calendar event creation for any family member
        if (permission == "create_events" || permission == "manage_calendar")
        {
            // Just check if they're a member of the family
            bool isMember = await IsMemberAsync(familyId, userId);
            if (isMember)
            {
                _logger.LogInformation("Granting {Permission} permission to user {UserId} for family {FamilyId} by override",
                    permission, userId, familyId);
                return true;
            }
        }

        // Regular permission check for other permissions
        FamilyMember? member = await _context.FamilyMembers
            .Include(m => m.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (member == null)
        {
            return false;
        }

        return member.Role.Permissions.Any(p => p.Name == permission);
    }

    public async Task<FamilyMember?> GetMemberByIdAsync(int memberId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(m => m.Id == memberId);
    }

    public async Task<FamilyMember?> GetMemberByUserIdAsync(int userId, int familyId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.FamilyId == familyId);
    }

    public async Task<IEnumerable<FamilyMember>> GetPendingMembersAsync()
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Family)
            .Include(m => m.Role)
            .Where(m => m.IsPending)
            .ToListAsync();
    }

    public async Task<bool> UpdateMemberAsync(FamilyMember member)
    {
        _context.FamilyMembers.Update(member);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteMemberAsync(int memberId)
    {
        FamilyMember? member = await _context.FamilyMembers.FindAsync(memberId);
        if (member == null)
            return false;

        _context.FamilyMembers.Remove(member);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> IsUserAdminOfFamilyAsync(int userId, int familyId)
    {
        // Check if user is the creator of the family
        Family? family = await _context.Families
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family != null && family.CreatedById == userId)
        {
            return true;
        }

        // Check if user has admin permissions through their role
        return await HasPermissionAsync(familyId, userId, "manage_family");
    }

    public async Task<bool> IsUserFamilyAdminAsync(int userId)
    {
        // Get all families the user belongs to
        IEnumerable<Family> userFamilies = await GetByUserIdAsync(userId);

        // Check if user is admin of any family
        foreach (Family family in userFamilies)
        {
            if (await IsUserAdminOfFamilyAsync(userId, family.Id))
            {
                return true;
            }
        }

        return false;
    }

    public async Task<IEnumerable<Family>> GetFamiliesUserIsAdminOfAsync(int userId)
    {
        IEnumerable<Family> allUserFamilies = await GetByUserIdAsync(userId);
        List<Family> adminFamilies = new List<Family>();

        foreach (Family family in allUserFamilies)
        {
            if (await IsUserAdminOfFamilyAsync(userId, family.Id))
            {
                adminFamilies.Add(family);
            }
        }

        return adminFamilies;
    }

    public async Task<IEnumerable<Family>> GetFamiliesUserIsMemberOfAsync(int userId)
    {
        // Return ALL families the user belongs to (including as admin)
        // This should be the same as GetByUserIdAsync since admins are also members
        return await _context.Families
            .Include(f => f.Members)
                .ThenInclude(m => m.Role)
                    .ThenInclude(r => r.Permissions)
            .Where(f => f.Members.Any(m => m.UserId == userId))
            .ToListAsync();
    }

        public async Task<IEnumerable<Family>> GetFamiliesUserHasManagementPrivilegesAsync(int userId)
    {
        return await _context.Families
            .Include(f => f.Members)
                .ThenInclude(m => m.Role)
                    .ThenInclude(r => r.Permissions)
            .Where(f => f.Members.Any(m => m.UserId == userId && 
                       m.Role.Permissions.Any(p => p.Name.Contains("manage") || p.Name.Contains("admin"))))
            .ToListAsync();
    }

    public async Task<bool> TransferFamilyOwnershipAsync(int familyId, int currentOwnerId, int newOwnerId)
    {
        // Verify current owner
        Family? family = await _context.Families
            .FirstOrDefaultAsync(f => f.Id == familyId && f.CreatedById == currentOwnerId);

        if (family == null)
        {
            return false;
        }

        // Verify new owner is a member of the family
        FamilyMember? newOwnerMember = await _context.FamilyMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == newOwnerId);

        if (newOwnerMember == null)
        {
            return false;
        }

        // Check age restrictions - children cannot become family owners
        if (newOwnerMember.User?.AgeGroup == FamilyMemberAgeGroup.Child)
        {
            return false;
        }

        // Transfer ownership
        family.CreatedById = newOwnerId;
        family.UpdatedAt = DateTime.UtcNow;

        // Make sure new owner has admin role
        FamilyRole? adminRole = await _context.FamilyRoles
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        if (adminRole != null)
        {
            newOwnerMember.RoleId = adminRole.Id;
        }

        // Optionally demote old owner to a member role (not admin)
        FamilyMember? currentOwnerMember = await _context.FamilyMembers
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == currentOwnerId);

        if (currentOwnerMember != null)
        {
            FamilyRole? memberRole = await _context.FamilyRoles
                .FirstOrDefaultAsync(r => r.Name == "Member");

            if (memberRole != null)
            {
                currentOwnerMember.RoleId = memberRole.Id;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CanUserManageFamilyBasedOnAgeAsync(int userId, int familyId)
    {
        // Get user information directly from Users table
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return false;
        }

        // Get family information to check additional constraints
        Family? family = await _context.Families
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.Id == familyId);

        if (family == null)
        {
            return false;
        }

        // Age-based restrictions with enhanced logic:
        switch (user.AgeGroup)
        {
            case FamilyMemberAgeGroup.Child:
                // Children (under 13): Cannot manage families at all
                return false;

            case FamilyMemberAgeGroup.Teen:
                // Teens (13-17): Can manage families they created, but with restrictions
                if (family.CreatedById == userId)
                {
                    // Teens can only manage families with <= 5 members
                    return family.Members.Count <= 5;
                }

                // Teens can have limited management privileges if granted by an adult admin
                FamilyMember? teenMember = family.Members.FirstOrDefault(m => m.UserId == userId);
                if (teenMember != null)
                {
                    // Check if teen has specific teen-management permissions
                    bool hasTeenManagementRole = await _context.FamilyRoles
                        .Include(r => r.Permissions)
                        .Where(r => r.Id == teenMember.RoleId)
                        .AnyAsync(r => r.Permissions.Any(p => p.Name == "teen_manage_family"));

                    return hasTeenManagementRole && family.Members.Count <= 5;
                }

                return false;

            case FamilyMemberAgeGroup.Adult:
                // Adults (18+): Can manage families if they have admin permissions or created the family
                return family.CreatedById == userId ||
                       await HasPermissionAsync(familyId, userId, "manage_family");

            default:
                return false;
        }
    }

    // Primary family management
    public async Task<Family?> GetPrimaryFamilyAsync(int userId)
    {
        try
        {
            User? user = await _context.Users
                .Include(u => u.PrimaryFamily)
                    .ThenInclude(f => f!.Members)
                        .ThenInclude(m => m.Role)
                            .ThenInclude(r => r!.Permissions)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.PrimaryFamily;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting primary family for user {UserId}", userId);
            return null;
        }
    }

    public async Task<bool> SetPrimaryFamilyAsync(int userId, int familyId)
    {
        try
        {
            // Verify user exists
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found when setting primary family", userId);
                return false;
            }

            // Verify family exists and user is a member
            bool isMember = await IsMemberAsync(familyId, userId);
            if (!isMember)
            {
                _logger.LogWarning("User {UserId} is not a member of family {FamilyId}", userId, familyId);
                return false;
            }

            // Update user's primary family
            user.PrimaryFamilyId = familyId;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully set primary family {FamilyId} for user {UserId}", familyId, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting primary family {FamilyId} for user {UserId}", familyId, userId);
            return false;
        }
    }

    public async Task<bool> UpdatePrimaryFamilyAsync(int userId, int familyId)
    {
        // For this implementation, UpdatePrimaryFamily is the same as SetPrimaryFamily
        // Could be enhanced in the future to include additional validation or logic
        return await SetPrimaryFamilyAsync(userId, familyId);
    }
}