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
namespace TaskTrackerAPI.Models
{
    public enum TaskItemStatus
    {
        ToDo = 0,
        NotStarted = 0, // Alias for ToDo
        InProgress = 1,
        OnHold = 2,
        Pending = 3,
        Completed = 4,
        Cancelled = 5
    }
} 