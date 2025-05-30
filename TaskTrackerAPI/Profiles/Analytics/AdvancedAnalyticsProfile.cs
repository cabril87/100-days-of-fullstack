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
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.DTOs.Analytics;

namespace TaskTrackerAPI.Profiles.Analytics
{
    /// <summary>
    /// AutoMapper profile for Advanced Analytics
    /// </summary>
    public class AdvancedAnalyticsProfile : Profile
    {
        public AdvancedAnalyticsProfile()
        {
            // SavedFilter mappings
            CreateMap<SavedFilter, SavedFilterDTO>();
            CreateMap<CreateSavedFilterDTO, SavedFilter>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<UpdateSavedFilterDTO, SavedFilter>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // AnalyticsQuery mappings
            CreateMap<AnalyticsQuery, AnalyticsQuery>(); // For tracking purposes

            // DataExportRequest mappings
            CreateMap<DataExportRequest, DataExportRequestDTO>()
                .ForMember(dest => dest.DownloadUrl, opt => opt.MapFrom(src => 
                    !string.IsNullOrEmpty(src.FilePath) ? $"/api/v1/data-export/download/{src.Id}" : null));

            CreateMap<CreateDataExportRequestDTO, DataExportRequest>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "pending"))
                .ForMember(dest => dest.FilePath, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ErrorMessage, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // DashboardWidget mappings - simplified without JSON serialization in mappings
            CreateMap<DashboardWidget, WidgetConfigDTO>()
                .ForMember(dest => dest.Position, opt => opt.Ignore())
                .ForMember(dest => dest.Configuration, opt => opt.Ignore());

            CreateMap<CreateWidgetDTO, DashboardWidget>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Position, opt => opt.Ignore())
                .ForMember(dest => dest.Configuration, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<UpdateWidgetDTO, DashboardWidget>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.WidgetType, opt => opt.Ignore())
                .ForMember(dest => dest.Position, opt => opt.Ignore())
                .ForMember(dest => dest.Configuration, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
} 