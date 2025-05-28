using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Security
{
    public class ThreatIntelligence
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(45)]
        public string IPAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ThreatType { get; set; } = string.Empty; // Malware, Botnet, Phishing, Spam, etc.

        [Required]
        [StringLength(20)]
        public string Severity { get; set; } = string.Empty; // Critical, High, Medium, Low

        [StringLength(100)]
        public string ThreatSource { get; set; } = string.Empty; // AbuseIPDB, VirusTotal, etc.

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public int ConfidenceScore { get; set; } // 0-100

        public bool IsActive { get; set; } = true;

        public DateTime FirstSeen { get; set; }
        public DateTime LastSeen { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Geolocation data
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string ISP { get; set; } = string.Empty;

        // Threat intelligence metadata
        public int ReportCount { get; set; } = 0;
        public bool IsWhitelisted { get; set; } = false;
        public bool IsBlacklisted { get; set; } = false;

        [StringLength(1000)]
        public string AdditionalMetadata { get; set; } = string.Empty; // JSON for extra data
    }
} 