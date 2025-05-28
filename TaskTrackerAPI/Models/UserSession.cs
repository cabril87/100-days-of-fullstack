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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class UserSession
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [Required]
        [MaxLength(128)]
        public string SessionToken { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public DateTime LastActivity { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Geolocation data
        [MaxLength(100)]
        public string? Country { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(10)]
        public string? CountryCode { get; set; }
        
        public double? Latitude { get; set; }
        
        public double? Longitude { get; set; }
        
        // Device information
        [MaxLength(100)]
        public string? DeviceType { get; set; }
        
        [MaxLength(100)]
        public string? Browser { get; set; }
        
        [MaxLength(50)]
        public string? OperatingSystem { get; set; }
        
        // Security flags
        public bool IsSuspicious { get; set; }
        
        [MaxLength(200)]
        public string? SecurityNotes { get; set; }
        
        public DateTime? TerminatedAt { get; set; }
        
        [MaxLength(100)]
        public string? TerminationReason { get; set; }
    }
} 