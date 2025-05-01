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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family;

public class InvitationAcceptDTO
{
    [Required]
    public string Token { get; set; } = string.Empty;
} 