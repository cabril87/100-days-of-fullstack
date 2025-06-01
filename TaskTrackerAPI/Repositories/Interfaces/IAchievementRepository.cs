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
using System.Threading.Tasks;
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for achievement and user achievement management
    /// </summary>
    public interface IAchievementRepository
    {
        /// <summary>
        /// Gets all available achievements in the system
        /// </summary>
        /// <returns>Collection of all achievements</returns>
        Task<IEnumerable<Achievement>> GetAllAchievementsAsync();

        /// <summary>
        /// Gets all achievements earned by a specific user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of user achievements</returns>
        Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(int userId);

        /// <summary>
        /// Gets a specific user achievement
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="achievementId">ID of the achievement</param>
        /// <returns>User achievement if found</returns>
        Task<UserAchievement?> GetUserAchievementAsync(int userId, int achievementId);

        /// <summary>
        /// Creates a new user achievement (awards achievement to user)
        /// </summary>
        /// <param name="achievement">User achievement to create</param>
        /// <returns>Created user achievement</returns>
        Task<UserAchievement> CreateUserAchievementAsync(UserAchievement achievement);

        /// <summary>
        /// Updates progress for a specific user achievement
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="achievementId">ID of the achievement</param>
        /// <param name="newProgress">New progress value</param>
        /// <returns>Updated user achievement</returns>
        Task<UserAchievement?> UpdateProgressAsync(int userId, int achievementId, int newProgress);

        /// <summary>
        /// Gets achievements that are available to be earned by a user (not yet achieved)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of available achievements</returns>
        Task<IEnumerable<Achievement>> GetAvailableAchievementsAsync(int userId);

        /// <summary>
        /// Gets progress for all achievements for a user (achieved and unachieved)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of achievement progress records</returns>
        Task<IEnumerable<AchievementProgress>> GetAchievementProgressAsync(int userId);

        /// <summary>
        /// Gets a specific achievement by ID
        /// </summary>
        /// <param name="achievementId">ID of the achievement</param>
        /// <returns>Achievement if found</returns>
        Task<Achievement?> GetAchievementByIdAsync(int achievementId);

        /// <summary>
        /// Checks if a user has earned a specific achievement
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="achievementId">ID of the achievement</param>
        /// <returns>True if the user has earned the achievement</returns>
        Task<bool> HasUserEarnedAchievementAsync(int userId, int achievementId);

        /// <summary>
        /// Gets the current progress value for a user's achievement
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="achievementId">ID of the achievement</param>
        /// <returns>Current progress value</returns>
        Task<int> GetCurrentProgressAsync(int userId, int achievementId);

        /// <summary>
        /// Gets achievements by category
        /// </summary>
        /// <param name="category">Achievement category</param>
        /// <returns>Collection of achievements in the category</returns>
        Task<IEnumerable<Achievement>> GetAchievementsByCategoryAsync(string category);

        /// <summary>
        /// Gets recently earned achievements for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="days">Number of days to look back</param>
        /// <returns>Collection of recently earned achievements</returns>
        Task<IEnumerable<UserAchievement>> GetRecentlyEarnedAchievementsAsync(int userId, int days = 7);

        /// <summary>
        /// Deletes a user achievement (revokes achievement)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="achievementId">ID of the achievement</param>
        /// <returns>True if the achievement was revoked</returns>
        Task<bool> RevokeAchievementAsync(int userId, int achievementId);
    }
} 