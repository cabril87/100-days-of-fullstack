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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Family members controller - manages family member information and relationships.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class FamilyMembersController : BaseApiController
    {
        private readonly ILogger<FamilyMembersController> _logger;
        private readonly IFamilyMemberService _familyMemberService;

        public FamilyMembersController(ILogger<FamilyMembersController> logger, IFamilyMemberService familyMemberService)
        {
            _logger = logger;
            _familyMemberService = familyMemberService; 
        }

        // GET: api/FamilyMembers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyPersonDTO>>> GetAllFamilyMembers()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyPersonDTO> members = await _familyMemberService.GetAllAsync();
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all family members");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/FamilyMembers/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<FamilyPersonDTO>> GetFamilyMemberById(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyPersonDTO? member = await _familyMemberService.GetByIdAsync(id);
                if (member == null)
                    return NotFound();

                return Ok(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family member with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/FamilyMembers/{id}/details
        [HttpGet("{id}/details")]
        public async Task<ActionResult<FamilyPersonDetailDTO>> GetFamilyMemberDetails(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyPersonDetailDTO? member = await _familyMemberService.GetDetailsByIdAsync(id);
                if (member == null)
                    return NotFound();

                return Ok(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family member details with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/FamilyMembers
        [HttpPost]
        public async Task<ActionResult<FamilyPersonDTO>> CreateFamilyMember(CreateFamilyPersonDTO memberDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyPersonDTO member = await _familyMemberService.CreateAsync(memberDto, userId);
                return CreatedAtAction(nameof(GetFamilyMemberById), new { id = member.Id }, member);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating family member");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/FamilyMembers/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<FamilyPersonDTO>> UpdateFamilyMember(int id, UpdateFamilyPersonDTO memberDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyPersonDTO? member = await _familyMemberService.UpdateAsync(id, memberDto, userId);
                if (member == null)
                    return NotFound();

                return Ok(member);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating family member with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/FamilyMembers/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFamilyMember(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _familyMemberService.DeleteAsync(id, userId);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting family member with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
} 