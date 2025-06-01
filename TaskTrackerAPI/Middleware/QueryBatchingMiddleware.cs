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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Middleware
{
    /// <summary>
    /// Middleware that handles batched API requests to reduce number of HTTP requests
    /// </summary>
    public class QueryBatchingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<QueryBatchingMiddleware> _logger;
        private readonly int _maxBatchSize;
        private readonly bool _enableAtomicOperations;
        
        /// <summary>
        /// Initializes a new instance of the QueryBatchingMiddleware class
        /// </summary>
        public QueryBatchingMiddleware(
            RequestDelegate next,
            ILogger<QueryBatchingMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _maxBatchSize = configuration.GetValue<int>("BatchOperations:MaxBatchSize", 100);
            _enableAtomicOperations = configuration.GetValue<bool>("BatchOperations:EnableAtomicOperations", true);
        }
        
        /// <summary>
        /// Process an HTTP request
        /// </summary>
        public async Task InvokeAsync(HttpContext context)
        {
            // Only process POST requests to the batch endpoint
            if (context.Request.Path.StartsWithSegments("/api/batch")
                && context.Request.Path.Value?.EndsWith("/execute") == true
                && context.Request.Method == HttpMethod.Post.Method)
            {
                await ProcessBatchRequestAsync(context);
                return;
            }
            
            // Continue with the regular pipeline for non-batch requests
            await _next(context);
        }
        
        /// <summary>
        /// Process a batch request
        /// </summary>
        private async Task ProcessBatchRequestAsync(HttpContext context)
        {
            try
            {
                // Get the request body
                string requestBody;
                using (StreamReader reader = new StreamReader(context.Request.Body, Encoding.UTF8))
                {
                    requestBody = await reader.ReadToEndAsync();
                }
                
                // Parse the batch request
                BatchRequest? batchRequest = JsonSerializer.Deserialize<BatchRequest>(requestBody);
                
                if (batchRequest == null || batchRequest.Requests == null || !batchRequest.Requests.Any())
                {
                    await WriteErrorResponseAsync(context, HttpStatusCode.BadRequest, "No requests specified in batch");
                    return;
                }
                
                // Check batch size limit
                if (batchRequest.Requests.Count > _maxBatchSize)
                {
                    await WriteErrorResponseAsync(context, HttpStatusCode.BadRequest, 
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})");
                    return;
                }
                
                // Process each request in the batch
                List<BatchResponse> responses = new List<BatchResponse>();
                bool hasErrors = false;
                
                foreach (BatchRequestItem request in batchRequest.Requests)
                {
                    // Validate relative URL (must start with /)
                    if (string.IsNullOrEmpty(request.RelativeUrl) || !request.RelativeUrl.StartsWith("/"))
                    {
                        responses.Add(new BatchResponse
                        {
                            Id = request.Id,
                            StatusCode = (int)HttpStatusCode.BadRequest,
                            Body = "Invalid URL. Must be a relative URL starting with '/'",
                            Success = false
                        });
                        
                        hasErrors = true;
                        continue;
                    }
                    
                    // Execute the individual request
                    BatchResponse response = await ExecuteRequestAsync(context, request);
                    responses.Add(response);
                    
                    // For atomic operations, break on first error
                    if (_enableAtomicOperations && batchRequest.IsAtomic && !response.Success)
                    {
                        hasErrors = true;
                        break;
                    }
                }
                
                // If atomic and there were errors, return failure status
                if (_enableAtomicOperations && batchRequest.IsAtomic && hasErrors)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                }
                else
                {
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                }
                
                // Write the batch response
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    Success = !(_enableAtomicOperations && batchRequest.IsAtomic && hasErrors),
                    Responses = responses,
                    TotalCount = responses.Count,
                    SuccessCount = responses.Count(r => r.Success),
                    FailureCount = responses.Count(r => !r.Success),
                    IsAtomic = batchRequest.IsAtomic
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing batch request");
                await WriteErrorResponseAsync(context, HttpStatusCode.InternalServerError, "Error processing batch request");
            }
        }
        
        /// <summary>
        /// Execute a single request within a batch
        /// </summary>
        private async Task<BatchResponse> ExecuteRequestAsync(HttpContext originalContext, BatchRequestItem request)
        {
            try
            {
                // Create a new HttpContext for the subrequest
                DefaultHttpContext newContext = new DefaultHttpContext();
                IHttpRequestFeature requestFeature = newContext.Features.Get<IHttpRequestFeature>()!;
                
                requestFeature.Method = request.Method.ToUpper();
                requestFeature.Path = request.RelativeUrl;
                requestFeature.QueryString = "";
                requestFeature.Scheme = originalContext.Request.Scheme;
                
                // Copy headers
                foreach (KeyValuePair<string, StringValues> header in originalContext.Request.Headers)
                {
                    newContext.Request.Headers[header.Key] = header.Value;
                }
                
                // Add request body if applicable
                if (!string.IsNullOrEmpty(request.Body))
                {
                    byte[] bodyBytes = Encoding.UTF8.GetBytes(request.Body);
                    newContext.Request.ContentType = "application/json";
                    newContext.Request.ContentLength = bodyBytes.Length;
                    newContext.Request.Body = new MemoryStream(bodyBytes);
                }
                
                // Copy authentication information
                if (originalContext.User.Identity?.IsAuthenticated == true)
                {
                    newContext.User = originalContext.User;
                }
                
                // Create response recorder
                MemoryStream responseBodyStream = new MemoryStream();
                newContext.Response.Body = responseBodyStream;
                
                // Process the request through the pipeline
                await _next(newContext);
                
                // Read the response
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                string responseBody = await new StreamReader(responseBodyStream).ReadToEndAsync();
                
                return new BatchResponse
                {
                    Id = request.Id,
                    StatusCode = newContext.Response.StatusCode,
                    Body = responseBody,
                    Success = newContext.Response.StatusCode >= 200 && newContext.Response.StatusCode < 300
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing batch request item");
                return new BatchResponse
                {
                    Id = request.Id,
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Body = "Error executing request: " + ex.Message,
                    Success = false
                };
            }
        }
        
        /// <summary>
        /// Write an error response to the HTTP context
        /// </summary>
        private async Task WriteErrorResponseAsync(HttpContext context, HttpStatusCode statusCode, string message)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            
            await context.Response.WriteAsJsonAsync(Models.ApiResponse<object>.ErrorResponse(message));
        }
    }
} 