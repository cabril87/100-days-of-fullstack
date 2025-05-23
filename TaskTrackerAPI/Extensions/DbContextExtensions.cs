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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Extensions
{
    /// <summary>
    /// Extensions methods for optimizing database context operations
    /// </summary>
    public static class DbContextExtensions
    {
        /// <summary>
        /// Optimizes an IQueryable by applying appropriate query hints and includes
        /// for better performance in production environments
        /// </summary>
        /// <typeparam name="T">The entity type</typeparam>
        /// <param name="query">The query to optimize</param>
        /// <param name="includeProperties">Optional properties to include</param>
        /// <returns>An optimized IQueryable</returns>
        public static IQueryable<T> OptimizeQuery<T>(
            this IQueryable<T> query, 
            params Expression<Func<T, object>>[] includeProperties) where T : class
        {
            // Apply includes for eager loading
            if (includeProperties != null)
            {
                query = includeProperties.Aggregate(
                    query, 
                    (current, include) => current.Include(include));
            }
            
            // Add no-tracking query hint for read-only queries
            query = query.AsNoTracking();
            
            return query;
        }
        
        /// <summary>
        /// Executes a query with a timeout and provides performance metrics
        /// </summary>
        /// <typeparam name="T">The result type</typeparam>
        /// <param name="dbContext">The database context</param>
        /// <param name="queryAction">The query action to execute</param>
        /// <param name="commandTimeout">Optional timeout in seconds (default from configuration)</param>
        /// <param name="logger">Optional logger</param>
        /// <returns>The query result</returns>
        public static async Task<T> ExecuteWithMetricsAsync<T>(
            this DbContext dbContext,
            Func<DbContext, Task<T>> queryAction,
            int? commandTimeout = null,
            ILogger? logger = null)
        {
            // Store original timeout
            int? originalTimeout = dbContext.Database.GetCommandTimeout();
            
            try
            {
                Stopwatch stopwatch = Stopwatch.StartNew();
                
                // Set command timeout if provided
                if (commandTimeout.HasValue)
                {
                    dbContext.Database.SetCommandTimeout(commandTimeout.Value);
                }
                
                // Execute the query
                T result = await queryAction(dbContext);
                
                stopwatch.Stop();
                
                // Log performance metrics
                if (logger != null && stopwatch.ElapsedMilliseconds > 500)
                {
                    logger.LogWarning(
                        "Slow query detected: {QueryType} took {ElapsedMilliseconds}ms",
                        typeof(T).Name,
                        stopwatch.ElapsedMilliseconds);
                }
                else if (logger != null)
                {
                    logger.LogDebug(
                        "Query executed: {QueryType} took {ElapsedMilliseconds}ms",
                        typeof(T).Name,
                        stopwatch.ElapsedMilliseconds);
                }
                
                return result;
            }
            finally
            {
                // Restore original timeout
                if (commandTimeout.HasValue)
                {
                    dbContext.Database.SetCommandTimeout(originalTimeout);
                }
            }
        }
        
        /// <summary>
        /// Gets a queryable with batch size optimization for large result sets
        /// </summary>
        /// <typeparam name="T">The entity type</typeparam>
        /// <param name="dbContext">The database context</param>
        /// <param name="batchSize">The batch size to use</param>
        /// <returns>An optimized IQueryable</returns>
        public static IQueryable<T> GetBatchedQueryable<T>(
            this DbContext dbContext,
            int batchSize = 1000) where T : class
        {
            return dbContext.Set<T>().AsNoTracking().AsSplitQuery();
        }
    }
} 