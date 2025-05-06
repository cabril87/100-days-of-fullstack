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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.ModalContext;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Interface for the Modal Context Protocol service
    /// Provides state transition validation and execution
    /// </summary>
    public interface IModalContextService
    {
        /// <summary>
        /// Validates if a state transition is allowed
        /// </summary>
        /// <param name="entityType">Type of entity (e.g., "task", "reminder")</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="fromState">Current state of the entity</param>
        /// <param name="toState">Desired new state</param>
        /// <param name="userId">ID of the user requesting the transition</param>
        /// <param name="metadata">Additional context for the transition</param>
        /// <returns>True if the transition is valid</returns>
        Task<bool> ValidateTransitionAsync(
            string entityType, 
            int entityId, 
            string fromState, 
            string toState, 
            int userId,
            Dictionary<string, object>? metadata = null);
            
        /// <summary>
        /// Executes a state transition with validation and tracking
        /// </summary>
        /// <typeparam name="T">Return type of the operation</typeparam>
        /// <param name="entityType">Type of entity (e.g., "task", "reminder")</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="fromState">Current state of the entity</param>
        /// <param name="toState">Desired new state</param>
        /// <param name="userId">ID of the user requesting the transition</param>
        /// <param name="transactionOperation">The operation to execute if transition is valid</param>
        /// <param name="metadata">Additional context for the transition</param>
        /// <returns>Transaction result with operation outcome</returns>
        Task<TransactionResult<T>> ExecuteTransactionAsync<T>(
            string entityType,
            int entityId,
            string fromState,
            string toState,
            int userId,
            Func<Task<T>> transactionOperation,
            Dictionary<string, object>? metadata = null);
            
        /// <summary>
        /// Logs a compliance check in the transaction system
        /// </summary>
        /// <param name="entityType">Type of entity being checked</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="userId">User performing the check</param>
        /// <param name="ruleId">ID of the compliance rule</param>
        /// <param name="ruleName">Name of the compliance rule</param>
        /// <param name="isCompliant">Whether the entity is compliant</param>
        /// <param name="message">Additional information about compliance</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task LogComplianceCheckAsync(
            string entityType,
            int entityId,
            int userId,
            string ruleId,
            string ruleName,
            bool isCompliant,
            string message);
            
        /// <summary>
        /// Gets recent transactions for an entity
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="limit">Maximum number of transactions to return</param>
        /// <returns>List of transaction records</returns>
        Task<List<TransactionLogDTO>> GetEntityTransactionsAsync(
            string entityType,
            int entityId,
            int limit = 20);
            
        /// <summary>
        /// Gets valid transitions for an entity type from a specific state
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="currentState">Current state of the entity</param>
        /// <returns>List of valid target states</returns>
        Task<List<string>> GetValidTransitionsAsync(
            string entityType,
            string currentState);
            
        /// <summary>
        /// Executes a distributed transaction across multiple entities
        /// </summary>
        /// <typeparam name="T">Return type of the operation</typeparam>
        /// <param name="transactionType">Type of transaction</param>
        /// <param name="transactionId">Unique ID for the transaction</param>
        /// <param name="fromState">Starting state</param>
        /// <param name="toState">Target state</param>
        /// <param name="userId">User initiating the transaction</param>
        /// <param name="distributedOperation">The operation to execute</param>
        /// <param name="compensatingActions">Actions to take if transaction fails</param>
        /// <param name="metadata">Additional transaction context</param>
        /// <returns>Transaction result with operation outcome</returns>
        Task<TransactionResult<T>> ExecuteDistributedTransactionAsync<T>(
            string transactionType,
            string transactionId,
            string fromState,
            string toState,
            int userId,
            Func<DistributedTransactionContext, Task<T>> distributedOperation,
            CompensatingActions? compensatingActions = null,
            Dictionary<string, object>? metadata = null);
    }
} 