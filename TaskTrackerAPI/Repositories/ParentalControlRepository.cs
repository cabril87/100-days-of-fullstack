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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for parental control operations
/// </summary>
public class ParentalControlRepository : IParentalControlRepository
{
    private readonly ApplicationDbContext _context;

    public ParentalControlRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Parental Control Management

    /// <summary>
    /// Gets parental control settings by ID
    /// </summary>
    /// <param name="id">Parental control ID</param>
    /// <returns>Parental control settings or null if not found</returns>
    public async Task<ParentalControl?> GetParentalControlByIdAsync(int id)
    {
        return await _context.ParentalControls
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Include(pc => pc.PermissionRequests)
            .FirstOrDefaultAsync(pc => pc.Id == id);
    }

    /// <summary>
    /// Gets parental control settings for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parental control settings or null if not found</returns>
    public async Task<ParentalControl?> GetParentalControlByChildIdAsync(int childUserId)
    {
        return await _context.ParentalControls
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Include(pc => pc.PermissionRequests)
            .FirstOrDefaultAsync(pc => pc.ChildUserId == childUserId);
    }

    /// <summary>
    /// Gets all children under parental control for a specific parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of parental control settings for all children</returns>
    public async Task<IEnumerable<ParentalControl>> GetParentalControlsByParentIdAsync(int parentUserId)
    {
        return await _context.ParentalControls
            .Include(pc => pc.Parent)
            .Include(pc => pc.Child)
            .Include(pc => pc.PermissionRequests)
            .Where(pc => pc.ParentUserId == parentUserId)
            .OrderBy(pc => pc.Child.FirstName)
            .ThenBy(pc => pc.Child.Username)
            .ToListAsync();
    }

    /// <summary>
    /// Creates new parental control settings
    /// </summary>
    /// <param name="parentalControl">Parental control settings to create</param>
    /// <returns>Created parental control settings</returns>
    public async Task<ParentalControl> CreateParentalControlAsync(ParentalControl parentalControl)
    {
        parentalControl.CreatedAt = DateTime.UtcNow;
        parentalControl.UpdatedAt = DateTime.UtcNow;

        await _context.ParentalControls.AddAsync(parentalControl);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        return await GetParentalControlByIdAsync(parentalControl.Id) ?? parentalControl;
    }

