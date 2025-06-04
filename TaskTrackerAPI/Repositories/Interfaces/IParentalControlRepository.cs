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
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for parental control operations
/// </summary>
public interface IParentalControlRepository
{
    // Parental Control Management
    
    /// <summary>
    /// Gets parental control settings by ID
    /// </summary>
    /// <param name="id">Parental control ID</param>
    /// <returns>Parental control settings or null if not found</returns>
    Task<ParentalControl?> GetParentalControlByIdAsync(int id);

    /// <summary>
    /// Gets parental control settings for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parental control settings or null if not found</returns>
    Task<ParentalControl?> GetParentalControlByChildIdAsync(int childUserId);

    /// <summary>
    /// Gets all children under parental control for a specific parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control settings for all children</returns>
    Task<IEnumerable<ParentalControl>> GetParentalControlsByParentIdAsync(int parentUserId);

    /// <summary>
    /// Creates new parental control settings
    /// </summary>
    /// <param name="parentalControl">Parental control settings to create</param>
    /// <returns>Created parental control settings</returns>
    Task<ParentalControl> CreateParentalControlAsync(ParentalControl parentalControl);

    /// <summary>
    /// Updates existing parental control settings
    /// </summary>
    /// <param name="parentalControl">Updated parental control settings</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task UpdateParentalControlAsync(ParentalControl parentalControl);

    /// <summary>
    /// Deletes parental control settings
    /// </summary>
    /// <param name="id">Parental control ID to delete</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task DeleteParentalControlAsync(int id);

    /// <summary>
    /// Checks if a user has parental controls applied
    /// </summary>
    /// <param name="childUserId">Child user ID to check</param>
    /// <returns>True if parental controls exist, false otherwise</returns>
    Task<bool> HasParentalControlsAsync(int childUserId);

    /// <summary>
    /// Checks if a parent has permission to manage a child's controls
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>True if parent has permission, false otherwise</returns>
    Task<bool> HasParentPermissionAsync(int parentUserId, int childUserId);

    // Permission Request Management

    /// <summary>
    /// Gets a permission request by ID
    /// </summary>
    /// <param name="id">Permission request ID</param>
    /// <returns>Permission request or null if not found</returns>
    Task<PermissionRequest?> GetPermissionRequestByIdAsync(int id);

    /// <summary>
    /// Gets all permission requests for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>List of permission requests</returns>
    Task<IEnumerable<PermissionRequest>> GetPermissionRequestsByChildIdAsync(int childUserId);

    /// <summary>
    /// Gets all permission requests that a parent needs to review
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of permission requests awaiting parent review</returns>
    Task<IEnumerable<PermissionRequest>> GetPendingPermissionRequestsByParentIdAsync(int parentUserId);

    /// <summary>
    /// Gets permission requests by status
    /// </summary>
    /// <param name="status">Permission request status</param>
    /// <returns>List of permission requests with the specified status</returns>
    Task<IEnumerable<PermissionRequest>> GetPermissionRequestsByStatusAsync(PermissionRequestStatus status);

    /// <summary>
    /// Creates a new permission request
    /// </summary>
    /// <param name="permissionRequest">Permission request to create</param>
    /// <returns>Created permission request</returns>
    Task<PermissionRequest> CreatePermissionRequestAsync(PermissionRequest permissionRequest);

    /// <summary>
    /// Updates a permission request (typically for approval/denial)
    /// </summary>
    /// <param name="permissionRequest">Updated permission request</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task UpdatePermissionRequestAsync(PermissionRequest permissionRequest);

    /// <summary>
    /// Deletes a permission request
    /// </summary>
    /// <param name="id">Permission request ID to delete</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task DeletePermissionRequestAsync(int id);

    /// <summary>
    /// Gets the count of pending permission requests for a parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Number of pending permission requests</returns>
    Task<int> GetPendingPermissionRequestCountAsync(int parentUserId);

    /// <summary>
    /// Gets the most recent permission requests for a child (for dashboard display)
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="count">Number of recent requests to retrieve</param>
    /// <returns>List of recent permission requests</returns>
    Task<IEnumerable<PermissionRequest>> GetRecentPermissionRequestsAsync(int childUserId, int count = 5);

    /// <summary>
    /// Marks expired permission requests as expired
    /// </summary>
    /// <returns>Number of requests marked as expired</returns>
    Task<int> MarkExpiredPermissionRequestsAsync();

    // Screen Time and Usage Tracking

    /// <summary>
    /// Records screen time usage for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="sessionDurationMinutes">Duration of the session in minutes</param>
    /// <param name="sessionDate">Date of the session</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task RecordScreenTimeAsync(int childUserId, int sessionDurationMinutes, DateTime sessionDate);

    /// <summary>
    /// Gets total screen time for a child on a specific date
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="date">Date to check</param>
    /// <returns>Total screen time in minutes</returns>
    Task<int> GetScreenTimeForDateAsync(int childUserId, DateTime date);

    /// <summary>
    /// Gets screen time usage for a child over a date range
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="startDate">Start date of the range</param>
    /// <param name="endDate">End date of the range</param>
    /// <returns>Dictionary with date as key and screen time minutes as value</returns>
    Task<Dictionary<DateTime, int>> GetScreenTimeRangeAsync(int childUserId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Checks if a child is currently within their allowed hours
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="currentTime">Current time to check against</param>
    /// <returns>True if within allowed hours, false otherwise</returns>
    Task<bool> IsWithinAllowedHoursAsync(int childUserId, DateTime currentTime);

    /// <summary>
    /// Gets remaining screen time for a child today
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Remaining screen time in minutes</returns>
    Task<int> GetRemainingScreenTimeAsync(int childUserId);

    // Validation and Security

    /// <summary>
    /// Validates if a parent can perform an action on a child's account
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action being performed</param>
    /// <returns>True if action is allowed, false otherwise</returns>
    Task<bool> ValidateParentActionAsync(int parentUserId, int childUserId, string actionType);

    /// <summary>
    /// Checks if a child requires parent approval for a specific action
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if approval is required, false otherwise</returns>
    Task<bool> RequiresParentApprovalAsync(int childUserId, string actionType);

    /// <summary>
    /// Gets the parent user ID for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parent user ID or null if no parental control exists</returns>
    Task<int?> GetParentUserIdAsync(int childUserId);
} 