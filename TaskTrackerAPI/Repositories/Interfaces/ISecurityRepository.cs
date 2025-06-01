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
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository for centralized security validation and resource ownership verification
    /// </summary>
    public interface ISecurityRepository
    {
        /// <summary>
        /// Verifies if a user owns a specific task
        /// </summary>
        /// <param name="taskId">ID of the task to check</param>
        /// <param name="userId">ID of the user to verify</param>
        /// <returns>True if the user owns the task</returns>
        Task<bool> VerifyTaskOwnershipAsync(int taskId, int userId);

        /// <summary>
        /// Verifies if a user owns a specific category
        /// </summary>
        /// <param name="categoryId">ID of the category to check</param>
        /// <param name="userId">ID of the user to verify</param>
        /// <returns>True if the user owns the category</returns>
        Task<bool> VerifyCategoryOwnershipAsync(int categoryId, int userId);

        /// <summary>
        /// Verifies if a user is a member of a specific family
        /// </summary>
        /// <param name="familyId">ID of the family to check</param>
        /// <param name="userId">ID of the user to verify</param>
        /// <returns>True if the user is a family member</returns>
        Task<bool> VerifyFamilyMembershipAsync(int familyId, int userId);

        /// <summary>
        /// Generic resource ownership verification
        /// </summary>
        /// <param name="resourceType">Type of resource to check</param>
        /// <param name="resourceId">ID of the resource</param>
        /// <param name="userId">ID of the user to verify</param>
        /// <returns>True if the user owns the resource</returns>
        Task<bool> VerifyResourceOwnershipAsync(ResourceType resourceType, int resourceId, int userId);

        /// <summary>
        /// Gets the family member entry with role information
        /// </summary>
        /// <param name="familyId">ID of the family</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>FamilyMember with role information if found</returns>
        Task<FamilyMember?> GetFamilyMemberRoleAsync(int familyId, int userId);

        /// <summary>
        /// Verifies if a user has admin role in a family
        /// </summary>
        /// <param name="familyId">ID of the family</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user is a family admin</returns>
        Task<bool> VerifyFamilyAdminAsync(int familyId, int userId);

        /// <summary>
        /// Verifies if a user owns a tag
        /// </summary>
        /// <param name="tagId">ID of the tag</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the tag</returns>
        Task<bool> VerifyTagOwnershipAsync(int tagId, int userId);

        /// <summary>
        /// Verifies if a user owns a reminder
        /// </summary>
        /// <param name="reminderId">ID of the reminder</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the reminder</returns>
        Task<bool> VerifyReminderOwnershipAsync(int reminderId, int userId);

        /// <summary>
        /// Verifies if a user owns a notification
        /// </summary>
        /// <param name="notificationId">ID of the notification</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the notification</returns>
        Task<bool> VerifyNotificationOwnershipAsync(int notificationId, int userId);

        /// <summary>
        /// Verifies if a user owns a board
        /// </summary>
        /// <param name="boardId">ID of the board</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the board</returns>
        Task<bool> VerifyBoardOwnershipAsync(int boardId, int userId);

        /// <summary>
        /// Verifies if a user owns a focus session
        /// </summary>
        /// <param name="focusSessionId">ID of the focus session</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the focus session</returns>
        Task<bool> VerifyFocusSessionOwnershipAsync(int focusSessionId, int userId);

        /// <summary>
        /// Verifies if a user owns an achievement
        /// </summary>
        /// <param name="achievementId">ID of the achievement</param>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if the user owns the achievement</returns>
        Task<bool> VerifyAchievementOwnershipAsync(int achievementId, int userId);
    }
} 