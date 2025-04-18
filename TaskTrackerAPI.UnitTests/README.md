# TaskTrackerAPI Unit Tests

This project contains all unit tests for the TaskTrackerAPI repositories and low-level components. Unit tests focus on testing individual components in isolation, with dependencies mocked or faked.

## Project Structure

- **Repositories/**: Tests for repository classes that interact with the database
  - Repository tests use an in-memory database to simulate data access without requiring a real database connection
  - Each test suite seeds its own data and verifies repository methods behave as expected

## Test Naming Convention

Tests follow a clear naming pattern: `MethodName_Scenario_ExpectedResult`

For example:
- `GetCategoryByIdAsync_WithValidIdAndUser_ReturnsCategory`
- `DeleteTaskAsync_WithUnownedTask_DoesNotCallRepository`

## Mocking Strategy

These tests use:
- **In-memory database** - For repository testing without real database connections
- **Moq** - For mocking interfaces and dependencies

## Running the Tests

```bash
# Run all tests in the project
dotnet test TaskTrackerAPI.UnitTests

# Run with code coverage reporting
dotnet test TaskTrackerAPI.UnitTests /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Guidelines for Adding New Tests

1. Group tests by the component they are testing
2. Mock all external dependencies
3. Tests should run independently without affecting each other
4. Focus on testing behavior, not implementation details
5. Add appropriate setup/cleanup to ensure tests don't affect each other 