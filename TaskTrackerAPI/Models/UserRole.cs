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

using System.ComponentModel;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Defines the four-tier user role system for application access control.
/// Each role has specific permissions and access levels.
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Regular family users - Standard application features
    /// Can: Manage family tasks, calendar, gamification, parental controls (as parent)
    /// Cannot: Access admin features, developer tools, customer support functions
    /// </summary>
    [Description("Regular User")]
    RegularUser = 0,

    /// <summary>
    /// Customer support representatives - User assistance
    /// Can: Search users, disable MFA, generate password reset codes, view family info
    /// Cannot: Access billing, system config, developer tools, delete accounts
    /// </summary>
    [Description("Customer Support")]
    CustomerSupport = 1,

    /// <summary>
    /// Development team members - System monitoring and debugging
    /// Can: Access debug endpoints, performance metrics, API monitoring, system health
    /// Cannot: Access user data, billing, customer support functions, system config
    /// </summary>
    [Description("Developer")]
    Developer = 2,

    /// <summary>
    /// Global administrator - Full system access
    /// Can: Everything (billing, system config, user management, assign roles)
    /// Highest privilege level with complete application control
    /// </summary>
    [Description("Global Admin")]
    GlobalAdmin = 3
}

/// <summary>
/// Static class containing user role constants and helper methods.
/// </summary>
public static class UserRoleConstants
{
    // Role string constants for backward compatibility
    public const string REGULAR_USER = "RegularUser";
    public const string CUSTOMER_SUPPORT = "CustomerSupport";
    public const string DEVELOPER = "Developer";
    public const string GLOBAL_ADMIN = "GlobalAdmin";

    // Legacy role constants (for migration)
    public const string LEGACY_USER = "User";
    public const string LEGACY_ADMIN = "Admin";

    /// <summary>
    /// Gets the string representation of a UserRole enum value.
    /// </summary>
    /// <param name="role">The UserRole enum value</param>
    /// <returns>String representation of the role</returns>
    public static string ToString(UserRole role)
    {
        return role switch
        {
            UserRole.RegularUser => REGULAR_USER,
            UserRole.CustomerSupport => CUSTOMER_SUPPORT,
            UserRole.Developer => DEVELOPER,
            UserRole.GlobalAdmin => GLOBAL_ADMIN,
            _ => REGULAR_USER
        };
    }

    /// <summary>
    /// Parses a string role to UserRole enum, with legacy support.
    /// </summary>
    /// <param name="roleString">The role string to parse</param>
    /// <returns>UserRole enum value</returns>
    public static UserRole FromString(string roleString)
    {
        return roleString switch
        {
            REGULAR_USER => UserRole.RegularUser,
            CUSTOMER_SUPPORT => UserRole.CustomerSupport,
            DEVELOPER => UserRole.Developer,
            GLOBAL_ADMIN => UserRole.GlobalAdmin,
            
            // Legacy role support for migration
            LEGACY_USER => UserRole.RegularUser,
            LEGACY_ADMIN => UserRole.GlobalAdmin,
            
            _ => UserRole.RegularUser // Default to regular user
        };
    }

    /// <summary>
    /// Gets all available role strings.
    /// </summary>
    /// <returns>Array of role strings</returns>
    public static string[] GetAllRoles()
    {
        return new[] { REGULAR_USER, CUSTOMER_SUPPORT, DEVELOPER, GLOBAL_ADMIN };
    }

    /// <summary>
    /// Checks if a role has administrative privileges.
    /// </summary>
    /// <param name="role">The role to check</param>
    /// <returns>True if the role has admin privileges</returns>
    public static bool HasAdminPrivileges(UserRole role)
    {
        return role == UserRole.GlobalAdmin;
    }

    /// <summary>
    /// Checks if a role can assist users (customer support functions).
    /// </summary>
    /// <param name="role">The role to check</param>
    /// <returns>True if the role can assist users</returns>
    public static bool CanAssistUsers(UserRole role)
    {
        return role == UserRole.CustomerSupport || role == UserRole.GlobalAdmin;
    }

    /// <summary>
    /// Checks if a role can access developer tools.
    /// </summary>
    /// <param name="role">The role to check</param>
    /// <returns>True if the role can access developer tools</returns>
    public static bool CanAccessDeveloperTools(UserRole role)
    {
        return role == UserRole.Developer || role == UserRole.GlobalAdmin;
    }

    /// <summary>
    /// Gets the hierarchy level of a role (higher number = more privileges).
    /// </summary>
    /// <param name="role">The role to check</param>
    /// <returns>Hierarchy level (0-3)</returns>
    public static int GetHierarchyLevel(UserRole role)
    {
        return (int)role;
    }

    /// <summary>
    /// Checks if one role can assign another role.
    /// Only Global Admin can assign roles.
    /// </summary>
    /// <param name="assignerRole">The role of the user doing the assignment</param>
    /// <param name="targetRole">The role being assigned</param>
    /// <returns>True if assignment is allowed</returns>
    public static bool CanAssignRole(UserRole assignerRole, UserRole targetRole)
    {
        // Only Global Admin can assign roles
        return assignerRole == UserRole.GlobalAdmin;
    }
} 