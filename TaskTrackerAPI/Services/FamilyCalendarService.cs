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
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class FamilyCalendarService : IFamilyCalendarService
{
    private readonly IFamilyCalendarRepository _calendarRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IFamilyMemberRepository _familyMemberRepository;
    private readonly IGamificationService _gamificationService;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyCalendarService> _logger;

    public FamilyCalendarService(
        IFamilyCalendarRepository calendarRepository,
        IFamilyRepository familyRepository,
        IFamilyMemberRepository familyMemberRepository,
        IGamificationService gamificationService,
        IMapper mapper,
        ILogger<FamilyCalendarService> logger)
    {
        _calendarRepository = calendarRepository;
        _familyRepository = familyRepository;
        _familyMemberRepository = familyMemberRepository;
        _gamificationService = gamificationService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyCalendarEventDTO>> GetAllEventsAsync(int familyId, int userId)
    {
        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access events for family {FamilyId} without being a member", userId, familyId);
            return new List<FamilyCalendarEventDTO>();
        }

        IEnumerable<FamilyCalendarEvent> events = await _calendarRepository.GetAllEventsAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyCalendarEventDTO>>(events);
    }

    public async Task<IEnumerable<FamilyCalendarEventDTO>> GetEventsInRangeAsync(int familyId, int userId, DateTime startDate, DateTime endDate)
    {
        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access events for family {FamilyId} without being a member", userId, familyId);
            return new List<FamilyCalendarEventDTO>();
        }

        IEnumerable<FamilyCalendarEvent> events = await _calendarRepository.GetEventsInRangeAsync(familyId, startDate, endDate);
        return _mapper.Map<IEnumerable<FamilyCalendarEventDTO>>(events);
    }

    public async Task<FamilyCalendarEventDTO?> GetEventByIdAsync(int eventId, int userId)
    {
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(eventId);
        if (eventEntity == null)
        {
            return null;
        }

        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(eventEntity.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access event {EventId} without being a member of family {FamilyId}", 
                userId, eventId, eventEntity.FamilyId);
            return null;
        }

        return _mapper.Map<FamilyCalendarEventDTO>(eventEntity);
    }

    public async Task<FamilyCalendarEventDTO?> CreateEventAsync(CreateFamilyCalendarEventDTO eventDto, int creatorId)
    {
        try
        {
            // Check if user is a member of the family
            bool isMember = await _familyRepository.IsMemberAsync(eventDto.FamilyId, creatorId);
            if (!isMember)
            {
                _logger.LogWarning("User {UserId} attempted to create event for family {FamilyId} without being a member", 
                    creatorId, eventDto.FamilyId);
                return null;
            }

            // Log that we're attempting to create an event
            _logger.LogInformation("Creating event {Title} for family {FamilyId} by user {UserId}", 
                eventDto.Title, eventDto.FamilyId, creatorId);

            // Map DTO to entity
            FamilyCalendarEvent eventEntity = _mapper.Map<FamilyCalendarEvent>(eventDto);
            eventEntity.CreatedById = creatorId;
            eventEntity.CreatedAt = DateTime.UtcNow;
            eventEntity.UpdatedAt = DateTime.UtcNow;
            
            // Make sure dates are in UTC
            if (eventEntity.StartTime.Kind != DateTimeKind.Utc)
            {
                eventEntity.StartTime = DateTime.SpecifyKind(eventEntity.StartTime, DateTimeKind.Utc);
            }
            
            if (eventEntity.EndTime.Kind != DateTimeKind.Utc)
            {
                eventEntity.EndTime = DateTime.SpecifyKind(eventEntity.EndTime, DateTimeKind.Utc);
            }
            
            // Make sure end time is after start time
            if (eventEntity.EndTime <= eventEntity.StartTime && !eventEntity.IsAllDay)
            {
                eventEntity.EndTime = eventEntity.StartTime.AddHours(1);
            }
            
            // Create the event
            _logger.LogInformation("Saving event to database");
            FamilyCalendarEvent createdEvent = await _calendarRepository.CreateEventAsync(eventEntity);
            
            // Add attendees if specified
            if (eventDto.AttendeeIds != null && eventDto.AttendeeIds.Any())
            {
                _logger.LogInformation("Adding {Count} attendees to event {EventId}", 
                    eventDto.AttendeeIds.Count(), createdEvent.Id);
                    
                foreach (int memberId in eventDto.AttendeeIds)
                {
                    // Verify member belongs to this family
                    FamilyMember? familyMember = await _familyRepository.GetMemberByIdAsync(memberId);
                    if (familyMember == null || familyMember.FamilyId != eventDto.FamilyId)
                    {
                        _logger.LogWarning("Skipping invalid member {MemberId} for event {EventId}", 
                            memberId, createdEvent.Id);
                        continue;
                    }

                    FamilyEventAttendee attendee = new FamilyEventAttendee
                    {
                        EventId = createdEvent.Id,
                        FamilyMemberId = memberId,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _calendarRepository.CreateAttendeeAsync(attendee);
                }
            }

            // Add reminders if specified
            if (eventDto.Reminders != null && eventDto.Reminders.Any())
            {
                _logger.LogInformation("Adding {Count} reminders to event {EventId}", 
                    eventDto.Reminders.Count(), createdEvent.Id);
                    
                foreach (EventReminderCreateDTO reminderDto in eventDto.Reminders)
                {
                    FamilyEventReminder reminder = new FamilyEventReminder
                    {
                        EventId = createdEvent.Id,
                        TimeBeforeInMinutes = reminderDto.TimeBeforeInMinutes,
                        ReminderMethod = reminderDto.ReminderMethod,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _calendarRepository.CreateReminderAsync(reminder);
                }
            }

            // Get the full event with related data
            _logger.LogInformation("Retrieving complete event {EventId}", createdEvent.Id);
            FamilyCalendarEvent? completeEvent = await _calendarRepository.GetEventByIdAsync(createdEvent.Id);
            
            if (completeEvent == null)
            {
                _logger.LogError("Created event {EventId} not found when retrieving complete data", createdEvent.Id);
                // Return the basic created event if we can't get the complete one
                return _mapper.Map<FamilyCalendarEventDTO>(createdEvent);
            }
            
            // Process gamification rewards for event creation
            try
            {
                // Award base points for creating an event
                await _gamificationService.AddPointsAsync(creatorId, 5, "family_event_creation", $"Created family event: {completeEvent.Title}");
                
                // Check for event creation achievements
                await _gamificationService.ProcessAchievementUnlocksAsync(creatorId, "family_event_creation", completeEvent.Id, new Dictionary<string, object>
                {
                    { "familyId", completeEvent.FamilyId },
                    { "eventType", completeEvent.EventType.ToString() },
                    { "isRecurring", completeEvent.IsRecurring },
                    { "attendeeCount", eventDto.AttendeeIds?.Count() ?? 0 }
                });
                
                _logger.LogInformation("Gamification rewards processed for event {EventId} creation by user {UserId}", 
                    completeEvent.Id, creatorId);
            }
            catch (Exception gamificationEx)
            {
                _logger.LogError(gamificationEx, "Error processing gamification rewards for event {EventId} creation", completeEvent.Id);
                // Don't fail the event creation if gamification fails
            }
            
            // Successfully created and retrieved the complete event
            _logger.LogInformation("Event {EventId} successfully created for family {FamilyId}", 
                completeEvent.Id, completeEvent.FamilyId);
            
            return _mapper.Map<FamilyCalendarEventDTO>(completeEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event {Title} for family {FamilyId}: {Message}", 
                eventDto.Title, eventDto.FamilyId, ex.Message);
            
            // Re-throw to allow controller to handle the error
            throw;
        }
    }

    public async Task<FamilyCalendarEventDTO?> UpdateEventAsync(int eventId, UpdateFamilyCalendarEventDTO eventDto, int userId)
    {
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(eventId);
        if (eventEntity == null)
        {
            return null;
        }

        // Check if user is creator or has permission to update events
        bool isCreator = eventEntity.CreatedById == userId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(eventEntity.FamilyId, userId, "manage_calendar");
        
        if (!isCreator && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to update event {EventId} without permission", userId, eventId);
            return null;
        }

        // Update properties if provided
        if (eventDto.Title != null)
            eventEntity.Title = eventDto.Title;
        
        if (eventDto.Description != null)
            eventEntity.Description = eventDto.Description;
        
        if (eventDto.StartTime.HasValue)
            eventEntity.StartTime = eventDto.StartTime.Value;
        
        if (eventDto.EndTime.HasValue)
            eventEntity.EndTime = eventDto.EndTime.Value;
        
        if (eventDto.IsAllDay.HasValue)
            eventEntity.IsAllDay = eventDto.IsAllDay.Value;
        
        if (eventDto.Location != null)
            eventEntity.Location = eventDto.Location;
        
        if (eventDto.Color != null)
            eventEntity.Color = eventDto.Color;
        
        if (eventDto.IsRecurring.HasValue)
            eventEntity.IsRecurring = eventDto.IsRecurring.Value;
        
        if (eventDto.RecurrencePattern != null)
            eventEntity.RecurrencePattern = eventDto.RecurrencePattern;
        
        if (eventDto.EventType.HasValue)
            eventEntity.EventType = eventDto.EventType.Value;

        // Update the event
        FamilyCalendarEvent? updatedEvent = await _calendarRepository.UpdateEventAsync(eventEntity);
        if (updatedEvent == null)
        {
            return null;
        }

        // Update attendees if specified
        if (eventDto.AttendeeIds != null)
        {
            // Get current attendees
            IEnumerable<FamilyEventAttendee> currentAttendees = await _calendarRepository.GetEventAttendeesAsync(eventId);
            List<int> currentAttendeeIds = currentAttendees.Select(a => a.FamilyMemberId).ToList();
            
            // Remove attendees that are no longer in the list
            foreach (FamilyEventAttendee attendee in currentAttendees)
            {
                if (!eventDto.AttendeeIds.Contains(attendee.FamilyMemberId))
                {
                    await _calendarRepository.DeleteAttendeeAsync(attendee.Id);
                }
            }
            
            // Add new attendees
            foreach (int memberId in eventDto.AttendeeIds)
            {
                if (!currentAttendeeIds.Contains(memberId))
                {
                    // Verify member belongs to this family
                    FamilyMember? familyMember = await _familyRepository.GetMemberByIdAsync(memberId);
                    if (familyMember == null || familyMember.FamilyId != eventEntity.FamilyId)
                    {
                        continue;
                    }

                    FamilyEventAttendee attendee = new FamilyEventAttendee
                    {
                        EventId = eventId,
                        FamilyMemberId = memberId,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _calendarRepository.CreateAttendeeAsync(attendee);
                }
            }
        }

        // Update reminders if specified
        if (eventDto.Reminders != null)
        {
            // Remove existing reminders
            IEnumerable<FamilyEventReminder> currentReminders = await _calendarRepository.GetEventRemindersAsync(eventId);
            foreach (FamilyEventReminder reminder in currentReminders)
            {
                await _calendarRepository.DeleteReminderAsync(reminder.Id);
            }
            
            // Add new reminders
            foreach (EventReminderCreateDTO reminderDto in eventDto.Reminders)
            {
                FamilyEventReminder reminder = new FamilyEventReminder
                {
                    EventId = eventId,
                    TimeBeforeInMinutes = reminderDto.TimeBeforeInMinutes,
                    ReminderMethod = reminderDto.ReminderMethod,
                    CreatedAt = DateTime.UtcNow
                };
                await _calendarRepository.CreateReminderAsync(reminder);
            }
        }

        // Get the full updated event with related data
        FamilyCalendarEvent? completeEvent = await _calendarRepository.GetEventByIdAsync(eventId);
        return _mapper.Map<FamilyCalendarEventDTO>(completeEvent);
    }

    public async Task<bool> DeleteEventAsync(int eventId, int userId)
    {
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(eventId);
        if (eventEntity == null)
        {
            return false;
        }

        // Check if user is creator or has permission to delete events
        bool isCreator = eventEntity.CreatedById == userId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(eventEntity.FamilyId, userId, "manage_calendar");
        
        if (!isCreator && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to delete event {EventId} without permission", userId, eventId);
            return false;
        }

        return await _calendarRepository.DeleteEventAsync(eventId);
    }

    public async Task<IEnumerable<EventAttendeeDTO>> GetEventAttendeesAsync(int eventId, int userId)
    {
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(eventId);
        if (eventEntity == null)
        {
            return new List<EventAttendeeDTO>();
        }

        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(eventEntity.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access attendees for event {EventId} without being a member of family {FamilyId}", 
                userId, eventId, eventEntity.FamilyId);
            return new List<EventAttendeeDTO>();
        }

        IEnumerable<FamilyEventAttendee> attendees = await _calendarRepository.GetEventAttendeesAsync(eventId);
        return _mapper.Map<IEnumerable<EventAttendeeDTO>>(attendees);
    }

    public async Task<EventAttendeeDTO?> UpdateAttendeeResponseAsync(UpdateAttendeeResponseDTO responseDto, int userId)
    {
        // Get the event
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(responseDto.EventId);
        if (eventEntity == null)
        {
            return null;
        }

        // Check if user is a member of the family
        FamilyMember? familyMember = await _familyRepository.GetMemberByUserIdAsync(userId, eventEntity.FamilyId);
        if (familyMember == null)
        {
            _logger.LogWarning("User {UserId} attempted to update attendee response for event {EventId} without being a member of family {FamilyId}", 
                userId, responseDto.EventId, eventEntity.FamilyId);
            return null;
        }

        // Get the attendee
        FamilyEventAttendee? attendee = await _calendarRepository.GetAttendeeByEventAndMemberAsync(responseDto.EventId, responseDto.FamilyMemberId);
        if (attendee == null)
        {
            return null;
        }

        // Check if user is the attendee or has permission to manage the event
        bool isAttendee = attendee.FamilyMemberId == familyMember.Id;
        bool hasPermission = await _familyRepository.HasPermissionAsync(eventEntity.FamilyId, userId, "manage_calendar");
        
        if (!isAttendee && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to update response for attendee {AttendeeId} without permission", 
                userId, attendee.Id);
            return null;
        }

        // Update the response
        attendee.Response = responseDto.Response;
        attendee.Note = responseDto.Note;
        attendee.UpdatedAt = DateTime.UtcNow;

        FamilyEventAttendee? updatedAttendee = await _calendarRepository.UpdateAttendeeAsync(attendee);
        return updatedAttendee != null ? _mapper.Map<EventAttendeeDTO>(updatedAttendee) : null;
    }

    public async Task<bool> RemoveAttendeeAsync(int eventId, int attendeeId, int userId)
    {
        FamilyCalendarEvent? eventEntity = await _calendarRepository.GetEventByIdAsync(eventId);
        if (eventEntity == null)
        {
            return false;
        }

        // Check if user is creator or has permission to manage the event
        bool isCreator = eventEntity.CreatedById == userId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(eventEntity.FamilyId, userId, "manage_calendar");
        
        if (!isCreator && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to remove attendee {AttendeeId} without permission", 
                userId, attendeeId);
            return false;
        }

        return await _calendarRepository.DeleteAttendeeAsync(attendeeId);
    }

    public async Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetMemberAvailabilityAsync(int memberId, int userId)
    {
        // Get the family member
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
        {
            return new List<FamilyMemberAvailabilityDTO>();
        }

        // Check if user is a member of the same family
        if (!await _familyRepository.IsMemberAsync(member.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access availability for member {MemberId} without being in the same family", 
                userId, memberId);
            return new List<FamilyMemberAvailabilityDTO>();
        }

        IEnumerable<FamilyMemberAvailability> availabilities = await _calendarRepository.GetMemberAvailabilityAsync(memberId);
        return _mapper.Map<IEnumerable<FamilyMemberAvailabilityDTO>>(availabilities);
    }

    public async Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetFamilyAvailabilityAsync(int familyId, int userId)
    {
        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access availability for family {FamilyId} without being a member", 
                userId, familyId);
            return new List<FamilyMemberAvailabilityDTO>();
        }

        IEnumerable<FamilyMemberAvailability> availabilities = await _calendarRepository.GetFamilyAvailabilityAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyMemberAvailabilityDTO>>(availabilities);
    }

    public async Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetAvailabilityInRangeAsync(int familyId, int userId, DateTime startDate, DateTime endDate)
    {
        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access availability for family {FamilyId} without being a member", 
                userId, familyId);
            return new List<FamilyMemberAvailabilityDTO>();
        }

        IEnumerable<FamilyMemberAvailability> availabilities = await _calendarRepository.GetAvailabilityInRangeAsync(familyId, startDate, endDate);
        return _mapper.Map<IEnumerable<FamilyMemberAvailabilityDTO>>(availabilities);
    }

    public async Task<FamilyMemberAvailabilityDTO?> GetAvailabilityByIdAsync(int availabilityId, int userId)
    {
        FamilyMemberAvailability? availability = await _calendarRepository.GetAvailabilityByIdAsync(availabilityId);
        if (availability == null || availability.FamilyMember == null)
        {
            return null;
        }

        // Check if user is a member of the same family
        if (!await _familyRepository.IsMemberAsync(availability.FamilyMember.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access availability {AvailabilityId} without being in the same family", 
                userId, availabilityId);
            return null;
        }

        return _mapper.Map<FamilyMemberAvailabilityDTO>(availability);
    }

    public async Task<FamilyMemberAvailabilityDTO?> CreateAvailabilityAsync(CreateFamilyMemberAvailabilityDTO availabilityDto, int userId)
    {
        // Get the family member
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(availabilityDto.FamilyMemberId);
        if (member == null)
        {
            return null;
        }

        // Check if user is the member or has permission to manage availability
        FamilyMember? userMember = await _familyRepository.GetMemberByUserIdAsync(userId, member.FamilyId);
        if (userMember == null)
        {
            _logger.LogWarning("User {UserId} attempted to create availability for member {MemberId} without being in the same family", 
                userId, availabilityDto.FamilyMemberId);
            return null;
        }

        bool isSelf = userMember.Id == availabilityDto.FamilyMemberId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(member.FamilyId, userId, "manage_calendar");
        
        if (!isSelf && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to create availability for member {MemberId} without permission", 
                userId, availabilityDto.FamilyMemberId);
            return null;
        }

        // Map DTO to entity
        FamilyMemberAvailability availability = _mapper.Map<FamilyMemberAvailability>(availabilityDto);
        availability.CreatedAt = DateTime.UtcNow;

        // Create the availability
        FamilyMemberAvailability createdAvailability = await _calendarRepository.CreateAvailabilityAsync(availability);
        
        // Get the full availability with related data
        FamilyMemberAvailability? completeAvailability = await _calendarRepository.GetAvailabilityByIdAsync(createdAvailability.Id);
        
        // Process gamification rewards for availability update
        try
        {
            // Award points for updating availability
            await _gamificationService.AddPointsAsync(userId, 5, "availability_updated", $"Updated availability for {completeAvailability?.StartTime:yyyy-MM-dd}");
            
            // Check for availability update achievements
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "availability_updated", completeAvailability?.FamilyMemberId ?? 0, new Dictionary<string, object>
            {
                { "familyId", availabilityDto.FamilyMemberId }, // This might need to be adjusted to get actual family ID
                { "availabilityType", availabilityDto.Status.ToString() }
            });
            
            _logger.LogInformation("Gamification rewards processed for availability update by user {UserId}", userId);
        }
        catch (Exception gamificationEx)
        {
            _logger.LogError(gamificationEx, "Error processing gamification rewards for availability update");
            // Don't fail the availability creation if gamification fails
        }
        
        return _mapper.Map<FamilyMemberAvailabilityDTO>(completeAvailability);
    }

    public async Task<FamilyMemberAvailabilityDTO?> UpdateAvailabilityAsync(int availabilityId, UpdateFamilyMemberAvailabilityDTO availabilityDto, int userId)
    {
        FamilyMemberAvailability? availability = await _calendarRepository.GetAvailabilityByIdAsync(availabilityId);
        if (availability == null || availability.FamilyMember == null)
        {
            return null;
        }

        // Check if user is the member or has permission to manage availability
        FamilyMember? userMember = await _familyRepository.GetMemberByUserIdAsync(userId, availability.FamilyMember.FamilyId);
        if (userMember == null)
        {
            _logger.LogWarning("User {UserId} attempted to update availability {AvailabilityId} without being in the same family", 
                userId, availabilityId);
            return null;
        }

        bool isSelf = userMember.Id == availability.FamilyMemberId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(availability.FamilyMember.FamilyId, userId, "manage_calendar");
        
        if (!isSelf && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to update availability {AvailabilityId} without permission", 
                userId, availabilityId);
            return null;
        }

        // Update properties if provided
        if (availabilityDto.StartTime.HasValue)
            availability.StartTime = availabilityDto.StartTime.Value;
        
        if (availabilityDto.EndTime.HasValue)
            availability.EndTime = availabilityDto.EndTime.Value;
        
        if (availabilityDto.IsRecurring.HasValue)
            availability.IsRecurring = availabilityDto.IsRecurring.Value;
        
        if (availabilityDto.RecurrencePattern != null)
            availability.RecurrencePattern = availabilityDto.RecurrencePattern;
        
        if (availabilityDto.Status.HasValue)
            availability.Status = _mapper.Map<AvailabilityStatus>(availabilityDto.Status.Value);
        
        if (availabilityDto.Note != null)
            availability.Note = availabilityDto.Note;
        
        if (availabilityDto.DayOfWeek.HasValue)
            availability.DayOfWeek = availabilityDto.DayOfWeek;

        // Update the availability
        FamilyMemberAvailability? updatedAvailability = await _calendarRepository.UpdateAvailabilityAsync(availability);
        return updatedAvailability != null ? _mapper.Map<FamilyMemberAvailabilityDTO>(updatedAvailability) : null;
    }

    public async Task<bool> DeleteAvailabilityAsync(int availabilityId, int userId)
    {
        FamilyMemberAvailability? availability = await _calendarRepository.GetAvailabilityByIdAsync(availabilityId);
        if (availability == null || availability.FamilyMember == null)
        {
            return false;
        }

        // Check if user is the member or has permission to manage availability
        FamilyMember? userMember = await _familyRepository.GetMemberByUserIdAsync(userId, availability.FamilyMember.FamilyId);
        if (userMember == null)
        {
            _logger.LogWarning("User {UserId} attempted to delete availability {AvailabilityId} without being in the same family", 
                userId, availabilityId);
            return false;
        }

        bool isSelf = userMember.Id == availability.FamilyMemberId;
        bool hasPermission = await _familyRepository.HasPermissionAsync(availability.FamilyMember.FamilyId, userId, "manage_calendar");
        
        if (!isSelf && !hasPermission)
        {
            _logger.LogWarning("User {UserId} attempted to delete availability {AvailabilityId} without permission", 
                userId, availabilityId);
            return false;
        }

        return await _calendarRepository.DeleteAvailabilityAsync(availabilityId);
    }

    public async Task<IEnumerable<FamilyCalendarEventDTO>> GetEventsDueTodayAsync(int familyId, int userId)
    {
        // Check if user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access today's events for family {FamilyId} without being a member", 
                userId, familyId);
            return new List<FamilyCalendarEventDTO>();
        }
        
        // Get the current date (today) at midnight
        DateTime today = DateTime.Today;
        DateTime tomorrow = today.AddDays(1);
        
        // Use the existing method to get events in the range of today
        IEnumerable<FamilyCalendarEvent> events = await _calendarRepository.GetEventsInRangeAsync(familyId, today, tomorrow);
        
        return _mapper.Map<IEnumerable<FamilyCalendarEventDTO>>(events);
    }
} 