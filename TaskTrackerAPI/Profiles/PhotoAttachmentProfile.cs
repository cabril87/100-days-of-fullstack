/*
 * Photo Attachment AutoMapper Profile
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * AutoMapper configuration for photo attachment model <-> DTO conversions
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Photos;
using TaskTrackerAPI.Repositories.Interfaces;
using System;

namespace TaskTrackerAPI.Profiles
{
    /// <summary>
    /// AutoMapper profile for photo attachment entity mappings
    /// </summary>
    public class PhotoAttachmentProfile : Profile
    {
        public PhotoAttachmentProfile()
        {
            // PhotoAttachment -> PhotoAttachmentDTO (Simplified mapping)
            CreateMap<PhotoAttachment, PhotoAttachmentDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ExternalId))
                .ForMember(dest => dest.Url, opt => opt.MapFrom(src => src.FilePath))
                .ForMember(dest => dest.ThumbnailUrl, opt => opt.MapFrom(src => src.ThumbnailPath))
                .ForMember(dest => dest.CapturedAt, opt => opt.MapFrom(src => src.CapturedAt))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => "User"))
                .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => new PhotoMetadataDTO
                {
                    Width = src.Width,
                    Height = src.Height,
                    DeviceInfo = src.DeviceInfo,
                    Location = src.Latitude.HasValue && src.Longitude.HasValue
                        ? new PhotoLocationDTO { Latitude = src.Latitude.Value, Longitude = src.Longitude.Value }
                        : null
                }));

            // PhotoValidation -> PhotoValidationDTO (Simplified)
            CreateMap<PhotoValidation, PhotoValidationDTO>()
                .ForMember(dest => dest.ValidatedBy, opt => opt.MapFrom(src => src.ValidatedBy));

            // PhotoShare -> PhotoShareDTO (Simplified)
            CreateMap<PhotoShare, PhotoShareDTO>()
                .ForMember(dest => dest.PhotoId, opt => opt.MapFrom(src => src.PhotoAttachment.ExternalId))
                .ForMember(dest => dest.SharedWith, opt => opt.MapFrom(src => new int[0]))
                .ForMember(dest => dest.Reactions, opt => opt.MapFrom(src => src.Reactions))
                .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments));

            // PhotoReaction -> PhotoReactionDTO
            CreateMap<PhotoReaction, PhotoReactionDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => "User"))
                .ForMember(dest => dest.Reaction, opt => opt.MapFrom(src => src.ReactionType))
                .ForMember(dest => dest.ReactedAt, opt => opt.MapFrom(src => src.ReactedAt));

            // PhotoComment -> PhotoCommentDTO
            CreateMap<PhotoComment, PhotoCommentDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => "User"))
                .ForMember(dest => dest.Comment, opt => opt.MapFrom(src => src.Comment))
                .ForMember(dest => dest.CommentedAt, opt => opt.MapFrom(src => src.CommentedAt));

            // PhotoStatistics -> PhotoStatisticsDTO
            CreateMap<PhotoStatistics, PhotoStatisticsDTO>();

            // Reverse mappings (Simplified)
            CreateMap<CreatePhotoAttachmentDTO, PhotoAttachment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FilePath, opt => opt.Ignore())
                .ForMember(dest => dest.ThumbnailPath, opt => opt.Ignore())
                .ForMember(dest => dest.CapturedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Width, opt => opt.MapFrom(src => src.Metadata.Width))
                .ForMember(dest => dest.Height, opt => opt.MapFrom(src => src.Metadata.Height))
                .ForMember(dest => dest.DeviceInfo, opt => opt.MapFrom(src => src.Metadata.DeviceInfo))
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Metadata.Location != null ? src.Metadata.Location.Latitude : (double?)null))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Metadata.Location != null ? src.Metadata.Location.Longitude : (double?)null));

            CreateMap<CreatePhotoValidationDTO, PhotoValidation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoAttachmentId, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.ValidatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<CreatePhotoShareDTO, PhotoShare>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoAttachmentId, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.SharedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 