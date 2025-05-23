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
// Models/RefreshToken.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

// Models/RefreshToken.cs
public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public required string Token { get; set; }
    
    [Required]
    public DateTime ExpiryDate { get; set; }
    
    [Required]
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    
    // IP address that created the token
    public string? CreatedByIp { get; set; }
    
    // IP address that revoked the token
    public string? RevokedByIp { get; set; }
    
    // Date the token was revoked
    public DateTime? RevokedDate { get; set; }
    
    // New token that replaced this one when rotated
    public string? ReplacedByToken { get; set; }
    
    // Family identifier to track chains of refresh tokens
    public string? TokenFamily { get; set; }
    
    // Reason for revocation
    public string? ReasonRevoked { get; set; }
    
    public bool IsExpired => DateTime.Now >= ExpiryDate;
    
    public bool IsRevoked => RevokedByIp != null;
    
    public bool IsActive => !IsExpired && !IsRevoked;
    
    [Required]
    public required int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}