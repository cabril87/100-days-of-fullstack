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
        private readonly IInvitationService _invitationService;
        private readonly ILogger<FamilyController> _logger;

        public FamilyController(
            IFamilyService familyService,
            IInvitationService invitationService,
            ILogger<FamilyController> logger)
        {
            _familyService = familyService;
            _invitationService = invitationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyDTO>>> GetAllFamilies()
        {
            try
            {
                int userId = User.GetUserId();
                var families = await _familyService.GetByUserIdAsync(userId);
                return Ok(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving families");
                return StatusCode(500, "An error occurred while retrieving families.");
            }
        }

        
         [HttpPost("createFamily")]
        public async Task<ActionResult<FamilyDTO>> CreateFamily([FromBody] FamilyCreateDTO familyDto)
        {
            try
            {
                int userId = User.GetUserId();
                var family = await _familyService.CreateAsync(familyDto, userId);
                return Ok(new
                {
                    family = family,
                    message = "Family created successfully. You are now the leader of this family. Use the invite endpoint to invite members."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating family with details: {ex.Message}");
                // Log inner exception if exists
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, $"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"An error occurred while creating the family: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FamilyDTO>> GetFamily(int id)
        {
            try
            {
                var family = await _familyService.GetByIdAsync(id);
                if (family == null)
                {
                    return NotFound();
                }
                return Ok(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family");
                return StatusCode(500, "An error occurred while retrieving the family.");
            }
        }

        [HttpPost("{familyId}/invitations")]
        public async Task<ActionResult<InvitationDTO>> CreateInvitation(int familyId, [FromBody] InvitationCreateDTO invitationDto)
        {
            try
            {
                int userId = User.GetUserId();

                // Validate familyId matches the one in the DTO
                if (familyId != invitationDto.FamilyId)
                {
                    return BadRequest("Family ID in the URL does not match the Family ID in the request body");
                }

                var invitation = await _invitationService.CreateAsync(invitationDto, userId);
                return Ok(new
                {
                    invitation = invitation,
                    message = "Invitation created successfully. The recipient can use the provided token to join the family."
                });
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
                _logger.LogError(ex, "Error creating invitation: {Message}", ex.Message);
                return StatusCode(500, "An error occurred while creating the invitation.");
            }
        }

        [HttpGet("{familyId}/invitations")]
        public async Task<ActionResult<IEnumerable<InvitationDTO>>> GetFamilyInvitations(int familyId)
        {
            try
            {
                int userId = User.GetUserId();
                var invitations = await _invitationService.GetByFamilyIdAsync(familyId, userId);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family invitations");
                return StatusCode(500, "An error occurred while retrieving family invitations.");
            }
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

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFamily(int id)
        {
            try
            {
                _logger.LogInformation("Received request to delete family with ID: {FamilyId}", id);
                int userId = User.GetUserId();
                
                // First check if the family exists
                var family = await _familyService.GetByIdAsync(id);
                if (family == null)
                {
                    _logger.LogWarning("Family with ID {FamilyId} not found for deletion", id);
                    return NotFound("Family not found.");
                }
                
                bool result = await _familyService.DeleteAsync(id, userId);
                
                if (!result)
                {
                    _logger.LogWarning("User {UserId} is not authorized to delete family {FamilyId}", userId, id);
                    return Unauthorized("You don't have permission to delete this family. Only the family creator or administrators with sufficient permissions can delete a family.");
                }
                
                _logger.LogInformation("Family with ID {FamilyId} successfully deleted by user {UserId}", id, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempting to delete family {FamilyId}", id);
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting family with ID {FamilyId}", id);
                return StatusCode(500, "An error occurred while deleting the family.");
            }
        }
    }
} 