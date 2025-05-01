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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFamilyMemberRepository
{
    Task<IEnumerable<FamilyMember>> GetAllAsync();
    Task<FamilyMember?> GetByIdAsync(int id);
    Task<FamilyMember?> GetByIdWithDetailsAsync(int id);
    Task<FamilyMember> CreateAsync(FamilyMember member);
    Task<FamilyMember?> UpdateAsync(FamilyMember member);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsByIdAsync(int id);
    Task<IEnumerable<FamilyMember>> GetByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyMember>> GetByUserIdAsync(int userId);
    Task<bool> IsFamilyMemberOwnedByUserAsync(int familyMemberId, int userId);
    Task<FamilyMember?> GetMemberByIdAsync(int memberId);
}