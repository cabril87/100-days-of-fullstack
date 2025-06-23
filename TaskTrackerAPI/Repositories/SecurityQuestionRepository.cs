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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for managing security questions
/// Provides CRUD operations and verification methods for enhanced authentication
/// </summary>
public class SecurityQuestionRepository : ISecurityQuestionRepository
{
    private readonly ApplicationDbContext _context;
    private readonly AuthHelper _authHelper;
    private readonly ILogger<SecurityQuestionRepository> _logger;

    public SecurityQuestionRepository(
        ApplicationDbContext context, 
        AuthHelper authHelper,
        ILogger<SecurityQuestionRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _authHelper = authHelper ?? throw new ArgumentNullException(nameof(authHelper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsByUserIdAsync(int userId)
    {
        try
        {
            return await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .OrderBy(sq => sq.QuestionOrder)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<SecurityQuestion?> GetSecurityQuestionByIdAsync(int questionId)
    {
        try
        {
            return await _context.SecurityQuestions
                .Include(sq => sq.User)
                .FirstOrDefaultAsync(sq => sq.Id == questionId && sq.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security question {QuestionId}", questionId);
            throw;
        }
    }

    public async Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsByEmailAsync(string email)
    {
        try
        {
            if (string.IsNullOrEmpty(email))
                return Enumerable.Empty<SecurityQuestion>();

            // Get user by email first, then get their security questions
            User? user = await _context.Users
                .AsNoTracking()
                .ToListAsync()
                .ContinueWith(t => t.Result.FirstOrDefault(u => 
                    string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));

            if (user == null)
                return Enumerable.Empty<SecurityQuestion>();

            return await GetSecurityQuestionsByUserIdAsync(user.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for email {Email}", email);
            throw;
        }
    }

    public async Task<bool> HasSecurityQuestionsAsync(int userId)
    {
        try
        {
            return await _context.SecurityQuestions
                .AnyAsync(sq => sq.UserId == userId && sq.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} has security questions", userId);
            return false;
        }
    }

    public async Task<int> GetSecurityQuestionCountAsync(int userId)
    {
        try
        {
            return await _context.SecurityQuestions
                .CountAsync(sq => sq.UserId == userId && sq.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting security questions for user {UserId}", userId);
            return 0;
        }
    }

    public async Task<SecurityQuestion> CreateSecurityQuestionAsync(SecurityQuestion securityQuestion)
    {
        try
        {
            // Encrypt the answer before storing
            securityQuestion.EncryptedAnswer = EncryptAnswer(securityQuestion.EncryptedAnswer);
            securityQuestion.CreatedAt = DateTime.UtcNow;
            securityQuestion.IsActive = true;

            await _context.SecurityQuestions.AddAsync(securityQuestion);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Created security question for user {UserId}, order {Order}", 
                securityQuestion.UserId, securityQuestion.QuestionOrder);
            
            return securityQuestion;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating security question for user {UserId}", securityQuestion.UserId);
            throw;
        }
    }

    public async Task<SecurityQuestion> UpdateSecurityQuestionAsync(SecurityQuestion securityQuestion)
    {
        try
        {
            // Encrypt the answer if it's been modified
            if (!string.IsNullOrEmpty(securityQuestion.EncryptedAnswer))
            {
                securityQuestion.EncryptedAnswer = EncryptAnswer(securityQuestion.EncryptedAnswer);
            }
            
            securityQuestion.UpdatedAt = DateTime.UtcNow;
            _context.SecurityQuestions.Update(securityQuestion);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Updated security question {QuestionId} for user {UserId}", 
                securityQuestion.Id, securityQuestion.UserId);
            
            return securityQuestion;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating security question {QuestionId}", securityQuestion.Id);
            throw;
        }
    }

    public async Task<bool> DeleteSecurityQuestionAsync(int questionId)
    {
        try
        {
            SecurityQuestion? securityQuestion = await _context.SecurityQuestions.FindAsync(questionId);
            if (securityQuestion != null)
            {
                _context.SecurityQuestions.Remove(securityQuestion);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Deleted security question {QuestionId}", questionId);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting security question {QuestionId}", questionId);
            throw;
        }
    }

    public async Task<int> DeleteAllUserSecurityQuestionsAsync(int userId)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId)
                .ToListAsync();

            if (userQuestions.Any())
            {
                _context.SecurityQuestions.RemoveRange(userQuestions);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Deleted {Count} security questions for user {UserId}", 
                    userQuestions.Count, userId);
            }

            return userQuestions.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting all security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> VerifySecurityAnswersAsync(int userId, Dictionary<int, string> answers)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .OrderBy(sq => sq.QuestionOrder)
                .ToListAsync();

            if (!userQuestions.Any() || userQuestions.Count != answers.Count)
            {
                _logger.LogWarning("Security question count mismatch for user {UserId}. Expected: {Expected}, Provided: {Provided}", 
                    userId, userQuestions.Count, answers.Count);
                return false;
            }

            // Verify each answer
            foreach (SecurityQuestion question in userQuestions)
            {
                if (!answers.ContainsKey(question.QuestionOrder))
                {
                    _logger.LogWarning("Missing answer for question order {Order} for user {UserId}", 
                        question.QuestionOrder, userId);
                    return false;
                }

                string providedAnswer = answers[question.QuestionOrder];
                if (!VerifyAnswer(providedAnswer, question.EncryptedAnswer))
                {
                    _logger.LogWarning("Incorrect answer for question order {Order} for user {UserId}", 
                        question.QuestionOrder, userId);
                    return false;
                }
            }

            _logger.LogInformation("Successfully verified security answers for user {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying security answers for user {UserId}", userId);
            return false;
        }
    }

    public async Task UpdateLastUsedTimestampAsync(int userId)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .ToListAsync();

            foreach (SecurityQuestion question in userQuestions)
            {
                question.LastUsedAt = DateTime.UtcNow;
            }

            if (userQuestions.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated last used timestamp for user {UserId} security questions", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last used timestamp for user {UserId}", userId);
            throw;
        }
    }

