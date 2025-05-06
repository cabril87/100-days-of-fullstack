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
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Provider for state transition rules in the Modal Context Protocol
    /// </summary>
    public interface ITransitionRuleProvider
    {
        /// <summary>
        /// Gets the transition rules for a specific entity type
        /// </summary>
        /// <param name="entityType">Type of entity (e.g., "task", "reminder")</param>
        /// <returns>Dictionary of source states to lists of valid target states</returns>
        Task<Dictionary<string, List<string>>> GetTransitionRulesAsync(string entityType);
        
        /// <summary>
        /// Gets available transitions from a specific state
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="fromState">Current state</param>
        /// <returns>List of valid target states</returns>
        Task<List<string>> GetAvailableTransitionsAsync(string entityType, string fromState);
        
        /// <summary>
        /// Validates if a specific transition is allowed
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="fromState">Source state</param>
        /// <param name="toState">Target state</param>
        /// <returns>True if the transition is valid</returns>
        Task<bool> IsValidTransitionAsync(string entityType, string fromState, string toState);
        
        /// <summary>
        /// Gets all entity types with defined transition rules
        /// </summary>
        /// <returns>List of entity types</returns>
        Task<List<string>> GetSupportedEntityTypesAsync();
        
        /// <summary>
        /// Reloads transition rules from storage
        /// </summary>
        /// <returns>Task representing the reload operation</returns>
        Task ReloadRulesAsync();
        
        /// <summary>
        /// Updates transition rules for an entity type
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="rules">New transition rules</param>
        /// <returns>Task representing the update operation</returns>
        Task UpdateTransitionRulesAsync(string entityType, Dictionary<string, List<string>> rules);
    }
} 