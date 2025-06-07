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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Family seeding controller - provides demo data and testing utilities.
/// Accessible to Global Admins only.
/// Used for development and demonstration purposes.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
[RequireGlobalAdmin]
public class FamilySeedingController : BaseApiController
{
    private readonly IFamilySeedingService _familySeedingService;
    private readonly ILogger<FamilySeedingController> _logger;

    public FamilySeedingController(
        IFamilySeedingService familySeedingService,
        ILogger<FamilySeedingController> logger)
    {
        _familySeedingService = familySeedingService;
        _logger = logger;
    }

    /// <summary>
    /// Get available family scenarios for seeding
    /// </summary>
    /// <returns>List of available scenarios with descriptions</returns>
    [HttpGet("scenarios")]
    public async Task<ActionResult<List<FamilyScenarioInfoDTO>>> GetScenarios()
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can access family seeding functionality");
            }

            List<FamilyScenarioInfoDTO> scenarios = await _familySeedingService.GetAvailableScenariosAsync();
            return Ok(scenarios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family scenarios");
            return StatusCode(500, "Failed to get family scenarios");
        }
    }

    /// <summary>
    /// Seed a family with test data
    /// </summary>
    /// <param name="request">Seeding request with scenario and options</param>
    /// <returns>Seeding result with created family information</returns>
    [HttpPost("seed")]
    public async Task<ActionResult<FamilySeedingResponseDTO>> SeedFamily([FromBody] FamilySeedingRequestDTO request)
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can seed family data");
            }

            int adminUserId = GetCurrentUserId();
            FamilySeedingResponseDTO result = await _familySeedingService.SeedFamilyAsync(request, adminUserId);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            _logger.LogInformation("Family seeded successfully: {FamilyName} with {MemberCount} members", 
                result.FamilyName, result.MembersCreated);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized family seeding attempt by user {UserId}", GetCurrentUserId());
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding family for scenario {Scenario}", request.Scenario);
            return StatusCode(500, "Failed to seed family data");
        }
    }

    /// <summary>
    /// Clear all test family data
    /// </summary>
    /// <returns>Number of families cleared</returns>
    [HttpDelete("clear")]
    public async Task<ActionResult<object>> ClearTestFamilies()
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can clear test family data");
            }

            int adminUserId = GetCurrentUserId();
            int cleared = await _familySeedingService.ClearTestFamiliesAsync(adminUserId);

            _logger.LogInformation("Cleared {Count} test families by admin {AdminUserId}", cleared, adminUserId);

            return Ok(new
            {
                Success = true,
                Message = $"Cleared {cleared} test families",
                FamiliesCleared = cleared
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing test families");
            return StatusCode(500, "Failed to clear test families");
        }
    }

    /// <summary>
    /// Get list of test families created by seeding
    /// </summary>
    /// <returns>List of test families</returns>
    [HttpGet("test-families")]
    public async Task<ActionResult<List<FamilyDTO>>> GetTestFamilies()
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can view test families");
            }

            int adminUserId = GetCurrentUserId();
            List<FamilyDTO> testFamilies = await _familySeedingService.GetTestFamiliesAsync(adminUserId);

            return Ok(testFamilies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting test families");
            return StatusCode(500, "Failed to get test families");
        }
    }

    /// <summary>
    /// Quick seed - Seed a specific scenario with one API call
    /// </summary>
    /// <param name="scenario">Family scenario to seed</param>
    /// <param name="memberCount">Number of members (optional, uses default if not specified)</param>
    /// <returns>Seeding result</returns>
    [HttpPost("quick-seed/{scenario}")]
    public async Task<ActionResult<FamilySeedingResponseDTO>> QuickSeed(
        FamilyScenario scenario,
        [FromQuery] int? memberCount = null)
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can seed family data");
            }

            FamilySeedingRequestDTO request = new FamilySeedingRequestDTO
            {
                Scenario = scenario,
                MemberCount = memberCount ?? 0,
                ClearExisting = true
            };

            int adminUserId = GetCurrentUserId();
            FamilySeedingResponseDTO result = await _familySeedingService.SeedFamilyAsync(request, adminUserId);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in quick seed for scenario {Scenario}", scenario);
            return StatusCode(500, "Failed to quick seed family data");
        }
    }

    /// <summary>
    /// Health check for seeding service
    /// </summary>
    /// <returns>Service status</returns>
    [HttpGet("health")]
    public async Task<ActionResult<object>> HealthCheck()
    {
        try
        {
            if (!IsGlobalAdmin())
            {
                return Forbid("Only global admins can check seeding service health");
            }

            List<FamilyScenarioInfoDTO> scenarios = await _familySeedingService.GetAvailableScenariosAsync();
            int adminUserId = GetCurrentUserId();
            List<FamilyDTO> testFamilies = await _familySeedingService.GetTestFamiliesAsync(adminUserId);

            return Ok(new
            {
                Status = "Healthy",
                ScenariosAvailable = scenarios.Count,
                TestFamiliesExists = testFamilies.Count,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed for family seeding service");
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Check if current user is a global admin
    /// </summary>
    /// <returns>True if user is global admin</returns>
    private bool IsGlobalAdmin()
    {
        string? userEmail = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
        string? userRole = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

        return userEmail?.ToLower() == "admin@tasktracker.com" || 
               userRole?.ToLower() == "globaladmin";
    }

    /// <summary>
    /// Get current user ID from claims
    /// </summary>
    /// <returns>User ID</returns>
    private int GetCurrentUserId()
    {
        string? userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    #endregion
} 