# Request Validation Pipeline

This document explains how to use the comprehensive validation pipeline to secure your API endpoints against injection attacks and malicious inputs.

## Overview

The validation pipeline consists of several components:

1. **ValidationMiddleware**: Performs deep validation on request bodies, query parameters, and route values to prevent SQL injection, command injection, and XSS attacks.

2. **ValidationService**: Centralized service with validation logic, including field-level validation, sanitization, and caching of validation results.

3. **FluentValidation**: For domain-specific validation rules (e.g., checking that entities exist in database).

4. **Custom Model Binders**: For special validation and sanitization scenarios, such as HTML sanitization.

5. **Validation Filters**: For consistent error handling across the application.

## Protecting Against Common Attacks

### SQL Injection Protection

The validation pipeline automatically checks all inputs for potential SQL injection patterns, such as:

- SQL keywords (SELECT, INSERT, UPDATE, DELETE, etc.)
- SQL commenting (-- or /* */)
- Common DBMS command execution (xp_cmdshell, etc.)

### Command Injection Protection

The pipeline also checks for attempts to inject operating system commands, such as:

- Command chaining operators (;, |, &&, ||)
- Shell access attempts
- Command substitution ($(command) or `command`)

### Cross-Site Scripting (XSS) Protection

XSS prevention is handled through:

- Detection of common script patterns (<script>, javascript:, etc.)
- Automatic sanitization of HTML in free-text fields
- Removal of event handlers and other dangerous JavaScript patterns

## How to Use

### Basic Input Validation

For simple validation rules, use FluentValidation by creating a validator class:

```csharp
public class MyDtoValidator : AbstractValidator<MyDto>
{
    public MyDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
        
        // Additional rules...
    }
}
```

### Sanitizing HTML Input

Use the `[Sanitize]` attribute on string properties to automatically sanitize HTML:

```csharp
public class CommentDto
{
    [Sanitize]
    public string Content { get; set; }
}
```

### Advanced Validation with Repository Checks

For validation rules that require database access, inject repositories into your validator:

```csharp
public class TaskCreateValidator : AbstractValidator<TaskCreateDto>
{
    public TaskCreateValidator(ICategoryRepository categoryRepo)
    {
        RuleFor(x => x.CategoryId)
            .MustAsync(async (id, cancellation) => await categoryRepo.ExistsAsync(id))
            .WithMessage("Category does not exist");
    }
}
```

### Custom Validation Rules

To create custom validation rules, use the `Must` or `MustAsync` methods:

```csharp
RuleFor(x => x.UserInput)
    .Must(BeValidText)
    .WithMessage("Input contains potentially malicious content");

private bool BeValidText(string text)
{
    // Custom validation logic
    return !containsMaliciousContent(text);
}
```

## Performance Considerations

The validation pipeline includes caching to improve performance:

- Validation results are cached for frequently validated patterns
- The cache uses a sliding expiration window (default: 10 minutes)
- Cache keys are based on the object type and a hash of its content

## Error Response Format

Validation errors are returned in a standardized format:

```json
{
  "status": 400,
  "title": "Validation Failed",
  "errors": {
    "propertyName1": ["Error message 1", "Error message 2"],
    "propertyName2": ["Error message 3"]
  }
}
```

## Testing Validation Rules

When writing tests for validation, you can directly instantiate validators:

```csharp
[Fact]
public async Task Should_Validate_Title()
{
    // Arrange
    var validator = new TaskItemCreateRequestValidator(mockValidationService, mockCategoryRepo, mockTagRepo);
    var dto = new TaskItemCreateRequestDTO { Title = ""; };
    
    // Act
    var result = await validator.ValidateAsync(dto);
    
    // Assert
    Assert.False(result.IsValid);
    Assert.Contains(result.Errors, e => e.PropertyName == "Title");
} 