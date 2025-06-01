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
using AutoMapper;
using TaskTrackerAPI.DTOs.BackgroundServices;
using TaskTrackerAPI.Models.BackgroundServices;

namespace TaskTrackerAPI.Mappings
{
    /// <summary>
    /// AutoMapper profile for background service entities
    /// </summary>
    public class BackgroundServiceMappingProfile : Profile
    {
        public BackgroundServiceMappingProfile()
        {
            // BackgroundServiceStatus mappings
            CreateMap<BackgroundServiceStatus, BackgroundServiceStatusDTO>()
                .ForMember(dest => dest.SuccessRate, opt => opt.MapFrom(src => (double)src.SuccessRate));
                
            CreateMap<BackgroundServiceStatusDTO, BackgroundServiceStatus>()
                .ForMember(dest => dest.SuccessRate, opt => opt.MapFrom(src => (decimal)src.SuccessRate));

            // BackgroundServiceExecution mappings
            CreateMap<BackgroundServiceExecution, BackgroundServiceExecutionDTO>();
            CreateMap<BackgroundServiceExecutionDTO, BackgroundServiceExecution>();

            // SystemMaintenanceNotification mappings
            CreateMap<SystemMaintenanceNotification, SystemMaintenanceNotificationDTO>();
            CreateMap<SystemMaintenanceNotificationDTO, SystemMaintenanceNotification>();
            CreateMap<CreateMaintenanceNotificationDTO, SystemMaintenanceNotification>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // SystemOptimizationRecommendation mappings
            CreateMap<SystemOptimizationRecommendation, SystemOptimizationRecommendationDTO>();
            CreateMap<SystemOptimizationRecommendationDTO, SystemOptimizationRecommendation>();

            // PriorityAdjustmentNotificationDTO mappings (for real-time notifications)
            CreateMap<PriorityAdjustmentNotificationDTO, PriorityAdjustmentNotificationDTO>();

            // BackgroundServiceHealthCheckDTO mappings
            CreateMap<BackgroundServiceHealthCheckDTO, BackgroundServiceHealthCheckDTO>();
        }
    }
} 