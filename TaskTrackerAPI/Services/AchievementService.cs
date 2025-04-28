using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;
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
                    .Where(a => a.IsActive)
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
                    .FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

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
                    .Where(a => a.Category.ToLower() == type.ToLower() && a.IsActive)
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
                    TargetValue = achievementDto.TargetValue,
                    Difficulty = achievementDto.Difficulty,
                    CreatedAt = DateTime.UtcNow
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
                achievement.TargetValue = achievementDto.TargetValue;
                achievement.Difficulty = achievementDto.Difficulty;
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

                achievement.IsActive = false;
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
                    .Where(ua => ua.UserId == userIdInt && ua.Achievement != null && ua.Achievement.IsActive)
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
                    // Create a new user achievement and mark it as unlocked if progress is 100%
                    userAchievement = new UserAchievement
                    {
                        UserId = userIdInt,
                        AchievementId = achievementId,
                        UnlockedAt = progress >= 100 ? DateTime.UtcNow : default
                    };
                    _context.UserAchievements.Add(userAchievement);
                }
                else if (progress >= 100 && userAchievement.UnlockedAt == default)
                {
                    // Update unlocked date if progress reaches 100%
                    userAchievement.UnlockedAt = DateTime.UtcNow;

                    // Award points for completing the achievement
                    Achievement? achievement = await _context.Achievements.FindAsync(achievementId);
                    if (achievement != null)
                    {
                        // TODO: Award points to the user
                        // This would involve creating a PointTransaction entry
                        // or calling another service to handle point awards
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating progress for user {UserId} on achievement {AchievementId}", 
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
                    // Skip already unlocked achievements
                    if (userAchievementDict.TryGetValue(achievement.Id, out UserAchievement? userAchievement) && 
                        userAchievement != null && userAchievement.UnlockedAt != default)
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
                            UnlockedAt = default
                        };
                        _context.UserAchievements.Add(userAchievement);
                        userAchievementDict[achievement.Id] = userAchievement;
                    }

                    // Check if the activity value meets or exceeds the target value for unlocking
                    if (activityValue.HasValue && activityValue.Value >= achievement.TargetValue)
                    {
                        userAchievement.UnlockedAt = DateTime.UtcNow;
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
                    .Where(ua => 
                        ua.UserId == userIdInt && 
                        ua.Achievement != null && ua.Achievement.IsActive && 
                        ua.UnlockedAt != default)
                    .OrderByDescending(ua => ua.UnlockedAt)
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