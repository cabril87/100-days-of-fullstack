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
using System.Threading.Tasks;

namespace TaskTrackerAPI.DTOs.ModalContext
{
    /// <summary>
    /// Represents the result of a transaction executed through the Modal Context Protocol
    /// </summary>
    /// <typeparam name="T">Type of result returned by the transaction</typeparam>
    public class TransactionResult<T>
    {
        /// <summary>
        /// Indicates if the transaction was successful
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// The result of the transaction operation
        /// </summary>
        public T? Result { get; set; }
        
        /// <summary>
        /// Error code if the transaction failed
        /// </summary>
        public string? ErrorCode { get; set; }
        
        /// <summary>
        /// Error message if the transaction failed
        /// </summary>
        public string? ErrorMessage { get; set; }
        
        /// <summary>
        /// The ID of the transaction in the log
        /// </summary>
        public int TransactionLogId { get; set; }
        
        /// <summary>
        /// Unique transaction ID for distributed operations
        /// </summary>
        public string? TransactionId { get; set; }
        
        /// <summary>
        /// Creates a successful transaction result
        /// </summary>
        /// <param name="result">The operation result</param>
        /// <param name="transactionLogId">ID of the transaction log entry</param>
        /// <returns>A successful transaction result</returns>
        public static TransactionResult<T> Succeeded(T result, int transactionLogId, string? transactionId = null)
        {
            return new TransactionResult<T>
            {
                Success = true,
                Result = result,
                TransactionLogId = transactionLogId,
                TransactionId = transactionId
            };
        }
        
        /// <summary>
        /// Creates a failed transaction result
        /// </summary>
        /// <param name="errorCode">Error code</param>
        /// <param name="errorMessage">Error message</param>
        /// <param name="transactionLogId">ID of the transaction log entry</param>
        /// <returns>A failed transaction result</returns>
        public static TransactionResult<T> Failed(string errorCode, string errorMessage, int transactionLogId = 0, string? transactionId = null)
        {
            return new TransactionResult<T>
            {
                Success = false,
                ErrorCode = errorCode,
                ErrorMessage = errorMessage,
                TransactionLogId = transactionLogId,
                TransactionId = transactionId
            };
        }
    }
    
    /// <summary>
    /// Context for distributed transactions
    /// </summary>
    public class DistributedTransactionContext
    {
        /// <summary>
        /// Unique ID for the transaction
        /// </summary>
        public string TransactionId { get; set; } = string.Empty;
        
        /// <summary>
        /// Type of transaction
        /// </summary>
        public string TransactionType { get; set; } = string.Empty;
        
        /// <summary>
        /// Starting state of the transaction
        /// </summary>
        public string FromState { get; set; } = string.Empty;
        
        /// <summary>
        /// Target state of the transaction
        /// </summary>
        public string ToState { get; set; } = string.Empty;
        
        /// <summary>
        /// Result of previous operations in the transaction
        /// </summary>
        public string Result { get; set; } = string.Empty;
        
        /// <summary>
        /// Timestamp when the transaction started
        /// </summary>
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Compensating actions for distributed transactions
    /// </summary>
    public class CompensatingActions
    {
        /// <summary>
        /// Action to execute when a transaction fails
        /// </summary>
        public Func<DistributedTransactionContext, Task>? OnFailure { get; set; }
        
        /// <summary>
        /// Action to execute when a transaction succeeds
        /// </summary>
        public Func<DistributedTransactionContext, Task>? OnSuccess { get; set; }
    }
} 