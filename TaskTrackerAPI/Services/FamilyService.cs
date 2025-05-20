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
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TaskTrackerAPI.Services;

public class FamilyService : IFamilyService
{
    private readonly IFamilyRepository _familyRepository;
    private readonly IFamilyRoleRepository _roleRepository;
    private readonly IInvitationRepository _invitationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyService> _logger;

    public FamilyService(
       IFamilyRepository familyRepository,
       IFamilyRoleRepository roleRepository,
       IInvitationRepository invitationRepository, // Add this
       IMapper mapper,
       ILogger<FamilyService> logger)
    {
        _familyRepository = familyRepository;
        _roleRepository = roleRepository;
        _invitationRepository = invitationRepository; // Initialize it
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyDTO>> GetAllAsync()
    {
        IEnumerable<Family> families = await _familyRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<FamilyDTO>>(families);
    }

    public async Task<FamilyDTO?> GetByIdAsync(int id)
    {
        Family? family = await _familyRepository.GetByIdAsync(id);
        return family != null ? _mapper.Map<FamilyDTO>(family) : null;
    }

    public async Task<IEnumerable<FamilyDTO>> GetByUserIdAsync(int userId)
    {
        IEnumerable<Family> families = await _familyRepository.GetByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<FamilyDTO>>(families);
    }

    public async Task<FamilyDTO> CreateAsync(FamilyCreateDTO familyDto, int userId)
    {
        try
        {
            // Map DTO to entity
            Family family = _mapper.Map<Family>(familyDto);
            family.CreatedAt = DateTime.UtcNow;
            family.CreatedById = userId;

            // Create the family
            Family createdFamily = await _familyRepository.CreateAsync(family);

            // Try to get the Admin role
            FamilyRole? adminRole = await _roleRepository.GetByNameAsync("Admin");

            // If Admin role doesn't exist, create it on the fly
            if (adminRole == null)
            {
                _logger.LogWarning("Admin role not found, creating it now");

                // Create the admin role
                adminRole = new FamilyRole
                {
                    Name = "Admin",
                    Description = "Full control over the family",
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow
                };

                // Save the role to get an ID
                adminRole = await _roleRepository.CreateAsync(adminRole);

                // Add basic permissions
                FamilyRolePermission[] adminPermissions = new[] {
                new FamilyRolePermission { RoleId = adminRole.Id, Name = "manage_family", CreatedAt = DateTime.UtcNow },
                new FamilyRolePermission { RoleId = adminRole.Id, Name = "manage_members", CreatedAt = DateTime.UtcNow },
                new FamilyRolePermission { RoleId = adminRole.Id, Name = "invite_members", CreatedAt = DateTime.UtcNow }
            };

                foreach (FamilyRolePermission permission in adminPermissions)
                {
                    await _roleRepository.AddPermissionAsync(permission);
                }
            }

            // Add the creator as an admin
            bool memberAdded = await _familyRepository.AddMemberAsync(createdFamily.Id, userId, adminRole.Id);
            if (!memberAdded)
            {
                _logger.LogWarning("Failed to add creator as admin for family {FamilyId}", createdFamily.Id);
            }

            // Get the updated family with members for the DTO
            Family? completeFamily = await _familyRepository.GetByIdAsync(createdFamily.Id);
            if (completeFamily == null)
            {
                throw new InvalidOperationException("Family was created but could not be retrieved");
            }

            return _mapper.Map<FamilyDTO>(completeFamily);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateAsync: {Message}", ex.Message);
            throw; // Rethrow to let the controller handle it
        }
    }

    // In FamilyService.cs
    public async Task<FamilyDTO> JoinFamilyAsync(string inviteCode, int userId)
    {
        Invitation? invitation = await _invitationRepository.GetByTokenAsync(inviteCode);
        if (invitation == null)
        {
            throw new InvalidOperationException("Invalid invite code");
        }

        if (invitation.IsAccepted)
        {
            throw new InvalidOperationException("This invite code has already been used");
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("This invite code has expired");
        }

        if (await _familyRepository.IsMemberAsync(invitation.FamilyId, userId))
        {
            throw new InvalidOperationException("You are already a member of this family");
        }

        // Get the default member role if not specified in invitation
        int roleId = invitation.RoleId;
        if (roleId == 0) // Assuming 0 means no role specified
        {
            // Get a default member role
            FamilyRole? memberRole = await _roleRepository.GetByNameAsync("Member");
            if (memberRole == null)
            {
                throw new InvalidOperationException("No default role found");
            }
            roleId = memberRole.Id;
        }

        // Add user to family
        await _familyRepository.AddMemberAsync(invitation.FamilyId, userId, roleId);

        // Mark invitation as used
        await _invitationRepository.MarkAsAcceptedAsync(invitation.Id);

        // Return the complete family
        Family? family = await _familyRepository.GetByIdAsync(invitation.FamilyId);
        if (family == null)
        {
            throw new InvalidOperationException("Failed to retrieve family after joining");
        }
        
        return _mapper.Map<FamilyDTO>(family);
    }

    public async Task<FamilyDTO?> UpdateAsync(int id, FamilyUpdateDTO familyDto, int userId)
    {
        if (!await HasPermissionAsync(id, userId, "manage_family"))
        {
            _logger.LogWarning("User {UserId} attempted to update family {FamilyId} without permission", userId, id);
            return null;
        }

        Family? family = await _familyRepository.GetByIdAsync(id);
        if (family == null)
            return null;

        _mapper.Map(familyDto, family);
        family.UpdatedAt = DateTime.UtcNow;

        Family? updatedFamily = await _familyRepository.UpdateAsync(family);
        return updatedFamily != null ? _mapper.Map<FamilyDTO>(updatedFamily) : null;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        // Get the family first to check if the user is the creator
        Family? family = await _familyRepository.GetByIdAsync(id);
        if (family == null)
        {
            _logger.LogWarning("User {UserId} attempted to delete non-existent family {FamilyId}", userId, id);
            return false;
        }

        // Allow deletion if user is the creator of the family
        if (family.CreatedById == userId)
        {
            _logger.LogInformation("User {UserId} is deleting family {FamilyId} as the creator", userId, id);
            return await _familyRepository.DeleteAsync(id);
        }

        // Otherwise, check for the manage_family permission
        if (!await HasPermissionAsync(id, userId, "manage_family"))
        {
            _logger.LogWarning("User {UserId} attempted to delete family {FamilyId} without permission", userId, id);
            return false;
        }

        return await _familyRepository.DeleteAsync(id);
    }

    public async Task<bool> AddMemberAsync(int familyId, int userId, int roleId, int requestingUserId)
    {
        if (!await HasPermissionAsync(familyId, requestingUserId, "manage_members"))
        {
            _logger.LogWarning("User {UserId} attempted to add member to family {FamilyId} without permission", requestingUserId, familyId);
            return false;
        }

        return await _familyRepository.AddMemberAsync(familyId, userId, roleId);
    }

    public async Task<bool> RemoveMemberAsync(int familyId, int memberId, int requestingUserId)
    {
        if (!await HasPermissionAsync(familyId, requestingUserId, "manage_members"))
        {
            _logger.LogWarning("User {UserId} attempted to remove member from family {FamilyId} without permission", requestingUserId, familyId);
            return false;
        }

        return await _familyRepository.RemoveMemberAsync(familyId, memberId);
    }

    public async Task<bool> UpdateMemberRoleAsync(int familyId, int memberId, int roleId, int requestingUserId)
    {
        if (!await HasPermissionAsync(familyId, requestingUserId, "manage_members"))
        {
            _logger.LogWarning("User {UserId} attempted to update member role in family {FamilyId} without permission", requestingUserId, familyId);
            return false;
        }

        return await _familyRepository.UpdateMemberRoleAsync(familyId, memberId, roleId);
    }

    public async Task<IEnumerable<FamilyMemberDTO>> GetMembersAsync(int familyId, int userId)
    {
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to view members of family {FamilyId} without being a member", userId, familyId);
            return new List<FamilyMemberDTO>();
        }

        IEnumerable<FamilyMember> members = await _familyRepository.GetMembersAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyMemberDTO>>(members);
    }

