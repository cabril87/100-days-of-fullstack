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

public interface IInvitationService
{
    Task<IEnumerable<InvitationDTO>> GetAllAsync();
    Task<InvitationDTO?> GetByIdAsync(int id);
    Task<IEnumerable<InvitationDTO>> GetByFamilyIdAsync(int familyId, int userId);
    Task<IEnumerable<InvitationDTO>> GetByEmailAsync(string email);
    Task<InvitationDTO> CreateAsync(InvitationCreateDTO invitationDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<InvitationResponseDTO> GetByTokenAsync(string token);
    Task<bool> AcceptInvitationAsync(string token, int userId);
    Task<string> GenerateInvitationTokenAsync();
    Task<string> GenerateInvitationQRCodeAsync(string token);
    Task<bool> ResendInvitationAsync(int id, int userId);
} 