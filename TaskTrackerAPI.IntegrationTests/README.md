# TaskTrackerAPI Integration Tests

This project contains integration tests for the TaskTrackerAPI, ensuring that API endpoints and controllers work correctly with all dependencies in a close-to-production environment.

## Overview

The integration tests use a custom `WebApplicationFactory` to create an in-memory test server that hosts the API with an in-memory database. This allows tests to make HTTP requests to the API endpoints and verify the responses.

### Key Components

- **CustomWebApplicationFactory**: Sets up the test environment, including an in-memory database and test authentication
- **TestAuthHandler**: Provides authentication for tests without requiring real JWT token validation
- **Controller Tests**: Test each controller's endpoints for CRUD operations and business logic

## Test Coverage

The integration tests cover the following controllers and operations:

### Auth Controller
- User registration
- User login
- Token refresh
- Logout

### Category Controller
- Get all categories
- Get category by ID
- Create category
- Update category
- Delete category
- Get tasks by category

### Task Items Controller
- Get all tasks
- Get task by ID
- Create task
- Update task
- Delete task
- Filter tasks by status, priority, and due date

### User Controller
- Get user profile
- Update user profile
- Change password

## Running the Tests

### Using PowerShell Script

For convenience, a PowerShell script is provided to run all integration tests:

```powershell
.\run-tests.ps1
```

This script will:
1. Build the solution
2. Clean previous test results
3. Run all integration tests with detailed output
4. Report success or failure

### Manual Test Execution

To run the tests manually, use the following commands:

