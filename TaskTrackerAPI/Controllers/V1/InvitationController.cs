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
using TaskTrackerAPI.Utils;
using TaskTrackerAPI.Extensions;
using System.Collections.Generic;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Route("api/[controller]")]
    public class InvitationController : ControllerBase
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
        public async Task<ActionResult<InvitationResponseDTO>> GetByToken(string token)
        {
            try
            {
                InvitationResponseDTO invitation = await _invitationService.GetByTokenAsync(token);
                if (invitation == null)
                {
                    return NotFound("Invitation not found or has expired");
                }

                return Ok(invitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invitation by token");
                return StatusCode(500, "An error occurred while retrieving the invitation.");
            }
        }

        [HttpPost("accept")]
        public async Task<ActionResult> AcceptInvitation([FromBody] InvitationAcceptDTO dto)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in AcceptInvitation");
                    return Unauthorized("User authentication failed");
                }
                
                bool result = await _invitationService.AcceptInvitationAsync(dto.Token, userId);
                
                if (!result)
                {
                    return BadRequest("Failed to accept invitation");
                }

                return Ok(new { message = "Invitation accepted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting invitation");
                return StatusCode(500, "An error occurred while accepting the invitation.");
            }
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<InvitationResponseDTO>>> GetPendingInvitations()
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in GetPendingInvitations");
                    return Unauthorized("User authentication failed");
                }
                
                var invitations = await _invitationService.GetPendingInvitationsForUserAsync(userId);
                
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending invitations");
                return StatusCode(500, "An error occurred while retrieving pending invitations.");
            }
        }

        [HttpPost("decline")]
        public async Task<ActionResult> DeclineInvitation([FromBody] InvitationAcceptDTO dto)
        {
            try
            {
                if (!User.TryGetUserIdAsInt(out int userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims in DeclineInvitation");
                    return Unauthorized("User authentication failed");
                }
                
                bool result = await _invitationService.DeclineInvitationAsync(dto.Token, userId);
                
                if (!result)
                {
                    return BadRequest("Failed to decline invitation");
                }

                return Ok(new { message = "Invitation declined successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining invitation");
                return StatusCode(500, "An error occurred while declining the invitation.");
            }
        }
    }
} 