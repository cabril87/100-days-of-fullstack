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
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class UserCalendarService : IUserCalendarService
{
    private readonly IUserCalendarRepository _userCalendarRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserCalendarService> _logger;

    // Family colors for visual distinction
    private readonly string[] FamilyColors = {
        "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", 
        "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6366F1"
    };

    public UserCalendarService(
        IUserCalendarRepository userCalendarRepository,
        IMapper mapper,
        ILogger<UserCalendarService> logger)
    {
        _userCalendarRepository = userCalendarRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserGlobalCalendarDTO> GetUserGlobalCalendarAsync(int userId)
    {
        try
        {
            // Get user's aggregated calendar data
            var allEvents = await _userCalendarRepository.GetAllUserEventsAsync(userId);
            var families = await _userCalendarRepository.GetUserFamiliesAsync(userId);
            var conflicts = await _userCalendarRepository.GetUserConflictingEventsAsync(userId, 
                DateTime.Today, DateTime.Today.AddDays(30));

            // Map events with family information
            var eventsWithFamily = allEvents.Select(e => 
            {
                var eventDto = _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e);
                eventDto.FamilyColor = GetFamilyColor(e.FamilyId);
                return eventDto;
            }).ToList();

            // Get statistics
            var statistics = await GetUserCalendarStatisticsAsync(userId);

            // Create global calendar DTO
            var globalCalendar = new UserGlobalCalendarDTO
            {
                UserId = userId,
                UserName = families.FirstOrDefault()?.Members?.FirstOrDefault(m => m.UserId == userId)?.User?.Username ?? "",
                Families = (await GetUserFamiliesCalendarSummaryAsync(userId)).ToList(),
                AllEvents = eventsWithFamily,
                Statistics = statistics,
                GeneratedAt = DateTime.UtcNow
            };

            return globalCalendar;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user global calendar for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsAsync(int userId)
    {
        try
        {
            var events = await _userCalendarRepository.GetAllUserEventsAsync(userId);
            
            return events.Select(e => 
            {
                var eventDto = _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e);
                eventDto.FamilyColor = GetFamilyColor(e.FamilyId);
                return eventDto;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all user events for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsInRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        try
        {
            var events = await _userCalendarRepository.GetUserEventsInRangeAsync(userId, startDate, endDate);
            
            return events.Select(e => 
            {
                var eventDto = _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e);
                eventDto.FamilyColor = GetFamilyColor(e.FamilyId);
                return eventDto;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user events in range for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsTodayAsync(int userId)
    {
        try
        {
            var events = await _userCalendarRepository.GetUserEventsTodayAsync(userId);
            
            return events.Select(e => 
            {
                var eventDto = _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e);
                eventDto.FamilyColor = GetFamilyColor(e.FamilyId);
                return eventDto;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user events today for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserUpcomingEventsAsync(int userId, int days = 7)
    {
        try
        {
            var events = await _userCalendarRepository.GetUserUpcomingEventsAsync(userId, days);
            
            return events.Select(e => 
            {
                var eventDto = _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e);
                eventDto.FamilyColor = GetFamilyColor(e.FamilyId);
                return eventDto;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user upcoming events for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<UserFamilyCalendarSummaryDTO>> GetUserFamiliesCalendarSummaryAsync(int userId)
    {
        try
        {
            var families = await _userCalendarRepository.GetUserFamiliesAsync(userId);
            var familyEventCounts = await _userCalendarRepository.GetFamilyEventCountsAsync(userId);
            var familyUpcomingCounts = await _userCalendarRepository.GetFamilyUpcomingEventCountsAsync(userId);
            var familyTodayCounts = await _userCalendarRepository.GetFamilyTodayEventCountsAsync(userId);
            var userCreatedCounts = await _userCalendarRepository.GetUserCreatedEventCountsAsync(userId);
            var userAttendingCounts = await _userCalendarRepository.GetUserAttendingEventCountsAsync(userId);
            var nextEventDates = await _userCalendarRepository.GetFamilyNextEventDatesAsync(userId);
            var lastActivityDates = await _userCalendarRepository.GetFamilyLastActivityDatesAsync(userId);

            var summaries = new List<UserFamilyCalendarSummaryDTO>();

            foreach (var family in families)
            {
                var userMember = family.Members?.FirstOrDefault(m => m.UserId == userId);
                
                var summary = _mapper.Map<UserFamilyCalendarSummaryDTO>(family);
                summary.FamilyColor = GetFamilyColor(family.Id);
                summary.TotalEvents = familyEventCounts.GetValueOrDefault(family.Id, 0);
                summary.UpcomingEvents = familyUpcomingCounts.GetValueOrDefault(family.Id, 0);
                summary.TodayEvents = familyTodayCounts.GetValueOrDefault(family.Id, 0);
                summary.UserCreatedEvents = userCreatedCounts.GetValueOrDefault(family.Id, 0);
                summary.UserAttendingEvents = userAttendingCounts.GetValueOrDefault(family.Id, 0);
                summary.NextEventDate = nextEventDates.GetValueOrDefault(family.Id);
                summary.LastActivity = lastActivityDates.GetValueOrDefault(family.Id, DateTime.MinValue);
                summary.HasPermissionToCreateEvents = await _userCalendarRepository.CanUserCreateEventsInFamilyAsync(userId, family.Id);
                summary.HasPermissionToManageEvents = await _userCalendarRepository.CanUserManageEventsInFamilyAsync(userId, family.Id);
                summary.UserRole = userMember?.Role?.Name ?? "Member";

                summaries.Add(summary);
            }

            return summaries;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user families calendar summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserAvailabilityDTO> GetUserAvailabilityAsync(int userId, DateTime date)
    {
        try
        {
            var eventsOnDate = await _userCalendarRepository.GetUserEventsOnDateAsync(userId, date);
            var conflictingEvents = await _userCalendarRepository.GetUserConflictingEventsAsync(userId, 
                date.Date, date.Date.AddDays(1).AddTicks(-1));

            // Calculate busy periods
            var busyPeriods = eventsOnDate.Select(e => new TimeSlotDTO
            {
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                Description = e.Title,
                Type = "Busy"
            }).ToList();

            // Calculate free periods (simplified - between 9 AM and 6 PM)
            var dayStart = date.Date.AddHours(9);
            var dayEnd = date.Date.AddHours(18);
            var freePeriods = CalculateFreePeriods(dayStart, dayEnd, busyPeriods);

            return new UserAvailabilityDTO
            {
                UserId = userId,
                Date = date,
                IsAvailable = !eventsOnDate.Any(),
                ConflictingEvents = conflictingEvents.Select(e => _mapper.Map<FamilyCalendarEventWithFamilyDTO>(e)).ToList(),
                BusySlots = busyPeriods,
                AvailableSlots = freePeriods,
                TimeZone = "UTC"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user availability for user {UserId} on {Date}", userId, date);
            throw;
        }
    }

    public async Task<IEnumerable<CalendarConflictDTO>> GetUserCalendarConflictsAsync(int userId)
    {
        try
        {
            var startDate = DateTime.Today;
            var endDate = startDate.AddDays(30);
            var conflictingEvents = await _userCalendarRepository.GetUserConflictingEventsAsync(userId, startDate, endDate);

            var conflicts = new List<CalendarConflictDTO>();

            // Group overlapping events into conflicts
            var eventsList = conflictingEvents.ToList();
            for (int i = 0; i < eventsList.Count; i++)
            {
                for (int j = i + 1; j < eventsList.Count; j++)
                {
                    if (DoEventsOverlap(eventsList[i], eventsList[j]))
                    {
                        var conflict = new CalendarConflictDTO
                        {
                            Id = conflicts.Count + 1,
                            ConflictDate = eventsList[i].StartTime.Date,
                            ConflictStartTime = eventsList[i].StartTime > eventsList[j].StartTime ? eventsList[i].StartTime : eventsList[j].StartTime,
                            ConflictEndTime = eventsList[i].EndTime < eventsList[j].EndTime ? eventsList[i].EndTime : eventsList[j].EndTime,
                            ConflictingEvents = new List<FamilyCalendarEventWithFamilyDTO> 
                            { 
                                _mapper.Map<FamilyCalendarEventWithFamilyDTO>(eventsList[i]),
                                _mapper.Map<FamilyCalendarEventWithFamilyDTO>(eventsList[j])
                            },
                            ConflictType = "TimeOverlap",
                            Severity = "Medium",
                            Description = $"Overlapping events: '{eventsList[i].Title}' and '{eventsList[j].Title}'",
                            IsResolved = false,
                            DetectedAt = DateTime.UtcNow
                        };

                        conflicts.Add(conflict);
                    }
                }
            }

            return conflicts.DistinctBy(c => c.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user calendar conflicts for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserCalendarStatisticsDTO> GetUserCalendarStatisticsAsync(int userId)
    {
        try
        {
            var totalEvents = await _userCalendarRepository.GetUserTotalEventsCountAsync(userId);
            var upcomingEvents = await _userCalendarRepository.GetUserUpcomingEventsCountAsync(userId);
            var pastEvents = await _userCalendarRepository.GetUserPastEventsCountAsync(userId);
            var eventsCreated = await _userCalendarRepository.GetUserEventsCreatedCountAsync(userId);
            var eventsAttending = await _userCalendarRepository.GetUserEventsAttendingCountAsync(userId);
            var eventTypes = await _userCalendarRepository.GetUserEventTypeDistributionAsync(userId);
            var dailyPattern = await _userCalendarRepository.GetUserDailyActivityPatternAsync(userId);
            var hourlyPattern = await _userCalendarRepository.GetUserHourlyActivityPatternAsync(userId);
            var monthlyPattern = await _userCalendarRepository.GetUserMonthlyActivityPatternAsync(userId);
            var lastEventCreated = await _userCalendarRepository.GetUserLastEventCreatedAsync(userId);
            var lastEventAttended = await _userCalendarRepository.GetUserLastEventAttendedAsync(userId);
            var nextUpcomingEvent = await _userCalendarRepository.GetUserNextUpcomingEventAsync(userId);

            var userFamilies = await _userCalendarRepository.GetUserFamiliesAsync(userId);

            return new UserCalendarStatisticsDTO
            {
                UserId = userId,
                TotalFamilies = userFamilies.Count(),
                TotalEvents = totalEvents,
                UpcomingEvents = upcomingEvents,
                PastEvents = pastEvents,
                TodayEvents = 0, // Will be calculated separately
                ThisWeekEvents = 0, // Will be calculated separately
                ThisMonthEvents = 0, // Will be calculated separately
                EventsCreatedByUser = eventsCreated,
                EventsUserAttending = eventsAttending,
                ActiveConflicts = 0, // Will be calculated separately
                ResolvedConflicts = 0, // Will be calculated separately
                FamilyStats = new List<FamilyStatisticsSummaryDTO>(),
                EventTypeDistribution = eventTypes,
                DailyActivityPattern = dailyPattern,
                HourlyActivityPattern = hourlyPattern,
                MonthlyActivityPattern = monthlyPattern,
                AverageEventsPerFamily = userFamilies.Any() ? (double)totalEvents / userFamilies.Count() : 0,
                AverageEventsPerWeek = 0, // Will be calculated separately
                EventAttendanceRate = totalEvents > 0 ? (double)eventsAttending / totalEvents * 100 : 0,
                EventCreationRate = totalEvents > 0 ? (double)eventsCreated / totalEvents * 100 : 0,
                LastEventCreated = lastEventCreated,
                LastEventAttended = lastEventAttended,
                NextUpcomingEvent = nextUpcomingEvent,
                BusiestDayOfWeek = dailyPattern.Any() ? (int)Enum.Parse<DayOfWeek>(dailyPattern.OrderByDescending(kvp => kvp.Value).First().Key) : 0,
                BusiestHourOfDay = hourlyPattern.Any() ? hourlyPattern.OrderByDescending(kvp => kvp.Value).First().Key : 9,
                BusiestFamily = "",
                MostCommonEventType = eventTypes.Any() ? eventTypes.OrderByDescending(kvp => kvp.Value).First().Key : "",
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user calendar statistics for user {UserId}", userId);
            throw;
        }
    }

    // Helper methods
    private string GetFamilyColor(int familyId)
    {
        return FamilyColors[familyId % FamilyColors.Length];
    }

    private static bool DoEventsOverlap(FamilyCalendarEvent event1, FamilyCalendarEvent event2)
    {
        return event1.StartTime < event2.EndTime && event2.StartTime < event1.EndTime;
    }

    private static List<TimeSlotDTO> CalculateFreePeriods(DateTime dayStart, DateTime dayEnd, List<TimeSlotDTO> busyPeriods)
    {
        var freePeriods = new List<TimeSlotDTO>();
        var sortedBusy = busyPeriods.OrderBy(b => b.StartTime).ToList();

        var currentTime = dayStart;
        foreach (var busy in sortedBusy)
        {
            if (currentTime < busy.StartTime)
            {
                freePeriods.Add(new TimeSlotDTO
                {
                    StartTime = currentTime,
                    EndTime = busy.StartTime,
                    Description = "Available",
                    Type = "Available"
                });
            }
            currentTime = busy.EndTime > currentTime ? busy.EndTime : currentTime;
        }

        if (currentTime < dayEnd)
        {
            freePeriods.Add(new TimeSlotDTO
            {
                StartTime = currentTime,
                EndTime = dayEnd,
                Description = "Available",
                Type = "Available"
            });
        }

        return freePeriods;
    }

    private static List<TimeSlotDTO> GenerateTimeRecommendations(List<TimeSlotDTO> freePeriods)
    {
        return freePeriods
            .Where(f => (f.EndTime - f.StartTime).TotalMinutes >= 60) // At least 1 hour
            .Take(3)
            .ToList();
    }
} 