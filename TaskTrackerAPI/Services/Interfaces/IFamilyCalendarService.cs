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
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyCalendarService
{
    // Calendar event methods
    Task<IEnumerable<FamilyCalendarEventDTO>> GetAllEventsAsync(int familyId, int userId);
    Task<IEnumerable<FamilyCalendarEventDTO>> GetEventsInRangeAsync(int familyId, int userId, DateTime startDate, DateTime endDate);
    Task<FamilyCalendarEventDTO?> GetEventByIdAsync(int eventId, int userId);
    Task<FamilyCalendarEventDTO?> CreateEventAsync(CreateFamilyCalendarEventDTO eventDto, int creatorId);
    Task<FamilyCalendarEventDTO?> UpdateEventAsync(int eventId, UpdateFamilyCalendarEventDTO eventDto, int userId);
    Task<bool> DeleteEventAsync(int eventId, int userId);
    
    // Attendee methods
    Task<IEnumerable<EventAttendeeDTO>> GetEventAttendeesAsync(int eventId, int userId);
    Task<EventAttendeeDTO?> UpdateAttendeeResponseAsync(UpdateAttendeeResponseDTO responseDto, int userId);
    Task<bool> RemoveAttendeeAsync(int eventId, int attendeeId, int userId);
    
    // Availability methods
    Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetMemberAvailabilityAsync(int memberId, int userId);
    Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetFamilyAvailabilityAsync(int familyId, int userId);
    Task<IEnumerable<FamilyMemberAvailabilityDTO>> GetAvailabilityInRangeAsync(int familyId, int userId, DateTime startDate, DateTime endDate);
    Task<FamilyMemberAvailabilityDTO?> GetAvailabilityByIdAsync(int availabilityId, int userId);
    Task<FamilyMemberAvailabilityDTO?> CreateAvailabilityAsync(CreateFamilyMemberAvailabilityDTO availabilityDto, int userId);
    Task<FamilyMemberAvailabilityDTO?> UpdateAvailabilityAsync(int availabilityId, UpdateFamilyMemberAvailabilityDTO availabilityDto, int userId);
    Task<bool> DeleteAvailabilityAsync(int availabilityId, int userId);
    
    // New method to get events due today for a family
    Task<IEnumerable<FamilyCalendarEventDTO>> GetEventsDueTodayAsync(int familyId, int userId);
} 