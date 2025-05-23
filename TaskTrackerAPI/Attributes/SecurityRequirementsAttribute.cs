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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Attributes
{
    /// <summary>
    /// Enforces consistent security requirements across API endpoints.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class SecurityRequirementsAttribute : ActionFilterAttribute
    {
        private readonly SecurityRequirementLevel _requirementLevel;
        private readonly ResourceType _resourceType;
        private readonly string[] _requiredPermissions;
        private readonly bool _requireOwnership;
        private readonly bool _allowChildAccess;
        private readonly string _resourceIdParameter;

        /// <summary>
        /// Enforces security requirements for an API endpoint
        /// </summary>
        /// <param name="requirementLevel">The security level required for the endpoint</param>
        /// <param name="resourceType">The type of resource being accessed</param>
        /// <param name="requireOwnership">Whether the user must own the resource</param>
        /// <param name="allowChildAccess">Whether child users are allowed to access</param>
        /// <param name="resourceIdParameter">The name of the parameter that contains the resource ID</param>
        /// <param name="requiredPermissions">Optional list of permissions required</param>
        public SecurityRequirementsAttribute(
            SecurityRequirementLevel requirementLevel = SecurityRequirementLevel.Authenticated,
            ResourceType resourceType = ResourceType.None,
            bool requireOwnership = false,
            bool allowChildAccess = true,
            string resourceIdParameter = "id",
            params string[] requiredPermissions)
        {
            _requirementLevel = requirementLevel;
            _resourceType = resourceType;
            _requireOwnership = requireOwnership;
            _allowChildAccess = allowChildAccess;
            _requiredPermissions = requiredPermissions;
            _resourceIdParameter = resourceIdParameter;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Get logger from DI
            ILogger<SecurityRequirementsAttribute> logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<SecurityRequirementsAttribute>>();

            // Get security service from DI
            ISecurityService securityService = context.HttpContext.RequestServices.GetRequiredService<ISecurityService>();

            // Extract user info from context
            if (context.HttpContext.User.Identity?.IsAuthenticated != true && 
                _requirementLevel != SecurityRequirementLevel.Public)
            {
                logger.LogWarning("Security violation: Unauthenticated access attempt to {Path}", 
                    context.HttpContext.Request.Path);
                context.Result = new UnauthorizedObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                { 
                    Message = "Authentication required for this resource",
                    Success = false,
                    StatusCode = 401
                });
                return;
            }

            // Check if user is admin - admins bypass most checks
            bool isAdmin = context.HttpContext.User.IsInRole("Admin");
            if (isAdmin && _requirementLevel != SecurityRequirementLevel.AdminOnly)
            {
                // Admins bypass most security checks
                await next();
                return;
            }

            // Check if admin-only resource
            if (_requirementLevel == SecurityRequirementLevel.AdminOnly && !isAdmin)
            {
                logger.LogWarning("Security violation: Non-admin user attempted to access admin-only resource {Path}", 
                    context.HttpContext.Request.Path);
                context.Result = new ObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                {
                    Message = "This operation requires administrator privileges",
                    Success = false,
                    StatusCode = 403
                })
                {
                    StatusCode = 403
                };
                return;
            }

            // Check child access restrictions
            if (!_allowChildAccess && context.HttpContext.User.IsInRole("Child"))
            {
                logger.LogWarning("Security violation: Child user attempted to access restricted resource {Path}", 
                    context.HttpContext.Request.Path);
                context.Result = new ObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                {
                    Message = "This operation is not available for child accounts",
                    Success = false,
                    StatusCode = 403
                })
                {
                    StatusCode = 403
                };
                return;
            }

            // Check ownership requirements
            if (_requireOwnership && _resourceType != ResourceType.None)
            {
                // Extract the resource ID from the action parameters
                if (context.ActionArguments.TryGetValue(_resourceIdParameter, out object? resourceIdObj) && 
                    resourceIdObj != null && 
                    int.TryParse(resourceIdObj.ToString(), out int resourceId))
                {
                    bool ownershipVerified = await securityService.VerifyResourceOwnershipAsync(_resourceType, resourceId);
                    if (!ownershipVerified)
                    {
                        logger.LogWarning("Security violation: User attempted to access resource they don't own: {ResourceType}:{ResourceId}", 
                            _resourceType, resourceId);
                        context.Result = new ObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                        {
                            Message = "You don't have permission to access this resource",
                            Success = false,
                            StatusCode = 403
                        })
                        {
                            StatusCode = 403
                        };
                        return;
                    }
                }
                else
                {
                    // If the resource ID couldn't be found or parsed, log a warning and fail the request
                    logger.LogWarning("Cannot verify resource ownership: Resource ID not found in request parameters for {Path}",
                        context.HttpContext.Request.Path);
                    context.Result = new BadRequestObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                    {
                        Message = "Invalid resource identifier",
                        Success = false,
                        StatusCode = 400
                    });
                    return;
                }
            }

            // Check specific permissions
            if (_requiredPermissions.Length > 0)
            {
                bool hasPermission = securityService.VerifyPermissions(_requiredPermissions);
                if (!hasPermission)
                {
                    logger.LogWarning("Security violation: User lacks required permissions for {Path}", 
                        context.HttpContext.Request.Path);
                    context.Result = new ObjectResult(new TaskTrackerAPI.Models.ApiResponse<object>
                    {
                        Message = "You don't have the required permissions for this operation",
                        Success = false,
                        StatusCode = 403
                    })
                    {
                        StatusCode = 403
                    };
                    return;
                }
            }

            // All security checks passed, proceed to the action
            await next();
        }
    }

    /// <summary>
    /// Defines the level of security requirements for an endpoint
    /// </summary>
    public enum SecurityRequirementLevel
    {
        /// <summary>
        /// Endpoint can be accessed without authentication
        /// </summary>
        Public = 0,
        
        /// <summary>
        /// Endpoint requires authentication
        /// </summary>
        Authenticated = 1,
        
        /// <summary>
        /// Endpoint requires admin role
        /// </summary>
        AdminOnly = 2
    }

    /// <summary>
    /// Defines the type of resource being accessed
    /// </summary>
    public enum ResourceType
    {
        None = 0,
        Task = 1,
        Category = 2,
        Tag = 3,
        User = 4,
        Family = 5,
        FamilyMember = 6,
        Invitation = 7,
        Reminder = 8,
        Notification = 9,
        Achievement = 10,
        Badge = 11,
        Board = 12,
        Focus = 13
    }
} 