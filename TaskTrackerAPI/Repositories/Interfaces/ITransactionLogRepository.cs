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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for transaction logs
    /// </summary>
    public interface ITransactionLogRepository
    {
        /// <summary>
        /// Adds a new transaction log entry
        /// </summary>
        /// <param name="log">The transaction log to add</param>
        /// <returns>The added transaction log with ID</returns>
        Task<TransactionLog> AddTransactionLogAsync(TransactionLog log);
        
        /// <summary>
        /// Gets a transaction log by ID
        /// </summary>
        /// <param name="id">The transaction log ID</param>
        /// <returns>The transaction log if found, null otherwise</returns>
        Task<TransactionLog?> GetTransactionLogByIdAsync(int id);
        
        /// <summary>
        /// Gets recent transaction logs for an entity
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="limit">Maximum number of logs to return</param>
        /// <returns>List of transaction logs</returns>
        Task<List<TransactionLog>> GetEntityTransactionsAsync(
            string entityType, 
            int entityId, 
            int limit = 20);
            
        /// <summary>
        /// Gets recent transaction logs for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="limit">Maximum number of logs to return</param>
        /// <returns>List of transaction logs</returns>
        Task<List<TransactionLog>> GetUserTransactionsAsync(
            int userId, 
            int limit = 20);
            
        /// <summary>
        /// Gets recent transaction logs for a specific entity type
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="limit">Maximum number of logs to return</param>
        /// <returns>List of transaction logs</returns>
        Task<List<TransactionLog>> GetTransactionsByEntityTypeAsync(
            string entityType, 
            int limit = 100);
            
        /// <summary>
        /// Gets transactions within a specific date range
        /// </summary>
        /// <param name="startDate">Start date (inclusive)</param>
        /// <param name="endDate">End date (inclusive)</param>
        /// <param name="entityType">Optional entity type filter</param>
        /// <returns>List of transaction logs</returns>
        Task<List<TransactionLog>> GetTransactionsByDateRangeAsync(
            DateTime startDate, 
            DateTime endDate, 
            string? entityType = null);
            
        /// <summary>
        /// Gets recent transactions for a user and specific entity type
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="entityType">Type of entity</param>
        /// <param name="limit">Maximum number of transactions</param>
        /// <returns>List of transaction logs</returns>
        Task<List<TransactionLog>> GetRecentUserTransactionsAsync(
            int userId, 
            string entityType, 
            int limit = 100);
            
        /// <summary>
        /// Logs a transition attempt
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="fromState">Source state</param>
        /// <param name="toState">Target state</param>
        /// <param name="userId">User initiating the transition</param>
        /// <param name="isValid">Whether the transition is valid</param>
        /// <param name="metadata">Additional context information</param>
        /// <returns>The created transaction log</returns>
        Task<TransactionLog> LogTransitionAsync(
            string entityType, 
            int entityId, 
            string fromState, 
            string toState, 
            int userId, 
            bool isValid, 
            Dictionary<string, object>? metadata = null);
            
        /// <summary>
        /// Records a successful transition
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="fromState">Source state</param>
        /// <param name="toState">Target state</param>
        /// <param name="userId">User initiating the transition</param>
        /// <param name="metadata">Additional context information</param>
        /// <returns>The created transaction log</returns>
        Task<TransactionLog> RecordSuccessfulTransitionAsync(
            string entityType, 
            int entityId, 
            string fromState, 
            string toState, 
            int userId, 
            Dictionary<string, object>? metadata = null);
            
        /// <summary>
        /// Records a failed transition
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <param name="entityId">ID of the entity</param>
        /// <param name="fromState">Source state</param>
        /// <param name="toState">Target state</param>
        /// <param name="userId">User initiating the transition</param>
        /// <param name="failureReason">Reason for the failure</param>
        /// <param name="metadata">Additional context information</param>
        /// <returns>The created transaction log</returns>
        Task<TransactionLog> RecordFailedTransitionAsync(
            string entityType, 
            int entityId, 
            string fromState, 
            string toState, 
            int userId, 
            string failureReason, 
            Dictionary<string, object>? metadata = null);
            
        /// <summary>
        /// Gets transactions that haven't been processed for analytics
        /// </summary>
        /// <param name="cutoffTime">Only include transactions before this time</param>
        /// <returns>List of unprocessed transaction logs</returns>
        Task<List<TransactionLog>> GetUnprocessedTransactionsAsync(DateTime cutoffTime);
        
        /// <summary>
        /// Marks transactions as processed for analytics
        /// </summary>
        /// <param name="transactionIds">IDs of transactions to mark</param>
        /// <returns>Number of transactions marked</returns>
        Task<int> MarkTransactionsProcessedAsync(List<int> transactionIds);
    }
} 