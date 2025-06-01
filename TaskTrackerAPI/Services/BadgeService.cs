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
using AutoMapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class BadgeService : IBadgeService
    {
        private readonly IBadgeRepository _badgeRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<BadgeService> _logger;

        public BadgeService(IBadgeRepository badgeRepository, IMapper mapper, ILogger<BadgeService> logger)
        {
            _badgeRepository = badgeRepository ?? throw new ArgumentNullException(nameof(badgeRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<BadgeDTO>> GetAllBadgesAsync()
        {
            try
            {
                IEnumerable<Badge> badges = await _badgeRepository.GetAllBadgesAsync();
                return _mapper.Map<IEnumerable<BadgeDTO>>(badges);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all badges");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<BadgeDTO?> GetBadgeByIdAsync(int id)
        {
            try
            {
                Badge? badge = await _badgeRepository.GetBadgeByIdAsync(id);
                return badge != null ? _mapper.Map<BadgeDTO>(badge) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badge with ID {BadgeId}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<BadgeDTO>> GetBadgesByCategoryAsync(string category)
        {
            try
            {
                IEnumerable<Badge> badges = await _badgeRepository.GetBadgesByCategoryAsync(category);
                return _mapper.Map<IEnumerable<BadgeDTO>>(badges);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for category {Category}", category);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<BadgeDTO>> GetBadgesByRarityAsync(string rarity)
        {
            try
            {
                IEnumerable<Badge> badges = await _badgeRepository.GetBadgesByTierAsync(rarity);
                return _mapper.Map<IEnumerable<BadgeDTO>>(badges);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges with rarity {Rarity}", rarity);
                throw;
            }
        }

        /// <inheritdoc/>
        public Task<BadgeDTO> CreateBadgeAsync(BadgeCreateUpdateDTO badgeDto)
        {
            try
            {
                // Note: Badge creation should be handled by admin services
                throw new NotSupportedException("Badge creation should be handled through admin services");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating badge {BadgeName}", badgeDto.Name);
                throw;
            }
        }

        /// <inheritdoc/>
        public Task<bool> UpdateBadgeAsync(int id, string name, string? description, string? category, string? imageUrl)
        {
            try
            {
                // Note: Badge updates should be handled by admin services
                throw new NotSupportedException("Badge updates should be handled through admin services");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating badge {BadgeId}", id);
                return Task.FromResult(false);
            }
        }

        /// <inheritdoc/>
        public Task<bool> DeleteBadgeAsync(int id)
        {
            try
            {
                // Note: Badge deletion should be handled by admin services
                throw new NotSupportedException("Badge deletion should be handled through admin services");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting badge with ID {BadgeId}", id);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<UserBadgeDTO>> GetUserBadgesAsync(int userId)
        {
            try
            {
                IEnumerable<UserBadge> userBadges = await _badgeRepository.GetUserBadgesAsync(userId);
                return _mapper.Map<IEnumerable<UserBadgeDTO>>(userBadges);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> AwardBadgeToUserAsync(int userId, int badgeId, string? awardNote = null)
        {
            try
            {
                // Check if user already has this badge
                bool hasEarned = await _badgeRepository.HasUserEarnedBadgeAsync(userId, badgeId);
                if (hasEarned)
                {
                    _logger.LogInformation("User {UserId} already has badge {BadgeId}", userId, badgeId);
                    return false;
                }

                // Award badge to user
                await _badgeRepository.AwardBadgeAsync(userId, badgeId);
                _logger.LogInformation("Badge {BadgeId} awarded to user {UserId}", badgeId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error awarding badge {BadgeId} to user {UserId}", badgeId, userId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> RemoveBadgeFromUserAsync(int userId, int badgeId)
        {
            try
            {
                bool result = await _badgeRepository.RevokeBadgeAsync(userId, badgeId);
                if (result)
                {
                    _logger.LogInformation("Badge {BadgeId} removed from user {UserId}", badgeId, userId);
                }
                else
                {
                    _logger.LogWarning("User {UserId} does not have badge {BadgeId}", userId, badgeId);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing badge {BadgeId} from user {UserId}", badgeId, userId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> UpdateBadgeDisplayStatusAsync(int userId, int userBadgeId, bool isDisplayed)
        {
            try
            {
                bool result = await _badgeRepository.UpdateBadgeDisplayStatusAsync(userId, userBadgeId, isDisplayed);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating display status for user badge {UserBadgeId}", userBadgeId);
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> SetBadgeAsFeaturedAsync(int userId, int userBadgeId, bool isFeatured)
        {
            try
            {
                bool result = await _badgeRepository.SetBadgeAsFeaturedAsync(userId, userBadgeId, isFeatured);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting featured status for user badge {UserBadgeId}", userBadgeId);
                throw;
            }
        }
    }
} 