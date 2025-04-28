using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Services.Interfaces
{

    public interface IBadgeService
    {
        /// Get all badges
        Task<IEnumerable<BadgeDTO>> GetAllBadgesAsync();
        
        /// Get badge by ID
        Task<BadgeDTO?> GetBadgeByIdAsync(int id);
        
        /// Get badges by category
        Task<IEnumerable<BadgeDTO>> GetBadgesByCategoryAsync(string category);
        
        /// Get badges by rarity
        Task<IEnumerable<BadgeDTO>> GetBadgesByRarityAsync(string rarity);
        
        /// Create a new badge
        Task<BadgeDTO> CreateBadgeAsync(BadgeCreateUpdateDTO badgeDto);
        
        /// Update an existing badge
        Task<bool> UpdateBadgeAsync(int id, string name, string? description, string? category, string? imageUrl);

        /// Delete a badge
        Task<bool> DeleteBadgeAsync(int id);
        
        /// Get badges earned by a user
        Task<IEnumerable<UserBadgeDTO>> GetUserBadgesAsync(int userId);
        
        /// Award a badge to a user
        Task<bool> AwardBadgeToUserAsync(int userId, int badgeId, string? awardNote = null); 
        
        /// Remove a badge from a user
        Task<bool> RemoveBadgeFromUserAsync(int userId, int badgeId);
        
        /// Update display status of a user's badge
        Task<bool> UpdateBadgeDisplayStatusAsync(int userId, int userBadgeId, bool isDisplayed);
        
        /// Set a badge as featured (pinned) on a user's profile
        Task<bool> SetBadgeAsFeaturedAsync(int userId, int userBadgeId, bool isFeatured);
    }
} 