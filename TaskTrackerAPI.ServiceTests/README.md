# TaskTrackerAPI Service Tests

This project contains tests for all service-layer components in the TaskTrackerAPI application. Service tests focus on business logic and behavior, with dependencies like repositories mocked.

## Project Structure

- **Services/**: Tests for service classes that implement business logic
  - Each service test class mocks the repositories and other dependencies
  - Verifies that service methods coordinate correctly with dependencies
  - Tests business rules and exception handling

- **Helpers/**: Tests for helper classes and utilities
  - `AuthHelperMock.cs` - Mock implementation of authentication helpers for testing
  - `MappingProfileTests.cs` - Tests for AutoMapper configuration and mapping profiles

## Test Configuration

Test configuration is managed through `appsettings.test.json`, which includes:
- `TokenKey` - Used for JWT token signing in tests
- `PasswordKey` - Used for password pepper in tests

These test keys are intentionally using safe test values and are not used in production.

## Test Naming Convention

Tests follow a clear naming pattern: `MethodName_Scenario_ExpectedResult`

For example:
- `CreateCategoryAsync_WithDuplicateName_ThrowsException`
- `GetTasksByStatusAsync_ReturnsTasksWithMatchingStatus`

## Mocking Strategy

These tests use:
- **Moq** - For mocking repositories and other dependencies
- **Mock implementations** - For complex helpers like authentication

## Running the Tests

```bash
# Run all tests in the project
dotnet test TaskTrackerAPI.ServiceTests

# Run with code coverage reporting
dotnet test TaskTrackerAPI.ServiceTests /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Guidelines for Adding New Tests

1. Group tests by the service they are testing
2. Mock all external dependencies (repositories, helpers, etc.)
3. Verify both successful and error scenarios
4. Test business rules and constraints
5. Ensure tests run independently without affecting each other 