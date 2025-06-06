/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
        Task<bool> SendWelcomeEmailAsync(string toEmail, string userName);
        Task<bool> SendFamilyInvitationEmailAsync(string toEmail, string inviterName, string familyName, string invitationToken);
        Task<bool> SendTestEmailAsync(string toEmail);
    }
} 