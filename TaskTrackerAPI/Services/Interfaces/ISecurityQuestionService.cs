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
using TaskTrackerAPI.DTOs.Auth;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for managing security questions
/// Provides business logic for enhanced authentication and password recovery
/// </summary>
public interface ISecurityQuestionService
{
    /// <summary>
    /// Sets up security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="setupDto">Security question setup data</param>
    /// <returns>Success confirmation</returns>
    Task<bool> SetupSecurityQuestionsAsync(int userId, SecurityQuestionSetupDTO setupDto);

    /// <summary>
    /// Gets user's security questions (without answers) for display
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Security questions list</returns>
    Task<SecurityQuestionListDTO> GetUserSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Gets user's security questions by email address (for password reset)
    /// </summary>
    /// <param name="email">User's email address</param>
    /// <returns>Security questions list</returns>
    Task<SecurityQuestionListDTO> GetSecurityQuestionsByEmailAsync(string email);

    /// <summary>
    /// Verifies security question answers for password reset
    /// </summary>
    /// <param name="verificationDto">Verification data with answers</param>
    /// <returns>Verification result with token if successful</returns>
    Task<SecurityQuestionVerificationResultDTO> VerifySecurityAnswersAsync(SecurityQuestionVerificationDTO verificationDto);

    /// <summary>
    /// Updates existing security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="updateDto">Update data</param>
    /// <returns>Success confirmation</returns>
    Task<bool> UpdateSecurityQuestionsAsync(int userId, SecurityQuestionUpdateDTO updateDto);

    /// <summary>
    /// Deletes all security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of questions deleted</returns>
    Task<int> DeleteAllSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Checks if a user has security questions set up
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if user has security questions</returns>
    Task<bool> HasSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Gets age-appropriate predefined security questions
    /// </summary>
    /// <param name="requestDto">Request parameters including age group</param>
    /// <returns>List of age-appropriate questions</returns>
    Task<List<PredefinedSecurityQuestionDTO>> GetAgeAppropriateQuestionsAsync(AgeAppropriateQuestionsRequestDTO requestDto);

    /// <summary>
    /// Validates security question setup data
    /// </summary>
    /// <param name="setupDto">Setup data to validate</param>
    /// <param name="ageGroup">User's age group</param>
    /// <returns>Validation result with error messages if any</returns>
    Task<(bool IsValid, List<string> Errors)> ValidateSecurityQuestionSetupAsync(SecurityQuestionSetupDTO setupDto, string ageGroup);

    /// <summary>
    /// Deactivates all security questions for a user (soft delete)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of questions deactivated</returns>
    Task<int> DeactivateSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Reactivates all security questions for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of questions reactivated</returns>
    Task<int> ReactivateSecurityQuestionsAsync(int userId);

    /// <summary>
    /// Gets security question usage statistics for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Usage statistics</returns>
    Task<(int TotalQuestions, int LastUsedDaysAgo, int TotalUsageCount)> GetSecurityQuestionStatsAsync(int userId);

    /// <summary>
    /// Generates a password reset token after successful security question verification
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Reset token and expiration</returns>
    Task<(string Token, DateTime Expiration)> GeneratePasswordResetTokenAsync(int userId);

    /// <summary>
    /// Validates a password reset token generated from security question verification
    /// </summary>
    /// <param name="token">Reset token</param>
    /// <returns>User ID if token is valid, null otherwise</returns>
    Task<int?> ValidatePasswordResetTokenAsync(string token);
} 