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
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class AchievementService : IAchievementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AchievementService> _logger;

        public AchievementService(
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<AchievementService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AchievementDTO>> GetAllAchievementsAsync()
        {
            try
            {
                IEnumerable<Achievement> achievements = await _context.Achievements
                    .Where(a => !a.IsDeleted)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<AchievementDTO>>(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all achievements");
                throw;
            }
        }

        public async Task<AchievementDTO?> GetAchievementByIdAsync(int id)
        {
            try
            {
                Achievement? achievement = await _context.Achievements
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

                if (achievement == null)
                {
                    return null;
                }

                return _mapper.Map<AchievementDTO>(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement with ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<AchievementDTO>> GetAchievementsByTypeAsync(string type)
        {
            try
            {
                IEnumerable<Achievement> achievements = await _context.Achievements
                    .Where(a => a.Category.ToLower() == type.ToLower() && !a.IsDeleted)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<AchievementDTO>>(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements of type {Type}", type);
                throw;
            }
        }

        public async Task<AchievementDTO> CreateAchievementAsync(AchievementCreateUpdateDTO achievementDto)
        {
            try
            {
                Achievement achievement = new Achievement
                {
                    Name = achievementDto.Name,
                    Description = achievementDto.Description,
                    Category = achievementDto.Category,
                    PointValue = achievementDto.PointValue,
                    IconUrl = achievementDto.IconUrl,
                    Criteria = achievementDto.TargetValue.ToString(),
                    Difficulty = (AchievementDifficulty)achievementDto.Difficulty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Achievements.Add(achievement);
                await _context.SaveChangesAsync();

                return _mapper.Map<AchievementDTO>(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating achievement {Name}", achievementDto.Name);
                throw;
            }
        }

        public async Task<bool> UpdateAchievementAsync(int id, AchievementCreateUpdateDTO achievementDto)
        {
            try
            {
                Achievement? achievement = await _context.Achievements
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (achievement == null)
                {
                    return false;
                }

                achievement.Name = achievementDto.Name;
                achievement.Description = achievementDto.Description;
                achievement.Category = achievementDto.Category;
                achievement.PointValue = achievementDto.PointValue;
                achievement.IconUrl = achievementDto.IconUrl;
                achievement.Criteria = achievementDto.TargetValue.ToString();
                achievement.Difficulty = (AchievementDifficulty)achievementDto.Difficulty;
                achievement.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating achievement with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAchievementAsync(int id)
        {
            try
            {
                Achievement? achievement = await _context.Achievements
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (achievement == null)
                {
                    return false;
                }

                achievement.IsDeleted = true;
                achievement.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting achievement with ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<UserAchievementDTO>> GetUserAchievementsAsync(string userId)
        {
            try
            {
                int userIdInt = int.Parse(userId);
                IEnumerable<UserAchievement> userAchievements = await _context.UserAchievements
                    .Include(ua => ua.Achievement)
                    .Where(ua => ua.UserId == userIdInt && ua.Achievement != null && !ua.Achievement.IsDeleted)
                    .ToListAsync();
                
                return _mapper.Map<IEnumerable<UserAchievementDTO>>(userAchievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> UpdateUserAchievementProgressAsync(string userId, int achievementId, int progress)
        {
            try
            {
                int userIdInt = int.Parse(userId);
                UserAchievement? userAchievement = await _context.UserAchievements
                    .FirstOrDefaultAsync(ua => ua.UserId == userIdInt && ua.AchievementId == achievementId);
                
                if (userAchievement == null)
                {
                    // Create new user achievement record
                    userAchievement = new UserAchievement
                    {
                        UserId = userIdInt,
                        AchievementId = achievementId,
                        Progress = 0,
                        IsCompleted = false,
                        StartedAt = DateTime.UtcNow
                    };
                    
                    _context.UserAchievements.Add(userAchievement);
                }
                
                // Ensure progress is between 0 and 100
                progress = Math.Clamp(progress, 0, 100);
                
                // Update progress
                userAchievement.Progress = progress;
                
                // If progress reached 100%, mark as completed
                if (progress >= 100 && !userAchievement.IsCompleted)
                {
                    userAchievement.IsCompleted = true;
                    userAchievement.CompletedAt = DateTime.UtcNow;
                    
                    // TODO: Award points for completing achievement
                }
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating achievement progress for user {UserId}, achievement {AchievementId}",
                    userId, achievementId);
                throw;
            }
        }

        public async Task<bool> ProcessUserActivityAsync(string userId, string activityType, int? activityValue = null)
        {
            try
            {
                int userIdInt = int.Parse(userId);
                // Get all achievements that match the activity type
                List<Achievement> relevantAchievements = await _context.Achievements
                    .Where(a => a.Category.ToLower() == activityType.ToLower())
                    .ToListAsync();

                if (!relevantAchievements.Any())
                {
                    return true; // No relevant achievements to process
                }

                // Get or create user achievements
                List<UserAchievement> userAchievements = await _context.UserAchievements
                    .Where(ua => ua.UserId == userIdInt && relevantAchievements.Select(a => a.Id).Contains(ua.AchievementId))
                    .ToListAsync();

                Dictionary<int, UserAchievement> userAchievementDict = userAchievements.ToDictionary(ua => ua.AchievementId);

                foreach (Achievement achievement in relevantAchievements)
                {
                    // Skip already completed achievements
                    if (userAchievementDict.TryGetValue(achievement.Id, out UserAchievement? userAchievement) && 
                        userAchievement != null && userAchievement.IsCompleted)
                    {
                        continue;
                    }

                    // For achievements without a record, create one
                    if (!userAchievementDict.TryGetValue(achievement.Id, out userAchievement))
                    {
                        userAchievement = new UserAchievement
                        {
                            UserId = userIdInt,
                            AchievementId = achievement.Id,
                            Progress = 0,
                            IsCompleted = false,
                            StartedAt = DateTime.UtcNow
                        };
                        _context.UserAchievements.Add(userAchievement);
                        userAchievementDict[achievement.Id] = userAchievement;
                    }

                    // Check if the activity value meets or exceeds the target value for completing
                    if (activityValue.HasValue && int.TryParse(achievement.Criteria, out int targetValue) && activityValue.Value >= targetValue)
                    {
                        userAchievement.Progress = 100;
                        userAchievement.IsCompleted = true;
                        userAchievement.CompletedAt = DateTime.UtcNow;
                        // TODO: Award points
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing activity {ActivityType} for user {UserId}", 
                    activityType, userId);
                throw;
            }
        }

        public async Task<IEnumerable<UserAchievementDTO>> GetRecentlyUnlockedAchievementsAsync(string userId, int count = 5)
        {
            try
            {
                int userIdInt = int.Parse(userId);
                IEnumerable<UserAchievement> userAchievements = await _context.UserAchievements
                    .Include(ua => ua.Achievement)
                    .Where(ua => ua.UserId == userIdInt && ua.IsCompleted && ua.CompletedAt != null)
                    .OrderByDescending(ua => ua.CompletedAt)
                    .Take(count)
                    .ToListAsync();
                
                return _mapper.Map<IEnumerable<UserAchievementDTO>>(userAchievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recently unlocked achievements for user {UserId}", userId);
                throw;
            }
        }

        // Legacy methods that handle int userId values, converting them to string
        public Task<IEnumerable<UserAchievementDTO>> GetUserAchievementsAsync(int userId)
        {
            return GetUserAchievementsAsync(userId.ToString());
        }

        public Task<bool> UpdateUserAchievementProgressAsync(int userId, int achievementId, int progress)
        {
            return UpdateUserAchievementProgressAsync(userId.ToString(), achievementId, progress);
        }

        public Task<bool> ProcessUserActivityAsync(int userId, string activityType, int? activityValue = null)
        {
            return ProcessUserActivityAsync(userId.ToString(), activityType, activityValue);
        }

        public Task<IEnumerable<UserAchievementDTO>> GetRecentlyUnlockedAchievementsAsync(int userId, int count = 5)
        {
            return GetRecentlyUnlockedAchievementsAsync(userId.ToString(), count);
        }
    }
} 