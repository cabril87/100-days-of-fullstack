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
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for parental control operations
/// </summary>
public class ParentalControlService : IParentalControlService
{
    private readonly IParentalControlRepository _parentalControlRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ParentalControlService> _logger;

    public ParentalControlService(
        IParentalControlRepository parentalControlRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<ParentalControlService> logger)
    {
        _parentalControlRepository = parentalControlRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    // Parental Control Management

    /// <summary>
    /// Gets parental control settings for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Parental control settings or null if not found</returns>
    public async Task<ParentalControlDTO?> GetParentalControlByChildIdAsync(int childUserId, int requestingUserId)
    {
        // Validate access permissions
        if (childUserId != requestingUserId)
        {
            bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(requestingUserId, childUserId);
            if (!hasPermission)
            {
                throw new UnauthorizedAccessException("You don't have permission to view this child's parental control settings");
            }
        }

        ParentalControl? parentalControl = await _parentalControlRepository.GetParentalControlByChildIdAsync(childUserId);
        return parentalControl != null ? _mapper.Map<ParentalControlDTO>(parentalControl) : null;
    }

    /// <summary>
    /// Gets all children under parental control for a specific parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control settings for all children</returns>
    public async Task<IEnumerable<ParentalControlDTO>> GetParentalControlsByParentIdAsync(int parentUserId)
    {
        IEnumerable<ParentalControl> parentalControls = await _parentalControlRepository.GetParentalControlsByParentIdAsync(parentUserId);
        return _mapper.Map<IEnumerable<ParentalControlDTO>>(parentalControls);
    }

    /// <summary>
    /// Creates new parental control settings
    /// </summary>
    /// <param name="createDto">Parental control settings to create</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Created parental control settings</returns>
    public async Task<ParentalControlDTO> CreateParentalControlAsync(ParentalControlCreateUpdateDTO createDto, int parentUserId)
    {
        // Validate that the child exists and is not already under parental control
        User? childUser = await _userRepository.GetUserByIdAsync(createDto.ChildUserId);
        if (childUser == null || !childUser.IsActive)
        {
            throw new ArgumentException("Child user not found or inactive");
        }

        // Check if parental controls already exist for this child
        bool hasExistingControls = await _parentalControlRepository.HasParentalControlsAsync(createDto.ChildUserId);
        if (hasExistingControls)
        {
            throw new InvalidOperationException("Parental controls already exist for this child");
        }

        // Validate parent has permission (family relationship)
        bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(parentUserId, createDto.ChildUserId);
        if (!hasPermission)
        {
            throw new UnauthorizedAccessException("You don't have permission to create parental controls for this user");
        }

        // Validate child is actually a child (not adult)
        if (childUser.AgeGroup == FamilyMemberAgeGroup.Adult)
        {
            throw new InvalidOperationException("Cannot create parental controls for adult users");
        }

        // Convert DTO to model
        ParentalControl parentalControl = _mapper.Map<ParentalControl>(createDto);
        parentalControl.ParentUserId = parentUserId;
        parentalControl.ChildUserId = createDto.ChildUserId;

        ParentalControl createdControl = await _parentalControlRepository.CreateParentalControlAsync(parentalControl);
        
        _logger.LogInformation("Parental controls created by user {ParentUserId} for child {ChildUserId}", 
            parentUserId, createDto.ChildUserId);

        return _mapper.Map<ParentalControlDTO>(createdControl);
    }

    /// <summary>
    /// Updates existing parental control settings
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="updateDto">Updated parental control settings</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Updated parental control settings</returns>
    public async Task<ParentalControlDTO> UpdateParentalControlAsync(int childUserId, ParentalControlCreateUpdateDTO updateDto, int parentUserId)
    {
        // Validate parent has permission
        bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(parentUserId, childUserId);
        if (!hasPermission)
        {
            throw new UnauthorizedAccessException("You don't have permission to update parental controls for this child");
        }

        // Get existing parental control
        ParentalControl? existingControl = await _parentalControlRepository.GetParentalControlByChildIdAsync(childUserId);
        if (existingControl == null)
        {
            throw new ArgumentException("Parental controls not found for this child");
        }

        // Update the model using AutoMapper
        _mapper.Map(updateDto, existingControl);
        existingControl.ParentUserId = parentUserId; // Preserve the parent ID
        existingControl.ChildUserId = childUserId; // Preserve the child ID

        await _parentalControlRepository.UpdateParentalControlAsync(existingControl);
        
        _logger.LogInformation("Parental controls updated by user {ParentUserId} for child {ChildUserId}", 
            parentUserId, childUserId);

        return _mapper.Map<ParentalControlDTO>(existingControl);
    }

    /// <summary>
    /// Removes parental control settings for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task RemoveParentalControlAsync(int childUserId, int parentUserId)
    {
        // Validate parent has permission and is direct parent
        bool canDelete = await _parentalControlRepository.ValidateParentActionAsync(parentUserId, childUserId, "DeleteChild");
        if (!canDelete)
        {
            throw new UnauthorizedAccessException("You don't have permission to remove parental controls for this child");
        }

        ParentalControl? existingControl = await _parentalControlRepository.GetParentalControlByChildIdAsync(childUserId);
        if (existingControl == null)
        {
            throw new ArgumentException("Parental controls not found for this child");
        }

        await _parentalControlRepository.DeleteParentalControlAsync(existingControl.Id);
        
        _logger.LogInformation("Parental controls removed by user {ParentUserId} for child {ChildUserId}", 
            parentUserId, childUserId);
    }

    /// <summary>
    /// Gets a summary of all children under parental control for dashboard display
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control summaries</returns>
    public async Task<IEnumerable<ParentalControlSummaryDTO>> GetParentalControlSummariesAsync(int parentUserId)
    {
        IEnumerable<ParentalControl> parentalControls = await _parentalControlRepository.GetParentalControlsByParentIdAsync(parentUserId);
        List<ParentalControlSummaryDTO> summaries = new List<ParentalControlSummaryDTO>();

        foreach (ParentalControl control in parentalControls)
        {
            int pendingRequests = await _parentalControlRepository.GetPendingPermissionRequestCountAsync(parentUserId);
            int todayScreenTime = await _parentalControlRepository.GetScreenTimeForDateAsync(control.ChildUserId, DateTime.Today);
            int remainingScreenTime = await _parentalControlRepository.GetRemainingScreenTimeAsync(control.ChildUserId);
            bool isWithinAllowedHours = await _parentalControlRepository.IsWithinAllowedHoursAsync(control.ChildUserId, DateTime.Now);
            IEnumerable<PermissionRequest> recentRequests = await _parentalControlRepository.GetRecentPermissionRequestsAsync(control.ChildUserId, 5);

            ParentalControlSummaryDTO summary = new ParentalControlSummaryDTO
            {
                Child = _mapper.Map<UserDTO>(control.Child),
                Settings = _mapper.Map<ParentalControlDTO>(control),
                PendingRequestsCount = pendingRequests,
                TodayScreenTimeMinutes = todayScreenTime,
                RemainingScreenTimeMinutes = remainingScreenTime,
                IsWithinAllowedHours = isWithinAllowedHours,
                RecentRequests = _mapper.Map<List<PermissionRequestDTO>>(recentRequests)
            };

            summaries.Add(summary);
        }

        return summaries;
    }

    // Permission Request Management

    /// <summary>
    /// Creates a new permission request from a child to their parent
    /// </summary>
    /// <param name="createDto">Permission request details</param>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Created permission request</returns>
    public async Task<PermissionRequestDTO> CreatePermissionRequestAsync(PermissionRequestCreateDTO createDto, int childUserId)
    {
        // Get the parent user ID for this child
        int? parentUserId = await _parentalControlRepository.GetParentUserIdAsync(childUserId);
        if (parentUserId == null)
        {
            throw new InvalidOperationException("No parental controls found for this user");
        }

        // Validate that approval is actually required for this action
        bool requiresApproval = await _parentalControlRepository.RequiresParentApprovalAsync(childUserId, createDto.RequestType);
        if (!requiresApproval)
        {
            throw new InvalidOperationException($"Parent approval is not required for action: {createDto.RequestType}");
        }

        // Create the permission request using AutoMapper
        PermissionRequest permissionRequest = _mapper.Map<PermissionRequest>(createDto);
        permissionRequest.ChildUserId = childUserId;
        permissionRequest.ParentUserId = parentUserId.Value;
        permissionRequest.ExpiresAt = createDto.ExpiresAt ?? DateTime.UtcNow.AddHours(24); // Default 24-hour expiry

        PermissionRequest createdRequest = await _parentalControlRepository.CreatePermissionRequestAsync(permissionRequest);
        
        _logger.LogInformation("Permission request created by child {ChildUserId} for parent {ParentUserId}: {RequestType}", 
            childUserId, parentUserId.Value, createDto.RequestType);

        return _mapper.Map<PermissionRequestDTO>(createdRequest);
    }

    /// <summary>
    /// Gets all permission requests for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>List of permission requests</returns>
    public async Task<IEnumerable<PermissionRequestDTO>> GetPermissionRequestsByChildIdAsync(int childUserId, int requestingUserId)
    {
        // Validate access permissions
        if (childUserId != requestingUserId)
        {
            bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(requestingUserId, childUserId);
            if (!hasPermission)
            {
                throw new UnauthorizedAccessException("You don't have permission to view this child's permission requests");
            }
        }

        IEnumerable<PermissionRequest> requests = await _parentalControlRepository.GetPermissionRequestsByChildIdAsync(childUserId);
        return _mapper.Map<IEnumerable<PermissionRequestDTO>>(requests);
    }

    /// <summary>
    /// Gets all pending permission requests for a parent to review
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of pending permission requests</returns>
    public async Task<IEnumerable<PermissionRequestDTO>> GetPendingPermissionRequestsAsync(int parentUserId)
    {
        IEnumerable<PermissionRequest> requests = await _parentalControlRepository.GetPendingPermissionRequestsByParentIdAsync(parentUserId);
        return _mapper.Map<IEnumerable<PermissionRequestDTO>>(requests);
    }

    /// <summary>
    /// Responds to a permission request (approve or deny)
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <param name="responseDto">Response details</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Updated permission request</returns>
    public async Task<PermissionRequestDTO> RespondToPermissionRequestAsync(int requestId, PermissionRequestResponseDTO responseDto, int parentUserId)
    {
        PermissionRequest? request = await _parentalControlRepository.GetPermissionRequestByIdAsync(requestId);
        if (request == null)
        {
            throw new ArgumentException("Permission request not found");
        }

        // Validate that the requesting parent is the correct parent
        if (request.ParentUserId != parentUserId)
        {
            throw new UnauthorizedAccessException("You don't have permission to respond to this request");
        }

        // Validate request is still pending
        if (request.Status != PermissionRequestStatus.Pending)
        {
            throw new InvalidOperationException("This request has already been responded to");
        }

        // Check if request has expired
        if (request.ExpiresAt.HasValue && request.ExpiresAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("This request has expired");
        }

        // Update the request
        request.Status = responseDto.IsApproved ? PermissionRequestStatus.Approved : PermissionRequestStatus.Denied;
        request.ResponseMessage = responseDto.ResponseMessage;
        request.RespondedAt = DateTime.UtcNow;

        await _parentalControlRepository.UpdatePermissionRequestAsync(request);
        
        _logger.LogInformation("Permission request {RequestId} {Status} by parent {ParentUserId}", 
            requestId, request.Status, parentUserId);

        return _mapper.Map<PermissionRequestDTO>(request);
    }

    /// <summary>
    /// Processes multiple permission requests in bulk
    /// </summary>
    /// <param name="bulkResponseDto">Bulk response details</param>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of updated permission requests</returns>
    public async Task<IEnumerable<PermissionRequestDTO>> BulkRespondToPermissionRequestsAsync(BulkPermissionRequestResponseDTO bulkResponseDto, int parentUserId)
    {
        List<PermissionRequestDTO> processedRequests = new List<PermissionRequestDTO>();

        foreach (int requestId in bulkResponseDto.RequestIds)
        {
            try
            {
                PermissionRequestResponseDTO response = new PermissionRequestResponseDTO
                {
                    IsApproved = bulkResponseDto.IsApproved,
                    ResponseMessage = bulkResponseDto.ResponseMessage
                };

                PermissionRequestDTO processedRequest = await RespondToPermissionRequestAsync(requestId, response, parentUserId);
                processedRequests.Add(processedRequest);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to process permission request {RequestId} in bulk operation: {Error}", 
                    requestId, ex.Message);
                // Continue processing other requests
            }
        }

        return processedRequests;
    }

