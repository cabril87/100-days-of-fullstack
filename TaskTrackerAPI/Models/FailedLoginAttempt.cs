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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class FailedLoginAttempt
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string EmailOrUsername { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        [Required]
        public DateTime AttemptTime { get; set; }
        
        [MaxLength(100)]
        public string? FailureReason { get; set; }
        
        // Geolocation data
        [MaxLength(100)]
        public string? Country { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(10)]
        public string? CountryCode { get; set; }
        
        public double? Latitude { get; set; }
        
        public double? Longitude { get; set; }
        
        // Risk assessment
        public bool IsSuspicious { get; set; }
        
        [MaxLength(200)]
        public string? RiskFactors { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 