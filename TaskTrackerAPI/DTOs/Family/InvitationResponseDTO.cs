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

namespace TaskTrackerAPI.DTOs.Family;

public class InvitationResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string InvitedBy { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
} 