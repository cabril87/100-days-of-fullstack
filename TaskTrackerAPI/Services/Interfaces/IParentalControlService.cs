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
using TaskTrackerAPI.DTOs.Auth;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for parental control operations
/// </summary>
public interface IParentalControlService
{
    // Parental Control Management

    /// <summary>
    /// Gets parental control settings for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Parental control settings or null if not found</returns>
    Task<ParentalControlDTO?> GetParentalControlByChildIdAsync(int childUserId, int requestingUserId);

    /// <summary>
    /// Gets all children under parental control for a specific parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control settings for all children</returns>
    Task<IEnumerable<ParentalControlDTO>> GetParentalControlsByParentIdAsync(int parentUserId);

    /// <summary>
    /// Creates new parental control settings
    /// </summary>
    /// <param name="createDto">Parental control settings to create</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Created parental control settings</returns>
    Task<ParentalControlDTO> CreateParentalControlAsync(ParentalControlCreateUpdateDTO createDto, int parentUserId);

    /// <summary>
    /// Updates existing parental control settings
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="updateDto">Updated parental control settings</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Updated parental control settings</returns>
    Task<ParentalControlDTO> UpdateParentalControlAsync(int childUserId, ParentalControlCreateUpdateDTO updateDto, int parentUserId);

    /// <summary>
    /// Removes parental control settings for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task RemoveParentalControlAsync(int childUserId, int parentUserId);

    /// <summary>
    /// Gets a summary of all children under parental control for dashboard display
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control summaries</returns>
    Task<IEnumerable<ParentalControlSummaryDTO>> GetParentalControlSummariesAsync(int parentUserId);

    // Permission Request Management

    /// <summary>
    /// Creates a new permission request from a child to their parent
    /// </summary>
    /// <param name="createDto">Permission request details</param>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Created permission request</returns>
    Task<PermissionRequestDTO> CreatePermissionRequestAsync(PermissionRequestCreateDTO createDto, int childUserId);

    /// <summary>
    /// Gets all permission requests for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>List of permission requests</returns>
    Task<IEnumerable<PermissionRequestDTO>> GetPermissionRequestsByChildIdAsync(int childUserId, int requestingUserId);

    /// <summary>
    /// Gets all pending permission requests for a parent to review
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of pending permission requests</returns>
    Task<IEnumerable<PermissionRequestDTO>> GetPendingPermissionRequestsAsync(int parentUserId);

    /// <summary>
    /// Responds to a permission request (approve or deny)
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <param name="responseDto">Response details</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Updated permission request</returns>
    Task<PermissionRequestDTO> RespondToPermissionRequestAsync(int requestId, PermissionRequestResponseDTO responseDto, int parentUserId);

    /// <summary>
    /// Processes multiple permission requests in bulk
    /// </summary>
    /// <param name="bulkResponseDto">Bulk response details</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of updated permission requests</returns>
    Task<IEnumerable<PermissionRequestDTO>> BulkRespondToPermissionRequestsAsync(BulkPermissionRequestResponseDTO bulkResponseDto, int parentUserId);

    /// <summary>
    /// Deletes a permission request
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task DeletePermissionRequestAsync(int requestId, int requestingUserId);

    /// <summary>
    /// Gets the count of pending permission requests for a parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Number of pending permission requests</returns>
    Task<int> GetPendingPermissionRequestCountAsync(int parentUserId);

    // Screen Time and Usage Management

    /// <summary>
    /// Records screen time usage for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="sessionDurationMinutes">Duration of the session in minutes</param>
    /// <returns>Task representing the asynchronous operation</returns>
    Task RecordScreenTimeAsync(int childUserId, int sessionDurationMinutes);

    /// <summary>
    /// Gets remaining screen time for a child today
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Remaining screen time in minutes</returns>
    Task<int> GetRemainingScreenTimeAsync(int childUserId, int requestingUserId);

    /// <summary>
    /// Checks if a child is currently within their allowed hours
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>True if within allowed hours, false otherwise</returns>
    Task<bool> IsWithinAllowedHoursAsync(int childUserId, int requestingUserId);

    // Validation and Security

    /// <summary>
    /// Checks if a child requires parent approval for a specific action
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if approval is required, false otherwise</returns>
    Task<bool> RequiresParentApprovalAsync(int childUserId, string actionType);

    /// <summary>
    /// Validates if a parent can perform an action on a child's account
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action being performed</param>
    /// <returns>True if action is allowed, false otherwise</returns>
    Task<bool> CanParentPerformActionAsync(int parentUserId, int childUserId, string actionType);

    /// <summary>
    /// Gets the parent user ID for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parent user ID or null if no parental control exists</returns>
    Task<int?> GetParentUserIdAsync(int childUserId);

    // Background Tasks

    /// <summary>
    /// Marks expired permission requests as expired (background task)
    /// </summary>
    /// <returns>Number of requests marked as expired</returns>
    Task<int> ProcessExpiredPermissionRequestsAsync();
} 