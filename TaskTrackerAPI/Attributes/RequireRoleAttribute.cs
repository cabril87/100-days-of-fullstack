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
using Microsoft.AspNetCore.Mvc.Filters;
using TaskTrackerAPI.Models;
using System.Security.Claims;
using System;
using System.Linq;

namespace TaskTrackerAPI.Attributes;

/// <summary>
/// Authorization attribute that requires specific user roles for access.
/// Can be applied to controllers or individual actions.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequireRoleAttribute : Attribute, IAuthorizationFilter
{
    private readonly UserRole[] _requiredRoles;
    private readonly bool _requireAll;

    /// <summary>
    /// Initializes a new instance of RequireRoleAttribute with a single required role.
    /// </summary>
    /// <param name="requiredRole">The role required for access</param>
    public RequireRoleAttribute(UserRole requiredRole)
    {
        _requiredRoles = new[] { requiredRole };
        _requireAll = false;
    }

    /// <summary>
    /// Initializes a new instance of RequireRoleAttribute with multiple required roles.
    /// </summary>
    /// <param name="requiredRoles">The roles required for access</param>
    /// <param name="requireAll">If true, user must have ALL roles. If false, user needs ANY role.</param>
    public RequireRoleAttribute(UserRole[] requiredRoles, bool requireAll = false)
    {
        _requiredRoles = requiredRoles ?? throw new ArgumentNullException(nameof(requiredRoles));
        _requireAll = requireAll;
    }

    /// <summary>
    /// Initializes a new instance with multiple roles specified as parameters.
    /// User needs ANY of the specified roles.
    /// </summary>
    public RequireRoleAttribute(UserRole role1, UserRole role2) : this(new[] { role1, role2 }, false) { }
    public RequireRoleAttribute(UserRole role1, UserRole role2, UserRole role3) : this(new[] { role1, role2, role3 }, false) { }

    /// <summary>
    /// Performs authorization check on the request.
    /// </summary>
    /// <param name="context">The authorization filter context</param>
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Check if user is authenticated
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Get user role from claims
        Claim? roleClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role);
        if (roleClaim == null)
        {
            context.Result = new ForbidResult("No role claim found");
            return;
        }

        // Parse user role
        UserRole userRole = UserRoleConstants.FromString(roleClaim.Value);

        // Check role authorization
        bool hasAccess = _requireAll 
            ? _requiredRoles.All(role => HasRole(userRole, role))
            : _requiredRoles.Any(role => HasRole(userRole, role));

        if (!hasAccess)
        {
            string requiredRolesString = string.Join(", ", _requiredRoles.Select(r => UserRoleConstants.ToString(r)));
            string userRoleString = UserRoleConstants.ToString(userRole);
            
            context.Result = new ForbidResult($"Access denied. Required role(s): {requiredRolesString}. User role: {userRoleString}");
            return;
        }
    }

    /// <summary>
    /// Checks if the user has the required role or higher privileges.
    /// </summary>
    /// <param name="userRole">The user's role</param>
    /// <param name="requiredRole">The required role</param>
    /// <returns>True if user has access</returns>
    private static bool HasRole(UserRole userRole, UserRole requiredRole)
    {
        // Global Admin has access to everything
        if (userRole == UserRole.GlobalAdmin)
            return true;

        // Exact role match
        if (userRole == requiredRole)
            return true;

        // Special cases for role hierarchy
        return requiredRole switch
        {
            UserRole.RegularUser => true, // All roles can access regular user features
            UserRole.CustomerSupport => UserRoleConstants.CanAssistUsers(userRole),
            UserRole.Developer => UserRoleConstants.CanAccessDeveloperTools(userRole),
            UserRole.GlobalAdmin => UserRoleConstants.HasAdminPrivileges(userRole),
            _ => false
        };
    }
}

/// <summary>
/// Convenience attributes for common role requirements.
/// </summary>
public class RequireGlobalAdminAttribute : RequireRoleAttribute
{
    public RequireGlobalAdminAttribute() : base(UserRole.GlobalAdmin) { }
}

public class RequireCustomerSupportAttribute : RequireRoleAttribute  
{
    public RequireCustomerSupportAttribute() : base(UserRole.CustomerSupport, UserRole.GlobalAdmin) { }
}

public class RequireDeveloperAttribute : RequireRoleAttribute
{
    public RequireDeveloperAttribute() : base(UserRole.Developer, UserRole.GlobalAdmin) { }
}

public class RequireAdminOrSupportAttribute : RequireRoleAttribute
{
    public RequireAdminOrSupportAttribute() : base(new[] { UserRole.GlobalAdmin, UserRole.CustomerSupport }, false) { }
}

public class RequireAdminOrDeveloperAttribute : RequireRoleAttribute
{
    public RequireAdminOrDeveloperAttribute() : base(new[] { UserRole.GlobalAdmin, UserRole.Developer }, false) { }
} 