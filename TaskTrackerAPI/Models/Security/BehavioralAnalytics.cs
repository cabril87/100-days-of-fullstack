using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Security
{
    public class BehavioralAnalytics
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(45)]
        public string IPAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ActionType { get; set; } = string.Empty; // Login, DataAccess, FileUpload, etc.

        [StringLength(200)]
        public string ResourceAccessed { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; }

        // Behavioral metrics
        public TimeSpan SessionDuration { get; set; }
        public int ActionsPerMinute { get; set; }
        public int DataVolumeAccessed { get; set; } // in KB

        // Location and device info
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string DeviceType { get; set; } = string.Empty; // Desktop, Mobile, Tablet

        [StringLength(100)]
        public string Browser { get; set; } = string.Empty;

        [StringLength(50)]
        public string OperatingSystem { get; set; } = string.Empty;

        // Anomaly detection
        public bool IsAnomalous { get; set; } = false;
        public double AnomalyScore { get; set; } = 0.0; // 0.0 - 1.0

        [StringLength(20)]
        public string RiskLevel { get; set; } = "Low"; // Low, Medium, High, Critical

        [StringLength(500)]
        public string AnomalyReason { get; set; } = string.Empty;

        // Pattern analysis
        public bool IsNewLocation { get; set; } = false;
        public bool IsNewDevice { get; set; } = false;
        public bool IsOffHours { get; set; } = false;
        public bool IsHighVelocity { get; set; } = false; // Rapid successive actions

        // Baseline comparison
        public double DeviationFromBaseline { get; set; } = 0.0;
        public bool IsOutsideNormalPattern { get; set; } = false;

        [StringLength(1000)]
        public string BehaviorMetadata { get; set; } = string.Empty; // JSON for additional data

        public DateTime CreatedAt { get; set; }
    }
} 