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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class AchievementService : IAchievementService
    {
        private readonly IAchievementRepository _achievementRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AchievementService> _logger;

        public AchievementService(
            IAchievementRepository achievementRepository,
            IMapper mapper,
            ILogger<AchievementService> logger)
        {
            _achievementRepository = achievementRepository ?? throw new ArgumentNullException(nameof(achievementRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<AchievementDTO>> GetAllAchievementsAsync()
        {
            try
            {
                IEnumerable<Achievement> achievements = await _achievementRepository.GetAllAchievementsAsync();
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
                Achievement? achievement = await _achievementRepository.GetAchievementByIdAsync(id);
                return achievement != null ? _mapper.Map<AchievementDTO>(achievement) : null;
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
                IEnumerable<Achievement> achievements = await _achievementRepository.GetAchievementsByCategoryAsync(type);
                return _mapper.Map<IEnumerable<AchievementDTO>>(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements of type {Type}", type);
                throw;
            }
        }

        public Task<AchievementDTO> CreateAchievementAsync(AchievementCreateUpdateDTO achievementDto)
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

                // Note: Repository doesn't handle creation of new achievements - that would typically be admin-only
                // For now, keeping the basic structure but this would need to be moved to an admin service
                throw new NotSupportedException("Achievement creation should be handled through admin services");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating achievement {Name}", achievementDto.Name);
                throw;
            }
        }

        public Task<bool> UpdateAchievementAsync(int id, AchievementCreateUpdateDTO achievementDto)
        {
            try
            {
                // Note: Repository doesn't handle updating achievements - that would typically be admin-only
                throw new NotSupportedException("Achievement updates should be handled through admin services");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating achievement with ID {Id}", id);
                throw;
            }
        }

        public Task<bool> DeleteAchievementAsync(int id)
        {
            try
            {
                // Note: Repository doesn't handle deleting achievements - that would typically be admin-only
                throw new NotSupportedException("Achievement deletion should be handled through admin services");
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
                IEnumerable<UserAchievement> userAchievements = await _achievementRepository.GetUserAchievementsAsync(userIdInt);
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
                
                // Ensure progress is between 0 and 100
                progress = Math.Clamp(progress, 0, 100);
                
                UserAchievement? result = await _achievementRepository.UpdateProgressAsync(userIdInt, achievementId, progress);
                return result != null;
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
                IEnumerable<Achievement> relevantAchievements = await _achievementRepository.GetAchievementsByCategoryAsync(activityType);

                if (!relevantAchievements.Any())
                {
                    return true; // No relevant achievements to process
                }

                // Process each relevant achievement
                foreach (Achievement achievement in relevantAchievements)
                {
                    // Check if user has already completed this achievement
                    bool hasEarned = await _achievementRepository.HasUserEarnedAchievementAsync(userIdInt, achievement.Id);
                    if (hasEarned)
                    {
                        continue; // Skip already completed achievements
                    }

                    // Check if the activity value meets or exceeds the target value for completing
                    if (activityValue.HasValue && int.TryParse(achievement.Criteria, out int targetValue) && activityValue.Value >= targetValue)
                    {
                        // Award the achievement
                        await _achievementRepository.UpdateProgressAsync(userIdInt, achievement.Id, 100);
                    }
                }

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
                IEnumerable<UserAchievement> userAchievements = await _achievementRepository.GetRecentlyEarnedAchievementsAsync(userIdInt, count);
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