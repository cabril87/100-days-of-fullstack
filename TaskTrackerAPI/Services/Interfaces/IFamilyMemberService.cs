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

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyMemberService
{
    Task<IEnumerable<FamilyPersonDTO>> GetAllAsync();
    Task<FamilyPersonDTO?> GetByIdAsync(int id);
    Task<FamilyPersonDetailDTO?> GetDetailsByIdAsync(int id);
    Task<FamilyPersonDTO> CreateAsync(CreateFamilyPersonDTO memberDto, int userId);
    Task<FamilyPersonDTO?> UpdateAsync(int id, UpdateFamilyPersonDTO memberDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> IsUserMemberOfFamilyAsync(int userId, int familyId);
} 