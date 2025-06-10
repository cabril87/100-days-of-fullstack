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
using System.Linq;
using FluentValidation;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Validators
{
    /// <summary>
    /// Validator for TaskItemCreateRequestDTO using FluentValidation
    /// </summary>
    public class TaskItemCreateRequestValidator : AbstractValidator<TaskItemCreateRequestDTO>
    {
        private readonly IValidationService _validationService;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ITagRepository _tagRepository;

        public TaskItemCreateRequestValidator(
            IValidationService validationService,
            ICategoryRepository categoryRepository,
            ITagRepository tagRepository)
        {
            _validationService = validationService;
            _categoryRepository = categoryRepository;
            _tagRepository = tagRepository;

            // Title validation
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(100).WithMessage("Title cannot exceed 100 characters")
                .Must(BeValidText).WithMessage("Title contains potentially malicious content");

            // Description validation (optional)
            When(x => !string.IsNullOrEmpty(x.Description), () =>
            {
                RuleFor(x => x.Description)
                    .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                    .Must(BeValidText).WithMessage("Description contains potentially malicious content");
            });

            // Status validation
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid task status value");

            // Priority validation - now expects string instead of int
            RuleFor(x => x.Priority)
                .NotEmpty().WithMessage("Priority is required")
                .Must(BeValidPriority).WithMessage("Priority must be Low, Medium, High, or Urgent");

            // Due date validation
            When(x => !string.IsNullOrEmpty(x.DueDate), () =>
            {
                RuleFor(x => x.DueDate)
                    .Must(BeValidDateString).WithMessage("Due date must be a valid ISO date string");
            });

            // Category validation
            When(x => x.CategoryId.HasValue, () =>
            {
                RuleFor(x => x.CategoryId!.Value)
                    .MustAsync(async (id, cancellation) => await _categoryRepository.ExistsAsync(id))
                    .WithMessage("Specified category does not exist");
            });

            // Tags validation - validate string tag names
            When(x => x.Tags != null && x.Tags.Count > 0, () =>
            {
                RuleFor(x => x.Tags)
                    .Must(tags => tags != null && tags.Count <= 10).WithMessage("Cannot have more than 10 tags per task")
                    .Must(tags => tags != null && tags.All(tag => !string.IsNullOrWhiteSpace(tag))).WithMessage("Tag names cannot be empty")
                    .Must(tags => tags != null && tags.All(tag => tag.Length <= 50)).WithMessage("Tag names cannot exceed 50 characters")
                    .Must(tags => tags != null && tags.All(BeValidText)).WithMessage("One or more tag names contain potentially malicious content")
                    .Must(tags => tags != null && tags.Distinct(StringComparer.OrdinalIgnoreCase).Count() == tags.Count).WithMessage("Duplicate tag names are not allowed");
            });

            // EstimatedTimeMinutes validation (renamed from EstimatedMinutes)
            When(x => x.EstimatedTimeMinutes.HasValue, () =>
            {
                RuleFor(x => x.EstimatedTimeMinutes!.Value)
                    .GreaterThanOrEqualTo(0).WithMessage("Estimated time must be positive")
                    .LessThanOrEqualTo(10080).WithMessage("Estimated time cannot exceed one week (10,080 minutes)");
            });

            // Skip recurring task validation for now - will implement later
        }

        private bool BeValidText(string text)
        {
            if (string.IsNullOrEmpty(text))
                return true;

            // Check for SQL injection
            if (_validationService.ContainsSqlInjection(text))
                return false;

            // Check for command injection
            if (_validationService.ContainsCommandInjection(text))
                return false;

            // Check for XSS
            if (_validationService.ContainsXss(text))
                return false;

            return true;
        }

        private bool BeValidPriority(string priority)
        {
            return priority == "Low" || priority == "Medium" || priority == "High" || priority == "Urgent";
        }

        private bool BeValidDateString(string? dateString)
        {
            if (string.IsNullOrEmpty(dateString))
                return false;
            return DateTime.TryParse(dateString, out _);
        }
    }
} 