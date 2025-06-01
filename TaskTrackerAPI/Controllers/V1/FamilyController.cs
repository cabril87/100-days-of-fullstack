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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1
{
    [Authorize]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/family")]
    [ApiController]
    public class FamilyController : BaseApiController
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
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyDTO>>>> GetAllFamilies()
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<FamilyDTO> families = await _familyService.GetByUserIdAsync(userId);
                return ApiOk(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving families");
                return ApiServerError<IEnumerable<FamilyDTO>>("An error occurred while retrieving families.");
            }
        }

        [HttpGet("current-family")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> GetCurrentFamily()
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<FamilyDTO> families = await _familyService.GetByUserIdAsync(userId);
                FamilyDTO? currentFamily = families.FirstOrDefault();
                
                if (currentFamily == null)
                {
                    return ApiNotFound<FamilyDTO>("No family found for the current user");
                }
                
                return ApiOk(currentFamily);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current family");
                return ApiServerError<FamilyDTO>("An error occurred while retrieving the current family.");
            }
        }
        
        [HttpPost("createFamily")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> CreateFamily([FromBody] FamilyCreateDTO familyDto)
        {
            if (!ModelState.IsValid)
            {
                List<string> errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return ApiBadRequest<FamilyDTO>("Invalid family data", errors);
            }

            try
            {
                int userId = GetUserId();
                FamilyDTO family = await _familyService.CreateAsync(familyDto, userId);
                return ApiCreated(family, "Family created successfully. You are now the leader of this family. Use the invite endpoint to invite members.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating family with details: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, $"Inner exception: {ex.InnerException.Message}");
                }
                return ApiServerError<FamilyDTO>($"An error occurred while creating the family: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> GetFamily(int id)
        {
            try
            {
                FamilyDTO? family = await _familyService.GetByIdAsync(id);
                if (family == null)
                {
                    return ApiNotFound<FamilyDTO>();
                }
                return ApiOk(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family");
                return ApiServerError<FamilyDTO>("An error occurred while retrieving the family.");
            }
        }

        [HttpPost("{familyId}/invitations")]
        public async Task<ActionResult<ApiResponse<InvitationDTO>>> CreateInvitation(int familyId, [FromBody] InvitationCreateDTO invitationDto)
        {
            try
            {
                int userId = GetUserId();

                if (familyId != invitationDto.FamilyId)
                {
                    return ApiBadRequest<InvitationDTO>("Family ID in the URL does not match the Family ID in the request body");
                }

                InvitationDTO invitation = await _invitationService.CreateAsync(invitationDto, userId);
                return ApiOk(invitation, "Invitation created successfully. The recipient can use the provided token to join the family.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiUnauthorized<InvitationDTO>(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return ApiBadRequest<InvitationDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invitation: {Message}", ex.Message);
                return ApiServerError<InvitationDTO>("An error occurred while creating the invitation.");
            }
        }

        [HttpGet("{familyId}/invitations")]
        public async Task<ActionResult<ApiResponse<IEnumerable<InvitationDTO>>>> GetFamilyInvitations(int familyId)
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<InvitationDTO> invitations = await _invitationService.GetByFamilyIdAsync(familyId, userId);
                return ApiOk(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family invitations");
                return ApiServerError<IEnumerable<InvitationDTO>>("An error occurred while retrieving family invitations.");
            }
        }

        [Authorize]
        [HttpPost("members/{memberId}/complete-profile")]
        public async Task<ActionResult<ApiResponse<FamilyMemberDTO>>> CompleteMemberProfile(int memberId, [FromBody] CompleteProfileDTO profileDto)
        {
            try
            {
                int userId = GetUserId();
                FamilyMemberDTO member = await _familyService.CompleteMemberProfileAsync(memberId, userId, profileDto);
                return ApiOk(member, "Member profile completed successfully.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiUnauthorized<FamilyMemberDTO>(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return ApiBadRequest<FamilyMemberDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing member profile");
                return ApiServerError<FamilyMemberDTO>("An error occurred while completing the profile.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-members")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyMemberDTO>>>> GetPendingMembers()
        {
            try
            {
                IEnumerable<FamilyMemberDTO> pendingMembers = await _familyService.GetPendingMembersAsync();
                return ApiOk(pendingMembers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending members");
                return ApiServerError<IEnumerable<FamilyMemberDTO>>("An error occurred while retrieving pending members.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("members/{memberId}/approve")]
        public async Task<ActionResult<ApiResponse<FamilyMemberDTO>>> ApproveMember(int memberId)
        {
            try
            {
                int adminId = GetUserId();
                FamilyMemberDTO member = await _familyService.ApproveMemberAsync(memberId, adminId);
                return ApiOk(member, "Member approved successfully.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiUnauthorized<FamilyMemberDTO>(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return ApiBadRequest<FamilyMemberDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving member");
                return ApiServerError<FamilyMemberDTO>("An error occurred while approving the member.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("members/{memberId}/reject")]
        public async Task<ActionResult<ApiResponse<object>>> RejectMember(int memberId, [FromBody] RejectMemberDTO rejectDto)
        {
            try
            {
                int adminId = GetUserId();
                await _familyService.RejectMemberAsync(memberId, adminId, rejectDto.Reason);
                return ApiOk<object>(new object(), "Member rejected successfully.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiUnauthorized<object>(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return ApiBadRequest<object>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting member");
                return ApiServerError<object>("An error occurred while rejecting the member.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteFamily(int id)
        {
            try
            {
                _logger.LogInformation("Received request to delete family with ID: {FamilyId}", id);
                int userId = GetUserId();
                
                // First check if the family exists
                FamilyDTO? family = await _familyService.GetByIdAsync(id);
                if (family == null)
                {
                    _logger.LogWarning("Family with ID {FamilyId} not found for deletion", id);
                    return ApiNotFound<object>($"Family with ID {id} not found");
                }
                
                // Check if user is admin or creator
                bool isAdmin = await _familyService.IsUserAdminOfFamilyAsync(userId, id);  
                if (!isAdmin)
                {
                    _logger.LogWarning("User {UserId} attempted to delete family {FamilyId} without admin rights", userId, id);
                    return ApiUnauthorized<object>("You do not have permission to delete this family.");
                }
                
                bool deleteSuccess = await _familyService.DeleteAsync(id, userId);
                
                if (!deleteSuccess)
                {
                    _logger.LogError("Failed to delete family with ID {FamilyId}", id);
                    return ApiServerError<object>($"Failed to delete family with ID {id}. The deletion operation was not successful.");
                }
                
                // Double-check that the family was actually deleted
                FamilyDTO? familyAfterDelete = await _familyService.GetByIdAsync(id);
                if (familyAfterDelete != null)
                {
                    _logger.LogError("Family with ID {FamilyId} was reported as deleted but still exists", id);
                    return ApiServerError<object>($"Deletion inconsistency: Family with ID {id} still exists after deletion.");
                }
                
                _logger.LogInformation("Family with ID {FamilyId} deleted successfully", id);
                return ApiOk<object>(new object(), "Family deleted successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting family with ID {FamilyId}", id);
                return ApiServerError<object>($"An error occurred while deleting the family: {ex.Message}");
            }
        }
    }
} 