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
using System.ComponentModel;

namespace TaskTrackerAPI.DTOs.Auth
{
    /// <summary>
    /// User role enumeration for DTOs
    /// </summary>
    public enum UserRoleDTO
    {
        /// <summary>
        /// Regular family users - Standard application features
        /// </summary>
        [Description("Regular User")]
        RegularUser = 0,

        /// <summary>
        /// Customer support representatives - User assistance
        /// </summary>
        [Description("Customer Support")]
        CustomerSupport = 1,

        /// <summary>
        /// Development team members - System monitoring and debugging
        /// </summary>
        [Description("Developer")]
        Developer = 2,

        /// <summary>
        /// Global administrator - Full system access
        /// </summary>
        [Description("Global Admin")]
        GlobalAdmin = 3
    }
} 