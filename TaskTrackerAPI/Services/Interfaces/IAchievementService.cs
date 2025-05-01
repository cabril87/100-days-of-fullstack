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
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Services.Interfaces
{
    
    /// Interface for achievement management in the gamification system
    
    public interface IAchievementService
    {
        
        /// Gets all available achievements
        
        /// <returns>Collection of all achievements</returns>
        Task<IEnumerable<AchievementDTO>> GetAllAchievementsAsync();

        
        /// Gets an achievement by its unique identifier
        
        /// <param name="id">The achievement ID</param>
        /// <returns>The achievement if found, null otherwise</returns>
        Task<AchievementDTO?> GetAchievementByIdAsync(int id);

        
        /// Gets achievements by type
        
        /// <param name="type">The achievement type</param>
        /// <returns>Collection of achievements of the specified type</returns>
        Task<IEnumerable<AchievementDTO>> GetAchievementsByTypeAsync(string type);

        
        /// Creates a new achievement
        
        /// <param name="achievementDto">The achievement creation information</param>
        /// <returns>The created achievement with assigned ID</returns>
        Task<AchievementDTO> CreateAchievementAsync(AchievementCreateUpdateDTO achievementDto);

        
        /// Updates an existing achievement
        
        /// <param name="id">The achievement ID to update</param>
        /// <param name="achievementDto">The updated achievement information</param>
        /// <returns>True if updated successfully, false otherwise</returns>
        Task<bool> UpdateAchievementAsync(int id, AchievementCreateUpdateDTO achievementDto);

        
        /// Deletes an achievement
        
        /// <param name="id">The achievement ID to delete</param>
        /// <returns>True if deleted successfully, false otherwise</returns>
        Task<bool> DeleteAchievementAsync(int id);

        
        /// Gets all achievements for a user, including progress
        
        /// <param name="userId">The user ID</param>
        /// <returns>Collection of achievements with progress for the user</returns>
        Task<IEnumerable<UserAchievementDTO>> GetUserAchievementsAsync(string userId);

        
        /// Updates progress for a user's achievement
        
        /// <param name="userId">The user ID</param>
        /// <param name="achievementId">The achievement ID</param>
        /// <param name="progress">The new progress value</param>
        /// <returns>True if updated successfully, false otherwise</returns>
        Task<bool> UpdateUserAchievementProgressAsync(string userId, int achievementId, int progress);

        
        /// Checks user activity and updates achievement progress automatically
        
        /// <param name="userId">The user ID</param>
        /// <param name="activityType">The type of activity performed</param>
        /// <param name="activityValue">The value associated with the activity (optional)</param>
        /// <returns>True if processed successfully, false otherwise</returns>
        Task<bool> ProcessUserActivityAsync(string userId, string activityType, int? activityValue = null);

        
        /// Gets recently unlocked achievements for a user
        
        /// <param name="userId">The user ID</param>
        /// <param name="count">Maximum number of achievements to return</param>
        /// <returns>Collection of recently unlocked achievements</returns>
        Task<IEnumerable<UserAchievementDTO>> GetRecentlyUnlockedAchievementsAsync(string userId, int count = 5);
    }
} 