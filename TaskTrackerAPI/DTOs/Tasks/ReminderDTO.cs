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
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Data transfer object for reminders
    
    public class ReminderDTO
    {
        
        /// Unique identifier for the reminder
        
        public int Id { get; set; }

        
        /// Title of the reminder
        
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the reminder
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// User ID associated with this reminder
        
        public int UserId { get; set; }

        
        /// Task ID this reminder is associated with (if any)
        
        public int? TaskId { get; set; }

        
        /// Scheduled date and time for the reminder
        
        [Required]
        public DateTime ReminderTime { get; set; }

        
        /// Due date for the reminder
        
        [Required]
        public DateTime DueDate { get; set; }

        
        /// Status of the reminder
        
        public ReminderStatus Status { get; set; } = ReminderStatus.Pending;

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int Priority { get; set; } = 0;

        
        /// Whether this is a recurring reminder
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }

        
        /// Date when the reminder was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        /// Date when the reminder was acknowledged
        
        public DateTime? AcknowledgedAt { get; set; }

        /// Location information for the reminder (if location-based)
        public LocationInfoDTO? LocationInfo { get; set; }
    }

    
    /// DTO for creating a reminder
    
    public class CreateReminderDTO
    {
        
        /// Title of the reminder
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        
        /// Optional description
        
        [StringLength(500)]
        public string? Description { get; set; }

        
        /// Associated task ID (optional)
        
        public int? TaskId { get; set; }

        
        /// Scheduled reminder time
        
        [Required]
        public DateTime ReminderTime { get; set; }

        
        /// Due date for the reminder (defaults to ReminderTime date if not specified)
        
        public DateTime? DueDate { get; set; }

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int Priority { get; set; } = 0;

        
        /// Whether this is a recurring reminder
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }

        /// Location information for the reminder (if location-based)
        public LocationInfoDTO? LocationInfo { get; set; }
    }

    
    /// DTO for updating a reminder
    
    public class UpdateReminderDTO
    {
        
        /// Title of the reminder
        
        [StringLength(100)]
        public string? Title { get; set; }

        
        /// Description of the reminder
        
        [StringLength(500)]
        public string? Description { get; set; }

        
        /// Scheduled reminder time
        
        public DateTime? ReminderTime { get; set; }

        
        /// Due date for the reminder
        
        public DateTime? DueDate { get; set; }

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int? Priority { get; set; }

        
        /// Status of the reminder
        
        public ReminderStatus? Status { get; set; }

        
        /// Whether this is a recurring reminder
        
        public bool? IsRecurring { get; set; }

        
        /// Recurrence pattern
        
        public string? RecurrencePattern { get; set; }

        /// Location information for the reminder (if location-based)
        public LocationInfoDTO? LocationInfo { get; set; }
    }

    
    /// Reminder statistics DTO
    
    public class ReminderStatisticsDTO
    {
        
        /// Total number of reminders
        
        public int TotalReminders { get; set; }

        
        /// Number of pending reminders
        
        public int PendingReminders { get; set; }

        
        /// Number of completed reminders
        
        public int CompletedReminders { get; set; }

        
        /// Number of missed reminders
        
        public int MissedReminders { get; set; }

        
        /// Number of upcoming reminders
        
        public int UpcomingReminders { get; set; }

        
        /// Reminders due today
        
        public int DueTodayReminders { get; set; }
    }

    
    /// Reminder status enum
    
    public enum ReminderStatus
    {
        Pending = 0,
        Triggered = 1,
        Acknowledged = 2,
        Dismissed = 3,
        Missed = 4,
        Completed = 5,
        Snoozed = 6
    }

    /// <summary>
    /// DTO for detailed recurring reminder patterns
    /// </summary>
    public class RecurringPatternDTO
    {
        /// <summary>
        /// Type of recurrence pattern
        /// </summary>
        [Required]
        public RecurrenceType Type { get; set; }

        /// <summary>
        /// Interval between occurrences (e.g., every 2 weeks)
        /// </summary>
        [Required]
        [Range(1, 100)]
        public int Interval { get; set; } = 1;

        /// <summary>
        /// Days of the week for weekly recurrence
        /// </summary>
        public List<DayOfWeek>? DaysOfWeek { get; set; }

        /// <summary>
        /// Day of the month for monthly recurrence
        /// </summary>
        [Range(1, 31)]
        public int? DayOfMonth { get; set; }

        /// <summary>
        /// Week number for monthly recurrence (1st, 2nd, 3rd, 4th, or last week)
        /// </summary>
        public int? WeekOfMonth { get; set; }

        /// <summary>
        /// Month(s) for yearly recurrence (1-12)
        /// </summary>
        public List<int>? MonthsOfYear { get; set; }

        /// <summary>
        /// End date for recurring pattern (null = no end date)
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Number of occurrences after which the pattern ends
        /// </summary>
        [Range(1, 999)]
        public int? NumberOfOccurrences { get; set; }
    }

    /// <summary>
    /// Recurrence type enum
    /// </summary>
    public enum RecurrenceType
    {
        Daily = 0,
        Weekly = 1,
        Monthly = 2,
        Yearly = 3,
        Custom = 4
    }

    /// <summary>
    /// DTO for reminder notification preferences
    /// </summary>
    public class ReminderPreferencesDTO
    {
        /// <summary>
        /// User ID these preferences apply to
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Default reminder time (minutes before due time)
        /// </summary>
        [Range(0, 10080)] // Up to 7 days in minutes
        public int DefaultReminderTime { get; set; } = 15;

        /// <summary>
        /// Whether to send push notifications
        /// </summary>
        public bool EnablePushNotifications { get; set; } = true;

        /// <summary>
        /// Whether to send email notifications
        /// </summary>
        public bool EnableEmailNotifications { get; set; } = false;

        /// <summary>
        /// Whether to send SMS notifications
        /// </summary>
        public bool EnableSmsNotifications { get; set; } = false;

        /// <summary>
        /// Email address for notifications
        /// </summary>
        [EmailAddress]
        public string? EmailAddress { get; set; }

        /// <summary>
        /// Phone number for SMS notifications
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Start of daily notification window (quiet hours)
        /// </summary>
        public TimeSpan NotificationWindowStart { get; set; } = new TimeSpan(8, 0, 0); // 8:00 AM

        /// <summary>
        /// End of daily notification window (quiet hours)
        /// </summary>
        public TimeSpan NotificationWindowEnd { get; set; } = new TimeSpan(22, 0, 0); // 10:00 PM

        /// <summary>
        /// Default snooze duration in minutes
        /// </summary>
        [Range(1, 1440)] // Up to 24 hours in minutes
        public int DefaultSnoozeDuration { get; set; } = 10;
    }

    /// <summary>
    /// DTO for snoozing a reminder
    /// </summary>
    public class SnoozeReminderDTO
    {
        /// <summary>
        /// Reminder ID to snooze
        /// </summary>
        [Required]
        public int ReminderId { get; set; }

        /// <summary>
        /// Duration to snooze in minutes
        /// </summary>
        [Range(1, 1440)] // Up to 24 hours
        public int SnoozeDurationMinutes { get; set; } = 10;

        /// <summary>
        /// Custom time to snooze until (overrides duration if provided)
        /// </summary>
        public DateTime? SnoozeUntil { get; set; }
    }

    /// <summary>
    /// DTO for location-based reminder information
    /// </summary>
    public class LocationInfoDTO
    {
        /// <summary>
        /// Location name or description
        /// </summary>
        [Required]
        [StringLength(100)]
        public string LocationName { get; set; } = string.Empty;

        /// <summary>
        /// Latitude coordinate
        /// </summary>
        [Required]
        [Range(-90, 90)]
        public double Latitude { get; set; }

        /// <summary>
        /// Longitude coordinate
        /// </summary>
        [Required]
        [Range(-180, 180)]
        public double Longitude { get; set; }

        /// <summary>
        /// Radius in meters to trigger the reminder
        /// </summary>
        [Range(10, 10000)]
        public int RadiusMeters { get; set; } = 100;

        /// <summary>
        /// Whether to trigger on entering the location
        /// </summary>
        public bool TriggerOnEntry { get; set; } = true;

        /// <summary>
        /// Whether to trigger on exiting the location
        /// </summary>
        public bool TriggerOnExit { get; set; } = false;
    }
}
 