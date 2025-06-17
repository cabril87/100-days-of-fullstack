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

public interface IFamilyRepository
{
    Task<IEnumerable<Family>> GetAllAsync();
    Task<Family?> GetByIdAsync(int id);
    Task<IEnumerable<Family>> GetByUserIdAsync(int userId);
    Task<Family> CreateAsync(Family family);
    Task<Family?> UpdateAsync(Family family);
    Task<bool> DeleteAsync(int id);
    Task<bool> AddMemberAsync(int familyId, int userId, int roleId);
    Task<bool> RemoveMemberAsync(int familyId, int userId);
    Task<bool> UpdateMemberRoleAsync(int familyId, int userId, int roleId);
    Task<IEnumerable<FamilyMember>> GetMembersAsync(int familyId);
    Task<bool> FamilyExistsAsync(int familyId);
    Task<bool> IsMemberAsync(int familyId, int userId);
    Task<bool> HasPermissionAsync(int familyId, int userId, string permission);
    Task<FamilyMember?> GetMemberByIdAsync(int memberId);
    Task<FamilyMember?> GetMemberByUserIdAsync(int userId, int familyId);
    Task<IEnumerable<FamilyMember>> GetPendingMembersAsync();
    Task<bool> UpdateMemberAsync(FamilyMember member);
    Task<bool> DeleteMemberAsync(int memberId);
    
    // Family Admin and Ownership Methods
    Task<bool> IsUserAdminOfFamilyAsync(int userId, int familyId);
    Task<bool> IsUserFamilyAdminAsync(int userId);
    Task<IEnumerable<Family>> GetFamiliesUserIsAdminOfAsync(int userId);
    Task<IEnumerable<Family>> GetFamiliesUserIsMemberOfAsync(int userId);
    Task<IEnumerable<Family>> GetFamiliesUserHasManagementPrivilegesAsync(int userId);
    
    // Family Ownership Transfer (Pass the Baton)
    Task<bool> TransferFamilyOwnershipAsync(int familyId, int currentOwnerId, int newOwnerId);
    Task<bool> CanUserManageFamilyBasedOnAgeAsync(int userId, int familyId);
    
    // Primary family management
    Task<Family?> GetPrimaryFamilyAsync(int userId);
    Task<bool> SetPrimaryFamilyAsync(int userId, int familyId);
    Task<bool> UpdatePrimaryFamilyAsync(int userId, int familyId);
} 