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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Points controller - manages user points and scoring system.
/// Accessible to all authenticated users (RegularUser and above).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
[RequireRole(UserRole.RegularUser)]
public class PointsController : BaseApiController
{
    private readonly IPointsService _pointsService;
    private readonly IUserAccessor _userAccessor;

    public PointsController(IPointsService pointsService, IUserAccessor userAccessor)
    {
        _pointsService = pointsService;
        _userAccessor = userAccessor;
    }

    /// <summary>
    /// Get current user's points balance
    /// </summary>
    [HttpGet("balance")]
    public async Task<ActionResult<ApiResponse<int>>> GetBalance()
    {
        int userId = int.Parse(_userAccessor.GetCurrentUserId());
        int points = await _pointsService.GetUserPointsAsync(userId);
        return ApiOk(points, "Points balance retrieved successfully");
    }

    /// <summary>
    /// Get user's points transaction history
    /// </summary>
    [HttpGet("transactions")]
    public async Task<ActionResult<ApiResponse<List<PointTransaction>>>> GetTransactionHistory([FromQuery] int limit = 50)
    {
        int userId = int.Parse(_userAccessor.GetCurrentUserId());
        List<PointTransaction> transactions = await _pointsService.GetTransactionHistoryAsync(userId, limit);
        return ApiOk(transactions, "Transaction history retrieved successfully");
    }

    /// <summary>
    /// Purchase a template with points
    /// </summary>
    [HttpPost("purchase/{templateId}")]
    public async Task<ActionResult<ApiResponse<object>>> PurchaseTemplate(int templateId)
    {
        int userId = int.Parse(_userAccessor.GetCurrentUserId());
        
        bool success = await _pointsService.PurchaseTemplateAsync(userId, templateId);
        
        if (!success)
        {
            return ApiBadRequest<object>("Unable to purchase template. Check if you have sufficient points or already own this template.");
        }

        return ApiOk<object>(new object(), "Template purchased successfully!");
    }

    /// <summary>
    /// Check if user has purchased a specific template
    /// </summary>
    [HttpGet("purchases/{templateId}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> HasPurchased(int templateId)
    {
        int userId = int.Parse(_userAccessor.GetCurrentUserId());
        bool hasPurchased = await _pointsService.HasPurchasedTemplateAsync(userId, templateId);
        return ApiOk(hasPurchased, "Purchase status retrieved successfully");
    }

    /// <summary>
    /// Get user's purchased templates
    /// </summary>
    [HttpGet("purchases")]
    public async Task<ActionResult<ApiResponse<List<TemplatePurchase>>>> GetPurchases()
    {
        int userId = int.Parse(_userAccessor.GetCurrentUserId());
        List<TemplatePurchase> purchases = await _pointsService.GetUserPurchasesAsync(userId);
        return ApiOk(purchases, "Purchases retrieved successfully");
    }

    /// <summary>
    /// Add points to user account (admin only)
    /// </summary>
    [HttpPost("add")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> AddPoints([FromBody] AddPointsRequest request)
    {
        await _pointsService.AddPointsAsync(request.UserId, request.Points, request.Reason);
        return ApiOk<object>(new object(), "Points added successfully!");
    }
}

public class AddPointsRequest
{
    public int UserId { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; } = string.Empty;
} 