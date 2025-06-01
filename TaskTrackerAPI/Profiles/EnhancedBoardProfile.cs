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
using AutoMapper;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for enhanced board entities
/// Uses explicit typing and follows repository pattern conventions
/// </summary>
public class EnhancedBoardProfile : Profile
{
    public EnhancedBoardProfile()
    {
        // Enhanced BoardColumn mappings
        CreateMap<BoardColumn, EnhancedBoardColumnDTO>()
            .ForMember(dest => dest.TaskCount, opt => opt.Ignore()); // Set in service layer

        CreateMap<CreateEnhancedBoardColumnDTO, BoardColumn>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BoardId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Board, opt => opt.Ignore());

        CreateMap<UpdateEnhancedBoardColumnDTO, BoardColumn>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // BoardSettings mappings
        CreateMap<BoardSettings, BoardSettingsDTO>();

        CreateMap<UpdateBoardSettingsDTO, BoardSettings>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // BoardTemplate mappings
        CreateMap<BoardTemplate, BoardTemplateDTO>()
            .ForMember(dest => dest.CreatedByUsername, opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.Username : null))
            .ForMember(dest => dest.DefaultColumns, opt => opt.MapFrom(src => src.DefaultColumns));

        CreateMap<CreateBoardTemplateDTO, BoardTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.UsageCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.AverageRating, opt => opt.Ignore())
            .ForMember(dest => dest.RatingCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.DefaultColumns, opt => opt.Ignore()); // Handled separately

        // BoardTemplateColumn mappings
        CreateMap<BoardTemplateColumn, BoardTemplateColumnDTO>();

        CreateMap<CreateBoardTemplateColumnDTO, BoardTemplateColumn>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BoardTemplateId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.BoardTemplate, opt => opt.Ignore());

        // Enhanced board detail mappings
        CreateMap<Board, SuperEnhancedBoardDetailDTO>()
            .IncludeBase<Board, BoardDetailDTO>()
            .ForMember(dest => dest.Settings, opt => opt.MapFrom(src => src.Settings))
            .ForMember(dest => dest.Columns, opt => opt.MapFrom(src => src.Columns))
            .ForMember(dest => dest.Statistics, opt => opt.Ignore()) // Calculated in service
            .ForMember(dest => dest.IsCustomBoard, opt => opt.MapFrom(src => src.Columns.Count > 0))
            .ForMember(dest => dest.TemplateId, opt => opt.Ignore()) // Set by service if applicable
            .ForMember(dest => dest.TemplateName, opt => opt.Ignore()); // Set by service if applicable

        // Create default board settings mapping
        CreateMap<CreateBoardDTO, BoardSettings>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BoardId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.EnableWipLimits, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.ShowSubtasks, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.EnableSwimLanes, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.DefaultTaskView, opt => opt.MapFrom(src => "detailed"))
            .ForMember(dest => dest.EnableDragDrop, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowTaskIds, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.EnableTaskTimer, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowProgressBars, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowAvatars, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowDueDates, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowPriority, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowCategories, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.AutoRefresh, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.AutoRefreshInterval, opt => opt.MapFrom(src => 30))
            .ForMember(dest => dest.EnableRealTimeCollaboration, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowNotifications, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.EnableKeyboardShortcuts, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Theme, opt => opt.MapFrom(src => "auto"))
            .ForMember(dest => dest.CustomThemeConfig, opt => opt.Ignore())
            .ForMember(dest => dest.SwimLaneGroupBy, opt => opt.Ignore())
            .ForMember(dest => dest.DefaultSortBy, opt => opt.MapFrom(src => "created"))
            .ForMember(dest => dest.DefaultSortDirection, opt => opt.MapFrom(src => "desc"))
            .ForMember(dest => dest.ShowColumnCounts, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.ShowBoardStats, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.EnableGamification, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.IsArchived, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Board, opt => opt.Ignore());
    }
} 