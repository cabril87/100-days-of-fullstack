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
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Text.Json;
using System.IO;
using System;
using TaskTrackerAPI.DTOs.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Security controller - manages user security settings and preferences.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class SecurityController : BaseApiController
    {
        private readonly ILogger<SecurityController> _logger;

        public SecurityController(ILogger<SecurityController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Receives CSP violation reports
        /// </summary>
        /// <returns>Acknowledgment of the report being received</returns>
        [HttpPost("cspreport")]
        [AllowAnonymous]
        [Consumes("application/csp-report", "application/json", "application/reports+json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> ReceiveCspReport()
        {
            try
            {
                // Read the request body
                using StreamReader reader = new StreamReader(Request.Body);
                string body = await reader.ReadToEndAsync();

                if (string.IsNullOrEmpty(body))
                {
                    _logger.LogWarning("Received empty CSP report");
                    return NoContent();
                }

                // Try to parse the report - can be in different formats
                CspViolationReport? report = null;

                try
                {
                    JsonDocument jsonDocument = JsonDocument.Parse(body);
                    JsonElement rootElement = jsonDocument.RootElement;

                    // Handle standard CSP report format
                    if (rootElement.TryGetProperty("csp-report", out JsonElement cspReport))
                    {
                        report = ParseStandardCspReport(cspReport);
                    }
                    // Handle report-to format (newer browsers)
                    else if (rootElement.ValueKind == JsonValueKind.Array)
                    {
                        report = ParseReportToFormat(rootElement);
                    }
                    // Handle direct report format
                    else
                    {
                        report = ParseDirectReportFormat(rootElement);
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse CSP report: {ReportBody}", body);
                }

                if (report != null)
                {
                    LogCspViolation(report);
                }
                else
                {
                    _logger.LogWarning("Received unparseable CSP report: {ReportBody}", body);
                }

                // Return 204 No Content to acknowledge receipt
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSP violation report");
                return NoContent(); // Still return 204 to avoid error feedback loop
            }
        }

        private CspViolationReport ParseStandardCspReport(JsonElement cspReport)
        {
            CspViolationReport report = new CspViolationReport();

            if (cspReport.TryGetProperty("document-uri", out JsonElement documentUri))
                report.DocumentUri = documentUri.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("referrer", out JsonElement referrer))
                report.Referrer = referrer.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("violated-directive", out JsonElement violatedDirective))
                report.ViolatedDirective = violatedDirective.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("effective-directive", out JsonElement effectiveDirective))
                report.EffectiveDirective = effectiveDirective.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("original-policy", out JsonElement originalPolicy))
                report.OriginalPolicy = originalPolicy.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("blocked-uri", out JsonElement blockedUri))
                report.BlockedUri = blockedUri.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("source-file", out JsonElement sourceFile))
                report.SourceFile = sourceFile.GetString() ?? string.Empty;

            if (cspReport.TryGetProperty("line-number", out JsonElement lineNumber))
                report.LineNumber = lineNumber.TryGetInt32(out int line) ? line : null;

            if (cspReport.TryGetProperty("column-number", out JsonElement columnNumber))
                report.ColumnNumber = columnNumber.TryGetInt32(out int column) ? column : null;

            report.Timestamp = DateTimeOffset.UtcNow;
            report.ReportFormat = "csp-report";

            return report;
        }

        private CspViolationReport? ParseReportToFormat(JsonElement rootElement)
        {
            // Handle the array format used by Report-To
            if (rootElement.ValueKind == JsonValueKind.Array && rootElement.GetArrayLength() > 0)
            {
                JsonElement firstReport = rootElement[0];
                
                if (firstReport.TryGetProperty("body", out JsonElement body) && 
                    body.TryGetProperty("blockedURL", out JsonElement blockedUrl))
                {
                    CspViolationReport report = new CspViolationReport
                    {
                        ReportFormat = "report-to",
                        Timestamp = DateTimeOffset.UtcNow
                    };

                    if (firstReport.TryGetProperty("type", out JsonElement type))
                        report.ReportType = type.GetString() ?? string.Empty;

                    if (firstReport.TryGetProperty("url", out JsonElement url))
                        report.DocumentUri = url.GetString() ?? string.Empty;

                    if (body.TryGetProperty("referrer", out JsonElement referrer))
                        report.Referrer = referrer.GetString() ?? string.Empty;

                    if (body.TryGetProperty("disposition", out JsonElement disposition))
                        report.Disposition = disposition.GetString() ?? string.Empty;

                    if (body.TryGetProperty("effectiveDirective", out JsonElement effectiveDirective))
                        report.EffectiveDirective = effectiveDirective.GetString() ?? string.Empty;

                    if (body.TryGetProperty("originalPolicy", out JsonElement originalPolicy))
                        report.OriginalPolicy = originalPolicy.GetString() ?? string.Empty;

                    report.BlockedUri = blockedUrl.GetString() ?? string.Empty;

                    if (body.TryGetProperty("sourceFile", out JsonElement sourceFile))
                        report.SourceFile = sourceFile.GetString() ?? string.Empty;

                    if (body.TryGetProperty("lineNumber", out JsonElement lineNumber))
                        report.LineNumber = lineNumber.TryGetInt32(out int line) ? line : null;

                    if (body.TryGetProperty("columnNumber", out JsonElement columnNumber))
                        report.ColumnNumber = columnNumber.TryGetInt32(out int column) ? column : null;

                    return report;
                }
            }

            return null;
        }

        private CspViolationReport? ParseDirectReportFormat(JsonElement rootElement)
        {
            bool hasBlockedUri = rootElement.TryGetProperty("blocked-uri", out JsonElement blockedUri);
            bool hasBlockedUrl = rootElement.TryGetProperty("blockedURL", out JsonElement blockedUrl);
            
            // Some browsers might send a direct format
            if (hasBlockedUri || hasBlockedUrl)
            {
                CspViolationReport report = new CspViolationReport
                {
                    ReportFormat = "direct",
                    Timestamp = DateTimeOffset.UtcNow
                };

                if (rootElement.TryGetProperty("document-uri", out JsonElement documentUri))
                    report.DocumentUri = documentUri.GetString() ?? string.Empty;
                else if (rootElement.TryGetProperty("documentURL", out JsonElement documentUrl))
                    report.DocumentUri = documentUrl.GetString() ?? string.Empty;

                if (rootElement.TryGetProperty("referrer", out JsonElement referrer))
                    report.Referrer = referrer.GetString() ?? string.Empty;

                if (rootElement.TryGetProperty("violated-directive", out JsonElement violatedDirective))
                    report.ViolatedDirective = violatedDirective.GetString() ?? string.Empty;
                else if (rootElement.TryGetProperty("effectiveDirective", out JsonElement effectiveDirective))
                    report.EffectiveDirective = effectiveDirective.GetString() ?? string.Empty;

                // Use the appropriate blocked URI source
                if (hasBlockedUri && blockedUri.ValueKind != JsonValueKind.Undefined)
                {
                    report.BlockedUri = blockedUri.GetString() ?? string.Empty;
                }
                else if (hasBlockedUrl && blockedUrl.ValueKind != JsonValueKind.Undefined)
                {
                    report.BlockedUri = blockedUrl.GetString() ?? string.Empty;
                }
                else
                {
                    report.BlockedUri = string.Empty;
                }

                return report;
            }

            return null;
        }

        private void LogCspViolation(CspViolationReport report)
        {
            _logger.LogWarning(
                "CSP Violation: {ViolatedDirective} - Blocked URI: {BlockedUri}, Source: {Source}:{Line}:{Column}, Document: {DocumentUri}, Format: {Format}",
                report.EffectiveDirective ?? report.ViolatedDirective,
                report.BlockedUri,
                report.SourceFile,
                report.LineNumber,
                report.ColumnNumber,
                report.DocumentUri,
                report.ReportFormat);
        }

        /// <summary>
        /// Endpoint for testing security headers
        /// </summary>
        [HttpGet("test-headers")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult TestSecurityHeaders()
        {
            return Ok(new { message = "Security headers should be visible in the response" });
        }

        /// <summary>
        /// Gets a nonce for use in inline scripts if needed
        /// Only to be used when the server needs to set a nonce for dynamic script injection
        /// </summary>
        [HttpGet("nonce")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetNonce()
        {
            string nonce = Middleware.SecurityHeadersMiddleware.GetCurrentRequestNonce(HttpContext);
            return Ok(new { nonce });
        }
    }
} 