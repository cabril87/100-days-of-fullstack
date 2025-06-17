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

namespace TaskTrackerAPI.DTOs.Templates;

/// <summary>
/// DTO for real-time template marketplace events sent via SignalR
/// </summary>
public class TemplateEventDTO
{
    /// <summary>
    /// Type of template event (TemplatePublished)
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the template involved in the event
    /// </summary>
    public int TemplateId { get; set; }

    /// <summary>
    /// Name of the template
    /// </summary>
    public string TemplateName { get; set; } = string.Empty;

    /// <summary>
    /// Name of the template author
    /// </summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 