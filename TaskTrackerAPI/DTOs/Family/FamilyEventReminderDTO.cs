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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyEventReminderDTO
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int TimeBeforeInMinutes { get; set; }
    public ReminderMethod ReminderMethod { get; set; } = ReminderMethod.Notification;
    public bool Sent { get; set; } = false;
    public DateTime? SentAt { get; set; }
    public DateTime CreatedAt { get; set; }
} 