    public async Task IncrementUsageCountAsync(int userId)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .ToListAsync();

            foreach (SecurityQuestion question in userQuestions)
            {
                question.UsageCount++;
            }

            if (userQuestions.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Incremented usage count for user {UserId} security questions", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing usage count for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<SecurityQuestion>> GetOrderedSecurityQuestionsAsync(int userId)
    {
        try
        {
            return await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .OrderBy(sq => sq.QuestionOrder)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving ordered security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> IsQuestionOrderUsedAsync(int userId, int questionOrder)
    {
        try
        {
            return await _context.SecurityQuestions
                .AnyAsync(sq => sq.UserId == userId && sq.QuestionOrder == questionOrder && sq.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking question order {Order} for user {UserId}", questionOrder, userId);
            return false;
        }
    }

    public async Task<int> GetNextAvailableQuestionOrderAsync(int userId)
    {
        try
        {
            List<int> usedOrders = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .Select(sq => sq.QuestionOrder)
                .ToListAsync();

            // Return the next available order (1, 2, or 3)
            for (int order = 1; order <= 3; order++)
            {
                if (!usedOrders.Contains(order))
                {
                    return order;
                }
            }

            // If all orders are used, return 4 to indicate no available order
            return 4;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting next available question order for user {UserId}", userId);
            return 4;
        }
    }

    public async Task<int> DeactivateAllUserSecurityQuestionsAsync(int userId)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .ToListAsync();

            foreach (SecurityQuestion question in userQuestions)
            {
                question.IsActive = false;
                question.UpdatedAt = DateTime.UtcNow;
            }

            if (userQuestions.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Deactivated {Count} security questions for user {UserId}", 
                    userQuestions.Count, userId);
            }

            return userQuestions.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> ReactivateAllUserSecurityQuestionsAsync(int userId)
    {
        try
        {
            List<SecurityQuestion> userQuestions = await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && !sq.IsActive)
                .ToListAsync();

            foreach (SecurityQuestion question in userQuestions)
            {
                question.IsActive = true;
                question.UpdatedAt = DateTime.UtcNow;
            }

            if (userQuestions.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Reactivated {Count} security questions for user {UserId}", 
                    userQuestions.Count, userId);
            }

            return userQuestions.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reactivating security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<SecurityQuestion>> GetActiveSecurityQuestionsAsync(int userId)
    {
        try
        {
            return await _context.SecurityQuestions
                .Where(sq => sq.UserId == userId && sq.IsActive)
                .OrderBy(sq => sq.QuestionOrder)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active security questions for user {UserId}", userId);
            throw;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Encrypts a security answer using the AuthHelper
    /// </summary>
    /// <param name="answer">Plain text answer</param>
    /// <returns>Encrypted answer</returns>
    private string EncryptAnswer(string answer)
    {
        try
        {
            // Normalize the answer (trim, lowercase) for consistent verification
            string normalizedAnswer = answer.Trim().ToLowerInvariant();
            
            // Use AuthHelper to create a hash (similar to password hashing)
            _authHelper.CreatePasswordHash(normalizedAnswer, out string hash, out string salt);
            
            // Combine hash and salt for storage (separated by a delimiter)
            return $"{hash}:{salt}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error encrypting security answer");
            throw;
        }
    }

    /// <summary>
    /// Verifies a provided answer against the encrypted stored answer
    /// </summary>
    /// <param name="providedAnswer">The answer provided by the user</param>
    /// <param name="encryptedAnswer">The encrypted answer stored in the database</param>
    /// <returns>True if answers match, false otherwise</returns>
    private bool VerifyAnswer(string providedAnswer, string encryptedAnswer)
    {
        try
        {
            // Normalize the provided answer
            string normalizedAnswer = providedAnswer.Trim().ToLowerInvariant();
            
            // Split the stored encrypted answer to get hash and salt
            string[] parts = encryptedAnswer.Split(':');
            if (parts.Length != 2)
            {
                _logger.LogWarning("Invalid encrypted answer format");
                return false;
            }

            string storedHash = parts[0];
            string storedSalt = parts[1];

            // Verify using AuthHelper
            return _authHelper.VerifyPasswordHash(normalizedAnswer, storedHash, storedSalt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying security answer");
            return false;
        }
    }

    #endregion
} 