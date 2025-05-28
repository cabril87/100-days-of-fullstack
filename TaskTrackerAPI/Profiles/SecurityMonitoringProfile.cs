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
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class SecurityMonitoringProfile : Profile
{
    public SecurityMonitoringProfile()
    {
        // SecurityMetrics mappings
        CreateMap<SecurityMetrics, SecurityMetricDTO>();
        CreateMap<SecurityMetricDTO, SecurityMetrics>();

        // SecurityAuditLog mappings
        CreateMap<SecurityAuditLog, SecurityAuditLogDTO>();
        CreateMap<SecurityAuditLogDTO, SecurityAuditLog>();

        // SystemHealthMetrics mappings
        CreateMap<SystemHealthMetrics, SystemMetricDTO>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.MetricName))
            .ForMember(dest => dest.IsHealthy, opt => opt.MapFrom(src => src.IsHealthy));

        CreateMap<SystemMetricDTO, SystemHealthMetrics>()
            .ForMember(dest => dest.MetricName, opt => opt.MapFrom(src => src.Name));
    }
} 