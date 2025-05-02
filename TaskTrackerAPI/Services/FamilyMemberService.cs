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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Services;

public class FamilyMemberService : IFamilyMemberService
{
    private readonly IFamilyMemberRepository _familyMemberRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyMemberService> _logger;

    public FamilyMemberService(
        IFamilyMemberRepository familyMemberRepository,
        IFamilyRepository familyRepository,
        IMapper mapper,
        ILogger<FamilyMemberService> logger)
    {
        _familyMemberRepository = familyMemberRepository;
        _familyRepository = familyRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyPersonDTO>> GetAllAsync()
    {
        IEnumerable<FamilyMember> members = await _familyMemberRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<FamilyPersonDTO>>(members);
    }

    public async Task<FamilyPersonDTO?> GetByIdAsync(int id)
    {
        FamilyMember? member = await _familyMemberRepository.GetByIdAsync(id);
        if (member == null)
            return null;

        return _mapper.Map<FamilyPersonDTO>(member);
    }

    public async Task<FamilyPersonDetailDTO?> GetDetailsByIdAsync(int id)
    {
        FamilyMember? member = await _familyMemberRepository.GetByIdWithDetailsAsync(id);
        if (member == null)
            return null;

        return _mapper.Map<FamilyPersonDetailDTO>(member);
    }

    public async Task<FamilyPersonDTO> CreateAsync(CreateFamilyPersonDTO memberDto, int userId)
    {
        if (!await _familyRepository.IsMemberAsync(memberDto.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to create a family member in family {FamilyId} without being a member", userId, memberDto.FamilyId);
            throw new UnauthorizedAccessException("You are not a member of this family");
        }

        FamilyMember member = _mapper.Map<FamilyMember>(memberDto);
        
        FamilyMember? result = await _familyMemberRepository.CreateAsync(member);
        if (result == null)
        {
            _logger.LogError("Failed to create family member in family {FamilyId}", memberDto.FamilyId);
            throw new InvalidOperationException("Failed to create family member");
        }
        
        return _mapper.Map<FamilyPersonDTO>(result);
    }

    public async Task<FamilyPersonDTO?> UpdateAsync(int id, UpdateFamilyPersonDTO memberDto, int userId)
    {
        FamilyMember? member = await _familyMemberRepository.GetByIdAsync(id);
        if (member == null)
            return null;

        if (!await _familyRepository.IsMemberAsync(member.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to update a family member in family {FamilyId} without being a member", userId, member.FamilyId);
            throw new UnauthorizedAccessException("You are not a member of this family");
        }

        _mapper.Map(memberDto, member);
        
        FamilyMember? result = await _familyMemberRepository.UpdateAsync(member);
        return result != null ? _mapper.Map<FamilyPersonDTO>(result) : null;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        FamilyMember? member = await _familyMemberRepository.GetByIdAsync(id);
        if (member == null)
            return false;

        if (!await _familyRepository.IsMemberAsync(member.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to delete a family member in family {FamilyId} without being a member", userId, member.FamilyId);
            return false;
        }

        return await _familyMemberRepository.DeleteAsync(id);
    }

    public async Task<bool> IsUserMemberOfFamilyAsync(int userId, int familyId)
    {
        return await _familyRepository.IsMemberAsync(familyId, userId);
    }
} 