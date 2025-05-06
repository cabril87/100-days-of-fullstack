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
using System.Text.Json.Serialization;

namespace TaskTrackerAPI.DTOs.Security
{
    /// <summary>
    /// Data Transfer Object for Content Security Policy violation reports
    /// </summary>
    public class CspViolationReport
    {
        /// <summary>
        /// The URI of the document where the violation occurred
        /// </summary>
        public string DocumentUri { get; set; } = string.Empty;

        /// <summary>
        /// The referrer of the document where the violation occurred
        /// </summary>
        public string Referrer { get; set; } = string.Empty;

        /// <summary>
        /// The directive that was violated
        /// </summary>
        public string ViolatedDirective { get; set; } = string.Empty;

        /// <summary>
        /// The effective directive that was violated
        /// </summary>
        public string EffectiveDirective { get; set; } = string.Empty;

        /// <summary>
        /// The original policy as specified in the Content-Security-Policy header
        /// </summary>
        public string OriginalPolicy { get; set; } = string.Empty;

        /// <summary>
        /// The URI of the resource that was blocked from loading due to the policy violation
        /// </summary>
        public string BlockedUri { get; set; } = string.Empty;

        /// <summary>
        /// The source file where the violation occurred
        /// </summary>
        public string SourceFile { get; set; } = string.Empty;

        /// <summary>
        /// The line number in the source file where the violation occurred
        /// </summary>
        public int? LineNumber { get; set; } = null;

        /// <summary>
        /// The column number in the source file where the violation occurred
        /// </summary>
        public int? ColumnNumber { get; set; } = null;

        /// <summary>
        /// The report type (for Report-To format)
        /// </summary>
        public string ReportType { get; set; } = string.Empty;

        /// <summary>
        /// The disposition of the violation (enforce or report)
        /// </summary>
        public string Disposition { get; set; } = string.Empty;

        /// <summary>
        /// The format of the report (csp-report, report-to, direct)
        /// </summary>
        public string ReportFormat { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when the report was received
        /// </summary>
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// Request ID or correlation ID
        /// </summary>
        public string RequestId { get; set; } = string.Empty;

        /// <summary>
        /// IP address of the client that reported the violation (anonymized for privacy)
        /// </summary>
        public string ClientIp { get; set; } = string.Empty;

        /// <summary>
        /// User agent of the client that reported the violation
        /// </summary>
        public string UserAgent { get; set; } = string.Empty;
    }
} 