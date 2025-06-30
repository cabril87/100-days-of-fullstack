/*
 * Photo Attachment Controller
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * RESTful API endpoints for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Photos;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Controller for photo attachment operations with task evidence and family sharing
    /// </summary>
    [ApiController]
    [Route("api/v1/family/{familyId:int}/photos")]
    [Authorize]
    public class PhotoAttachmentController : ControllerBase
    {
        private readonly IPhotoAttachmentService _photoService;
        private readonly ILogger<PhotoAttachmentController> _logger;

        public PhotoAttachmentController(
            IPhotoAttachmentService photoService,
            ILogger<PhotoAttachmentController> logger)
        {
            _photoService = photoService;
            _logger = logger;
        }

        /// <summary>
        /// Get all photo attachments for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>List of photo attachments</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<PhotoAttachmentDTO>>>> GetFamilyPhotos(
            [FromRoute] int familyId)
        {
            try
            {
                string? userId = User.GetUserId();
                _logger.LogInformation("Getting family photos for family {FamilyId} by user {UserId}", familyId, userId);

                List<PhotoAttachmentDTO> photos = await _photoService.GetFamilyPhotosAsync(familyId);
                
                return Ok(new ApiResponse<List<PhotoAttachmentDTO>>
                {
                    Success = true,
                    Data = photos,
                    Message = $"Retrieved {photos.Count} photos"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family photos for family {FamilyId}", familyId);
                return StatusCode(500, new ApiResponse<List<PhotoAttachmentDTO>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving photos"
                });
            }
        }

        /// <summary>
        /// Get photo attachments for a specific task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>List of photo attachments</returns>
        [HttpGet("task/{taskId:int}")]
        public async Task<ActionResult<ApiResponse<List<PhotoAttachmentDTO>>>> GetTaskPhotos(
            [FromRoute] int taskId)
        {
            try
            {
                string? userId = User.GetUserId();
                _logger.LogInformation("Getting task photos for task {TaskId} by user {UserId}", taskId, userId);

                List<PhotoAttachmentDTO> photos = await _photoService.GetTaskPhotosAsync(taskId);
                
                return Ok(new ApiResponse<List<PhotoAttachmentDTO>>
                {
                    Success = true,
                    Data = photos,
                    Message = $"Retrieved {photos.Count} photos for task"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task photos for task {TaskId}", taskId);
                return StatusCode(500, new ApiResponse<List<PhotoAttachmentDTO>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving task photos"
                });
            }
        }

        /// <summary>
        /// Upload a new photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="createDto">Photo upload data</param>
        /// <returns>Created photo attachment</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<PhotoAttachmentDTO>>> UploadPhoto(
            [FromRoute] int familyId,
            [FromBody] [Required] CreatePhotoAttachmentDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<PhotoAttachmentDTO>
                    {
                        Success = false,
                        Message = "Invalid photo data provided"
                    });
                }

                string? userIdString = User.GetUserId();
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new ApiResponse<PhotoAttachmentDTO>
                    {
                        Success = false,
                        Message = "Invalid user authentication"
                    });
                }

                _logger.LogInformation("Uploading photo for family {FamilyId} by user {UserId}", familyId, userId);

                PhotoAttachmentDTO photo = await _photoService.CreatePhotoAsync(familyId, userId, createDto);
                
                return CreatedAtAction(
                    nameof(GetPhotoById),
                    new { familyId, photoId = photo.Id },
                    new ApiResponse<PhotoAttachmentDTO>
                    {
                        Success = true,
                        Data = photo,
                        Message = "Photo uploaded successfully"
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading photo for family {FamilyId}", familyId);
                return StatusCode(500, new ApiResponse<PhotoAttachmentDTO>
                {
                    Success = false,
                    Message = "An error occurred while uploading the photo"
                });
            }
        }

        /// <summary>
        /// Get a specific photo attachment by ID
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo attachment details</returns>
        [HttpGet("{photoId}")]
        public async Task<ActionResult<ApiResponse<PhotoAttachmentDTO>>> GetPhotoById(
            [FromRoute] int familyId,
            [FromRoute] string photoId)
        {
            try
            {
                string? userId = User.GetUserId();
                _logger.LogInformation("Getting photo {PhotoId} from family {FamilyId} by user {UserId}", photoId, familyId, userId);

                PhotoAttachmentDTO? photo = await _photoService.GetPhotoByIdAsync(photoId);
                
                if (photo == null)
                {
                    return NotFound(new ApiResponse<PhotoAttachmentDTO>
                    {
                        Success = false,
                        Message = "Photo not found"
                    });
                }
                
                return Ok(new ApiResponse<PhotoAttachmentDTO>
                {
                    Success = true,
                    Data = photo,
                    Message = "Photo retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting photo {PhotoId} from family {FamilyId}", photoId, familyId);
                return StatusCode(500, new ApiResponse<PhotoAttachmentDTO>
                {
                    Success = false,
                    Message = "An error occurred while retrieving the photo"
                });
            }
        }

        /// <summary>
        /// Delete a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Success status</returns>
        [HttpDelete("{photoId}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePhoto(
            [FromRoute] int familyId,
            [FromRoute] string photoId)
        {
            try
            {
                string? userIdString = User.GetUserId();
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Invalid user authentication"
                    });
                }

                _logger.LogInformation("Deleting photo {PhotoId} from family {FamilyId} by user {UserId}", photoId, familyId, userId);

                bool deleted = await _photoService.DeletePhotoAsync(familyId, photoId, userId);
                
                if (!deleted)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Photo not found or could not be deleted"
                    });
                }
                
                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Photo deleted successfully"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to delete photo {PhotoId} from family {FamilyId}", photoId, familyId);
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting photo {PhotoId} from family {FamilyId}", photoId, familyId);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = "An error occurred while deleting the photo"
                });
            }
        }

        /// <summary>
        /// Validate a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="validationDto">Validation data</param>
        /// <returns>Photo validation result</returns>
        [HttpPost("validate")]
        public async Task<ActionResult<ApiResponse<PhotoValidationDTO>>> ValidatePhoto(
            [FromRoute] int familyId,
            [FromBody] [Required] CreatePhotoValidationDTO validationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<PhotoValidationDTO>
                    {
                        Success = false,
                        Message = "Invalid validation data provided"
                    });
                }

                string? userIdString = User.GetUserId();
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new ApiResponse<PhotoValidationDTO>
                    {
                        Success = false,
                        Message = "Invalid user authentication"
                    });
                }

                _logger.LogInformation("Validating photo {PhotoId} in family {FamilyId} by user {UserId}", validationDto.PhotoId, familyId, userId);

                PhotoValidationDTO validation = await _photoService.ValidatePhotoAsync(familyId, userId, validationDto);
                
                return Ok(new ApiResponse<PhotoValidationDTO>
                {
                    Success = true,
                    Data = validation,
                    Message = "Photo validated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating photo in family {FamilyId}", familyId);
                return StatusCode(500, new ApiResponse<PhotoValidationDTO>
                {
                    Success = false,
                    Message = "An error occurred while validating the photo"
                });
            }
        }

        /// <summary>
        /// Share a photo with family members
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="shareDto">Share data</param>
        /// <returns>Photo share result</returns>
        [HttpPost("share")]
        public async Task<ActionResult<ApiResponse<PhotoShareDTO>>> SharePhoto(
            [FromRoute] int familyId,
            [FromBody] [Required] CreatePhotoShareDTO shareDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<PhotoShareDTO>
                    {
                        Success = false,
                        Message = "Invalid share data provided"
                    });
                }

                string? userIdString = User.GetUserId();
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new ApiResponse<PhotoShareDTO>
                    {
                        Success = false,
                        Message = "Invalid user authentication"
                    });
                }

                _logger.LogInformation("Sharing photo {PhotoId} in family {FamilyId} by user {UserId}", shareDto.PhotoId, familyId, userId);

                PhotoShareDTO share = await _photoService.SharePhotoAsync(familyId, userId, shareDto);
                
                return Ok(new ApiResponse<PhotoShareDTO>
                {
                    Success = true,
                    Data = share,
                    Message = "Photo shared successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing photo in family {FamilyId}", familyId);
                return StatusCode(500, new ApiResponse<PhotoShareDTO>
                {
                    Success = false,
                    Message = "An error occurred while sharing the photo"
                });
            }
        }

        /// <summary>
        /// Get photo statistics for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Photo statistics</returns>
        [HttpGet("statistics")]
        public ActionResult<ApiResponse<object>> GetPhotoStatistics(
            [FromRoute] int familyId)
        {
            try
            {
                string? userId = User.GetUserId();
                _logger.LogInformation("Getting photo statistics for family {FamilyId} by user {UserId}", familyId, userId);

                // Temporarily using object until PhotoStatisticsDTO is available
                object stats = new
                {
                    TotalPhotos = 0,
                    TaskEvidencePhotos = 0,
                    AchievementPhotos = 0,
                    TotalStorageUsed = 0L,
                    AverageCompressionRatio = 0.0,
                    PhotosThisMonth = 0,
                    MostActiveUploader = "No data"
                };
                
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = stats,
                    Message = "Photo statistics retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting photo statistics for family {FamilyId}", familyId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving photo statistics"
                });
            }
        }
    }
} 