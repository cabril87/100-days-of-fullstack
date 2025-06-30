/*
 * Photo Attachment Service Implementation
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Business logic layer for photo attachment operations
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using AutoMapper;
using TaskTrackerAPI.DTOs.Photos;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service for photo attachment operations with enterprise-grade business logic
    /// </summary>
    public class PhotoAttachmentService : IPhotoAttachmentService
    {
        private readonly IPhotoAttachmentRepository _photoRepository;
        private readonly IFamilyRepository _familyRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PhotoAttachmentService> _logger;

        public PhotoAttachmentService(
            IPhotoAttachmentRepository photoRepository,
            IFamilyRepository familyRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<PhotoAttachmentService> logger)
        {
            _photoRepository = photoRepository;
            _familyRepository = familyRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Get all photo attachments for a specific family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>List of photo attachment DTOs</returns>
        public async Task<List<PhotoAttachmentDTO>> GetFamilyPhotosAsync(int familyId)
        {
            try
            {
                _logger.LogInformation("Fetching photos for family {FamilyId}", familyId);

                // Verify family exists
                Family? family = await _familyRepository.GetByIdAsync(familyId);
                if (family == null)
                {
                    throw new NotFoundException($"Family with ID {familyId} not found");
                }

                IEnumerable<PhotoAttachment> photos = await _photoRepository.GetFamilyPhotosAsync(familyId);
                List<PhotoAttachmentDTO> photoDtos = _mapper.Map<List<PhotoAttachmentDTO>>(photos);

                _logger.LogInformation("Retrieved {Count} photos for family {FamilyId}", photoDtos.Count, familyId);
                return photoDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching photos for family {FamilyId}", familyId);
                throw;
            }
        }

        /// <summary>
        /// Get photo attachments for a specific task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>List of photo attachment DTOs</returns>
        public async Task<List<PhotoAttachmentDTO>> GetTaskPhotosAsync(int taskId)
        {
            try
            {
                _logger.LogInformation("Fetching photos for task {TaskId}", taskId);

                IEnumerable<PhotoAttachment> photos = await _photoRepository.GetTaskPhotosAsync(taskId);
                List<PhotoAttachmentDTO> photoDtos = _mapper.Map<List<PhotoAttachmentDTO>>(photos);

                _logger.LogInformation("Retrieved {Count} photos for task {TaskId}", photoDtos.Count, taskId);
                return photoDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching photos for task {TaskId}", taskId);
                throw;
            }
        }

        /// <summary>
        /// Get a specific photo attachment by ID
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo attachment DTO or null</returns>
        public async Task<PhotoAttachmentDTO?> GetPhotoByIdAsync(string photoId)
        {
            try
            {
                _logger.LogInformation("Getting photo {PhotoId}", photoId);

                PhotoAttachment? photo = await _photoRepository.GetPhotoByExternalIdAsync(photoId);
                if (photo == null)
                {
                    return null;
                }

                PhotoAttachmentDTO photoDto = _mapper.Map<PhotoAttachmentDTO>(photo);
                
                _logger.LogInformation("Retrieved photo {PhotoId} successfully", photoId);
                return photoDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting photo {PhotoId}", photoId);
                throw;
            }
        }

        /// <summary>
        /// Create a new photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="createDto">Photo creation data</param>
        /// <returns>Created photo attachment DTO</returns>
        public async Task<PhotoAttachmentDTO> CreatePhotoAsync(int familyId, int userId, CreatePhotoAttachmentDTO createDto)
        {
            try
            {
                _logger.LogInformation("Creating photo for family {FamilyId} by user {UserId}", familyId, userId);

                // Verify family exists
                Family? family = await _familyRepository.GetByIdAsync(familyId);
                if (family == null)
                {
                    throw new NotFoundException($"Family with ID {familyId} not found");
                }

                User? user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    throw new NotFoundException($"User with ID {userId} not found");
                }

                // Create photo attachment model
                PhotoAttachment photoAttachment = new PhotoAttachment
                {
                    ExternalId = Guid.NewGuid().ToString(),
                    FileName = createDto.FileName,
                    OriginalSize = createDto.OriginalSize,
                    CompressedSize = createDto.CompressedSize,
                    FilePath = $"/api/v1/photos/{Guid.NewGuid()}", // Generate URL
                    ThumbnailPath = $"/api/v1/photos/{Guid.NewGuid()}/thumbnail", // Generate thumbnail URL
                    MimeType = createDto.MimeType,
                    CapturedAt = DateTime.UtcNow,
                    TaskId = createDto.TaskId,
                    UserId = userId,
                    FamilyId = familyId,
                    IsTaskEvidence = createDto.IsTaskEvidence,
                    IsAchievementPhoto = createDto.IsAchievementPhoto,
                    CompressionRatio = createDto.CompressionRatio,
                    Width = createDto.Metadata.Width,
                    Height = createDto.Metadata.Height,
                    DeviceInfo = createDto.Metadata.DeviceInfo,
                    Latitude = createDto.Metadata.Location?.Latitude,
                    Longitude = createDto.Metadata.Location?.Longitude
                };

                // TODO: Store actual photo data (file system, cloud storage, etc.)
                // For now, we're just storing metadata

                PhotoAttachment createdPhoto = await _photoRepository.CreatePhotoAsync(photoAttachment);
                PhotoAttachmentDTO photoDto = _mapper.Map<PhotoAttachmentDTO>(createdPhoto);

                _logger.LogInformation("Created photo {PhotoId} for family {FamilyId}", createdPhoto.ExternalId, familyId);
                return photoDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating photo for family {FamilyId} by user {UserId}", familyId, userId);
                throw;
            }
        }

        /// <summary>
        /// Delete a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="photoId">Photo identifier</param>
        /// <param name="userId">User identifier requesting deletion</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeletePhotoAsync(int familyId, string photoId, int userId)
        {
            try
            {
                _logger.LogInformation("Deleting photo {PhotoId} from family {FamilyId} by user {UserId}", photoId, familyId, userId);

                // Verify photo exists and belongs to family (using external ID)
                PhotoAttachment? photo = await _photoRepository.GetPhotoByExternalIdAsync(photoId);
                if (photo == null)
                {
                    throw new NotFoundException($"Photo with ID {photoId} not found");
                }

                if (photo.FamilyId != familyId)
                {
                    throw new UnauthorizedAccessException($"Photo {photoId} does not belong to family {familyId}");
                }

                // Only allow deletion by photo owner or family admin
                if (photo.UserId != userId)
                {
                    FamilyMember? familyMember = await _familyRepository.GetFamilyMemberAsync(familyId, userId);
                    if (familyMember?.Role?.Name != "Admin" && familyMember?.Role?.Name != "Parent")
                    {
                        throw new UnauthorizedAccessException("You don't have permission to delete this photo");
                    }
                }

                bool deleted = await _photoRepository.DeletePhotoAsync(photo.Id); // Use internal ID for deletion
                
                if (deleted)
                {
                    _logger.LogInformation("Deleted photo {PhotoId} from family {FamilyId}", photoId, familyId);
                }
                else
                {
                    _logger.LogWarning("Failed to delete photo {PhotoId} from family {FamilyId}", photoId, familyId);
                }

                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting photo {PhotoId} from family {FamilyId}", photoId, familyId);
                throw;
            }
        }

        /// <summary>
        /// Validate a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier performing validation</param>
        /// <param name="validationDto">Validation data</param>
        /// <returns>Photo validation DTO</returns>
        public async Task<PhotoValidationDTO> ValidatePhotoAsync(int familyId, int userId, CreatePhotoValidationDTO validationDto)
        {
            try
            {
                _logger.LogInformation("Validating photo {PhotoId} in family {FamilyId} by user {UserId}", validationDto.PhotoId, familyId, userId);

                // Verify photo exists and belongs to family (using external ID)
                PhotoAttachment? photo = await _photoRepository.GetPhotoByExternalIdAsync(validationDto.PhotoId);
                if (photo == null)
                {
                    throw new NotFoundException($"Photo with ID {validationDto.PhotoId} not found");
                }

                if (photo.FamilyId != familyId)
                {
                    throw new UnauthorizedAccessException($"Photo {validationDto.PhotoId} does not belong to family {familyId}");
                }

                // Calculate validation score based on type
                int validationScore = validationDto.ValidationType switch
                {
                    "automatic" => 85, // AI-based validation
                    "family_review" => 95, // Human review
                    "self_validated" => 70, // Self-assessment
                    _ => 50
                };

                PhotoValidation validation = new PhotoValidation
                {
                    PhotoAttachmentId = photo.Id,
                    IsValid = validationScore >= 70,
                    ValidationType = validationDto.ValidationType,
                    ValidatedBy = userId,
                    ValidatedAt = DateTime.UtcNow,
                    ValidationScore = validationScore,
                    Feedback = validationDto.Feedback
                };

                PhotoValidation createdValidation = await _photoRepository.CreatePhotoValidationAsync(validation);
                PhotoValidationDTO validationDtoResult = _mapper.Map<PhotoValidationDTO>(createdValidation);

                _logger.LogInformation("Validated photo {PhotoId} with score {Score}", validationDto.PhotoId, validationScore);
                return validationDtoResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating photo {PhotoId} in family {FamilyId}", validationDto.PhotoId, familyId);
                throw;
            }
        }

        /// <summary>
        /// Share a photo with family members
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier sharing the photo</param>
        /// <param name="shareDto">Share data</param>
        /// <returns>Photo share DTO</returns>
        public async Task<PhotoShareDTO> SharePhotoAsync(int familyId, int userId, CreatePhotoShareDTO shareDto)
        {
            try
            {
                _logger.LogInformation("Sharing photo {PhotoId} in family {FamilyId} by user {UserId}", shareDto.PhotoId, familyId, userId);

                // Verify photo exists and belongs to family (using external ID)
                PhotoAttachment? photo = await _photoRepository.GetPhotoByExternalIdAsync(shareDto.PhotoId);
                if (photo == null)
                {
                    throw new NotFoundException($"Photo with ID {shareDto.PhotoId} not found");
                }

                if (photo.FamilyId != familyId)
                {
                    throw new UnauthorizedAccessException($"Photo {shareDto.PhotoId} does not belong to family {familyId}");
                }

                PhotoShare photoShare = new PhotoShare
                {
                    PhotoAttachmentId = photo.Id,
                    SharedBy = userId,
                    SharedAt = DateTime.UtcNow,
                    ShareMessage = shareDto.ShareMessage
                };

                PhotoShare createdShare = await _photoRepository.CreatePhotoShareAsync(photoShare);
                PhotoShareDTO shareDtoResult = _mapper.Map<PhotoShareDTO>(createdShare);

                _logger.LogInformation("Shared photo {PhotoId} with {MemberCount} family members", shareDto.PhotoId, shareDto.SharedWith.Length);
                return shareDtoResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing photo {PhotoId} in family {FamilyId}", shareDto.PhotoId, familyId);
                throw;
            }
        }

        /// <summary>
        /// Get photo statistics for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Photo statistics DTO</returns>
        public async Task<PhotoStatisticsDTO> GetPhotoStatisticsAsync(int familyId)
        {
            try
            {
                _logger.LogInformation("Fetching photo statistics for family {FamilyId}", familyId);

                // Verify family exists
                Family? family = await _familyRepository.GetByIdAsync(familyId);
                if (family == null)
                {
                    throw new NotFoundException($"Family with ID {familyId} not found");
                }

                PhotoStatistics stats = await _photoRepository.GetPhotoStatisticsAsync(familyId);
                PhotoStatisticsDTO statsDto = _mapper.Map<PhotoStatisticsDTO>(stats);

                _logger.LogInformation("Retrieved photo statistics for family {FamilyId}: {TotalPhotos} photos", familyId, stats.TotalPhotos);
                return statsDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching photo statistics for family {FamilyId}", familyId);
                throw;
            }
        }
    }
} 