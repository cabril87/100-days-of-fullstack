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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.RateLimiting;
using System.Threading.Tasks;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/rate-limits")]
[ApiController]
[Authorize(Roles = "Admin")]
public class RateLimitMonitoringController : BaseApiController
{
    private readonly ILogger<RateLimitMonitoringController> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IUserSubscriptionService _userSubscriptionService;

    public RateLimitMonitoringController(
        ILogger<RateLimitMonitoringController> logger,
        ApplicationDbContext context,
        IUserSubscriptionService userSubscriptionService)
    {
        _logger = logger;
        _context = context;
        _userSubscriptionService = userSubscriptionService;
    }

    /// <summary>
    /// Gets all subscription tiers
    /// </summary>
    [HttpGet("subscription-tiers")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubscriptionTier>>>> GetSubscriptionTiers()
    {
        try
        {
            IEnumerable<SubscriptionTier> tiers = await _context.SubscriptionTiers.ToListAsync();
            return Ok(ApiResponse<IEnumerable<SubscriptionTier>>.SuccessResponse(tiers));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subscription tiers");
            return StatusCode(500, ApiResponse<IEnumerable<SubscriptionTier>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets a subscription tier by ID
    /// </summary>
    [HttpGet("subscription-tiers/{id}")]
    public async Task<ActionResult<ApiResponse<SubscriptionTier>>> GetSubscriptionTier(int id)
    {
        try
        {
            SubscriptionTier? tier = await _context.SubscriptionTiers.FindAsync(id);
            if (tier == null)
            {
                return NotFound(ApiResponse<SubscriptionTier>.NotFoundResponse($"Tier with ID {id} not found"));
            }

            return Ok(ApiResponse<SubscriptionTier>.SuccessResponse(tier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subscription tier {TierId}", id);
            return StatusCode(500, ApiResponse<SubscriptionTier>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Creates a new subscription tier
    /// </summary>
    [HttpPost("subscription-tiers")]
    public async Task<ActionResult<ApiResponse<SubscriptionTier>>> CreateSubscriptionTier(SubscriptionTier tier)
    {
        try
        {
            _context.SubscriptionTiers.Add(tier);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSubscriptionTier), new { id = tier.Id }, 
                ApiResponse<SubscriptionTier>.SuccessResponse(tier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription tier");
            return StatusCode(500, ApiResponse<SubscriptionTier>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Updates a subscription tier
    /// </summary>
    [HttpPut("subscription-tiers/{id}")]
    public async Task<ActionResult<ApiResponse<SubscriptionTier>>> UpdateSubscriptionTier(int id, SubscriptionTier tier)
    {
        if (id != tier.Id)
        {
            return BadRequest(ApiResponse<SubscriptionTier>.ErrorResponse("ID mismatch"));
        }

        try
        {
            tier.UpdatedAt = DateTime.UtcNow;
            _context.Entry(tier).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<SubscriptionTier>.SuccessResponse(tier));
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await TierExists(id))
            {
                return NotFound(ApiResponse<SubscriptionTier>.NotFoundResponse($"Tier with ID {id} not found"));
            }
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription tier {TierId}", id);
            return StatusCode(500, ApiResponse<SubscriptionTier>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets all rate limit configurations
    /// </summary>
    [HttpGet("tier-configs")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RateLimitTierConfig>>>> GetRateLimitConfigs()
    {
        try
        {
            IEnumerable<RateLimitTierConfig> configs = await _context.RateLimitTierConfigs
                .Include(c => c.SubscriptionTier)
                .ToListAsync();
                
            return Ok(ApiResponse<IEnumerable<RateLimitTierConfig>>.SuccessResponse(configs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rate limit configurations");
            return StatusCode(500, ApiResponse<IEnumerable<RateLimitTierConfig>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Creates a new rate limit configuration
    /// </summary>
    [HttpPost("tier-configs")]
    public async Task<ActionResult<ApiResponse<RateLimitTierConfig>>> CreateRateLimitConfig(RateLimitTierConfig config)
    {
        try
        {
            _context.RateLimitTierConfigs.Add(config);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRateLimitConfigs), null,
                ApiResponse<RateLimitTierConfig>.SuccessResponse(config));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating rate limit configuration");
            return StatusCode(500, ApiResponse<RateLimitTierConfig>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets all circuit breakers and their statuses
    /// </summary>
    [HttpGet("circuit-breakers")]
    public ActionResult<ApiResponse<object>> GetCircuitBreakers()
    {
        try
        {
            var circuitBreakers = CircuitBreaker.GetAll();
            var result = circuitBreakers.Select(cb => new
            {
                Name = cb.Key,
                State = cb.Value.State.ToString(),
                IsOpen = cb.Value.State == CircuitState.Open
            });

            return Ok(ApiResponse<object>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving circuit breakers");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Resets a specific circuit breaker
    /// </summary>
    [HttpPost("circuit-breakers/{name}/reset")]
    public ActionResult<ApiResponse<object>> ResetCircuitBreaker(string name)
    {
        try
        {
            var circuitBreakers = CircuitBreaker.GetAll();
            if (circuitBreakers.TryGetValue(name, out CircuitBreaker? circuitBreaker))
            {
                circuitBreaker!.Reset();
                return Ok(ApiResponse<object>.SuccessResponse(new 
                { 
                    Name = name,
                    State = circuitBreaker.State.ToString(),
                    Message = "Circuit breaker reset successfully" 
                }));
            }

            return NotFound(ApiResponse<object>.NotFoundResponse($"Circuit breaker '{name}' not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting circuit breaker {Name}", name);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets API quota usage for all users
    /// </summary>
    [HttpGet("quotas")]
    public async Task<ActionResult<ApiResponse<object>>> GetQuotaUsage([FromQuery] int? userId = null)
    {
        try
        {
            IQueryable<UserApiQuota> query = _context.UserApiQuotas
                .Include(q => q.SubscriptionTier)
                .Include(q => q.User);

            if (userId.HasValue)
            {
                query = query.Where(q => q.UserId == userId.Value);
            }

            List<UserApiQuota> quotas = await query.ToListAsync();
            
            var result = quotas.Select(q => new
            {
                UserId = q.UserId,
                UserName = q.User?.Username,
                SubscriptionTier = q.SubscriptionTier?.Name,
                ApiCallsUsedToday = q.ApiCallsUsedToday,
                MaxDailyApiCalls = q.MaxDailyApiCalls,
                UsagePercentage = q.MaxDailyApiCalls > 0 
                    ? Math.Round((double)q.ApiCallsUsedToday / q.MaxDailyApiCalls * 100, 2) 
                    : 0,
                LastResetTime = q.LastResetTime,
                NextResetTime = q.LastResetTime.Date.AddDays(1),
                IsExempt = q.IsExemptFromQuota
            });

            return Ok(ApiResponse<object>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quota usage");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Reset user API quota
    /// </summary>
    [HttpPost("quotas/{userId}/reset")]
    public async Task<ActionResult<ApiResponse<object>>> ResetQuota(int userId)
    {
        try
        {
            UserApiQuota? quota = await _context.UserApiQuotas.FirstOrDefaultAsync(q => q.UserId == userId);
            if (quota == null)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Quota for user {userId} not found"));
            }

            quota.ApiCallsUsedToday = 0;
            quota.LastResetTime = DateTime.UtcNow.Date;
            quota.LastUpdatedTime = DateTime.UtcNow;
            quota.HasReceivedQuotaWarning = false;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                UserId = userId,
                Message = "API quota reset successfully",
                NewQuota = new
                {
                    ApiCallsUsedToday = quota.ApiCallsUsedToday,
                    MaxDailyApiCalls = quota.MaxDailyApiCalls,
                    NextResetTime = quota.LastResetTime.Date.AddDays(1)
                }
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting quota for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Get user's quota and rate limit info
    /// </summary>
    [HttpGet("my-limits")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<object>>> GetMyLimits()
    {
        try
        {
            int userId = User.Identity?.IsAuthenticated == true 
                ? int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0")
                : 0;

            if (userId == 0)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    Message = "You are not authenticated. Default rate limits apply.",
                    UserType = "Anonymous",
                    RateLimits = new
                    {
                        General = new { Limit = 30, TimeWindowSeconds = 60 },
                        Authentication = new { Limit = 5, TimeWindowSeconds = 60 },
                        Tasks = new { Limit = 20, TimeWindowSeconds = 30 }
                    },
                    DailyQuota = "N/A"
                }));
            }

            bool isTrusted = await _userSubscriptionService.IsTrustedSystemAccountAsync(userId);
            SubscriptionTier tier = await _userSubscriptionService.GetUserSubscriptionTierAsync(userId);
            (int remaining, DateTime resetTime) = await _userSubscriptionService.GetRemainingQuotaAsync(userId);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                UserId = userId,
                SubscriptionTier = tier.Name,
                IsTrustedAccount = isTrusted,
                DailyQuota = new
                {
                    TotalQuota = tier.DailyApiQuota,
                    Remaining = remaining,
                    ResetTime = resetTime,
                    IsExempt = tier.IsSystemTier
                },
                RateLimits = new
                {
                    Default = new { Limit = tier.DefaultRateLimit, TimeWindowSeconds = tier.DefaultTimeWindowSeconds },
                    BypassStandardLimits = tier.BypassStandardRateLimits
                }
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user limits");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    private async Task<bool> TierExists(int id)
    {
        return await _context.SubscriptionTiers.AnyAsync(t => t.Id == id);
    }
} 