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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class FamilyCalendarRepository : IFamilyCalendarRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FamilyCalendarRepository> _logger;

    public FamilyCalendarRepository(ApplicationDbContext context, ILogger<FamilyCalendarRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Event methods
    public async Task<IEnumerable<FamilyCalendarEvent>> GetAllEventsAsync(int familyId)
    {
        return await _context.FamilyCalendarEvents
            .Where(e => e.FamilyId == familyId)
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Reminders)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyCalendarEvent>> GetEventsInRangeAsync(int familyId, DateTime startDate, DateTime endDate)
    {
        return await _context.FamilyCalendarEvents
            .Where(e => e.FamilyId == familyId && 
                  ((e.StartTime >= startDate && e.StartTime <= endDate) || 
                   (e.EndTime >= startDate && e.EndTime <= endDate) || 
                   (e.StartTime <= startDate && e.EndTime >= endDate)))
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Reminders)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<FamilyCalendarEvent?> GetEventByIdAsync(int eventId)
    {
        return await _context.FamilyCalendarEvents
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Reminders)
            .FirstOrDefaultAsync(e => e.Id == eventId);
    }

    public async Task<FamilyCalendarEvent> CreateEventAsync(FamilyCalendarEvent eventEntity)
    {
        _context.FamilyCalendarEvents.Add(eventEntity);
        await _context.SaveChangesAsync();
        return eventEntity;
    }

    public async Task<FamilyCalendarEvent?> UpdateEventAsync(FamilyCalendarEvent eventEntity)
    {
        eventEntity.UpdatedAt = DateTime.UtcNow;
        _context.FamilyCalendarEvents.Update(eventEntity);
        await _context.SaveChangesAsync();
        return eventEntity;
    }

    public async Task<bool> DeleteEventAsync(int eventId)
    {
        var eventEntity = await _context.FamilyCalendarEvents.FindAsync(eventId);
        if (eventEntity == null)
        {
            return false;
        }

        _context.FamilyCalendarEvents.Remove(eventEntity);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> IsEventInFamilyAsync(int eventId, int familyId)
    {
        return await _context.FamilyCalendarEvents
            .AnyAsync(e => e.Id == eventId && e.FamilyId == familyId);
    }

    // Attendee methods
    public async Task<IEnumerable<FamilyEventAttendee>> GetEventAttendeesAsync(int eventId)
    {
        return await _context.FamilyEventAttendees
            .Where(a => a.EventId == eventId)
            .Include(a => a.FamilyMember)
            .ToListAsync();
    }

    public async Task<FamilyEventAttendee?> GetAttendeeByIdAsync(int attendeeId)
    {
        return await _context.FamilyEventAttendees
            .Include(a => a.FamilyMember)
            .FirstOrDefaultAsync(a => a.Id == attendeeId);
    }

    public async Task<FamilyEventAttendee> CreateAttendeeAsync(FamilyEventAttendee attendee)
    {
        _context.FamilyEventAttendees.Add(attendee);
        await _context.SaveChangesAsync();
        return attendee;
    }

    public async Task<FamilyEventAttendee?> UpdateAttendeeAsync(FamilyEventAttendee attendee)
    {
        attendee.UpdatedAt = DateTime.UtcNow;
        _context.FamilyEventAttendees.Update(attendee);
        await _context.SaveChangesAsync();
        return attendee;
    }

    public async Task<bool> DeleteAttendeeAsync(int attendeeId)
    {
        var attendee = await _context.FamilyEventAttendees.FindAsync(attendeeId);
        if (attendee == null)
        {
            return false;
        }

        _context.FamilyEventAttendees.Remove(attendee);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<FamilyEventAttendee?> GetAttendeeByEventAndMemberAsync(int eventId, int memberId)
    {
        return await _context.FamilyEventAttendees
            .FirstOrDefaultAsync(a => a.EventId == eventId && a.FamilyMemberId == memberId);
    }

    // Reminder methods
    public async Task<IEnumerable<FamilyEventReminder>> GetEventRemindersAsync(int eventId)
    {
        return await _context.FamilyEventReminders
            .Where(r => r.EventId == eventId)
            .ToListAsync();
    }

    public async Task<FamilyEventReminder?> GetReminderByIdAsync(int reminderId)
    {
        return await _context.FamilyEventReminders
            .FirstOrDefaultAsync(r => r.Id == reminderId);
    }

    public async Task<FamilyEventReminder> CreateReminderAsync(FamilyEventReminder reminder)
    {
        _context.FamilyEventReminders.Add(reminder);
        await _context.SaveChangesAsync();
        return reminder;
    }

    public async Task<FamilyEventReminder?> UpdateReminderAsync(FamilyEventReminder reminder)
    {
        _context.FamilyEventReminders.Update(reminder);
        await _context.SaveChangesAsync();
        return reminder;
    }

    public async Task<bool> DeleteReminderAsync(int reminderId)
    {
        var reminder = await _context.FamilyEventReminders.FindAsync(reminderId);
        if (reminder == null)
        {
            return false;
        }

        _context.FamilyEventReminders.Remove(reminder);
        return await _context.SaveChangesAsync() > 0;
    }

    // Availability methods
    public async Task<IEnumerable<FamilyMemberAvailability>> GetMemberAvailabilityAsync(int memberId)
    {
        return await _context.FamilyMemberAvailabilities
            .Where(a => a.FamilyMemberId == memberId)
            .Include(a => a.FamilyMember)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyMemberAvailability>> GetFamilyAvailabilityAsync(int familyId)
    {
        return await _context.FamilyMemberAvailabilities
            .Where(a => a.FamilyMember!.FamilyId == familyId)
            .Include(a => a.FamilyMember)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyMemberAvailability>> GetAvailabilityInRangeAsync(int familyId, DateTime startDate, DateTime endDate)
    {
        return await _context.FamilyMemberAvailabilities
            .Where(a => a.FamilyMember!.FamilyId == familyId && 
                  ((a.StartTime >= startDate && a.StartTime <= endDate) || 
                   (a.EndTime >= startDate && a.EndTime <= endDate) || 
                   (a.StartTime <= startDate && a.EndTime >= endDate)))
            .Include(a => a.FamilyMember)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<FamilyMemberAvailability?> GetAvailabilityByIdAsync(int availabilityId)
    {
        return await _context.FamilyMemberAvailabilities
            .Include(a => a.FamilyMember)
            .FirstOrDefaultAsync(a => a.Id == availabilityId);
    }

    public async Task<FamilyMemberAvailability> CreateAvailabilityAsync(FamilyMemberAvailability availability)
    {
        _context.FamilyMemberAvailabilities.Add(availability);
        await _context.SaveChangesAsync();
        return availability;
    }

    public async Task<FamilyMemberAvailability?> UpdateAvailabilityAsync(FamilyMemberAvailability availability)
    {
        availability.UpdatedAt = DateTime.UtcNow;
        _context.FamilyMemberAvailabilities.Update(availability);
        await _context.SaveChangesAsync();
        return availability;
    }

    public async Task<bool> DeleteAvailabilityAsync(int availabilityId)
    {
        var availability = await _context.FamilyMemberAvailabilities.FindAsync(availabilityId);
        if (availability == null)
        {
            return false;
        }

        _context.FamilyMemberAvailabilities.Remove(availability);
        return await _context.SaveChangesAsync() > 0;
    }
} 