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
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Filters
{
    /// <summary>
    /// Filter that handles validation failures from model binding and FluentValidation
    /// </summary>
    public class ValidateModelStateFilter : IActionFilter
    {
        private readonly ILogger<ValidateModelStateFilter> _logger;
        private readonly IValidationService _validationService;

        public ValidateModelStateFilter(
            ILogger<ValidateModelStateFilter> logger,
            IValidationService validationService)
        {
            _logger = logger;
            _validationService = validationService;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            // Check if the model state is valid
            if (!context.ModelState.IsValid)
            {
                // Create a structured error response with validation details
                object errorResponse = new
                {
                    Status = 400,
                    Title = "Validation Failed",
                    Errors = GetModelStateErrors(context)
                };

                // Log the validation failure
                _logger.LogWarning("Validation failed for request to {Path}. Errors: {@Errors}",
                    context.HttpContext.Request.Path,
                    errorResponse);

                // Return a bad request with the error details
                context.Result = new BadRequestObjectResult(errorResponse);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Nothing to do after execution
        }

        private IDictionary<string, string[]> GetModelStateErrors(ActionExecutingContext context)
        {
            // Convert model state errors to a dictionary
            return context.ModelState
                .Where(pair => pair.Value != null && pair.Value.Errors.Count > 0)
                .ToDictionary(
                    pair => pair.Key,
                    pair => pair.Value!.Errors.Select(error => error.ErrorMessage).ToArray()
                );
        }
    }
} 