    /// <summary>
    /// Updates existing parental control settings
    /// </summary>
    /// <param name="parentalControl">Updated parental control settings</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task UpdateParentalControlAsync(ParentalControl parentalControl)
    {
        parentalControl.UpdatedAt = DateTime.UtcNow;
        _context.ParentalControls.Update(parentalControl);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletes parental control settings
    /// </summary>
    /// <param name="id">Parental control ID to delete</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task DeleteParentalControlAsync(int id)
    {
        ParentalControl? parentalControl = await _context.ParentalControls.FindAsync(id);
        if (parentalControl != null)
        {
            _context.ParentalControls.Remove(parentalControl);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Checks if a user has parental controls applied
    /// </summary>
    /// <param name="childUserId">Child user ID to check</param>
    /// <returns>True if parental controls exist, false otherwise</returns>
    public async Task<bool> HasParentalControlsAsync(int childUserId)
    {
        return await _context.ParentalControls
            .AnyAsync(pc => pc.ChildUserId == childUserId);
    }

    /// <summary>
    /// Checks if a parent has permission to manage a child's controls
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>True if parent has permission, false otherwise</returns>
    public async Task<bool> HasParentPermissionAsync(int parentUserId, int childUserId)
    {
        // Check if parent has direct parental control over child
        bool hasDirectControl = await _context.ParentalControls
            .AnyAsync(pc => pc.ParentUserId == parentUserId && pc.ChildUserId == childUserId);

        if (hasDirectControl)
            return true;

        // Check if they are in the same family and parent has appropriate role
        return await _context.FamilyMembers
            .Include(fm => fm.Role)
            .AnyAsync(fm => fm.UserId == parentUserId 
                && _context.FamilyMembers.Any(cfm => cfm.UserId == childUserId 
                    && cfm.FamilyId == fm.FamilyId)
                && (fm.Role.Name == "Parent" || fm.Role.Name == "Guardian"));
    }

    // Permission Request Management

    /// <summary>
    /// Gets a permission request by ID
    /// </summary>
    /// <param name="id">Permission request ID</param>
    /// <returns>Permission request or null if not found</returns>
    public async Task<PermissionRequest?> GetPermissionRequestByIdAsync(int id)
    {
        return await _context.PermissionRequests
            .Include(pr => pr.Child)
            .Include(pr => pr.Parent)
            .FirstOrDefaultAsync(pr => pr.Id == id);
    }

    /// <summary>
    /// Gets all permission requests for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>List of permission requests</returns>
    public async Task<IEnumerable<PermissionRequest>> GetPermissionRequestsByChildIdAsync(int childUserId)
    {
        return await _context.PermissionRequests
            .Include(pr => pr.Child)
            .Include(pr => pr.Parent)
            .Where(pr => pr.ChildUserId == childUserId)
            .OrderByDescending(pr => pr.RequestedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all permission requests that a parent needs to review
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>List of permission requests awaiting parent review</returns>
    public async Task<IEnumerable<PermissionRequest>> GetPendingPermissionRequestsByParentIdAsync(int parentUserId)
    {
        return await _context.PermissionRequests
            .Include(pr => pr.Child)
            .Include(pr => pr.Parent)
            .Where(pr => pr.ParentUserId == parentUserId 
                && pr.Status == PermissionRequestStatus.Pending
                && (pr.ExpiresAt == null || pr.ExpiresAt > DateTime.UtcNow))
            .OrderBy(pr => pr.RequestedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Gets permission requests by status
    /// </summary>
    /// <param name="status">Permission request status</param>
    /// <returns>List of permission requests with the specified status</returns>
    public async Task<IEnumerable<PermissionRequest>> GetPermissionRequestsByStatusAsync(PermissionRequestStatus status)
    {
        return await _context.PermissionRequests
            .Include(pr => pr.Child)
            .Include(pr => pr.Parent)
            .Where(pr => pr.Status == status)
            .OrderByDescending(pr => pr.RequestedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Creates a new permission request
    /// </summary>
    /// <param name="permissionRequest">Permission request to create</param>
    /// <returns>Created permission request</returns>
    public async Task<PermissionRequest> CreatePermissionRequestAsync(PermissionRequest permissionRequest)
    {
        permissionRequest.RequestedAt = DateTime.UtcNow;
        permissionRequest.Status = PermissionRequestStatus.Pending;

        await _context.PermissionRequests.AddAsync(permissionRequest);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        return await GetPermissionRequestByIdAsync(permissionRequest.Id) ?? permissionRequest;
    }

    /// <summary>
    /// Updates a permission request (typically for approval/denial)
    /// </summary>
    /// <param name="permissionRequest">Updated permission request</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task UpdatePermissionRequestAsync(PermissionRequest permissionRequest)
    {
        if (permissionRequest.Status != PermissionRequestStatus.Pending && permissionRequest.RespondedAt == null)
        {
            permissionRequest.RespondedAt = DateTime.UtcNow;
        }

        _context.PermissionRequests.Update(permissionRequest);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletes a permission request
    /// </summary>
    /// <param name="id">Permission request ID to delete</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task DeletePermissionRequestAsync(int id)
    {
        PermissionRequest? permissionRequest = await _context.PermissionRequests.FindAsync(id);
        if (permissionRequest != null)
        {
            _context.PermissionRequests.Remove(permissionRequest);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Gets the count of pending permission requests for a parent
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <returns>Number of pending permission requests</returns>
    public async Task<int> GetPendingPermissionRequestCountAsync(int parentUserId)
    {
        return await _context.PermissionRequests
            .CountAsync(pr => pr.ParentUserId == parentUserId 
                && pr.Status == PermissionRequestStatus.Pending
                && (pr.ExpiresAt == null || pr.ExpiresAt > DateTime.UtcNow));
    }

    /// <summary>
    /// Gets the most recent permission requests for a child (for dashboard display)
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="count">Number of recent requests to retrieve</param>
    /// <returns>List of recent permission requests</returns>
    public async Task<IEnumerable<PermissionRequest>> GetRecentPermissionRequestsAsync(int childUserId, int count = 5)
    {
        return await _context.PermissionRequests
            .Include(pr => pr.Child)
            .Include(pr => pr.Parent)
            .Where(pr => pr.ChildUserId == childUserId)
            .OrderByDescending(pr => pr.RequestedAt)
            .Take(count)
            .ToListAsync();
    }

    /// <summary>
    /// Marks expired permission requests as expired
    /// </summary>
    /// <returns>Number of requests marked as expired</returns>
    public async Task<int> MarkExpiredPermissionRequestsAsync()
    {
        List<PermissionRequest> expiredRequests = await _context.PermissionRequests
            .Where(pr => pr.Status == PermissionRequestStatus.Pending 
                && pr.ExpiresAt != null 
                && pr.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync();

        foreach (PermissionRequest request in expiredRequests)
        {
            request.Status = PermissionRequestStatus.Expired;
            request.RespondedAt = DateTime.UtcNow;
            request.ResponseMessage = "Request expired without response";
        }

        if (expiredRequests.Count > 0)
        {
            await _context.SaveChangesAsync();
        }

        return expiredRequests.Count;
    }

    // Screen Time and Usage Tracking

    /// <summary>
    /// Records screen time usage for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="sessionDurationMinutes">Duration of the session in minutes</param>
    /// <param name="sessionDate">Date of the session</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public async Task RecordScreenTimeAsync(int childUserId, int sessionDurationMinutes, DateTime sessionDate)
    {
        // Create a special screen time tracking session
        UserSession screenTimeSession = new UserSession
        {
            UserId = childUserId,
            SessionToken = $"screen-time-{Guid.NewGuid():N}",
            IpAddress = "127.0.0.1",
            UserAgent = $"TaskTracker-ScreenTime-{sessionDurationMinutes}min",
            CreatedAt = sessionDate,
            LastActivity = sessionDate.AddMinutes(sessionDurationMinutes),
            ExpiresAt = sessionDate.AddMinutes(sessionDurationMinutes),
            IsActive = false,
            DeviceType = "Application",
            SecurityNotes = $"Screen time session: {sessionDurationMinutes} minutes"
        };

        await _context.UserSessions.AddAsync(screenTimeSession);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Gets total screen time for a child on a specific date
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="date">Date to check</param>
    /// <returns>Total screen time in minutes</returns>
    public async Task<int> GetScreenTimeForDateAsync(int childUserId, DateTime date)
    {
        DateTime startOfDay = date.Date;
        DateTime endOfDay = startOfDay.AddDays(1).AddTicks(-1);

        List<UserSession> screenTimeSessions = await _context.UserSessions
            .Where(us => us.UserId == childUserId 
                && us.UserAgent != null && us.UserAgent.StartsWith("TaskTracker-ScreenTime")
                && us.CreatedAt >= startOfDay 
                && us.CreatedAt <= endOfDay)
            .ToListAsync();

        int totalMinutes = 0;
        foreach (UserSession session in screenTimeSessions)
        {
            if (session.UserAgent != null && session.ExpiresAt.HasValue)
            {
                // Extract duration from UserAgent or calculate from timestamps
                TimeSpan sessionDuration = session.ExpiresAt.Value - session.CreatedAt;
                totalMinutes += (int)sessionDuration.TotalMinutes;
            }
        }

        return totalMinutes;
    }

    /// <summary>
    /// Gets screen time usage for a child over a date range
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="startDate">Start date of the range</param>
    /// <param name="endDate">End date of the range</param>
    /// <returns>Dictionary with date as key and screen time minutes as value</returns>
    public async Task<Dictionary<DateTime, int>> GetScreenTimeRangeAsync(int childUserId, DateTime startDate, DateTime endDate)
    {
        List<UserSession> screenTimeSessions = await _context.UserSessions
            .Where(us => us.UserId == childUserId 
                && us.UserAgent != null && us.UserAgent.StartsWith("TaskTracker-ScreenTime")
                && us.CreatedAt >= startDate.Date 
                && us.CreatedAt <= endDate.Date.AddDays(1).AddTicks(-1))
            .ToListAsync();

        Dictionary<DateTime, int> result = new Dictionary<DateTime, int>();

        foreach (UserSession session in screenTimeSessions)
        {
            DateTime sessionDate = session.CreatedAt.Date;
            
            if (!result.ContainsKey(sessionDate))
            {
                result[sessionDate] = 0;
            }

            if (session.ExpiresAt.HasValue)
            {
                TimeSpan sessionDuration = session.ExpiresAt.Value - session.CreatedAt;
                result[sessionDate] += (int)sessionDuration.TotalMinutes;
            }
        }

        return result;
    }

    /// <summary>
    /// Checks if a child is currently within their allowed hours
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="currentTime">Current time to check against</param>
    /// <returns>True if within allowed hours, false otherwise</returns>
    public async Task<bool> IsWithinAllowedHoursAsync(int childUserId, DateTime currentTime)
    {
        ParentalControl? controls = await GetParentalControlByChildIdAsync(childUserId);
        if (controls == null || !controls.ScreenTimeEnabled)
            return true; // No restrictions

        DayOfWeek currentDayOfWeek = currentTime.DayOfWeek;
        TimeSpan currentTimeOfDay = currentTime.TimeOfDay;

        // Check if current time falls within any allowed time range for today
        return controls.AllowedHours.Any(timeRange => 
            timeRange.DayOfWeek == currentDayOfWeek 
            && timeRange.IsActive
            && currentTimeOfDay >= timeRange.StartTime 
            && currentTimeOfDay <= timeRange.EndTime);
    }

    /// <summary>
    /// Gets remaining screen time for a child today
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Remaining screen time in minutes</returns>
    public async Task<int> GetRemainingScreenTimeAsync(int childUserId)
    {
        ParentalControl? controls = await GetParentalControlByChildIdAsync(childUserId);
        if (controls == null || !controls.ScreenTimeEnabled)
            return int.MaxValue; // No limits

        int usedToday = await GetScreenTimeForDateAsync(childUserId, DateTime.Today);
        int dailyLimitMinutes = (int)controls.DailyTimeLimit.TotalMinutes;
        
        return Math.Max(0, dailyLimitMinutes - usedToday);
    }

    // Validation and Security

    /// <summary>
    /// Validates if a parent can perform an action on a child's account
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action being performed</param>
    /// <returns>True if action is allowed, false otherwise</returns>
    public async Task<bool> ValidateParentActionAsync(int parentUserId, int childUserId, string actionType)
    {
        // First check if parent has permission over child
        if (!await HasParentPermissionAsync(parentUserId, childUserId))
            return false;

        // Additional validation based on action type
        return actionType switch
        {
            "ManageControls" => true, // All parents can manage basic controls
            "DeleteChild" => await IsDirectParentAsync(parentUserId, childUserId), // Only direct parents
            "ViewSensitiveData" => await IsDirectParentAsync(parentUserId, childUserId), // Only direct parents
            _ => true // Allow other actions by default for authorized parents
        };
    }

    /// <summary>
    /// Checks if a child requires parent approval for a specific action
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if approval is required, false otherwise</returns>
    public async Task<bool> RequiresParentApprovalAsync(int childUserId, string actionType)
    {
        ParentalControl? controls = await GetParentalControlByChildIdAsync(childUserId);
        if (controls == null)
            return false; // No parental controls

        return actionType switch
        {
            PermissionRequestTypes.SpendPoints => controls.PointSpendingApprovalRequired,
            PermissionRequestTypes.CreateTask => controls.TaskApprovalRequired,
            PermissionRequestTypes.ModifyTask => controls.TaskApprovalRequired,
            PermissionRequestTypes.InviteFamilyMember => !controls.CanInviteOthers,
            PermissionRequestTypes.ChangeProfile => true, // Always require approval for profile changes
            PermissionRequestTypes.ChatWithOthers => controls.ChatMonitoringEnabled,
            _ => false // Default: no approval required
        };
    }

    /// <summary>
    /// Gets the parent user ID for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parent user ID or null if no parental control exists</returns>
    public async Task<int?> GetParentUserIdAsync(int childUserId)
    {
        ParentalControl? controls = await _context.ParentalControls
            .AsNoTracking()
            .FirstOrDefaultAsync(pc => pc.ChildUserId == childUserId);

        return controls?.ParentUserId;
    }

    // Private helper methods

    /// <summary>
    /// Checks if a parent is the direct parent (not just family member) of a child
    /// </summary>
    /// <param name="parentUserId">Parent user ID</param>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>True if direct parent, false otherwise</returns>
    private async Task<bool> IsDirectParentAsync(int parentUserId, int childUserId)
    {
        return await _context.ParentalControls
            .AnyAsync(pc => pc.ParentUserId == parentUserId && pc.ChildUserId == childUserId);
    }
} 