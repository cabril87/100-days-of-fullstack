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

using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Analytics
{
    /// <summary>
    /// Query builder configuration DTO
    /// </summary>
    public class QueryBuilderDTO
    {
        public List<QueryFieldDTO> AvailableFields { get; set; } = new();
        public List<FilterTypeDTO> FilterTypes { get; set; } = new();
        public List<OperatorTypeDTO> OperatorTypes { get; set; } = new();
        public Dictionary<string, object> DefaultValues { get; set; } = new();
    }

    /// <summary>
    /// Query field definition DTO
    /// </summary>
    public class QueryFieldDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // string, number, date, boolean, array
        public List<string>? Options { get; set; }
    }

    /// <summary>
    /// Filter type definition DTO
    /// </summary>
    public class FilterTypeDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Component { get; set; } = string.Empty;
    }

    /// <summary>
    /// Operator type definition DTO
    /// </summary>
    public class OperatorTypeDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public List<string> ApplicableTypes { get; set; } = new();
    }

    /// <summary>
    /// Query execution request DTO
    /// </summary>
    public class ExecuteQueryDTO
    {
        public string QueryName { get; set; } = string.Empty;
        public string QueryType { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    /// <summary>
    /// Query validation request DTO
    /// </summary>
    public class ValidateQueryDTO
    {
        public string QueryType { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    /// <summary>
    /// Query validation result DTO
    /// </summary>
    public class QueryValidationResultDTO
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public Dictionary<string, object> SuggestedValues { get; set; } = new();
    }
} 