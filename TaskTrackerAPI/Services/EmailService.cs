/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Auth;
using System;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly bool _enableSsl;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            
            // Get SMTP configuration from appsettings
            _smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@tasktracker.com";
            _fromName = _configuration["Email:FromName"] ?? "TaskTracker";
            _smtpUsername = _configuration["Email:SmtpUsername"] ?? "";
            _smtpPassword = _configuration["Email:SmtpPassword"] ?? "";
            _enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");
        }

        public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
        {
            try
            {
                var resetLink = $"{_configuration["App:FrontendUrl"]}/auth/reset-password?token={resetToken}";
                
                var subject = "Reset Your TaskTracker Password";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                            .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; background-color: #f9f9f9; }}
                            .button {{ background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
                            .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🔒 Password Reset Request</h1>
                            </div>
                            <div class='content'>
                                <h2>Hello {userName},</h2>
                                <p>We received a request to reset your password for your TaskTracker account.</p>
                                <p>Click the button below to reset your password:</p>
                                <a href='{resetLink}' class='button'>Reset Password</a>
                                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                <p><a href='{resetLink}'>{resetLink}</a></p>
                                <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
                                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                            </div>
                            <div class='footer'>
                                <p>© 2025 TaskTracker. All rights reserved.</p>
                                <p>This is an automated message, please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>";

                return await SendEmailAsync(toEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string toEmail, string userName)
        {
            try
            {
                var loginLink = $"{_configuration["App:FrontendUrl"]}/auth/login";
                
                var subject = "Welcome to TaskTracker! 🎉";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                            .header {{ background-color: #059669; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; background-color: #f9f9f9; }}
                            .button {{ background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
                            .feature {{ background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #059669; }}
                            .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🎉 Welcome to TaskTracker!</h1>
                            </div>
                            <div class='content'>
                                <h2>Hello {userName},</h2>
                                <p>Thank you for joining TaskTracker! We're excited to help you organize your tasks and boost your productivity.</p>
                                
                                <h3>🚀 Get Started:</h3>
                                <div class='feature'>
                                    <strong>✅ Create Your First Task</strong><br>
                                    Start organizing your work and personal tasks
                                </div>
                                <div class='feature'>
                                    <strong>👨‍👩‍👧‍👦 Set Up Your Family</strong><br>
                                    Invite family members and collaborate on tasks
                                </div>
                                <div class='feature'>
                                    <strong>🎮 Earn Points & Achievements</strong><br>
                                    Complete tasks to earn points and unlock badges
                                </div>
                                
                                <p>Ready to get started?</p>
                                <a href='{loginLink}' class='button'>Go to TaskTracker</a>
                                
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                            </div>
                            <div class='footer'>
                                <p>© 2025 TaskTracker. All rights reserved.</p>
                                <p>Happy organizing! 📋✨</p>
                            </div>
                        </div>
                    </body>
                    </html>";

                return await SendEmailAsync(toEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
                return false;
            }
        }

        public async Task<bool> SendFamilyInvitationEmailAsync(string toEmail, string inviterName, string familyName, string invitationToken)
        {
            try
            {
                var invitationLink = $"{_configuration["App:FrontendUrl"]}/family/invite?token={invitationToken}";
                
                var subject = $"You're invited to join {familyName} on TaskTracker! 👨‍👩‍👧‍👦";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                            .header {{ background-color: #7C3AED; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; background-color: #f9f9f9; }}
                            .button {{ background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
                            .family-info {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 2px solid #7C3AED; }}
                            .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>👨‍👩‍👧‍👦 Family Invitation</h1>
                            </div>
                            <div class='content'>
                                <h2>You're Invited!</h2>
                                <p><strong>{inviterName}</strong> has invited you to join their family on TaskTracker.</p>
                                
                                <div class='family-info'>
                                    <h3>🏠 {familyName}</h3>
                                    <p>Join this family to:</p>
                                    <ul>
                                        <li>📝 Share and collaborate on tasks</li>
                                        <li>🏆 Compete in family challenges</li>
                                        <li>📊 Track collective progress</li>
                                        <li>🎮 Earn family achievements</li>
                                    </ul>
                                </div>
                                
                                <p>Ready to join the family?</p>
                                <a href='{invitationLink}' class='button'>Accept Invitation</a>
                                
                                <p>If the button doesn't work, copy and paste this link:</p>
                                <p><a href='{invitationLink}'>{invitationLink}</a></p>
                                
                                <p><em>This invitation will expire in 7 days.</em></p>
                            </div>
                            <div class='footer'>
                                <p>© 2025 TaskTracker. All rights reserved.</p>
                                <p>Don't want to receive family invitations? You can adjust your notification preferences in your account settings.</p>
                            </div>
                        </div>
                    </body>
                    </html>";

                return await SendEmailAsync(toEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send family invitation email to {Email}", toEmail);
                return false;
            }
        }

        public async Task<bool> SendTestEmailAsync(string toEmail)
        {
            try
            {
                var subject = "TaskTracker Email Test";
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2>📧 Email Test Successful!</h2>
                        <p>This is a test email from TaskTracker to verify that email sending is working correctly.</p>
                        <p><strong>Timestamp:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                        <p>If you received this email, your email service is configured properly! ✅</p>
                    </body>
                    </html>";

                return await SendEmailAsync(toEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send test email to {Email}", toEmail);
                return false;
            }
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Check if email is enabled
                if (!bool.Parse(_configuration["Email:Enabled"] ?? "false"))
                {
                    _logger.LogInformation("Email sending is disabled. Would send email to {Email} with subject: {Subject}", 
                        toEmail, subject);
                    return true; // Return true for disabled state to prevent errors
                }

                using var client = new SmtpClient(_smtpHost, _smtpPort);
                client.EnableSsl = _enableSsl;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);

                using var message = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                message.To.Add(toEmail);

                await client.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", toEmail, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", toEmail, subject);
                return false;
            }
        }
    }
} 