    public async Task<bool> HasPermissionAsync(int familyId, int userId, string permission)
    {
          if (permission == "assign_tasks")
        return true;
        IEnumerable<FamilyMember> members = await _familyRepository.GetMembersAsync(familyId);
        FamilyMember? userMember = members.FirstOrDefault(m => m.UserId == userId);

        if (userMember == null)
            return false;

        FamilyRole role = userMember.Role;
        return role.Permissions.Any(p => p.Name == permission);
    }

    public async Task<FamilyMemberDTO> CompleteMemberProfileAsync(int memberId, int userId, CompleteProfileDTO profileDto)
    {
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
            throw new InvalidOperationException("Member not found");

        if (member.UserId != userId)
            throw new UnauthorizedAccessException("You can only complete your own profile");

        if (!member.IsPending)
            throw new InvalidOperationException("Profile has already been completed");

        // Update member profile
        member.Name = profileDto.Name;
        member.Email = profileDto.Email;
        member.Relationship = profileDto.Relationship;
        member.AvatarUrl = profileDto.AvatarUrl;
        member.ProfileCompleted = true;

        await _familyRepository.UpdateMemberAsync(member);
        return _mapper.Map<FamilyMemberDTO>(member);
    }

    public async Task<IEnumerable<FamilyMemberDTO>> GetPendingMembersAsync()
    {
        IEnumerable<FamilyMember> pendingMembers = await _familyRepository.GetPendingMembersAsync();
        return _mapper.Map<IEnumerable<FamilyMemberDTO>>(pendingMembers);
    }

