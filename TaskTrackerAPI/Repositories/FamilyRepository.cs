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

public class FamilyRepository : TaskTrackerAPI.Repositories.Interfaces.IFamilyRepository
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
        var family = await _context.Families.FindAsync(id);
        if (family == null)
        {
            return false;
        }

        _context.Families.Remove(family);
        await _context.SaveChangesAsync();
        return true;
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

        var member = new FamilyMember
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
        var member = await _context.FamilyMembers
            .FirstOrDefaultAsync(m => m.FamilyId == familyId && m.UserId == userId);

        if (member == null)
            return false;

        _context.FamilyMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateMemberRoleAsync(int familyId, int userId, int roleId)
    {
        var member = await _context.FamilyMembers
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
            .Include(m => m.User)
            .Include(m => m.Role)
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
        var member = await _context.FamilyMembers
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
            .Include(m => m.Family)
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.Id == memberId);
    }

    public async Task<FamilyMember?> GetMemberByUserIdAsync(int userId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Family)
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.UserId == userId);
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
        var member = await _context.FamilyMembers.FindAsync(memberId);
        if (member == null)
            return false;

        _context.FamilyMembers.Remove(member);
        return await _context.SaveChangesAsync() > 0;
    }
} 