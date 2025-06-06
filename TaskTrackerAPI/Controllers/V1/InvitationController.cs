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
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using System.Collections.Generic;
using TaskTrackerAPI.Controllers.V2;
using System.Linq;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class InvitationController : BaseApiController
    {
        private readonly IInvitationService _invitationService;
        private readonly ILogger<InvitationController> _logger;

        public InvitationController(
            IInvitationService invitationService,
            ILogger<InvitationController> logger)
        {
            _invitationService = invitationService;
            _logger = logger;
        }

        [HttpGet("token/{token}")]
        public async Task<ActionResult<ApiResponse<InvitationResponseDTO>>> GetByToken(string token)
        {
            try
            {
                InvitationResponseDTO invitation = await _invitationService.GetByTokenAsync(token);
                if (invitation == null)
                {
                    return ApiNotFound<InvitationResponseDTO>("Invitation not found or has expired");
                }

                return ApiOk(invitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invitation by token");
                return ApiServerError<InvitationResponseDTO>("An error occurred while retrieving the invitation.");
            }
        }

        [HttpPost("accept")]
        public async Task<ActionResult<ApiResponse<object>>> AcceptInvitation([FromBody] InvitationAcceptDTO dto)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in AcceptInvitation");
                    return ApiUnauthorized<object>("User authentication failed");
                }
                
                bool result = await _invitationService.AcceptInvitationAsync(dto.Token, userId);
                
                if (!result)
                {
                    return ApiBadRequest<object>("Failed to accept invitation");
                }

                return ApiOk<object>(new object(), "Invitation accepted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting invitation");
                return ApiServerError<object>("An error occurred while accepting the invitation.");
            }
        }

        [HttpGet("pending")]
        public async Task<ActionResult<ApiResponse<IEnumerable<InvitationResponseDTO>>>> GetPendingInvitations()
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in GetPendingInvitations");
                    return ApiUnauthorized<IEnumerable<InvitationResponseDTO>>("User authentication failed");
                }
                
                IEnumerable<InvitationResponseDTO> invitations = await _invitationService.GetPendingInvitationsForUserAsync(userId);
                
                return ApiOk(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending invitations");
                return ApiServerError<IEnumerable<InvitationResponseDTO>>("An error occurred while retrieving pending invitations.");
            }
        }

        [HttpGet("sent")]
        public async Task<ActionResult<ApiResponse<IEnumerable<InvitationDTO>>>> GetSentInvitations()
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in GetSentInvitations");
                    return ApiUnauthorized<IEnumerable<InvitationDTO>>("User authentication failed");
                }
                
                IEnumerable<InvitationDTO> invitations = await _invitationService.GetAllAsync();
                // Filter invitations created by the current user with null safety
                IEnumerable<InvitationDTO> sentInvitations = invitations.Where(i => i.CreatedBy?.Id == userId);
                
                return ApiOk(sentInvitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sent invitations");
                return ApiServerError<IEnumerable<InvitationDTO>>("An error occurred while retrieving sent invitations.");
            }
        }

        [HttpPost("decline")]
        public async Task<ActionResult<ApiResponse<object>>> DeclineInvitation([FromBody] InvitationAcceptDTO dto)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in DeclineInvitation");
                    return ApiUnauthorized<object>("User authentication failed");
                }
                
                bool result = await _invitationService.DeclineInvitationAsync(dto.Token, userId);
                
                if (!result)
                {
                    return ApiBadRequest<object>("Failed to decline invitation");
                }

                return ApiOk<object>(new object(), "Invitation declined successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining invitation");
                return ApiServerError<object>("An error occurred while declining the invitation.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> CancelInvitation(int id)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in CancelInvitation");
                    return ApiUnauthorized<object>("User authentication failed");
                }
                
                bool result = await _invitationService.DeleteAsync(id, userId);
                
                if (!result)
                {
                    return ApiBadRequest<object>("Failed to cancel invitation. You may not have permission or the invitation does not exist.");
                }

                return ApiOk<object>(new object(), "Invitation canceled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error canceling invitation: {Message}", ex.Message);
                return ApiServerError<object>("An error occurred while canceling the invitation.");
            }
        }

        [HttpPost("{id}/resend")]
        public async Task<ActionResult<ApiResponse<object>>> ResendInvitation(int id)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in ResendInvitation");
                    return ApiUnauthorized<object>("User authentication failed");
                }
                
                bool result = await _invitationService.ResendInvitationAsync(id, userId);
                
                if (!result)
                {
                    return ApiBadRequest<object>("Failed to resend invitation. You may not have permission or the invitation does not exist.");
                }

                return ApiOk<object>(new object(), "Invitation resent successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending invitation: {Message}", ex.Message);
                return ApiServerError<object>("An error occurred while resending the invitation.");
            }
        }
    }
} 