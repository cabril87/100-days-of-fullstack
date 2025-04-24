using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class FamilyAchievementRepository : IFamilyAchievementRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyAchievementRepository> _logger;

    public FamilyAchievementRepository(ApplicationDbContext context, ILogger<FamilyAchievementRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyAchievement>> GetAllAsync()
    {
        return await _context.FamilyAchievements
            .Include(a => a.MemberContributions)
            .ToListAsync();
    }

    public async Task<FamilyAchievement?> GetByIdAsync(int id)
    {
        return await _context.FamilyAchievements
            .Include(a => a.MemberContributions)
                .ThenInclude(c => c.Member)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<FamilyAchievement>> GetByFamilyIdAsync(int familyId)
    {
        return await _context.FamilyAchievements
            .Where(a => a.FamilyId == familyId)
            .Include(a => a.MemberContributions)
                .ThenInclude(c => c.Member)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyAchievement>> GetCompletedByFamilyIdAsync(int familyId)
    {
        return await _context.FamilyAchievements
            .Where(a => a.FamilyId == familyId && a.IsCompleted)
            .Include(a => a.MemberContributions)
                .ThenInclude(c => c.Member)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyAchievement>> GetInProgressByFamilyIdAsync(int familyId)
    {
        return await _context.FamilyAchievements
            .Where(a => a.FamilyId == familyId && !a.IsCompleted)
            .Include(a => a.MemberContributions)
                .ThenInclude(c => c.Member)
            .ToListAsync();
    }

    public async Task<FamilyAchievement> CreateAsync(FamilyAchievement achievement)
    {
        _context.FamilyAchievements.Add(achievement);
        await _context.SaveChangesAsync();
        return achievement;
    }

    public async Task<FamilyAchievement?> UpdateAsync(FamilyAchievement achievement)
    {
        _context.Entry(achievement).State = EntityState.Modified;
        
        try
        {
            await _context.SaveChangesAsync();
            return achievement;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Error updating family achievement {AchievementId}", achievement.Id);
            return null;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var achievement = await _context.FamilyAchievements.FindAsync(id);
        if (achievement == null)
            return false;

        _context.FamilyAchievements.Remove(achievement);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease)
    {
        var achievement = await _context.FamilyAchievements.FindAsync(achievementId);
        if (achievement == null)
            return false;

        achievement.ProgressCurrent += progressIncrease;
        achievement.UpdatedAt = DateTime.UtcNow;
        
        // Check if achievement is completed
        if (achievement.ProgressCurrent >= achievement.ProgressTarget && !achievement.IsCompleted)
        {
            achievement.IsCompleted = true;
            achievement.CompletedAt = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddMemberContributionAsync(int achievementId, int memberId, int points)
    {
        var contribution = await _context.FamilyAchievementMembers
            .FirstOrDefaultAsync(c => c.AchievementId == achievementId && c.FamilyMemberId == memberId);
            
        if (contribution != null)
        {
            // Update existing contribution
            contribution.ContributionPoints += points;
            contribution.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new contribution
            contribution = new FamilyAchievementMember
            {
                AchievementId = achievementId,
                FamilyMemberId = memberId,
                ContributionPoints = points,
                CreatedAt = DateTime.UtcNow
            };
            _context.FamilyAchievementMembers.Add(contribution);
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<FamilyAchievementMember>> GetMemberContributionsAsync(int achievementId)
    {
        return await _context.FamilyAchievementMembers
            .Where(c => c.AchievementId == achievementId)
            .Include(c => c.Member)
            .ToListAsync();
    }
    
    public async Task<int> GetFamilyPointsTotalAsync(int familyId)
    {
        var achievements = await _context.FamilyAchievements
            .Where(a => a.FamilyId == familyId && a.IsCompleted)
            .ToListAsync();
            
        return achievements.Sum(a => a.PointValue);
    }
} 