    /// <summary>
    /// Deletes a permission request
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task DeletePermissionRequestAsync(int requestId, int requestingUserId)
    {
        PermissionRequest? request = await _parentalControlRepository.GetPermissionRequestByIdAsync(requestId);
        if (request == null)
        {
            throw new ArgumentException("Permission request not found");
        }

        // Only allow deletion by the child who created it or the parent who can respond to it
        if (request.ChildUserId != requestingUserId && request.ParentUserId != requestingUserId)
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this request");
        }

        await _parentalControlRepository.DeletePermissionRequestAsync(requestId);
        
        _logger.LogInformation("Permission request {RequestId} deleted by user {UserId}", 
            requestId, requestingUserId);
    }

    /// <summary>
    /// Gets the count of pending permission requests for a parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Number of pending permission requests</returns>
    public async Task<int> GetPendingPermissionRequestCountAsync(int parentUserId)
    {
        return await _parentalControlRepository.GetPendingPermissionRequestCountAsync(parentUserId);
    }

    // Screen Time and Usage Management

    /// <summary>
    /// Records screen time usage for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="sessionDurationMinutes">Duration of the session in minutes</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task RecordScreenTimeAsync(int childUserId, int sessionDurationMinutes)
    {
        // Validate that the child has parental controls (screen time tracking enabled)
        bool hasControls = await _parentalControlRepository.HasParentalControlsAsync(childUserId);
        if (!hasControls)
        {
            return; // No tracking needed if no parental controls
        }

        await _parentalControlRepository.RecordScreenTimeAsync(childUserId, sessionDurationMinutes, DateTime.UtcNow);
        
        _logger.LogDebug("Screen time recorded for child {ChildUserId}: {Minutes} minutes", 
            childUserId, sessionDurationMinutes);
    }

    /// <summary>
    /// Gets remaining screen time for a child today
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Remaining screen time in minutes</returns>
    public async Task<int> GetRemainingScreenTimeAsync(int childUserId, int requestingUserId)
    {
        // Validate access permissions
        if (childUserId != requestingUserId)
        {
            bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(requestingUserId, childUserId);
            if (!hasPermission)
            {
                throw new UnauthorizedAccessException("You don't have permission to view this child's screen time");
            }
        }

        return await _parentalControlRepository.GetRemainingScreenTimeAsync(childUserId);
    }

    /// <summary>
    /// Checks if a child is currently within their allowed hours
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>True if within allowed hours, false otherwise</returns>
    public async Task<bool> IsWithinAllowedHoursAsync(int childUserId, int requestingUserId)
    {
        // Validate access permissions
        if (childUserId != requestingUserId)
        {
            bool hasPermission = await _parentalControlRepository.HasParentPermissionAsync(requestingUserId, childUserId);
            if (!hasPermission)
            {
                throw new UnauthorizedAccessException("You don't have permission to check this child's allowed hours");
            }
        }

        return await _parentalControlRepository.IsWithinAllowedHoursAsync(childUserId, DateTime.Now);
    }

    // Validation and Security

    /// <summary>
    /// Checks if a child requires parent approval for a specific action
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if approval is required, false otherwise</returns>
    public async Task<bool> RequiresParentApprovalAsync(int childUserId, string actionType)
    {
        return await _parentalControlRepository.RequiresParentApprovalAsync(childUserId, actionType);
    }

    /// <summary>
    /// Validates if a parent can perform an action on a child's account
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action being performed</param>
    /// <returns>True if action is allowed, false otherwise</returns>
    public async Task<bool> CanParentPerformActionAsync(int parentUserId, int childUserId, string actionType)
    {
        return await _parentalControlRepository.ValidateParentActionAsync(parentUserId, childUserId, actionType);
    }

    /// <summary>
    /// Gets the parent user ID for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parent user ID or null if no parental control exists</returns>
    public async Task<int?> GetParentUserIdAsync(int childUserId)
    {
        return await _parentalControlRepository.GetParentUserIdAsync(childUserId);
    }

    // Background Tasks

    /// <summary>
    /// Marks expired permission requests as expired (background task)
    /// </summary>
    /// <returns>Number of requests marked as expired</returns>
    public async Task<int> ProcessExpiredPermissionRequestsAsync()
    {
        int expiredCount = await _parentalControlRepository.MarkExpiredPermissionRequestsAsync();
        
        if (expiredCount > 0)
        {
            _logger.LogInformation("Marked {Count} permission requests as expired", expiredCount);
        }

        return expiredCount;
    }
} 