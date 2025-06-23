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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for managing security questions
/// Provides CRUD operations and verification methods for enhanced authentication
/// </summary>
public interface ISecurityQuestionRepository
{
    /// <summary>
    /// Gets all security questions for a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Collection of security questions for the user</returns>
    Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsByUserIdAsync(int userId);

    /// <summary>
    /// Gets a specific security question by ID
    /// </summary>
    /// <param name="questionId">Security question ID</param>
    /// <returns>Security question or null if not found</returns>
    Task<SecurityQuestion?> GetSecurityQuestionByIdAsync(int questionId);

    /// <summary>
    /// Gets security questions for a user by email address
    /// </summary>
    /// <param name="email">User's email address</param>
    /// <returns>Collection of security questions for the user</returns>
    Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsByEmailAsync(string email);

    /// <summary>
    /// Checks if a user has security questions set up
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if user has security questions, false otherwise</returns>
    Task<bool> HasSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Gets the count of security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of security questions set up</returns>
    Task<int> GetSecurityQuestionCountAsync(int userId);

    /// <summary>
    /// Creates a new security question
    /// </summary>
    /// <param name="securityQuestion">Security question to create</param>
    /// <returns>Created security question</returns>
    Task<SecurityQuestion> CreateSecurityQuestionAsync(SecurityQuestion securityQuestion);

    /// <summary>
    /// Updates an existing security question
    /// </summary>
    /// <param name="securityQuestion">Security question to update</param>
    /// <returns>Updated security question</returns>
    Task<SecurityQuestion> UpdateSecurityQuestionAsync(SecurityQuestion securityQuestion);

    /// <summary>
    /// Deletes a security question by ID
    /// </summary>
    /// <param name="questionId">Security question ID to delete</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteSecurityQuestionAsync(int questionId);

    /// <summary>
    /// Deletes all security questions for a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of security questions deleted</returns>
    Task<int> DeleteAllUserSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Verifies if provided answers match the user's security questions
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="answers">Dictionary of question order and answers</param>
    /// <returns>True if all answers are correct, false otherwise</returns>
    Task<bool> VerifySecurityAnswersAsync(int userId, Dictionary<int, string> answers);

    /// <summary>
    /// Updates the last used timestamp for security questions
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Task completion</returns>
    Task UpdateLastUsedTimestampAsync(int userId);

    /// <summary>
    /// Increments usage count for security questions
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Task completion</returns>
    Task IncrementUsageCountAsync(int userId);

    /// <summary>
    /// Gets security questions ordered by their question order
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Ordered collection of security questions</returns>
    Task<IEnumerable<SecurityQuestion>> GetOrderedSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Checks if a specific question order is already used by a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="questionOrder">Question order to check</param>
    /// <returns>True if order is already used, false otherwise</returns>
    Task<bool> IsQuestionOrderUsedAsync(int userId, int questionOrder);

    /// <summary>
    /// Gets the next available question order for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Next available question order (1-3)</returns>
    Task<int> GetNextAvailableQuestionOrderAsync(int userId);

    /// <summary>
    /// Deactivates all security questions for a user (soft delete)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of questions deactivated</returns>
    Task<int> DeactivateAllUserSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Reactivates all security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of questions reactivated</returns>
    Task<int> ReactivateAllUserSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Gets all active security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Collection of active security questions</returns>
    Task<IEnumerable<SecurityQuestion>> GetActiveSecurityQuestionsAsync(int userId);
} 