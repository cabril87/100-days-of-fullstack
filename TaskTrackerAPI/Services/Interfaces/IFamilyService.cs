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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyService
{
    Task<IEnumerable<FamilyDTO>> GetAllAsync();
    Task<FamilyDTO?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyDTO>> GetByUserIdAsync(int userId);
    Task<FamilyDTO> CreateAsync(FamilyCreateDTO familyDto, int userId);
    Task<FamilyDTO?> UpdateAsync(int id, FamilyUpdateDTO familyDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> AddMemberAsync(int familyId, int userId, int roleId, int requestingUserId);
    Task<bool> RemoveMemberAsync(int familyId, int memberId, int requestingUserId);
    Task<bool> UpdateMemberRoleAsync(int familyId, int memberId, int roleId, int requestingUserId);
    Task<IEnumerable<FamilyMemberDTO>> GetMembersAsync(int familyId, int userId);
    Task<bool> HasPermissionAsync(int familyId, int userId, string permission);
    Task<bool> IsFamilyMemberAsync(int familyId, int userId);
    Task<FamilyMemberDTO> CompleteMemberProfileAsync(int memberId, int userId, CompleteProfileDTO profileDto);
    Task<IEnumerable<FamilyMemberDTO>> GetPendingMembersAsync();
    Task<FamilyMemberDTO> ApproveMemberAsync(int memberId, int adminId);
    Task<bool> RejectMemberAsync(int memberId, int adminId, string reason);
    Task<FamilyDTO> JoinFamilyAsync(string inviteCode, int userId);
    Task<bool> IsUserAdminOfFamilyAsync(int userId, int familyId);
    Task<bool> IsUserFamilyAdminAsync(int userId);
    
    // Family relationship tracking
    Task<IEnumerable<FamilyDTO>> GetFamiliesUserIsAdminOfAsync(int userId);
    Task<IEnumerable<FamilyDTO>> GetFamiliesUserIsMemberOfAsync(int userId);
    Task<IEnumerable<FamilyDTO>> GetFamiliesUserHasManagementPrivilegesAsync(int userId);
    
    // Family ownership transfer (Pass the Baton)
    Task<bool> TransferFamilyOwnershipAsync(int familyId, int currentOwnerId, int newOwnerId);
    Task<bool> CanUserManageFamilyBasedOnAgeAsync(int userId, int familyId);
    
    // Enhanced family management
    Task<FamilyManagementPermissionsDTO> GetUserFamilyManagementPermissionsAsync(int userId, int? familyId = null);
    Task<UserFamilyRelationshipsDTO> GetUserFamilyRelationshipsAsync(int userId);
    
    // Primary family management
    Task<FamilyDTO?> GetPrimaryFamilyAsync(int userId);
    Task<FamilyDTO> SetPrimaryFamilyAsync(int userId, int familyId);
    Task<bool> UpdatePrimaryFamilyAsync(int userId, int familyId);
}