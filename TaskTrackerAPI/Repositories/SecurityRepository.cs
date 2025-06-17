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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository for centralized security validation and resource ownership verification
    /// </summary>
    public class SecurityRepository : ISecurityRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SecurityRepository> _logger;

        public SecurityRepository(ApplicationDbContext context, ILogger<SecurityRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> VerifyTaskOwnershipAsync(int taskId, int userId)
        {
            try
            {
                return await _context.TaskItems.AnyAsync(t => t.Id == taskId && t.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying task ownership for task {TaskId} and user {UserId}", taskId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyCategoryOwnershipAsync(int categoryId, int userId)
        {
            try
            {
                return await _context.Categories.AnyAsync(c => c.Id == categoryId && c.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying category ownership for category {CategoryId} and user {UserId}", categoryId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyFamilyMembershipAsync(int familyId, int userId)
        {
            try
            {
                return await _context.FamilyMembers.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying family membership for family {FamilyId} and user {UserId}", familyId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyResourceOwnershipAsync(ResourceType resourceType, int resourceId, int userId)
        {
            try
            {
                return resourceType switch
                {
                    ResourceType.Task => await VerifyTaskOwnershipAsync(resourceId, userId),
                    ResourceType.Category => await VerifyCategoryOwnershipAsync(resourceId, userId),
                    ResourceType.Tag => await VerifyTagOwnershipAsync(resourceId, userId),
                    ResourceType.User => userId == resourceId,
                    ResourceType.Family => await VerifyFamilyMembershipAsync(resourceId, userId),
                    ResourceType.FamilyMember => await VerifyFamilyMemberOwnershipAsync(resourceId, userId),
                    ResourceType.Invitation => await VerifyInvitationOwnershipAsync(resourceId, userId),
                    ResourceType.Reminder => await VerifyReminderOwnershipAsync(resourceId, userId),
                    ResourceType.Notification => await VerifyNotificationOwnershipAsync(resourceId, userId),
                    ResourceType.Achievement => await VerifyAchievementOwnershipAsync(resourceId, userId),
                    ResourceType.Focus => await VerifyFocusSessionOwnershipAsync(resourceId, userId),
                    ResourceType.Board => await VerifyBoardOwnershipAsync(resourceId, userId),
                    _ => false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying resource ownership for {ResourceType}:{ResourceId} and user {UserId}", resourceType, resourceId, userId);
                return false;
            }
        }

        public async Task<FamilyMember?> GetFamilyMemberRoleAsync(int familyId, int userId)
        {
            try
            {
                return await _context.FamilyMembers
                    .Include(fm => fm.Role)
                    .FirstOrDefaultAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family member role for family {FamilyId} and user {UserId}", familyId, userId);
                return null;
            }
        }

        public async Task<bool> VerifyFamilyAdminAsync(int familyId, int userId)
        {
            try
            {
                FamilyMember? member = await GetFamilyMemberRoleAsync(familyId, userId);
                return member?.Role?.Name?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying family admin role for family {FamilyId} and user {UserId}", familyId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyTagOwnershipAsync(int tagId, int userId)
        {
            try
            {
                return await _context.Tags.AnyAsync(t => t.Id == tagId && t.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying tag ownership for tag {TagId} and user {UserId}", tagId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyReminderOwnershipAsync(int reminderId, int userId)
        {
            try
            {
                return await _context.Reminders.AnyAsync(r => r.Id == reminderId && r.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying reminder ownership for reminder {ReminderId} and user {UserId}", reminderId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyNotificationOwnershipAsync(int notificationId, int userId)
        {
            try
            {
                return await _context.Notifications.AnyAsync(n => n.Id == notificationId && n.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying notification ownership for notification {NotificationId} and user {UserId}", notificationId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyBoardOwnershipAsync(int boardId, int userId)
        {
            try
            {
                return await _context.Boards.AnyAsync(b => b.Id == boardId && b.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying board ownership for board {BoardId} and user {UserId}", boardId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyFocusSessionOwnershipAsync(int focusSessionId, int userId)
        {
            try
            {
                return await _context.FocusSessions.AnyAsync(f => f.Id == focusSessionId && f.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying focus session ownership for session {FocusSessionId} and user {UserId}", focusSessionId, userId);
                return false;
            }
        }

        public async Task<bool> VerifyAchievementOwnershipAsync(int achievementId, int userId)
        {
            try
            {
                return await _context.UserAchievements.AnyAsync(ua => ua.Id == achievementId && ua.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying achievement ownership for achievement {AchievementId} and user {UserId}", achievementId, userId);
                return false;
            }
        }

        /// <summary>
        /// Private helper method to verify family member ownership
        /// </summary>
        private async Task<bool> VerifyFamilyMemberOwnershipAsync(int familyMemberId, int userId)
        {
            try
            {
                FamilyMember? memberEntry = await _context.FamilyMembers.FirstOrDefaultAsync(fm => fm.Id == familyMemberId);
                return memberEntry?.UserId == userId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying family member ownership for member {FamilyMemberId} and user {UserId}", familyMemberId, userId);
                return false;
            }
        }

        /// <summary>
        /// Private helper method to verify invitation ownership (user must be family admin)
        /// </summary>
        private async Task<bool> VerifyInvitationOwnershipAsync(int invitationId, int userId)
        {
            try
            {
                Invitation? invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == invitationId);
                if (invitation == null) return false;

                return await VerifyFamilyAdminAsync(invitation.FamilyId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying invitation ownership for invitation {InvitationId} and user {UserId}", invitationId, userId);
                return false;
            }
        }
    }
} 
