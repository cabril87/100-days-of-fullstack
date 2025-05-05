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

            // Priority validation
            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 5).WithMessage("Priority must be between 0 and 5");

            // Due date validation
            When(x => x.DueDate.HasValue, () =>
            {
                RuleFor(x => x.DueDate)
                    .Must(BeAFutureDate).WithMessage("Due date must be in the future");
            });

            // Category validation
            When(x => x.CategoryId.HasValue, () =>
            {
                RuleFor(x => x.CategoryId!.Value)
                    .MustAsync(async (id, cancellation) => await _categoryRepository.ExistsAsync(id))
                    .WithMessage("Specified category does not exist");
            });

            // Tags validation
            When(x => x.TagIds != null && x.TagIds.Count > 0, () =>
            {
                RuleForEach(x => x.TagIds)
                    .MustAsync(async (id, cancellation) => await _tagRepository.ExistsAsync(id))
                    .WithMessage("One or more specified tags do not exist");
                
                RuleFor(x => x.TagIds.Count)
                    .LessThanOrEqualTo(10).WithMessage("A maximum of 10 tags can be applied to a task");
            });

            // EstimatedMinutes validation
            When(x => x.EstimatedMinutes.HasValue, () =>
            {
                RuleFor(x => x.EstimatedMinutes!.Value)
                    .GreaterThanOrEqualTo(0).WithMessage("Estimated minutes must be positive")
                    .LessThanOrEqualTo(10080).WithMessage("Estimated minutes cannot exceed one week (10,080 minutes)");
            });

            // RecurrencePattern validation
            When(x => x.IsRecurring, () =>
            {
                RuleFor(x => x.RecurrencePattern)
                    .NotEmpty().WithMessage("Recurrence pattern is required for recurring tasks")
                    .MaximumLength(100).WithMessage("Recurrence pattern cannot exceed 100 characters")
                    .Must(BeValidText).WithMessage("Recurrence pattern contains potentially malicious content");
            });
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

        private bool BeAFutureDate(DateTime? date)
        {
            if (!date.HasValue)
                return true;

            // Allow same-day due dates, but not past dates
            return date.Value.Date >= DateTime.UtcNow.Date;
        }
    }
} 