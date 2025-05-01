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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ITaskSharingService
    {
        Task<FamilyTaskItemDTO?> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int userId, bool requiresApproval);
        Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId, int userId);
        Task<IEnumerable<FamilyTaskItemDTO>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId, int userId);
        Task<IEnumerable<FamilyTaskItemDTO>> GetFamilyTasksAsync(int familyId, int userId);
        Task<bool> ApproveTaskAsync(int taskId, int userId, TaskApprovalDTO approvalDto);
        Task<FamilyTaskItemDTO?> GetFamilyTaskByIdAsync(int taskId, int userId);
    }
} 