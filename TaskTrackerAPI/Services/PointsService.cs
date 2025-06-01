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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class PointsService : IPointsService
{
    private readonly IPointsRepository _pointsRepository;
    private readonly ITaskTemplateRepository _taskTemplateRepository;
    private readonly ILogger<PointsService> _logger;

    public PointsService(
        IPointsRepository pointsRepository, 
        ITaskTemplateRepository taskTemplateRepository,
        ILogger<PointsService> logger)
    {
        _pointsRepository = pointsRepository ?? throw new ArgumentNullException(nameof(pointsRepository));
        _taskTemplateRepository = taskTemplateRepository ?? throw new ArgumentNullException(nameof(taskTemplateRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<int> GetUserPointsAsync(int userId)
    {
        try
        {
            return await _pointsRepository.GetUserPointsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting points for user {UserId}", userId);
            return 0;
        }
    }

    public async Task<bool> HasSufficientPointsAsync(int userId, int requiredPoints)
    {
        try
        {
            return await _pointsRepository.HasSufficientPointsAsync(userId, requiredPoints);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking sufficient points for user {UserId}, required: {RequiredPoints}", userId, requiredPoints);
            return false;
        }
    }

    public async Task<bool> DeductPointsAsync(int userId, int points, string reason, int? templateId = null)
    {
        try
        {
            // Check if user has sufficient points first
            if (!await HasSufficientPointsAsync(userId, points))
            {
                _logger.LogWarning("User {UserId} does not have sufficient points. Required: {Points}, Reason: {Reason}", userId, points, reason);
                return false;
            }

            // Use repository to deduct points
            PointTransaction transaction = await _pointsRepository.DeductPointsAsync(
                userId, 
                points, 
                "Purchase", 
                reason, 
                taskId: null, 
                templateId: templateId);

            _logger.LogInformation("Successfully deducted {Points} points from user {UserId}. Reason: {Reason}", points, userId, reason);
            return transaction != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deducting {Points} points from user {UserId}. Reason: {Reason}", points, userId, reason);
            return false;
        }
    }

    public async Task AddPointsAsync(int userId, int points, string reason, int? templateId = null)
    {
        try
        {
            // Use repository to add points
            PointTransaction transaction = await _pointsRepository.AddPointsAsync(
                userId, 
                points, 
                "Earned", 
                reason, 
                taskId: null, 
                templateId: templateId);

            _logger.LogInformation("Successfully added {Points} points to user {UserId}. Reason: {Reason}", points, userId, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding {Points} points to user {UserId}. Reason: {Reason}", points, userId, reason);
            throw;
        }
    }

    public async Task<List<PointTransaction>> GetTransactionHistoryAsync(int userId, int limit = 50)
    {
        try
        {
            IEnumerable<PointTransaction> transactions = await _pointsRepository.GetTransactionHistoryAsync(userId, limit);
            return transactions.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction history for user {UserId}", userId);
            return new List<PointTransaction>();
        }
    }

    public async Task<bool> PurchaseTemplateAsync(int userId, int templateId)
    {
        try
        {
            // Get template using repository
            TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
            if (template == null || template.Price == 0)
            {
                _logger.LogWarning("Template {TemplateId} not found or is free", templateId);
                return false; // Template not found or is free
            }

            // Check if user already owns this template using repository
            bool existingPurchase = await _taskTemplateRepository.HasUserPurchasedTemplateAsync(userId, templateId);
            
            if (existingPurchase)
            {
                _logger.LogWarning("User {UserId} already owns template {TemplateId}", userId, templateId);
                return false; // User already owns this template
            }

            // Check if user has sufficient points using repository
            if (!await HasSufficientPointsAsync(userId, template.Price))
            {
                _logger.LogWarning("User {UserId} has insufficient points for template {TemplateId}. Required: {Price}", userId, templateId, template.Price);
                return false; // Insufficient points
            }

            // Deduct points using repository
            bool pointsDeducted = await DeductPointsAsync(
                userId, 
                template.Price, 
                $"Purchased template: {template.Name}", 
                templateId);

            if (!pointsDeducted)
            {
                _logger.LogError("Failed to deduct points for template purchase. User: {UserId}, Template: {TemplateId}", userId, templateId);
                return false;
            }

            // Record purchase using repository
            TemplatePurchase purchase = new TemplatePurchase
            {
                UserId = userId,
                TemplateId = templateId,
                PointsSpent = template.Price,
                PurchasedAt = DateTime.UtcNow
            };

            await _taskTemplateRepository.CreateTemplatePurchaseAsync(purchase);
            
            // Update template purchase count using repository
            await _taskTemplateRepository.UpdateTemplatePurchaseCountAsync(templateId);

            _logger.LogInformation("Successfully purchased template {TemplateId} for user {UserId}. Points spent: {Points}", templateId, userId, template.Price);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error purchasing template {TemplateId} for user {UserId}", templateId, userId);
            return false;
        }
    }

    public async Task<bool> HasPurchasedTemplateAsync(int userId, int templateId)
    {
        try
        {
            return await _taskTemplateRepository.HasUserPurchasedTemplateAsync(userId, templateId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} has purchased template {TemplateId}", userId, templateId);
            return false;
        }
    }

    public async Task<List<TemplatePurchase>> GetUserPurchasesAsync(int userId)
    {
        try
        {
            return await _taskTemplateRepository.GetUserTemplatePurchasesAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving purchases for user {UserId}", userId);
            return new List<TemplatePurchase>();
        }
    }
} 