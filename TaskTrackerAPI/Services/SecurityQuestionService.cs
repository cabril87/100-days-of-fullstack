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
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for managing security questions
/// Provides comprehensive business logic for enhanced authentication and password recovery
/// </summary>
public class SecurityQuestionService : ISecurityQuestionService
{
    private readonly ISecurityQuestionRepository _securityQuestionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly AuthHelper _authHelper;
    private readonly IMapper _mapper;
    private readonly ILogger<SecurityQuestionService> _logger;

    // Predefined age-appropriate security questions
    private readonly Dictionary<FamilyMemberAgeGroup, List<PredefinedSecurityQuestionDTO>> _predefinedQuestions;

    public SecurityQuestionService(
        ISecurityQuestionRepository securityQuestionRepository,
        IUserRepository userRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        AuthHelper authHelper,
        IMapper mapper,
        ILogger<SecurityQuestionService> logger)
    {
        _securityQuestionRepository = securityQuestionRepository ?? throw new ArgumentNullException(nameof(securityQuestionRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _passwordResetTokenRepository = passwordResetTokenRepository ?? throw new ArgumentNullException(nameof(passwordResetTokenRepository));
        _authHelper = authHelper ?? throw new ArgumentNullException(nameof(authHelper));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _predefinedQuestions = InitializePredefinedQuestions();
    }

    public async Task<bool> SetupSecurityQuestionsAsync(int userId, SecurityQuestionSetupDTO setupDto)
    {
        try
        {
            _logger.LogInformation("Setting up security questions for user {UserId}", userId);

            // Validate user exists
            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for security question setup", userId);
                throw new ArgumentException("User not found");
            }

            // Validate setup data
            (bool isValid, List<string> errors) = await ValidateSecurityQuestionSetupAsync(setupDto, user.AgeGroup.ToString());
            if (!isValid)
            {
                _logger.LogWarning("Security question setup validation failed for user {UserId}: {Errors}", 
                    userId, string.Join(", ", errors));
                throw new ArgumentException($"Validation failed: {string.Join(", ", errors)}");
            }

            // Delete existing security questions
            int deletedCount = await _securityQuestionRepository.DeleteAllUserSecurityQuestionsAsync(userId);
            if (deletedCount > 0)
            {
                _logger.LogInformation("Deleted {Count} existing security questions for user {UserId}", deletedCount, userId);
            }

            // Create new security questions
            List<SecurityQuestion> questions = new List<SecurityQuestion>
            {
                new SecurityQuestion
                {
                    UserId = userId,
                    Question = setupDto.Question1,
                    EncryptedAnswer = setupDto.Answer1, // Will be encrypted in repository
                    QuestionOrder = 1,
                    IsAgeAppropriate = IsQuestionAgeAppropriate(setupDto.Question1, user.AgeGroup),
                    MinimumAgeGroup = user.AgeGroup
                },
                new SecurityQuestion
                {
                    UserId = userId,
                    Question = setupDto.Question2,
                    EncryptedAnswer = setupDto.Answer2, // Will be encrypted in repository
                    QuestionOrder = 2,
                    IsAgeAppropriate = IsQuestionAgeAppropriate(setupDto.Question2, user.AgeGroup),
                    MinimumAgeGroup = user.AgeGroup
                },
                new SecurityQuestion
                {
                    UserId = userId,
                    Question = setupDto.Question3,
                    EncryptedAnswer = setupDto.Answer3, // Will be encrypted in repository
                    QuestionOrder = 3,
                    IsAgeAppropriate = IsQuestionAgeAppropriate(setupDto.Question3, user.AgeGroup),
                    MinimumAgeGroup = user.AgeGroup
                }
            };

            // Save all questions
            foreach (SecurityQuestion question in questions)
            {
                await _securityQuestionRepository.CreateSecurityQuestionAsync(question);
            }

            _logger.LogInformation("Successfully set up {Count} security questions for user {UserId}", 
                questions.Count, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<SecurityQuestionListDTO> GetUserSecurityQuestionsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Retrieving security questions for user {UserId}", userId);

            IEnumerable<SecurityQuestion> questions = await _securityQuestionRepository.GetActiveSecurityQuestionsAsync(userId);
            List<SecurityQuestion> questionList = questions.ToList();

            return new SecurityQuestionListDTO
            {
                Questions = questionList.Select(q => new SecurityQuestionDisplayDTO
                {
                    Id = q.Id,
                    Question = q.Question,
                    QuestionOrder = q.QuestionOrder,
                    IsAgeAppropriate = q.IsAgeAppropriate,
                    CreatedAt = q.CreatedAt,
                    LastUsedAt = q.LastUsedAt
                }).ToList(),
                HasQuestionsSetup = questionList.Any(),
                QuestionCount = questionList.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<SecurityQuestionListDTO> GetSecurityQuestionsByEmailAsync(string email)
    {
        try
        {
            _logger.LogInformation("Retrieving security questions for email {Email}", email);

            IEnumerable<SecurityQuestion> questions = await _securityQuestionRepository.GetSecurityQuestionsByEmailAsync(email);
            List<SecurityQuestion> questionList = questions.ToList();

            return new SecurityQuestionListDTO
            {
                Questions = questionList.Select(q => new SecurityQuestionDisplayDTO
                {
                    Id = q.Id,
                    Question = q.Question,
                    QuestionOrder = q.QuestionOrder,
                    IsAgeAppropriate = q.IsAgeAppropriate,
                    CreatedAt = q.CreatedAt,
                    LastUsedAt = q.LastUsedAt
                }).ToList(),
                HasQuestionsSetup = questionList.Any(),
                QuestionCount = questionList.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for email {Email}", email);
            throw;
        }
    }

    public async Task<SecurityQuestionVerificationResultDTO> VerifySecurityAnswersAsync(SecurityQuestionVerificationDTO verificationDto)
    {
        try
        {
            _logger.LogInformation("Verifying security answers for email {Email}", verificationDto.Email);

            // Get user by email
            User? user = await _userRepository.GetUserByEmailAsync(verificationDto.Email);
            if (user == null)
            {
                _logger.LogWarning("User not found for email {Email} during security question verification", verificationDto.Email);
                return new SecurityQuestionVerificationResultDTO
                {
                    IsVerified = false,
                    ErrorMessage = "User not found"
                };
            }

            // Check if user has security questions
            bool hasQuestions = await _securityQuestionRepository.HasSecurityQuestionsAsync(user.Id);
            if (!hasQuestions)
            {
                _logger.LogWarning("User {UserId} does not have security questions set up", user.Id);
                return new SecurityQuestionVerificationResultDTO
                {
                    IsVerified = false,
                    ErrorMessage = "Security questions not set up for this account"
                };
            }

            // Prepare answers dictionary
            Dictionary<int, string> answers = new Dictionary<int, string>
            {
                { 1, verificationDto.Answer1 },
                { 2, verificationDto.Answer2 },
                { 3, verificationDto.Answer3 }
            };

            // Verify answers
            bool isVerified = await _securityQuestionRepository.VerifySecurityAnswersAsync(user.Id, answers);

            if (isVerified)
            {
                // Update usage statistics
                await _securityQuestionRepository.UpdateLastUsedTimestampAsync(user.Id);
                await _securityQuestionRepository.IncrementUsageCountAsync(user.Id);

                // Generate password reset token
                (string token, DateTime expiration) = await GeneratePasswordResetTokenAsync(user.Id);

                _logger.LogInformation("Security questions verified successfully for user {UserId}", user.Id);

                return new SecurityQuestionVerificationResultDTO
                {
                    IsVerified = true,
                    CorrectAnswers = 3,
                    TotalQuestions = 3,
                    VerificationToken = token,
                    TokenExpiration = expiration
                };
            }
            else
            {
                _logger.LogWarning("Security question verification failed for user {UserId}", user.Id);
                return new SecurityQuestionVerificationResultDTO
                {
                    IsVerified = false,
                    CorrectAnswers = 0,
                    TotalQuestions = 3,
                    ErrorMessage = "One or more security answers are incorrect"
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying security answers for email {Email}", verificationDto.Email);
            return new SecurityQuestionVerificationResultDTO
            {
                IsVerified = false,
                ErrorMessage = "An error occurred during verification"
            };
        }
    }

    public async Task<bool> UpdateSecurityQuestionsAsync(int userId, SecurityQuestionUpdateDTO updateDto)
    {
        try
        {
            _logger.LogInformation("Updating security questions for user {UserId}", userId);

            // Get existing questions
            IEnumerable<SecurityQuestion> existingQuestions = await _securityQuestionRepository.GetOrderedSecurityQuestionsAsync(userId);
            List<SecurityQuestion> questionsList = existingQuestions.ToList();

            if (!questionsList.Any())
            {
                _logger.LogWarning("No existing security questions found for user {UserId}", userId);
                throw new ArgumentException("No security questions found to update");
            }

            // Update questions based on provided data
            bool hasUpdates = false;

            // Update Question 1
            if (!string.IsNullOrEmpty(updateDto.Question1) || !string.IsNullOrEmpty(updateDto.Answer1))
            {
                SecurityQuestion? question1 = questionsList.FirstOrDefault(q => q.QuestionOrder == 1);
                if (question1 != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.Question1))
                        question1.Question = updateDto.Question1;
                    if (!string.IsNullOrEmpty(updateDto.Answer1))
                        question1.EncryptedAnswer = updateDto.Answer1; // Will be encrypted in repository
                    
                    await _securityQuestionRepository.UpdateSecurityQuestionAsync(question1);
                    hasUpdates = true;
                }
            }

            // Update Question 2
            if (!string.IsNullOrEmpty(updateDto.Question2) || !string.IsNullOrEmpty(updateDto.Answer2))
            {
                SecurityQuestion? question2 = questionsList.FirstOrDefault(q => q.QuestionOrder == 2);
                if (question2 != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.Question2))
                        question2.Question = updateDto.Question2;
                    if (!string.IsNullOrEmpty(updateDto.Answer2))
                        question2.EncryptedAnswer = updateDto.Answer2; // Will be encrypted in repository
                    
                    await _securityQuestionRepository.UpdateSecurityQuestionAsync(question2);
                    hasUpdates = true;
                }
            }

            // Update Question 3
            if (!string.IsNullOrEmpty(updateDto.Question3) || !string.IsNullOrEmpty(updateDto.Answer3))
            {
                SecurityQuestion? question3 = questionsList.FirstOrDefault(q => q.QuestionOrder == 3);
                if (question3 != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.Question3))
                        question3.Question = updateDto.Question3;
                    if (!string.IsNullOrEmpty(updateDto.Answer3))
                        question3.EncryptedAnswer = updateDto.Answer3; // Will be encrypted in repository
                    
                    await _securityQuestionRepository.UpdateSecurityQuestionAsync(question3);
                    hasUpdates = true;
                }
            }

            if (hasUpdates)
            {
                _logger.LogInformation("Successfully updated security questions for user {UserId}", userId);
            }
            else
            {
                _logger.LogInformation("No updates provided for security questions for user {UserId}", userId);
            }

            return hasUpdates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> DeleteAllSecurityQuestionsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Deleting all security questions for user {UserId}", userId);
            int deletedCount = await _securityQuestionRepository.DeleteAllUserSecurityQuestionsAsync(userId);
            _logger.LogInformation("Deleted {Count} security questions for user {UserId}", deletedCount, userId);
            return deletedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> HasSecurityQuestionsAsync(int userId)
    {
        try
        {
            return await _securityQuestionRepository.HasSecurityQuestionsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} has security questions", userId);
            return false;
        }
    }

    public async Task<List<PredefinedSecurityQuestionDTO>> GetAgeAppropriateQuestionsAsync(AgeAppropriateQuestionsRequestDTO requestDto)
    {
        try
        {
            _logger.LogInformation("Getting age-appropriate questions for age group {AgeGroup}", requestDto.AgeGroup);

            if (!Enum.TryParse<FamilyMemberAgeGroup>(requestDto.AgeGroup, out FamilyMemberAgeGroup ageGroup))
            {
                ageGroup = FamilyMemberAgeGroup.Adult; // Default to adult
            }

            List<PredefinedSecurityQuestionDTO> questions = new List<PredefinedSecurityQuestionDTO>();

            // Get questions for the specific age group and all lower age groups
            foreach (FamilyMemberAgeGroup group in Enum.GetValues<FamilyMemberAgeGroup>())
            {
                if (group <= ageGroup && _predefinedQuestions.ContainsKey(group))
                {
                    List<PredefinedSecurityQuestionDTO> groupQuestions = _predefinedQuestions[group];
                    
                    // Filter by categories if specified
                    if (requestDto.Categories != null && requestDto.Categories.Any())
                    {
                        groupQuestions = groupQuestions
                            .Where(q => requestDto.Categories.Contains(q.Category))
                            .ToList();
                    }
                    
                    questions.AddRange(groupQuestions);
                }
            }

            // Shuffle and take requested count
            questions = questions.OrderBy(x => Guid.NewGuid()).Take(requestDto.Count).ToList();

            _logger.LogInformation("Returning {Count} age-appropriate questions for age group {AgeGroup}", 
                questions.Count, requestDto.AgeGroup);

            return await Task.FromResult(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting age-appropriate questions for age group {AgeGroup}", requestDto.AgeGroup);
            return new List<PredefinedSecurityQuestionDTO>();
        }
    }

    public Task<(bool IsValid, List<string> Errors)> ValidateSecurityQuestionSetupAsync(SecurityQuestionSetupDTO setupDto, string ageGroup)
    {
        List<string> errors = new List<string>();

        try
        {
            // Check for duplicate questions
            HashSet<string> questions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                setupDto.Question1.Trim(),
                setupDto.Question2.Trim(),
                setupDto.Question3.Trim()
            };

            if (questions.Count != 3)
            {
                errors.Add("All security questions must be unique");
            }

            // Check for duplicate answers
            HashSet<string> answers = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                setupDto.Answer1.Trim(),
                setupDto.Answer2.Trim(),
                setupDto.Answer3.Trim()
            };

            if (answers.Count != 3)
            {
                errors.Add("All security answers must be unique");
            }

            // Validate question length and content
            List<string> questionTexts = new List<string> { setupDto.Question1, setupDto.Question2, setupDto.Question3 };
            for (int i = 0; i < questionTexts.Count; i++)
            {
                string question = questionTexts[i];
                if (string.IsNullOrWhiteSpace(question) || question.Length < 10)
                {
                    errors.Add($"Question {i + 1} must be at least 10 characters long");
                }
                if (question.Length > 250)
                {
                    errors.Add($"Question {i + 1} cannot exceed 250 characters");
                }
            }

            // Validate answer length and content
            List<string> answerTexts = new List<string> { setupDto.Answer1, setupDto.Answer2, setupDto.Answer3 };
            for (int i = 0; i < answerTexts.Count; i++)
            {
                string answer = answerTexts[i];
                if (string.IsNullOrWhiteSpace(answer) || answer.Length < 3)
                {
                    errors.Add($"Answer {i + 1} must be at least 3 characters long");
                }
                if (answer.Length > 100)
                {
                    errors.Add($"Answer {i + 1} cannot exceed 100 characters");
                }
            }

            // Age-appropriate validation
            if (Enum.TryParse<FamilyMemberAgeGroup>(ageGroup, out FamilyMemberAgeGroup userAgeGroup))
            {
                if (userAgeGroup == FamilyMemberAgeGroup.Child)
                {
                    // Additional validation for child accounts
                    List<string> inappropriateWords = new List<string> { "password", "social security", "credit card", "bank" };
                    
                    foreach (string question in questionTexts)
                    {
                        if (inappropriateWords.Any(word => question.ToLowerInvariant().Contains(word)))
                        {
                            errors.Add("Questions contain inappropriate content for child accounts");
                            break;
                        }
                    }
                }
            }

            return Task.FromResult((errors.Count == 0, errors));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating security question setup");
            errors.Add("An error occurred during validation");
            return Task.FromResult((false, errors));
        }
    }

    public async Task<int> DeactivateSecurityQuestionsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Deactivating security questions for user {UserId}", userId);
            return await _securityQuestionRepository.DeactivateAllUserSecurityQuestionsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> ReactivateSecurityQuestionsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Reactivating security questions for user {UserId}", userId);
            return await _securityQuestionRepository.ReactivateAllUserSecurityQuestionsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reactivating security questions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<(int TotalQuestions, int LastUsedDaysAgo, int TotalUsageCount)> GetSecurityQuestionStatsAsync(int userId)
    {
        try
        {
            IEnumerable<SecurityQuestion> questions = await _securityQuestionRepository.GetActiveSecurityQuestionsAsync(userId);
            List<SecurityQuestion> questionsList = questions.ToList();

            int totalQuestions = questionsList.Count;
            int totalUsageCount = questionsList.Sum(q => q.UsageCount);
            
            DateTime? lastUsed = questionsList
                .Where(q => q.LastUsedAt.HasValue)
                .Select(q => q.LastUsedAt!.Value)
                .OrderByDescending(d => d)
                .FirstOrDefault();

            int lastUsedDaysAgo = lastUsed.HasValue 
                ? (int)(DateTime.UtcNow - lastUsed.Value).TotalDays 
                : -1; // -1 indicates never used

            return (totalQuestions, lastUsedDaysAgo, totalUsageCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security question stats for user {UserId}", userId);
            return (0, -1, 0);
        }
    }

    public async Task<(string Token, DateTime Expiration)> GeneratePasswordResetTokenAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Generating password reset token for user {UserId}", userId);

            // Generate a secure token using existing method
            string token = _authHelper.GenerateRefreshToken();
            DateTime expiration = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour

            // Get user for email
            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            // Create password reset token entity
            PasswordResetToken resetToken = new PasswordResetToken
            {
                Token = token,
                UserId = userId,
                Email = user.Email,
                ExpirationTime = expiration,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            // Save to database
            await _passwordResetTokenRepository.CreateAsync(resetToken);

            _logger.LogInformation("Password reset token generated for user {UserId}, expires at {Expiration}", 
                userId, expiration);

            return (token, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password reset token for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int?> ValidatePasswordResetTokenAsync(string token)
    {
        try
        {
            _logger.LogInformation("Validating password reset token");

            PasswordResetToken? resetToken = await _passwordResetTokenRepository.GetByTokenAsync(token);
            
            if (resetToken == null)
            {
                _logger.LogWarning("Password reset token not found");
                return null;
            }

            if (resetToken.IsUsed)
            {
                _logger.LogWarning("Password reset token has already been used");
                return null;
            }

            if (resetToken.ExpirationTime < DateTime.UtcNow)
            {
                _logger.LogWarning("Password reset token has expired");
                return null;
            }

            _logger.LogInformation("Password reset token validated successfully for user {UserId}", resetToken.UserId);
            return resetToken.UserId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password reset token");
            return null;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Determines if a question is age-appropriate for the given age group
    /// </summary>
    private static bool IsQuestionAgeAppropriate(string question, FamilyMemberAgeGroup ageGroup)
    {
        if (ageGroup == FamilyMemberAgeGroup.Child)
        {
            // Check for inappropriate content for children
            List<string> inappropriateWords = new List<string> 
            { 
                "password", "social security", "credit card", "bank", "money", "job", "work"
            };
            
            return !inappropriateWords.Any(word => question.ToLowerInvariant().Contains(word));
        }
        
        return true; // Teen and Adult questions are generally appropriate
    }

    /// <summary>
    /// Initializes the predefined security questions by age group
    /// </summary>
    private static Dictionary<FamilyMemberAgeGroup, List<PredefinedSecurityQuestionDTO>> InitializePredefinedQuestions()
    {
        return new Dictionary<FamilyMemberAgeGroup, List<PredefinedSecurityQuestionDTO>>
        {
            [FamilyMemberAgeGroup.Child] = new List<PredefinedSecurityQuestionDTO>
            {
                new() { Question = "What is your favorite color?", MinimumAgeGroup = "Child", Category = "Personal", ExampleFormat = "blue" },
                new() { Question = "What is your pet's name?", MinimumAgeGroup = "Child", Category = "Personal", ExampleFormat = "Fluffy" },
                new() { Question = "What is your favorite food?", MinimumAgeGroup = "Child", Category = "Personal", ExampleFormat = "pizza" },
                new() { Question = "What is your favorite cartoon character?", MinimumAgeGroup = "Child", Category = "Entertainment", ExampleFormat = "SpongeBob" },
                new() { Question = "What is your favorite game to play?", MinimumAgeGroup = "Child", Category = "Entertainment", ExampleFormat = "Minecraft" },
                new() { Question = "What is your best friend's first name?", MinimumAgeGroup = "Child", Category = "Family", ExampleFormat = "Sarah" },
                new() { Question = "What grade are you in?", MinimumAgeGroup = "Child", Category = "School", ExampleFormat = "3rd grade" },
                new() { Question = "What is your favorite subject in school?", MinimumAgeGroup = "Child", Category = "School", ExampleFormat = "math" },
                new() { Question = "What is your favorite toy?", MinimumAgeGroup = "Child", Category = "Personal", ExampleFormat = "teddy bear" },
                new() { Question = "What is your favorite season?", MinimumAgeGroup = "Child", Category = "Personal", ExampleFormat = "summer" }
            },
            [FamilyMemberAgeGroup.Teen] = new List<PredefinedSecurityQuestionDTO>
            {
                new() { Question = "What is your favorite music genre?", MinimumAgeGroup = "Teen", Category = "Entertainment", ExampleFormat = "pop" },
                new() { Question = "What is your favorite movie?", MinimumAgeGroup = "Teen", Category = "Entertainment", ExampleFormat = "Avengers" },
                new() { Question = "What is your dream career?", MinimumAgeGroup = "Teen", Category = "Personal", ExampleFormat = "doctor" },
                new() { Question = "What high school do you attend?", MinimumAgeGroup = "Teen", Category = "School", ExampleFormat = "Lincoln High" },
                new() { Question = "What is your favorite social media app?", MinimumAgeGroup = "Teen", Category = "Technology", ExampleFormat = "Instagram" },
                new() { Question = "What sport do you like to play or watch?", MinimumAgeGroup = "Teen", Category = "Sports", ExampleFormat = "basketball" },
                new() { Question = "What is your favorite book series?", MinimumAgeGroup = "Teen", Category = "Entertainment", ExampleFormat = "Harry Potter" },
                new() { Question = "What is your favorite place to hang out?", MinimumAgeGroup = "Teen", Category = "Personal", ExampleFormat = "mall" },
                new() { Question = "What is your favorite video game?", MinimumAgeGroup = "Teen", Category = "Entertainment", ExampleFormat = "Fortnite" },
                new() { Question = "What is your biggest fear?", MinimumAgeGroup = "Teen", Category = "Personal", ExampleFormat = "spiders" }
            },
            [FamilyMemberAgeGroup.Adult] = new List<PredefinedSecurityQuestionDTO>
            {
                new() { Question = "What is your mother's maiden name?", MinimumAgeGroup = "Adult", Category = "Family", ExampleFormat = "Smith" },
                new() { Question = "What city were you born in?", MinimumAgeGroup = "Adult", Category = "Personal", ExampleFormat = "Chicago" },
                new() { Question = "What is the name of your first pet?", MinimumAgeGroup = "Adult", Category = "Personal", ExampleFormat = "Rex" },
                new() { Question = "What is the name of your elementary school?", MinimumAgeGroup = "Adult", Category = "School", ExampleFormat = "Oak Elementary" },
                new() { Question = "What is your favorite vacation destination?", MinimumAgeGroup = "Adult", Category = "Travel", ExampleFormat = "Hawaii" },
                new() { Question = "What is the make of your first car?", MinimumAgeGroup = "Adult", Category = "Personal", ExampleFormat = "Honda" },
                new() { Question = "What is your spouse's middle name?", MinimumAgeGroup = "Adult", Category = "Family", ExampleFormat = "Marie" },
                new() { Question = "What is the name of your favorite teacher?", MinimumAgeGroup = "Adult", Category = "School", ExampleFormat = "Mr. Johnson" },
                new() { Question = "What street did you grow up on?", MinimumAgeGroup = "Adult", Category = "Personal", ExampleFormat = "Main Street" },
                new() { Question = "What is your favorite restaurant?", MinimumAgeGroup = "Adult", Category = "Personal", ExampleFormat = "Olive Garden" }
            }
        };
    }

    #endregion
} 