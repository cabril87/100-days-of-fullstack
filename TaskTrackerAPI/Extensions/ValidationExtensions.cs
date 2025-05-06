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
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using FluentValidation.AspNetCore;
using TaskTrackerAPI.Middleware;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using System.Reflection;
using Microsoft.AspNetCore.Http;

namespace TaskTrackerAPI.Extensions
{
    public static class ValidationExtensions
    {
        /// <summary>
        /// Adds the validation pipeline to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection AddValidationPipeline(this IServiceCollection services)
        {
            // Register the validation service
            services.AddScoped<IValidationService, ValidationService>();
            
            // Register FluentValidation
            services.AddFluentValidationAutoValidation();
            
            // Register all validators from assembly
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            
            // Configure automatic model state validation
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true; // We'll handle it explicitly
            });
            
            return services;
        }

        /// <summary>
        /// Adds the validation middleware to the request pipeline
        /// </summary>
        /// <param name="app">The application builder</param>
        /// <returns>The application builder for chaining</returns>
        public static IApplicationBuilder UseValidationPipeline(this IApplicationBuilder app)
        {
            // Use middleware factory approach to properly handle scoped services
            app.Use(async (context, next) =>
            {
                // Create a scope for the request
                using (var scope = app.ApplicationServices.CreateScope())
                {
                    // Get the validation service from the scope
                    var validationService = scope.ServiceProvider.GetRequiredService<IValidationService>();
                    var logger = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Logging.ILogger<ValidationMiddleware>>();
                    
                    // Create and invoke the middleware with the scoped service
                    var middleware = new ValidationMiddleware(
                        async (HttpContext ctx) => await next(ctx),
                        logger,
                        validationService);
                    
                    await middleware.InvokeAsync(context);
                }
            });
            
            return app;
        }
    }
} 