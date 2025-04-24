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

namespace TaskTrackerAPI.Services;

public class FamilyService : IFamilyService
{
    private readonly IFamilyRepository _familyRepository;
    private readonly IFamilyRoleRepository _roleRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyService> _logger;

    public FamilyService(
        IFamilyRepository familyRepository,
        IFamilyRoleRepository roleRepository,
        IMapper mapper,
        ILogger<FamilyService> logger)
    {
        _familyRepository = familyRepository;
        _roleRepository = roleRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyDTO>> GetAllAsync()
    {
        var families = await _familyRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<FamilyDTO>>(families);
    }

    public async Task<FamilyDTO?> GetByIdAsync(int id)
    {
        var family = await _familyRepository.GetByIdAsync(id);
        return family != null ? _mapper.Map<FamilyDTO>(family) : null;
    }

    public async Task<IEnumerable<FamilyDTO>> GetByUserIdAsync(int userId)
    {
        var families = await _familyRepository.GetByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<FamilyDTO>>(families);
    }

    public async Task<FamilyDTO> CreateAsync(FamilyCreateDTO familyDto, int userId)
    {
        var family = _mapper.Map<Family>(familyDto);
        family.CreatedAt = DateTime.UtcNow;
        family.CreatedById = userId;

        var createdFamily = await _familyRepository.CreateAsync(family);

        // Add the creator as an admin
        var adminRole = await _roleRepository.GetByNameAsync("Admin");
        if (adminRole == null)
        {
            _logger.LogError("Admin role not found when creating family");
            throw new InvalidOperationException("Admin role not found");
        }

        await _familyRepository.AddMemberAsync(createdFamily.Id, userId, adminRole.Id);

        return _mapper.Map<FamilyDTO>(createdFamily);
    }

    public async Task<FamilyDTO?> UpdateAsync(int id, FamilyUpdateDTO familyDto, int userId)
    {
        if (!await HasPermissionAsync(id, userId, "manage_family"))
        {
            _logger.LogWarning("User {UserId} attempted to update family {FamilyId} without permission", userId, id);
            return null;
        }

        var family = await _familyRepository.GetByIdAsync(id);
        if (family == null)
            return null;

        _mapper.Map(familyDto, family);
        family.UpdatedAt = DateTime.UtcNow;

        var updatedFamily = await _familyRepository.UpdateAsync(family);
        return updatedFamily != null ? _mapper.Map<FamilyDTO>(updatedFamily) : null;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
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

        var members = await _familyRepository.GetMembersAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyMemberDTO>>(members);
    }

    public async Task<bool> HasPermissionAsync(int familyId, int userId, string permission)
    {
        var members = await _familyRepository.GetMembersAsync(familyId);
        var userMember = members.FirstOrDefault(m => m.UserId == userId);
        
        if (userMember == null)
            return false;
        
        var role = userMember.Role;
        return role.Permissions.Any(p => p.Name == permission);
    }

    public async Task<FamilyMemberDTO> CompleteMemberProfileAsync(int memberId, int userId, CompleteProfileDTO profileDto)
    {
        var member = await _familyRepository.GetMemberByIdAsync(memberId);
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
        var pendingMembers = await _familyRepository.GetPendingMembersAsync();
        return _mapper.Map<IEnumerable<FamilyMemberDTO>>(pendingMembers);
    }

    public async Task<FamilyMemberDTO> ApproveMemberAsync(int memberId, int adminId)
    {
        var member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
            throw new InvalidOperationException("Member not found");

        if (!member.IsPending)
            throw new InvalidOperationException("Member has already been approved");

        // Verify admin has permission
        var adminMember = await _familyRepository.GetMemberByUserIdAsync(adminId);
        if (adminMember == null || !adminMember.Role.Permissions.Any(p => p.Name == "manage_members"))
            throw new UnauthorizedAccessException("You don't have permission to approve members");

        member.IsPending = false;
        member.ApprovedAt = DateTime.UtcNow;

        await _familyRepository.UpdateMemberAsync(member);
        return _mapper.Map<FamilyMemberDTO>(member);
    }

    public async Task<bool> RejectMemberAsync(int memberId, int adminId, string reason)
    {
        var member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
        {
            throw new InvalidOperationException("Member not found");
        }

        if (!member.IsPending)
            throw new InvalidOperationException("Member has already been processed");

        // Verify admin has permission
        var adminMember = await _familyRepository.GetMemberByUserIdAsync(adminId);
        if (adminMember == null || !adminMember.Role.Permissions.Any(p => p.Name == "manage_members"))
            throw new UnauthorizedAccessException("You don't have permission to reject members");

        // Log rejection reason
        _logger.LogInformation("Member {MemberId} rejected by admin {AdminId}. Reason: {Reason}", 
            memberId, adminId, reason);

        return await _familyRepository.DeleteMemberAsync(memberId);
    }
} 