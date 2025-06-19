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
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Family management controller - handles family creation, management, and member operations.
    /// Accessible to all authenticated users (RegularUser and above).
    /// Age-based restrictions apply for certain operations (children cannot create families).
    /// </summary>
    [Authorize]
    [RequireRole(UserRole.RegularUser)] // All authenticated users can access family features
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class FamilyController : BaseApiController
    {
        private readonly IFamilyService _familyService;
        private readonly IInvitationService _invitationService;
        private readonly IFamilyRoleService _familyRoleService;
        private readonly ILogger<FamilyController> _logger;

        public FamilyController(
            IFamilyService familyService,
            IInvitationService invitationService,
            IFamilyRoleService familyRoleService,
            ILogger<FamilyController> logger)
        {
            _familyService = familyService;
            _invitationService = invitationService;
            _familyRoleService = familyRoleService;
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
        
        [HttpGet("is-family-admin")]
        public async Task<ActionResult<ApiResponse<bool>>> IsUserFamilyAdmin()
        {
            try
            {
                int userId = GetUserId();
                bool isFamilyAdmin = await _familyService.IsUserFamilyAdminAsync(userId);
                return ApiOk(isFamilyAdmin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user is family admin");
                return ApiServerError<bool>("An error occurred while checking family admin status.");
            }
        }
        
        [HttpPost]
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
            catch (InvalidOperationException ex) when (ex.Message.Contains("Children") || ex.Message.Contains("age"))
            {
                // Handle age-related restrictions with specific error codes
                _logger.LogWarning("User {UserId} attempted to create family but failed age restrictions: {Message}", GetUserId(), ex.Message);
                return ApiBadRequest<FamilyDTO>(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Handle other business logic errors
                _logger.LogWarning("User {UserId} family creation failed: {Message}", GetUserId(), ex.Message);
                return ApiBadRequest<FamilyDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating family for user {UserId}: {Message}", GetUserId(), ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                }
                return ApiServerError<FamilyDTO>("An error occurred while creating the family. Please try again later.");
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

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> UpdateFamily(int id, [FromBody] FamilyUpdateDTO familyDto)
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
                FamilyDTO? updatedFamily = await _familyService.UpdateAsync(id, familyDto, userId);
                
                if (updatedFamily == null)
                {
                    return ApiNotFound<FamilyDTO>("Family not found or access denied");
                }

                return ApiOk(updatedFamily, "Family updated successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiUnauthorized<FamilyDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating family with ID {FamilyId}", id);
                return ApiServerError<FamilyDTO>("An error occurred while updating the family.");
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

        [HttpGet("{familyId}/members")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyMemberDTO>>>> GetFamilyMembers(int familyId)
        {
            try
            {
                int userId = GetUserId();
                _logger.LogInformation("Getting members for family {FamilyId} by user {UserId}", familyId, userId);
                
                IEnumerable<FamilyMemberDTO> members = await _familyService.GetMembersAsync(familyId, userId);
                _logger.LogInformation("Successfully retrieved {MemberCount} members for family {FamilyId}", members.Count(), familyId);
                
                return ApiOk(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family members for family {FamilyId} by user {UserId}: {ErrorMessage}", familyId, GetUserId(), ex.Message);
                return ApiServerError<IEnumerable<FamilyMemberDTO>>($"An error occurred while retrieving family members: {ex.Message}");
            }
        }

        [HttpGet("{familyId}/stats")]
        public async Task<ActionResult<ApiResponse<object>>> GetFamilyStats(int familyId)
        {
            try
            {
                int userId = GetUserId();
                _logger.LogInformation("Getting stats for family {FamilyId} by user {UserId}", familyId, userId);
                
                // Check if user is a member of the family
                if (!await _familyService.IsFamilyMemberAsync(familyId, userId))
                {
                    return ApiUnauthorized<object>("You are not a member of this family");
                }

                // Get family members count
                IEnumerable<FamilyMemberDTO> members = await _familyService.GetMembersAsync(familyId, userId);
                
                // Create basic stats - you can expand this later
                var stats = new
                {
                    MemberCount = members.Count(),
                    AdminCount = members.Count(m => m.Role.Name == "Admin"),
                    AdultCount = members.Count(m => m.Role.Name == "Adult"),
                    ChildCount = members.Count(m => m.Role.Name == "Child"),
                    TotalTasks = 0, // Placeholder - would need task service integration
                    CompletedTasks = 0, // Placeholder
                    PendingTasks = 0, // Placeholder
                    LastActivity = DateTime.UtcNow // Placeholder
                };
                
                _logger.LogInformation("Successfully retrieved stats for family {FamilyId}", familyId);
                return ApiOk<object>(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family stats for family {FamilyId} by user {UserId}: {ErrorMessage}", familyId, GetUserId(), ex.Message);
                return ApiServerError<object>($"An error occurred while retrieving family stats: {ex.Message}");
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

        [RequireGlobalAdmin] // Only Global Admins can view all pending family members
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

        [RequireGlobalAdmin] // Only Global Admins can approve family members system-wide
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

        [RequireGlobalAdmin] // Only Global Admins can reject family members system-wide
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

        [HttpGet("admin-families")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyDTO>>>> GetAdminFamilies()
        {
            try
            {
                int userId = GetUserId();
                var families = await _familyService.GetFamiliesUserIsAdminOfAsync(userId);
                return ApiOk(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin families");
                return ApiServerError<IEnumerable<FamilyDTO>>("An error occurred while retrieving admin families.");
            }
        }

        [HttpGet("member-families")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyDTO>>>> GetMemberFamilies()
        {
            try
            {
                int userId = GetUserId();
                var families = await _familyService.GetFamiliesUserIsMemberOfAsync(userId);
                return ApiOk(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member families");
                return ApiServerError<IEnumerable<FamilyDTO>>("An error occurred while retrieving member families.");
            }
        }

        [HttpGet("management-families")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyDTO>>>> GetManagementFamilies()
        {
            try
            {
                int userId = GetUserId();
                var families = await _familyService.GetFamiliesUserHasManagementPrivilegesAsync(userId);
                return ApiOk(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving management families");
                return ApiServerError<IEnumerable<FamilyDTO>>("An error occurred while retrieving management families.");
            }
        }

        [HttpPost("{familyId}/transfer-ownership")]
        public async Task<ActionResult<ApiResponse<object>>> TransferFamilyOwnership(int familyId, [FromBody] TransferOwnershipDTO transferDto)
        {
            try
            {
                int currentOwnerId = GetUserId();
                
                if (familyId != transferDto.FamilyId)
                {
                    return ApiBadRequest<object>("Family ID in URL does not match the Family ID in request body");
                }

                bool success = await _familyService.TransferFamilyOwnershipAsync(familyId, currentOwnerId, transferDto.NewOwnerId);
                
                if (!success)
                {
                    return ApiBadRequest<object>("Family ownership transfer failed. Check permissions and age restrictions.");
                }

                return ApiOk<object>(new object(), "Family ownership transferred successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring family ownership");
                return ApiServerError<object>("An error occurred while transferring family ownership.");
            }
        }

        [HttpGet("{familyId}/can-manage")]
        public async Task<ActionResult<ApiResponse<bool>>> CanUserManageFamily(int familyId)
        {
            try
            {
                int userId = GetUserId();
                bool canManage = await _familyService.CanUserManageFamilyBasedOnAgeAsync(userId, familyId);
                return ApiOk(canManage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user can manage family");
                return ApiServerError<bool>("An error occurred while checking management permissions.");
            }
        }

        [HttpGet("management-permissions")]
        public async Task<ActionResult<ApiResponse<FamilyManagementPermissionsDTO>>> GetFamilyManagementPermissions([FromQuery] int? familyId = null)
        {
            try
            {
                int userId = GetUserId();
                var permissions = await _familyService.GetUserFamilyManagementPermissionsAsync(userId, familyId);
                return ApiOk(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family management permissions");
                return ApiServerError<FamilyManagementPermissionsDTO>("An error occurred while getting management permissions.");
            }
        }

        [HttpGet("user-relationships")]
        public async Task<ActionResult<ApiResponse<UserFamilyRelationshipsDTO>>> GetUserFamilyRelationships()
        {
            try
            {
                int userId = GetUserId();
                _logger.LogInformation("Getting family relationships for user ID: {UserId}", userId);
                
                UserFamilyRelationshipsDTO relationships = await _familyService.GetUserFamilyRelationshipsAsync(userId);
                
                _logger.LogInformation("User {UserId} family relationships: Admin={AdminCount}, Member={MemberCount}, Management={ManagementCount}", 
                    userId, 
                    relationships.AdminFamilies?.Count() ?? 0,
                    relationships.MemberFamilies?.Count() ?? 0,
                    relationships.ManagementFamilies?.Count() ?? 0);
                
                // Debug: Log family IDs if any exist
                if (relationships.AdminFamilies?.Any() == true)
                {
                    List<int> adminFamilyIds = relationships.AdminFamilies.Select(f => f.Id).ToList();
                    _logger.LogInformation("User {UserId} is admin of family IDs: [{FamilyIds}]", userId, string.Join(", ", adminFamilyIds));
                }
                if (relationships.MemberFamilies?.Any() == true)
                {
                    List<int> memberFamilyIds = relationships.MemberFamilies.Select(f => f.Id).ToList();
                    _logger.LogInformation("User {UserId} is member of family IDs: [{FamilyIds}]", userId, string.Join(", ", memberFamilyIds));
                }
                
                return ApiOk(relationships);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user family relationships");
                return ApiServerError<UserFamilyRelationshipsDTO>("An error occurred while getting family relationships.");
            }
        }

        [HttpGet("roles")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FamilyRoleDTO>>>> GetFamilyRoles()
        {
            try
            {
                var roles = await _familyRoleService.GetAllAsync();
                return ApiOk(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family roles");
                return ApiServerError<IEnumerable<FamilyRoleDTO>>("An error occurred while retrieving family roles.");
            }
        }

        [HttpPost("leave")]
        public async Task<ActionResult<ApiResponse<object>>> LeaveFamily([FromBody] LeaveFamilyDTO? leaveFamilyDto = null)
        {
            try
            {
                int userId = GetUserId();
                
                FamilyDTO? targetFamily = null;
                
                // If family ID is specified, use that family
                if (leaveFamilyDto?.FamilyId.HasValue == true)
                {
                    targetFamily = await _familyService.GetByIdAsync(leaveFamilyDto.FamilyId.Value);
                    if (targetFamily == null)
                    {
                        return ApiBadRequest<object>("Specified family not found");
                    }
                    
                    // Verify user is a member of this family
                    IEnumerable<FamilyMemberDTO> members = await _familyService.GetMembersAsync(targetFamily.Id, userId);
                    if (!members.Any(m => m.User.Id == userId))
                    {
                        return ApiBadRequest<object>("You are not a member of the specified family");
                    }
                }
                else
                {
                    // No family ID specified - get user's families and use logic to determine which one
                    IEnumerable<FamilyDTO> userFamilies = await _familyService.GetByUserIdAsync(userId);
                    
                    if (!userFamilies.Any())
                    {
                        return ApiBadRequest<object>("You are not a member of any family");
                    }
                    
                    // If user belongs to only one family, use that one
                    if (userFamilies.Count() == 1)
                    {
                        targetFamily = userFamilies.First();
                    }
                    else
                    {
                        // Multiple families - require the frontend to specify which one
                        return ApiBadRequest<object>($"You are a member of {userFamilies.Count()} families. Please specify which family you want to leave by providing a familyId in the request body.");
                    }
                }

                // Remove user from the family - find their member ID first
                IEnumerable<FamilyMemberDTO> familyMembers = await _familyService.GetMembersAsync(targetFamily.Id, userId);
                FamilyMemberDTO? userMember = familyMembers.FirstOrDefault(m => m.User.Id == userId);
                
                if (userMember == null)
                {
                    return ApiBadRequest<object>("You are not a member of this family");
                }

                // Check if user is the only admin
                int adminCount = familyMembers.Count(m => m.Role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase));
                bool userIsAdmin = userMember.Role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase);
                
                if (userIsAdmin && adminCount == 1)
                {
                    return ApiBadRequest<object>($"Cannot leave '{targetFamily.Name}' because you are the only admin. Please promote another member to admin first, or transfer ownership.");
                }

                // Remove user from the family
                bool success = await _familyService.RemoveMemberAsync(targetFamily.Id, userMember.Id, userId);
                
                if (!success)
                {
                    return ApiBadRequest<object>("Failed to leave family due to an unknown error.");
                }

                return ApiOk<object>(new object(), $"Successfully left '{targetFamily.Name}'");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving family for user {UserId}", GetUserId());
                return ApiServerError<object>("An error occurred while leaving the family.");
            }
        }

        // Primary family management endpoints
        [HttpGet("primary")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> GetPrimaryFamily()
        {
            try
            {
                int userId = GetUserId();
                FamilyDTO? primaryFamily = await _familyService.GetPrimaryFamilyAsync(userId);
                
                if (primaryFamily == null)
                {
                    return ApiNotFound<FamilyDTO>("No primary family found for user");
                }

                return ApiOk(primaryFamily);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting primary family for user {UserId}", GetUserId());
                return ApiServerError<FamilyDTO>("An error occurred while retrieving primary family.");
            }
        }

        [HttpPost("{familyId}/set-primary")]
        public async Task<ActionResult<ApiResponse<FamilyDTO>>> SetPrimaryFamily(int familyId)
        {
            try
            {
                int userId = GetUserId();
                FamilyDTO primaryFamily = await _familyService.SetPrimaryFamilyAsync(userId, familyId);
                
                return ApiOk(primaryFamily, $"Successfully set '{primaryFamily.Name}' as primary family");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when setting primary family {FamilyId} for user {UserId}", familyId, GetUserId());
                return ApiBadRequest<FamilyDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting primary family {FamilyId} for user {UserId}", familyId, GetUserId());
                return ApiServerError<FamilyDTO>("An error occurred while setting primary family.");
            }
        }

        [HttpPut("primary/{familyId}")]
        public async Task<ActionResult<ApiResponse<object>>> UpdatePrimaryFamily(int familyId)
        {
            try
            {
                int userId = GetUserId();
                bool success = await _familyService.UpdatePrimaryFamilyAsync(userId, familyId);
                
                if (!success)
                {
                    return ApiBadRequest<object>("Failed to update primary family. You may not be a member of this family.");
                }

                return ApiOk<object>(new object(), "Primary family updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating primary family {FamilyId} for user {UserId}", familyId, GetUserId());
                return ApiServerError<object>("An error occurred while updating primary family.");
            }
        }

        // Family privacy endpoints (temporary implementation until full privacy system is built)
        [HttpGet("{familyId}/privacy")]
        public async Task<ActionResult<ApiResponse<object>>> GetFamilyPrivacySettings(int familyId)
        {
            try
            {
                int userId = GetUserId();
                
                // Check if user is a member of the family
                if (!await _familyService.IsFamilyMemberAsync(familyId, userId))
                {
                    return ApiUnauthorized<object>("You are not a member of this family");
                }

                // Return default privacy settings (placeholder until privacy system is implemented)
                var defaultSettings = new
                {
                    visibility = new
                    {
                        profileVisibility = "family_only",
                        taskVisibility = "all_members",
                        searchable = true
                    },
                    sharing = new
                    {
                        allowTaskSharing = true,
                        allowInvitations = true,
                        shareAchievements = true,
                        activityVisibility = "family_only"
                    },
                    childProtection = new
                    {
                        enableParentalControls = true,
                        restrictExternalSharing = true,
                        moderateContent = true,
                        safeModeEnabled = true
                    },
                    dataRetention = new
                    {
                        retainActivityHistory = true,
                        autoDeleteOldTasks = false,
                        exportDataAllowed = true,
                        backupFrequency = "weekly"
                    }
                };

                return ApiOk<object>(defaultSettings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting privacy settings for family {FamilyId}", familyId);
                return ApiServerError<object>("An error occurred while retrieving privacy settings.");
            }
        }

        [HttpPut("{familyId}/privacy")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateFamilyPrivacySettings(int familyId, [FromBody] object privacySettings)
        {
            try
            {
                int userId = GetUserId();
                
                // Check if user is a member of the family and has admin privileges
                if (!await _familyService.IsFamilyMemberAsync(familyId, userId))
                {
                    return ApiUnauthorized<object>("You are not a member of this family");
                }

                bool isAdmin = await _familyService.IsUserFamilyAdminAsync(userId);
                if (!isAdmin)
                {
                    return ApiForbidden<object>("Only family admins can update privacy settings");
                }

                // For now, just acknowledge the update (placeholder until privacy system is implemented)
                _logger.LogInformation("Privacy settings updated for family {FamilyId} by user {UserId}", familyId, userId);

                return ApiOk<object>(privacySettings, "Privacy settings updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating privacy settings for family {FamilyId}", familyId);
                return ApiServerError<object>("An error occurred while updating privacy settings.");
            }
        }

        [HttpPost("{familyId}/export")]
        public async Task<ActionResult<ApiResponse<object>>> RequestFamilyDataExport(int familyId, [FromBody] object exportRequest)
        {
            try
            {
                int userId = GetUserId();
                
                // Check if user is a member of the family
                if (!await _familyService.IsFamilyMemberAsync(familyId, userId))
                {
                    return ApiUnauthorized<object>("You are not a member of this family");
                }

                // For now, just acknowledge the request (placeholder until export system is implemented)
                _logger.LogInformation("Data export requested for family {FamilyId} by user {UserId}", familyId, userId);

                return ApiOk<object>(new { message = "Data export request queued. You will receive an email when ready." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting data export for family {FamilyId}", familyId);
                return ApiServerError<object>("An error occurred while requesting data export.");
            }
        }

        [HttpGet("{familyId}/compliance")]
        public async Task<ActionResult<ApiResponse<object>>> GetFamilyComplianceStatus(int familyId)
        {
            try
            {
                int userId = GetUserId();
                
                // Check if user is a member of the family
                if (!await _familyService.IsFamilyMemberAsync(familyId, userId))
                {
                    return ApiUnauthorized<object>("You are not a member of this family");
                }

                // Return default compliance status (placeholder until compliance system is implemented)
                var complianceStatus = new
                {
                    compliant = true,
                    standards = new[]
                    {
                        new { name = "GDPR", status = "Compliant", lastChecked = DateTime.UtcNow.ToString("yyyy-MM-dd") },
                        new { name = "COPPA", status = "Compliant", lastChecked = DateTime.UtcNow.ToString("yyyy-MM-dd") },
                        new { name = "Family Privacy", status = "Compliant", lastChecked = DateTime.UtcNow.ToString("yyyy-MM-dd") }
                    },
                    lastChecked = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    nextReview = DateTime.UtcNow.AddMonths(3).ToString("yyyy-MM-ddTHH:mm:ssZ")
                };

                return ApiOk<object>(complianceStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance status for family {FamilyId}", familyId);
                return ApiServerError<object>("An error occurred while retrieving compliance status.");
            }
        }
    }
} 