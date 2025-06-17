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

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Attributes;

/// <summary>
/// Authorization attribute that requires specific age groups for access.
/// Can be applied to controllers or individual actions.
/// Provides method-level age-based authorization controls.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequireAgeGroupAttribute : Attribute, IAuthorizationFilter
{
    private readonly FamilyMemberAgeGroup[] _allowedAgeGroups;
    private readonly bool _requireAll;
    private readonly string? _customErrorMessage;

    /// <summary>
    /// Initializes a new instance of RequireAgeGroupAttribute with a single allowed age group.
    /// </summary>
    /// <param name="allowedAgeGroup">The age group allowed for access</param>
    /// <param name="customErrorMessage">Custom error message for access denied</param>
    public RequireAgeGroupAttribute(FamilyMemberAgeGroup allowedAgeGroup, string? customErrorMessage = null)
    {
        _allowedAgeGroups = new[] { allowedAgeGroup };
        _requireAll = false;
        _customErrorMessage = customErrorMessage;
    }

    /// <summary>
    /// Initializes a new instance of RequireAgeGroupAttribute with multiple allowed age groups.
    /// </summary>
    /// <param name="allowedAgeGroups">The age groups allowed for access</param>
    /// <param name="requireAll">If true, user must have ALL age groups. If false, user needs ANY age group.</param>
    /// <param name="customErrorMessage">Custom error message for access denied</param>
    public RequireAgeGroupAttribute(FamilyMemberAgeGroup[] allowedAgeGroups, bool requireAll = false, string? customErrorMessage = null)
    {
        _allowedAgeGroups = allowedAgeGroups ?? throw new ArgumentNullException(nameof(allowedAgeGroups));
        _requireAll = requireAll;
        _customErrorMessage = customErrorMessage;
    }

    /// <summary>
    /// Initializes a new instance with multiple age groups specified as parameters.
    /// User needs ANY of the specified age groups.
    /// </summary>
    public RequireAgeGroupAttribute(FamilyMemberAgeGroup ageGroup1, FamilyMemberAgeGroup ageGroup2, string? customErrorMessage = null) 
        : this(new[] { ageGroup1, ageGroup2 }, false, customErrorMessage) { }
    
    public RequireAgeGroupAttribute(FamilyMemberAgeGroup ageGroup1, FamilyMemberAgeGroup ageGroup2, FamilyMemberAgeGroup ageGroup3, string? customErrorMessage = null) 
        : this(new[] { ageGroup1, ageGroup2, ageGroup3 }, false, customErrorMessage) { }

    /// <summary>
    /// Performs authorization check on the request.
    /// </summary>
    /// <param name="context">The authorization filter context</param>
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        ILogger<RequireAgeGroupAttribute>? logger = context.HttpContext.RequestServices.GetService<ILogger<RequireAgeGroupAttribute>>();

        // Check if user is authenticated
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            logger?.LogWarning("Age group authorization failed: User not authenticated");
            context.Result = new UnauthorizedResult();
            return;
        }

        // Get user ID from claims
        string? userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
        {
            logger?.LogWarning("Age group authorization failed: Invalid user ID claim");
            context.Result = new ForbidResult("Invalid user token");
            return;
        }

        // Get user repository to retrieve age group
        IUserRepository? userRepository = context.HttpContext.RequestServices.GetService<IUserRepository>();
        if (userRepository == null)
        {
            logger?.LogError("Age group authorization failed: UserRepository not found in DI container");
            context.Result = new StatusCodeResult(500);
            return;
        }

        // Get user's age group
        FamilyMemberAgeGroup userAgeGroup;
        try
        {
            Task<User?> userTask = userRepository.GetUserByIdAsync(userId);
            userTask.Wait(); // Synchronous wait for authorization filter
            User? user = userTask.Result;
            
            if (user == null)
            {
                logger?.LogWarning("Age group authorization failed: User {UserId} not found", userId);
                context.Result = new ForbidResult("User not found");
                return;
            }

            userAgeGroup = user.AgeGroup;
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Age group authorization failed: Error retrieving user {UserId}", userId);
            context.Result = new StatusCodeResult(500);
            return;
        }

        // Check age group authorization
        bool hasAccess = _requireAll 
            ? _allowedAgeGroups.All(ageGroup => userAgeGroup == ageGroup)
            : _allowedAgeGroups.Any(ageGroup => userAgeGroup == ageGroup);

        if (!hasAccess)
        {
            string allowedAgeGroupsString = string.Join(", ", _allowedAgeGroups.Select(ag => ag.ToString()));
            string errorMessage = _customErrorMessage ?? GetDefaultErrorMessage(userAgeGroup, allowedAgeGroupsString);
            
            logger?.LogWarning("Age group authorization denied for user {UserId}. User age group: {UserAgeGroup}, Required: {RequiredAgeGroups}", 
                userId, userAgeGroup, allowedAgeGroupsString);

            context.Result = new ObjectResult(new { message = errorMessage })
            {
                StatusCode = 403
            };
            return;
        }

        logger?.LogDebug("Age group authorization successful for user {UserId} with age group {UserAgeGroup}", userId, userAgeGroup);
    }

    /// <summary>
    /// Gets the default error message based on user's age group.
    /// </summary>
    /// <param name="userAgeGroup">The user's age group</param>
    /// <param name="allowedAgeGroups">String representation of allowed age groups</param>
    /// <returns>Appropriate error message</returns>
    private static string GetDefaultErrorMessage(FamilyMemberAgeGroup userAgeGroup, string allowedAgeGroups)
    {
        return userAgeGroup switch
        {
            FamilyMemberAgeGroup.Child => "This feature is not available for children. Please ask a parent or guardian for assistance.",
            FamilyMemberAgeGroup.Teen => "This feature requires adult permissions. Please ask a parent or guardian for assistance.",
            FamilyMemberAgeGroup.Adult => $"Access restricted to specific age groups: {allowedAgeGroups}",
            _ => $"Access denied. Required age group(s): {allowedAgeGroups}. Your age group: {userAgeGroup}"
        };
    }
}

/// <summary>
/// Convenience attributes for common age group requirements.
/// </summary>
public class RequireAdultAttribute : RequireAgeGroupAttribute
{
    public RequireAdultAttribute(string? customErrorMessage = null) 
        : base(FamilyMemberAgeGroup.Adult, customErrorMessage ?? "This feature is only available to adults.") { }
}

public class RequireTeenOrAdultAttribute : RequireAgeGroupAttribute
{
    public RequireTeenOrAdultAttribute(string? customErrorMessage = null) 
        : base(new[] { FamilyMemberAgeGroup.Teen, FamilyMemberAgeGroup.Adult }, false, 
               customErrorMessage ?? "This feature is not available for children.") { }
}

public class RequireChildAttribute : RequireAgeGroupAttribute
{
    public RequireChildAttribute(string? customErrorMessage = null) 
        : base(FamilyMemberAgeGroup.Child, customErrorMessage ?? "This feature is only available to children.") { }
}

public class NoChildAccessAttribute : RequireAgeGroupAttribute
{
    public NoChildAccessAttribute(string? customErrorMessage = null) 
        : base(new[] { FamilyMemberAgeGroup.Teen, FamilyMemberAgeGroup.Adult }, false,
               customErrorMessage ?? "This feature is not available for children. Please ask a parent or guardian for assistance.") { }
} 