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
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.ModelBinders
{
    /// <summary>
    /// A custom model binder that automatically sanitizes string inputs to prevent XSS
    /// </summary>
    public class SanitizedStringModelBinder : IModelBinder
    {
        public async Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
            {
                throw new ArgumentNullException(nameof(bindingContext));
            }

            // Get the value provider result for this key
            ValueProviderResult valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

            // If no value was provided, do nothing
            if (valueProviderResult == ValueProviderResult.None)
            {
                return;
            }

            // Get the value as a string
            string? value = valueProviderResult.FirstValue;

            // If the value is null or empty, set the result and return
            if (string.IsNullOrEmpty(value))
            {
                bindingContext.Result = ModelBindingResult.Success(value);
                return;
            }

            // Get the validation service to sanitize the input
            IValidationService validationService = bindingContext.HttpContext.RequestServices.GetRequiredService<IValidationService>();

            // Sanitize the string - using Task.Run to make this truly async
            string sanitizedValue = await Task.Run(() => validationService.SanitizeHtml(value));

            // Set the model binding result
            bindingContext.Result = ModelBindingResult.Success(sanitizedValue);
        }
    }
} 