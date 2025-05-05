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
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TaskTrackerAPI.ModelBinders
{
    /// <summary>
    /// Attribute to indicate that a string property should be sanitized to prevent XSS attacks
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter, AllowMultiple = false)]
    public class SanitizeAttribute : Attribute, IBindingSourceMetadata, IModelNameProvider
    {
        /// <summary>
        /// Gets the binding source.
        /// </summary>
        public BindingSource BindingSource { get; } = BindingSource.Custom;

        /// <summary>
        /// Gets the model name.
        /// </summary>
        public string? Name { get; }

        /// <summary>
        /// Creates a new instance of the SanitizeAttribute.
        /// </summary>
        public SanitizeAttribute()
        {
        }

        /// <summary>
        /// Creates a new instance of the SanitizeAttribute with a custom name.
        /// </summary>
        /// <param name="name">The name of the property</param>
        public SanitizeAttribute(string name)
        {
            Name = name;
        }
    }
} 