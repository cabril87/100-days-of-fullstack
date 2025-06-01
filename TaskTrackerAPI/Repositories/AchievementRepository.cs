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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for achievement and user achievement management
    /// </summary>
    public class AchievementRepository : IAchievementRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AchievementRepository> _logger;

        public AchievementRepository(ApplicationDbContext context, ILogger<AchievementRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Achievement>> GetAllAchievementsAsync()
        {
            try
            {
                return await _context.Achievements
                    .OrderBy(a => a.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all achievements");
                return Enumerable.Empty<Achievement>();
            }
        }

        public async Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(int userId)
        {
            try
            {
                return await _context.UserAchievements
                    .Include(ua => ua.Achievement)
                    .Where(ua => ua.UserId == userId)
                    .OrderByDescending(ua => ua.CompletedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user achievements for user {UserId}", userId);
                return Enumerable.Empty<UserAchievement>();
            }
        }

        public async Task<UserAchievement?> GetUserAchievementAsync(int userId, int achievementId)
        {
            try
            {
                return await _context.UserAchievements
                    .Include(ua => ua.Achievement)
                    .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user achievement for user {UserId} and achievement {AchievementId}", userId, achievementId);
                return null;
            }
        }

        public async Task<UserAchievement> CreateUserAchievementAsync(UserAchievement achievement)
        {
            try
            {
                achievement.CompletedAt = DateTime.UtcNow;
                _context.UserAchievements.Add(achievement);
                await _context.SaveChangesAsync();
                
                // Load the achievement details
                await _context.Entry(achievement)
                    .Reference(ua => ua.Achievement)
                    .LoadAsync();
                    
                _logger.LogInformation("Achievement {AchievementId} awarded to user {UserId}", achievement.AchievementId, achievement.UserId);
                return achievement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user achievement for user {UserId} and achievement {AchievementId}", achievement.UserId, achievement.AchievementId);
                throw;
            }
        }

        public async Task<UserAchievement?> UpdateProgressAsync(int userId, int achievementId, int newProgress)
        {
            try
            {
                UserAchievement? existingProgress = await _context.UserAchievements
                    .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);

                if (existingProgress != null)
                {
                    existingProgress.Progress = newProgress;
                    // Check if completed
                    if (newProgress >= 100 && !existingProgress.IsCompleted)
                    {
                        existingProgress.IsCompleted = true;
                        existingProgress.CompletedAt = DateTime.UtcNow;
                    }
                }
                else
                {
                    // Create new progress record
                    existingProgress = new UserAchievement
                    {
                        UserId = userId,
                        AchievementId = achievementId,
                        Progress = newProgress,
                        IsCompleted = newProgress >= 100,
                        StartedAt = DateTime.UtcNow,
                        CompletedAt = newProgress >= 100 ? DateTime.UtcNow : null
                    };
                    _context.UserAchievements.Add(existingProgress);
                }

                await _context.SaveChangesAsync();
                
                // Load achievement details
                await _context.Entry(existingProgress)
                    .Reference(ua => ua.Achievement)
                    .LoadAsync();
                    
                return existingProgress;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating progress for user {UserId} and achievement {AchievementId}", userId, achievementId);
                return null;
            }
        }

        public async Task<IEnumerable<Achievement>> GetAvailableAchievementsAsync(int userId)
        {
            try
            {
                List<int> earnedAchievementIds = await _context.UserAchievements
                    .Where(ua => ua.UserId == userId)
                    .Select(ua => ua.AchievementId)
                    .ToListAsync();

                return await _context.Achievements
                    .Where(a => !earnedAchievementIds.Contains(a.Id))
                    .OrderBy(a => a.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available achievements for user {UserId}", userId);
                return Enumerable.Empty<Achievement>();
            }
        }

        public async Task<IEnumerable<AchievementProgress>> GetAchievementProgressAsync(int userId)
        {
            try
            {
                List<Achievement> allAchievements = await _context.Achievements.ToListAsync();
                List<UserAchievement> userAchievements = await _context.UserAchievements
                    .Where(ua => ua.UserId == userId)
                    .ToListAsync();

                List<AchievementProgress> progressList = new List<AchievementProgress>();

                foreach (Achievement achievement in allAchievements)
                {
                    UserAchievement? userAchievement = userAchievements.FirstOrDefault(ua => ua.AchievementId == achievement.Id);
                    
                    progressList.Add(new AchievementProgress
                    {
                        Achievement = achievement,
                        Progress = userAchievement?.Progress ?? 0,
                        IsEarned = userAchievement?.IsCompleted ?? false,
                        EarnedAt = userAchievement?.CompletedAt
                    });
                }

                return progressList.OrderBy(ap => ap.Achievement.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement progress for user {UserId}", userId);
                return Enumerable.Empty<AchievementProgress>();
            }
        }

        public async Task<Achievement?> GetAchievementByIdAsync(int achievementId)
        {
            try
            {
                return await _context.Achievements.FindAsync(achievementId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement {AchievementId}", achievementId);
                return null;
            }
        }

        public async Task<bool> HasUserEarnedAchievementAsync(int userId, int achievementId)
        {
            try
            {
                return await _context.UserAchievements
                    .AnyAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} has earned achievement {AchievementId}", userId, achievementId);
                return false;
            }
        }

        public async Task<int> GetCurrentProgressAsync(int userId, int achievementId)
        {
            try
            {
                UserAchievement? userAchievement = await _context.UserAchievements
                    .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
                    
                return userAchievement?.Progress ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving progress for user {UserId} and achievement {AchievementId}", userId, achievementId);
                return 0;
            }
        }

        public async Task<IEnumerable<Achievement>> GetAchievementsByCategoryAsync(string category)
        {
            try
            {
                return await _context.Achievements
                    .Where(a => a.Category == category)
                    .OrderBy(a => a.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements by category {Category}", category);
                return Enumerable.Empty<Achievement>();
            }
        }

        public async Task<IEnumerable<UserAchievement>> GetRecentlyEarnedAchievementsAsync(int userId, int days = 7)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-days);
                
                return await _context.UserAchievements
                    .Include(ua => ua.Achievement)
                    .Where(ua => ua.UserId == userId && ua.CompletedAt >= cutoffDate)
                    .OrderByDescending(ua => ua.CompletedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recently earned achievements for user {UserId}", userId);
                return Enumerable.Empty<UserAchievement>();
            }
        }

        public async Task<bool> RevokeAchievementAsync(int userId, int achievementId)
        {
            try
            {
                UserAchievement? userAchievement = await _context.UserAchievements
                    .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);

                if (userAchievement == null)
                {
                    return false;
                }

                _context.UserAchievements.Remove(userAchievement);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Achievement {AchievementId} revoked from user {UserId}", achievementId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking achievement {AchievementId} from user {UserId}", achievementId, userId);
                return false;
            }
        }
    }
} 