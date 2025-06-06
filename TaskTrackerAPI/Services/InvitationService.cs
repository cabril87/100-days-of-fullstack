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
using System.Security.Cryptography;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TaskTrackerAPI.Services;

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IFamilyRoleRepository _roleRepository;
    private readonly QRCodeHelper _qrCodeHelper;
    private readonly IMapper _mapper;
    private readonly ILogger<InvitationService> _logger;

    public InvitationService(
        IInvitationRepository invitationRepository,
        IFamilyRepository familyRepository,
        IFamilyRoleRepository roleRepository,
        QRCodeHelper qrCodeHelper,
        IMapper mapper,
        ILogger<InvitationService> logger)
    {
        _invitationRepository = invitationRepository;
        _familyRepository = familyRepository;
        _roleRepository = roleRepository;
        _qrCodeHelper = qrCodeHelper;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<InvitationDTO>> GetAllAsync()
    {
        try
        {
            IEnumerable<Invitation> invitations = await _invitationRepository.GetAllAsync();
            IEnumerable<InvitationDTO> mappedInvitations = _mapper.Map<IEnumerable<InvitationDTO>>(invitations);
            
            // Log any potential mapping issues
            _logger.LogInformation("Retrieved {Count} invitations successfully", mappedInvitations.Count());
            
            return mappedInvitations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all invitations");
            throw;
        }
    }

    public async Task<InvitationDTO?> GetByIdAsync(int id)
    {
        Invitation? invitation = await _invitationRepository.GetByIdAsync(id);
        if (invitation == null)
            return null;

        InvitationDTO invitationDto = _mapper.Map<InvitationDTO>(invitation);
        invitationDto.QRCodeData = await GenerateInvitationQRCodeAsync(invitation.Token);
        return invitationDto;
    }

    public async Task<IEnumerable<InvitationDTO>> GetByFamilyIdAsync(int familyId, int userId)
    {
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to view invitations for family {FamilyId} without being a member", userId, familyId);
            return new List<InvitationDTO>();
        }

        IEnumerable<Invitation> invitations = await _invitationRepository.GetByFamilyIdAsync(familyId);
        IEnumerable<InvitationDTO> invitationDtos = _mapper.Map<IEnumerable<InvitationDTO>>(invitations);

        // Generate QR codes for each invitation
        foreach (InvitationDTO invitationDto in invitationDtos)
        {
            invitationDto.QRCodeData = await GenerateInvitationQRCodeAsync(invitationDto.Token);
        }

        return invitationDtos;
    }

    public async Task<IEnumerable<InvitationDTO>> GetByEmailAsync(string email)
    {
        IEnumerable<Invitation> invitations = await _invitationRepository.GetByEmailAsync(email);
        IEnumerable<InvitationDTO> invitationDtos = _mapper.Map<IEnumerable<InvitationDTO>>(invitations);

        // Generate QR codes for each invitation
        foreach (InvitationDTO invitationDto in invitationDtos)
        {
            invitationDto.QRCodeData = await GenerateInvitationQRCodeAsync(invitationDto.Token);
        }

        return invitationDtos;
    }

    public async Task<InvitationDTO> CreateAsync(InvitationCreateDTO invitationDto, int userId)
    {
        // Check if user has permission
        if (!await _familyRepository.IsMemberAsync(invitationDto.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to create invitation for family {FamilyId} without being a member", userId, invitationDto.FamilyId);
            throw new UnauthorizedAccessException("You are not a member of this family");
        }

        // Check if family exists
        if (!await _familyRepository.FamilyExistsAsync(invitationDto.FamilyId))
        {
            _logger.LogWarning("Attempted to create invitation for non-existent family {FamilyId}", invitationDto.FamilyId);
            throw new InvalidOperationException("Family does not exist");
        }

        // Check if role exists
        if (!await _roleRepository.ExistsByIdAsync(invitationDto.FamilyRoleId))
        {
            _logger.LogWarning("Attempted to create invitation with non-existent role {RoleId}", invitationDto.FamilyRoleId);
            throw new InvalidOperationException("Role does not exist");
        }

        // Check for existing active invitation
        if (await _invitationRepository.ExistsActiveInvitationAsync(invitationDto.FamilyId, invitationDto.Email))
        {
            _logger.LogWarning("Attempted to create duplicate invitation for {Email} in family {FamilyId}", invitationDto.Email, invitationDto.FamilyId);
            throw new InvalidOperationException("An active invitation already exists for this email");
        }

        Invitation invitation = _mapper.Map<Invitation>(invitationDto);
        invitation.Token = await GenerateInvitationTokenAsync();
        invitation.CreatedById = userId;

        Invitation createdInvitation = await _invitationRepository.CreateAsync(invitation);
        InvitationDTO resultDto = _mapper.Map<InvitationDTO>(createdInvitation);
        resultDto.QRCodeData = await GenerateInvitationQRCodeAsync(createdInvitation.Token);

        return resultDto;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        Invitation? invitation = await _invitationRepository.GetByIdAsync(id);
        if (invitation == null)
            return false;

        // Check if user has permission (is a member of the family)
        if (!await _familyRepository.IsMemberAsync(invitation.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to delete invitation {InvitationId} without being a family member", userId, id);
            return false;
        }

        return await _invitationRepository.DeleteAsync(id);
    }

    public async Task<InvitationResponseDTO> GetByTokenAsync(string token)
    {
        Invitation? invitation = await _invitationRepository.GetByTokenAsync(token);
        if (invitation == null)
        {
            throw new InvalidOperationException("Invitation not found or has expired");
        }

        return new InvitationResponseDTO
        {
            Token = invitation.Token,
            FamilyName = invitation.Family.Name,
            RoleName = invitation.Role.Name,
            InvitedBy = invitation.CreatedBy.Username,
            ExpiresAt = invitation.ExpiresAt
        };
    }

    public async Task<bool> AcceptInvitationAsync(string token, int userId)
    {
        Invitation? invitation = await _invitationRepository.GetByTokenAsync(token);
        if (invitation == null)
        {
            _logger.LogWarning("Attempted to accept non-existent or expired invitation with token {Token}", token);
            return false;
        }

        // Add user to family with the specified role
        bool result = await _familyRepository.AddMemberAsync(invitation.FamilyId, userId, invitation.RoleId);
        if (!result)
        {
            _logger.LogError("Failed to add user {UserId} to family {FamilyId}", userId, invitation.FamilyId);
            return false;
        }

        // Mark invitation as accepted
        invitation.IsAccepted = true;
        await _invitationRepository.UpdateAsync(invitation);

        return true;
    }

    public async Task<string> GenerateInvitationTokenAsync()
    {
        string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).Replace("/", "_").Replace("+", "-").Replace("=", "");
        
        // Check if token already exists
        Invitation? existingInvitation = await _invitationRepository.GetByTokenAsync(token);
        if (existingInvitation != null)
        {
            // Try again with a new token
            return await GenerateInvitationTokenAsync();
        }
        
        return token;
    }

    public async Task<string> GenerateInvitationQRCodeAsync(string token)
    {
        // The data will be a URL to your invitation page
        string qrCodeData = $"tasktrackerapp://invitation/{token}";
        return await Task.FromResult(_qrCodeHelper.GenerateQRCodeBase64(qrCodeData));
    }

    public async Task<bool> ResendInvitationAsync(int id, int userId)
    {
        Invitation? invitation = await _invitationRepository.GetByIdAsync(id);
        if (invitation == null)
            return false;

        // Check if user has permission (is a member of the family)
        if (!await _familyRepository.IsMemberAsync(invitation.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to resend invitation {InvitationId} without being a family member", userId, id);
            return false;
        }

        // Update expiration date
        invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);
        await _invitationRepository.UpdateAsync(invitation);

        // Here you would typically send an email with the invitation link
        // This would be implemented in a real email service

        return true;
    }

    public async Task<IEnumerable<InvitationResponseDTO>> GetPendingInvitationsForUserAsync(int userId)
    {
        _logger.LogInformation("Getting pending invitations for user {UserId}", userId);
        
        var user = await _invitationRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Attempted to get pending invitations for non-existent user {UserId}", userId);
            return new List<InvitationResponseDTO>();
        }

        // Get invitations for this user's email that are still active
        _logger.LogInformation("Fetching pending invitations for email {Email}", user.Email);
        var invitations = await _invitationRepository.GetPendingInvitationsByEmailAsync(user.Email);
        _logger.LogInformation("Found {Count} pending invitations for user {UserId}", invitations.Count(), userId);
        
        var result = new List<InvitationResponseDTO>();
        foreach (var invitation in invitations)
        {
            // Check for null references
            if (invitation.Family == null)
            {
                _logger.LogWarning("Invitation {InvitationId} has null Family reference", invitation.Id);
                continue;
            }

            if (invitation.Role == null)
            {
                _logger.LogWarning("Invitation {InvitationId} has null Role reference", invitation.Id);
                continue;
            }

            if (invitation.CreatedBy == null)
            {
                _logger.LogWarning("Invitation {InvitationId} has null CreatedBy reference", invitation.Id);
                continue;
            }

            // Map to DTO with all necessary properties
            var dto = new InvitationResponseDTO
            {
                Id = invitation.Id,
                Token = invitation.Token,
                Email = invitation.Email,
                ExpiresAt = invitation.ExpiresAt,
                IsAccepted = invitation.IsAccepted,
                CreatedAt = invitation.CreatedAt,
                FamilyId = invitation.FamilyId,
                FamilyName = invitation.Family.Name,
                RoleId = invitation.RoleId,
                RoleName = invitation.Role.Name,
                InvitedBy = invitation.CreatedBy.Username
            };
            
            _logger.LogInformation("Adding invitation {InvitationId} to result list", invitation.Id);
            result.Add(dto);
        }

        _logger.LogInformation("Returning {Count} valid invitations for user {UserId}", result.Count, userId);
        return result;
    }
    
    public async Task<bool> DeclineInvitationAsync(string token, int userId)
    {
        Invitation? invitation = await _invitationRepository.GetByTokenAsync(token);
        if (invitation == null)
        {
            _logger.LogWarning("Attempted to decline non-existent or expired invitation with token {Token}", token);
            return false;
        }

        // Verify the invitation is for this user
        var user = await _invitationRepository.GetUserByIdAsync(userId);
        if (user == null || user.Email != invitation.Email)
        {
            _logger.LogWarning("User {UserId} attempted to decline invitation not meant for them", userId);
            return false;
        }

        // Instead of marking as declined, just delete the invitation
        return await _invitationRepository.DeleteAsync(invitation.Id);
    }
} 