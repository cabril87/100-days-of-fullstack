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

public interface IFamilyCalendarRepository
{
    // Event methods
    Task<IEnumerable<FamilyCalendarEvent>> GetAllEventsAsync(int familyId);
    Task<IEnumerable<FamilyCalendarEvent>> GetEventsInRangeAsync(int familyId, DateTime startDate, DateTime endDate);
    Task<FamilyCalendarEvent?> GetEventByIdAsync(int eventId);
    Task<FamilyCalendarEvent> CreateEventAsync(FamilyCalendarEvent eventEntity);
    Task<FamilyCalendarEvent?> UpdateEventAsync(FamilyCalendarEvent eventEntity);
    Task<bool> DeleteEventAsync(int eventId);
    Task<bool> IsEventInFamilyAsync(int eventId, int familyId);
    
    // Attendee methods
    Task<IEnumerable<FamilyEventAttendee>> GetEventAttendeesAsync(int eventId);
    Task<FamilyEventAttendee?> GetAttendeeByIdAsync(int attendeeId);
    Task<FamilyEventAttendee> CreateAttendeeAsync(FamilyEventAttendee attendee);
    Task<FamilyEventAttendee?> UpdateAttendeeAsync(FamilyEventAttendee attendee);
    Task<bool> DeleteAttendeeAsync(int attendeeId);
    Task<FamilyEventAttendee?> GetAttendeeByEventAndMemberAsync(int eventId, int memberId);
    
    // Reminder methods
    Task<IEnumerable<FamilyEventReminder>> GetEventRemindersAsync(int eventId);
    Task<FamilyEventReminder?> GetReminderByIdAsync(int reminderId);
    Task<FamilyEventReminder> CreateReminderAsync(FamilyEventReminder reminder);
    Task<FamilyEventReminder?> UpdateReminderAsync(FamilyEventReminder reminder);
    Task<bool> DeleteReminderAsync(int reminderId);
    
    // Availability methods
    Task<IEnumerable<FamilyMemberAvailability>> GetMemberAvailabilityAsync(int memberId);
    Task<IEnumerable<FamilyMemberAvailability>> GetFamilyAvailabilityAsync(int familyId);
    Task<IEnumerable<FamilyMemberAvailability>> GetAvailabilityInRangeAsync(int familyId, DateTime startDate, DateTime endDate);
    Task<FamilyMemberAvailability?> GetAvailabilityByIdAsync(int availabilityId);
    Task<FamilyMemberAvailability> CreateAvailabilityAsync(FamilyMemberAvailability availability);
    Task<FamilyMemberAvailability?> UpdateAvailabilityAsync(FamilyMemberAvailability availability);
    Task<bool> DeleteAvailabilityAsync(int availabilityId);
} 