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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// SignalR hub for real-time calendar updates, availability changes, and focus mode integration
    /// </summary>
    [Authorize]
    public class CalendarHub : Hub
    {
        private readonly ILogger<CalendarHub> _logger;
        private readonly IFamilyService _familyService;
        private readonly IUserCalendarService _userCalendarService;

        public CalendarHub(
            ILogger<CalendarHub> logger,
            IFamilyService familyService,
            IUserCalendarService userCalendarService)
        {
            _logger = logger;
            _familyService = familyService;
            _userCalendarService = userCalendarService;
        }

        /// <summary>
        /// Override of OnConnectedAsync to manage group membership
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            try
            {
                if (Context.User == null)
                {
                    _logger.LogWarning("User context is null in CalendarHub OnConnectedAsync");
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                string connectionId = Context.ConnectionId;

                _logger.LogInformation("User {UserId} connected to CalendarHub with connection {ConnectionId}", userId, connectionId);

                // Join user to their personal group
                await Groups.AddToGroupAsync(connectionId, $"User_{userId}");

                // Join user to all their family groups
                IEnumerable<UserFamilyCalendarSummaryDTO> userFamilies = await _userCalendarService.GetUserFamiliesCalendarSummaryAsync(userId);
                
                foreach (UserFamilyCalendarSummaryDTO family in userFamilies)
                {
                    string familyGroup = $"Family_{family.FamilyId}";
                    await Groups.AddToGroupAsync(connectionId, familyGroup);
                    _logger.LogDebug("Added user {UserId} to family group {FamilyGroup}", userId, familyGroup);
                }

                // Notify connected users
                await Clients.Caller.SendAsync("Connected", new
                {
                    UserId = userId,
                    ConnectedAt = DateTime.UtcNow,
                    Message = "Connected to calendar updates"
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CalendarHub OnConnectedAsync");
            }

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Override of OnDisconnectedAsync to clean up group membership
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                if (Context.User == null)
                {
                    _logger.LogWarning("User context is null in CalendarHub OnDisconnectedAsync");
                    await base.OnDisconnectedAsync(exception);
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                string connectionId = Context.ConnectionId;

                _logger.LogInformation("User {UserId} disconnected from CalendarHub with connection {ConnectionId}", userId, connectionId);

                if (exception != null)
                {
                    _logger.LogWarning(exception, "User {UserId} disconnected due to exception", userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CalendarHub OnDisconnectedAsync");
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Join a family calendar group to receive real-time updates for family events
        /// </summary>
        /// <param name="familyId">The family ID to join</param>
        public async Task JoinFamilyCalendar(int familyId)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                string connectionId = Context.ConnectionId;

                // Verify user is member of this family
                IEnumerable<UserFamilyCalendarSummaryDTO> userFamilies = await _userCalendarService.GetUserFamiliesCalendarSummaryAsync(userId);
                
                if (userFamilies.Any(f => f.FamilyId == familyId))
                {
                    string familyGroup = $"Family_{familyId}";
                    await Groups.AddToGroupAsync(connectionId, familyGroup);
                    
                    _logger.LogInformation("User {UserId} joined family calendar group {FamilyGroup}", userId, familyGroup);
                    
                    await Clients.Caller.SendAsync("JoinedFamilyCalendar", new
                    {
                        FamilyId = familyId,
                        Message = "Joined family calendar updates"
                    });
                }
                else
                {
                    _logger.LogWarning("User {UserId} attempted to join family calendar {FamilyId} without permission", userId, familyId);
                    
                    await Clients.Caller.SendAsync("Error", new
                    {
                        Message = "You don't have permission to join this family calendar"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining family calendar {FamilyId}", familyId);
                
                await Clients.Caller.SendAsync("Error", new
                {
                    Message = "Failed to join family calendar"
                });
            }
        }

        /// <summary>
        /// Leave a family calendar group
        /// </summary>
        /// <param name="familyId">The family ID to leave</param>
        public async Task LeaveFamilyCalendar(int familyId)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                string connectionId = Context.ConnectionId;
                string familyGroup = $"Family_{familyId}";

                await Groups.RemoveFromGroupAsync(connectionId, familyGroup);
                
                _logger.LogInformation("User {UserId} left family calendar group {FamilyGroup}", userId, familyGroup);
                
                await Clients.Caller.SendAsync("LeftFamilyCalendar", new
                {
                    FamilyId = familyId,
                    Message = "Left family calendar updates"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving family calendar group {FamilyId}", familyId);
                throw;
            }
        }

        /// <summary>
        /// Subscribe to availability updates for specific family members
        /// </summary>
        /// <param name="familyId">The family ID</param>
        /// <param name="memberIds">Array of family member IDs to subscribe to</param>
        public async Task SubscribeToAvailabilityUpdates(int familyId, int[] memberIds)
        {
            try
            {
                foreach (int memberId in memberIds)
                {
                    string availabilityGroup = $"member-availability-{memberId}";
                    await Groups.AddToGroupAsync(Context.ConnectionId, availabilityGroup);
                }
                
                if (Context.User != null)
                {
                    int userId = Context.User.GetUserIdAsInt();
                    _logger.LogInformation("User {UserId} subscribed to availability updates for {MemberCount} members in family {FamilyId}", 
                        userId, memberIds.Length, familyId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error subscribing to availability updates for family {FamilyId}", familyId);
                throw;
            }
        }

        /// <summary>
        /// Start focus mode session and block availability
        /// </summary>
        /// <param name="memberId">The family member ID entering focus mode</param>
        /// <param name="durationMinutes">Focus session duration in minutes</param>
        /// <param name="taskTitle">The task being focused on</param>
        public async Task StartFocusSession(int memberId, int durationMinutes, string taskTitle)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                
                // Notify availability group about focus session
                string availabilityGroup = $"member-availability-{memberId}";
                var focusSession = new
                {
                    MemberId = memberId,
                    UserId = userId,
                    DurationMinutes = durationMinutes,
                    TaskTitle = taskTitle,
                    StartTime = DateTime.UtcNow,
                    EndTime = DateTime.UtcNow.AddMinutes(durationMinutes),
                    Status = "InProgress"
                };
                
                await Clients.Group(availabilityGroup).SendAsync("FocusSessionStarted", focusSession);
                _logger.LogInformation("User {UserId} started focus session for member {MemberId}, duration: {Duration} minutes", 
                    userId, memberId, durationMinutes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting focus session for member {MemberId}", memberId);
                throw;
            }
        }

        /// <summary>
        /// End focus mode session and restore availability
        /// </summary>
        /// <param name="memberId">The family member ID ending focus mode</param>
        /// <param name="sessionQuality">Quality rating of the session (0-10)</param>
        public async Task EndFocusSession(int memberId, int? sessionQuality = null)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                
                // Notify availability group about focus session end
                string availabilityGroup = $"member-availability-{memberId}";
                var focusSessionEnd = new
                {
                    MemberId = memberId,
                    UserId = userId,
                    EndTime = DateTime.UtcNow,
                    SessionQuality = sessionQuality,
                    Status = "Completed"
                };
                
                await Clients.Group(availabilityGroup).SendAsync("FocusSessionEnded", focusSessionEnd);
                _logger.LogInformation("User {UserId} ended focus session for member {MemberId}, quality: {Quality}", 
                    userId, memberId, sessionQuality);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending focus session for member {MemberId}", memberId);
                throw;
            }
        }

        /// <summary>
        /// Request optimal focus time suggestions for a user
        /// </summary>
        /// <param name="memberId">The family member ID</param>
        /// <param name="desiredDuration">Desired focus duration in minutes</param>
        public async Task RequestOptimalFocusTime(int memberId, int desiredDuration)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                
                // This would trigger the smart scheduling service to find optimal focus times
                // For now, send a placeholder response
                var suggestions = new
                {
                    MemberId = memberId,
                    RequestedDuration = desiredDuration,
                    SuggestedTimes = new[]
                    {
                        new { StartTime = DateTime.UtcNow.AddMinutes(15), Confidence = 85, Reasoning = "Low family activity period" },
                        new { StartTime = DateTime.UtcNow.AddHours(2), Confidence = 92, Reasoning = "Optimal focus window based on patterns" },
                        new { StartTime = DateTime.UtcNow.AddHours(4), Confidence = 78, Reasoning = "Alternative quiet time" }
                    }
                };
                
                await Clients.Caller.SendAsync("OptimalFocusTimeSuggestions", suggestions);
                _logger.LogInformation("User {UserId} requested optimal focus time for member {MemberId}, duration: {Duration} minutes", 
                    userId, memberId, desiredDuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting optimal focus time for member {MemberId}", memberId);
                throw;
            }
        }

        /// <summary>
        /// Coordinate family quiet time for focus sessions
        /// </summary>
        /// <param name="familyId">The family ID</param>
        /// <param name="startTime">Start time for quiet period</param>
        /// <param name="endTime">End time for quiet period</param>
        /// <param name="reason">Reason for quiet time (e.g., "Focus session for John")</param>
        public async Task CoordinateFamilyQuietTime(int familyId, DateTime startTime, DateTime endTime, string reason)
        {
            try
            {
                if (Context.User == null)
                {
                    await Clients.Caller.SendAsync("Error", new { Message = "User not authenticated" });
                    return;
                }

                int userId = Context.User.GetUserIdAsInt();
                
                string familyGroup = $"family-calendar-{familyId}";
                var quietTime = new
                {
                    FamilyId = familyId,
                    InitiatedBy = userId,
                    StartTime = startTime,
                    EndTime = endTime,
                    Reason = reason,
                    DurationMinutes = (int)(endTime - startTime).TotalMinutes
                };
                
                await Clients.Group(familyGroup).SendAsync("FamilyQuietTimeRequested", quietTime);
                _logger.LogInformation("User {UserId} requested family quiet time for family {FamilyId}, {Start} to {End}", 
                    userId, familyId, startTime, endTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error coordinating family quiet time for family {FamilyId}", familyId);
                throw;
            }
        }
    }
} 