```bash
# Navigate to the integration tests project
cd TaskTrackerAPI.IntegrationTests

# Run the tests
dotnet test

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run with code coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Debugging Tests

To debug the integration tests:
1. Open the solution in Visual Studio or your preferred IDE
2. Set breakpoints in the test methods or in the API code
3. Run the tests in debug mode

## Configuration

The tests use the following configuration:

- In-memory SQLite database that's seeded with test data
- Test authentication that bypasses JWT validation
- Default test user with username "testuser" and password "Password123!"

## Adding New Tests

When adding new tests:
1. Follow the existing patterns in the corresponding controller test files
2. Ensure authentication is set up if testing protected endpoints
3. Add appropriate assertions to validate response status codes and response content
4. Consider edge cases and error conditions

## Common Issues

- **Authentication Failures**: Make sure the `TestAuthHandler` is properly configured
- **Missing Data**: Check that the database is being seeded with the necessary test data
- **Dependency Injection Issues**: Verify that services are properly registered in the `CustomWebApplicationFactory`

## Comprehensive Guide to Fixing Current Build Issues

The integration tests are currently failing to build due to several critical issues that need to be addressed:

### 1. TypeScript vs C# DTOs

The DTOs in the test project don't match those in the main API. There are multiple approaches to fix this:

#### Option A: Update Test DTOs to Match API DTOs
- Remove `DTOs/TestDTOs.cs` from the test project and reference the actual DTOs from the API.
- Update the `AdditionalDTOs.cs` file to only contain DTOs that don't exist in the API.

#### Option B: Create Mock DTOs with Compatible Properties
- Update all DTO classes in the test project to match the property signatures in the API DTOs.
- Fix specific property type mismatches (e.g., byte[] vs string, Guid vs int).

### 2. Model Changes in the API vs Tests

The API models and the test models have drifted apart:

- **User Model**: 
  - API has `Salt` and `Role` as string properties
  - Test expects these as byte[] properties
  - Fix: Update `CustomWebApplicationFactory.SeedDatabase()` to use string-type properties

- **TaskItem Model**:
  - API has renamed the model or its status enum
  - Test uses obsolete names
  - Fix: Update to match current names in API (`TaskItemStatus` enum values)

- **Collection Properties**:
  - API uses `DbSet<T>` with different names than tests
  - Fix: Update collection references (e.g., `TaskItems` vs potentially `Tasks`)

### 3. Authentication and Authorization

The current test auth handler is incompatible with the API's expectations:

- **TestAuthHandler.cs**: 
  - Update to use `TimeProvider` or create a compatible `ISystemClock` implementation
  - Fix the auth token generation to match what the API expects
  - Ensure claims include all required information

- **JWT Token Format**:
  - API expects a specific JWT format 
  - Fix: Ensure auth tokens in tests have the correct format

### 4. DTO Compatibility Issues

Several DTO classes have incompatible properties:

- **RegisterUserDTO**:
  - Missing: `ConfirmPassword`, `FirstName`, `LastName`
  - Fix: Add these properties or update tests to not use them

- **AuthResponseDTO**:
  - Missing: `UserId` property
  - Fix: Add this property or modify tests to extract user ID differently

- **RefreshTokenDTO**:
  - Missing: `Token` property (only has `RefreshToken`)
  - Fix: Add the `Token` property or update tests

- **UserProfileDTO**:
  - Missing entirely
  - Fix: Create this DTO class with required properties

### 5. Data Types and Assertions

There are multiple type conversion issues in assertions:

- **Guid vs int IDs**:
  - The API uses `Guid` while tests expect `int`
  - Fix: Update all ID references to use `Guid`

- **DateTime Comparisons**:
  - Invalid comparisons between DateTimes and other types
  - Fix: Update comparison logic to handle DateTimes properly

- **Collection Assertions**:
  - Some assertions use incorrect generic types
  - Fix: Update to use the correct type parameters

### 6. API Endpoint Compatibility

The tests call endpoints that might not match the API:

- **Route Parameters**:
  - Tests use `/api/tasks/999999` format, but API might use different format
  - Fix: Use actual API route formats

- **Query Parameters**:
  - Tests use different parameter names than API expects
  - Fix: Align query parameters with API expectations

### Step-by-Step Resolution Plan

1. **First, sync all model and DTO definitions**:
   - Use reflection or manual inspection to ensure test models match API models
   - Fix property types and names to be compatible

2. **Fix the CustomWebApplicationFactory**:
   - Update seed data to use correct types
   - Ensure database context configuration matches actual API

3. **Fix the AuthHandler**:
   - Implement a compatible auth scheme
   - Generate tokens in the format API expects

4. **Update test assertions**:
   - Fix type conversions and comparisons
   - Make sure all assertions use correct comparison methods

5. **Simplify the test scope**:
   - Start with a minimal set of tests that can pass
   - Gradually add tests as basic functionality works

By addressing these issues systematically, you should be able to get the integration tests working. Once basic tests pass, you can expand the coverage to include more advanced scenarios.

### Recommended First Steps

1. Start by focusing on a single controller test
2. Get that working end-to-end
3. Apply the learnings to other controller tests 

# TaskTrackerAPI Integration Tests - Fix Guide

## Key Issues to Fix

1. **System.Text.Json vs Newtonsoft.Json conflicts**
   - Pick one JSON serializer library and use it consistently
   - Replace ambiguous references to JsonSerializer

2. **DTO Type Conflicts**
   - Integration test DTOs conflict with API DTOs
   - Options: Delete AdditionalDTOs.cs and reference API DTOs directly, or use a different namespace

3. **TestAuthHandler for Modern ASP.NET**
   - Current implementation uses obsolete ISystemClock
   - Update to use TimeProvider

4. **Task Collection Name**
   - Rename `TaskItems` to `Tasks` in CustomWebApplicationFactory

5. **Method Signature Changes**
   - TestDataFactory has method signature mismatches with usage 
   - TestDataFactory.CreateChangePasswordDTO() doesn't match caller expectations

6. **Type Conversion Issues**
   - Guid vs int/int? type conversion errors
   - Fix UserId string/int conversion

## Quick Fix Plan

1. **Auth Handler Update**:
   ```csharp
   // Use proper constructor with modern TimeProvider
   public TestAuthHandler(
       IOptionsMonitor<AuthenticationSchemeOptions> options,
       ILoggerFactory logger,
       UrlEncoder encoder,
       ISystemClock clock)
       : base(options, logger, encoder, clock)
   {
   }
   ```

2. **Choose One JSON Library**:
   ```csharp
   // Remove System.Text.Json, use only Newtonsoft
   using Newtonsoft.Json;
   
   // Then consistently use:
   JsonConvert.SerializeObject(...)
   JsonConvert.DeserializeObject<T>(...)
   ```

3. **Fix TestDataFactory**:
   ```csharp
   // Fix method signature
   public static ChangePasswordDTO CreateChangePasswordDTO()
   {
       return new ChangePasswordDTO
       {
           CurrentPassword = "Password123!",
           NewPassword = "NewPassword123!",
           ConfirmNewPassword = "NewPassword123!"
       };
   }
   
   // Fix UpdateTaskItemDTO name
   public static TaskItemUpdateDTO UpdateTaskItemDTO(int? categoryId = 1)
   {
       // ...
   }
   ```

4. **Fix DbContext Reference**:
   ```csharp
   // In CustomWebApplicationFactory.cs
   context.Tasks.Add(task1);
   context.Tasks.Add(task2);
   ```

## Running the Fixed Tests

After making these changes:

1. Build the project:
   ```
   dotnet build
   ```

2. Run the tests:
   ```
   dotnet test
   ```

## More In-Depth Approach

If you need a more thorough fix:

1. Delete existing controller test files
2. Delete DTOs/AdditionalDTOs.cs
3. Create new reference to TaskTrackerAPI DTOs
4. Build completely new integration tests using the right types

This might be faster than fixing the numerous issues in the existing files. 