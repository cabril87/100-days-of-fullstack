using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FamilyController : ControllerBase
    {
        private readonly IFamilyService _familyService;
        private readonly ILogger<FamilyController> _logger;

        public FamilyController(IFamilyService familyService, ILogger<FamilyController> logger)
        {
            _familyService = familyService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("members/{memberId}/complete-profile")]
        public async Task<ActionResult<FamilyMemberDTO>> CompleteMemberProfile(int memberId, [FromBody] CompleteProfileDTO profileDto)
        {
            try
            {
                int userId = User.GetUserId();
                var member = await _familyService.CompleteMemberProfileAsync(memberId, userId, profileDto);
                return Ok(member);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing member profile");
                return StatusCode(500, "An error occurred while completing the profile.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-members")]
        public async Task<ActionResult<IEnumerable<FamilyMemberDTO>>> GetPendingMembers()
        {
            try
            {
                var pendingMembers = await _familyService.GetPendingMembersAsync();
                return Ok(pendingMembers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending members");
                return StatusCode(500, "An error occurred while retrieving pending members.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("members/{memberId}/approve")]
        public async Task<ActionResult<FamilyMemberDTO>> ApproveMember(int memberId)
        {
            try
            {
                int adminId = User.GetUserId();
                var member = await _familyService.ApproveMemberAsync(memberId, adminId);
                return Ok(member);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving member");
                return StatusCode(500, "An error occurred while approving the member.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("members/{memberId}/reject")]
        public async Task<ActionResult> RejectMember(int memberId, [FromBody] RejectMemberDTO rejectDto)
        {
            try
            {
                int adminId = User.GetUserId();
                await _familyService.RejectMemberAsync(memberId, adminId, rejectDto.Reason);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting member");
                return StatusCode(500, "An error occurred while rejecting the member.");
            }
        }
    }
} 