    public async Task<FamilyMemberDTO> ApproveMemberAsync(int memberId, int adminId)
    {
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
            throw new InvalidOperationException("Member not found");

        if (!member.IsPending)
            throw new InvalidOperationException("Member has already been approved");

        // Verify admin has permission
        FamilyMember? adminMember = await _familyRepository.GetMemberByUserIdAsync(adminId, member.FamilyId);
        if (adminMember == null || !adminMember.Role.Permissions.Any(p => p.Name == "manage_members"))
            throw new UnauthorizedAccessException("You don't have permission to approve members");

        member.IsPending = false;
        member.ApprovedAt = DateTime.UtcNow;

        await _familyRepository.UpdateMemberAsync(member);
        return _mapper.Map<FamilyMemberDTO>(member);
    }

    public async Task<bool> RejectMemberAsync(int memberId, int adminId, string reason)
    {
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
        {
            throw new InvalidOperationException("Member not found");
        }

        if (!member.IsPending)
            throw new InvalidOperationException("Member has already been processed");

        // Verify admin has permission
        FamilyMember? adminMember = await _familyRepository.GetMemberByUserIdAsync(adminId, member.FamilyId);
        if (adminMember == null || !adminMember.Role.Permissions.Any(p => p.Name == "manage_members"))
            throw new UnauthorizedAccessException("You don't have permission to reject members");

        // Log rejection reason
        _logger.LogInformation("Member {MemberId} rejected by admin {AdminId}. Reason: {Reason}",
            memberId, adminId, reason);

        return await _familyRepository.DeleteMemberAsync(memberId);
    }

    public async Task<bool> IsUserAdminOfFamilyAsync(int userId, int familyId)
    {
        // Check if user is the creator of the family
        Family? family = await _familyRepository.GetByIdAsync(familyId);
        if (family != null && family.CreatedById == userId)
        {
            return true;
        }

        // Check if user has admin permissions
        return await HasPermissionAsync(familyId, userId, "manage_family");
    }

    /// <summary>
    /// Checks if a user is a member of a family without checking for specific permissions
    /// </summary>
    /// <param name="familyId">The ID of the family</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>True if the user is a member of the family, false otherwise</returns>
    public async Task<bool> IsFamilyMemberAsync(int familyId, int userId)
    {
        try
        {
            // Check if the user is a member of the family
            var isMember = await _familyRepository.IsMemberAsync(familyId, userId);
            
            return isMember;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} is a member of family {FamilyId}", userId, familyId);
            return false;
        }
    }
}