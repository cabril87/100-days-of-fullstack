using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
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
                var invitation = await _invitationService.GetByTokenAsync(token);
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
                int userId = User.GetUserId();
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
    }
} 