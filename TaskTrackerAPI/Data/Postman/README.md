# TaskTracker API Postman Collection

This folder contains a Postman collection and environment for testing and documenting the TaskTracker API.

## Files

- `TaskTracker_API_Collection.json`: The main Postman collection containing all API requests organized by functionality
- `TaskTracker_API_Environment.json`: Environment variables for the API (development environment)

## Importing the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Drag and drop both files or navigate to them
4. Click "Import" to confirm

## Using the Collection

### Setting Up the Environment

1. After importing, select the "TaskTracker API - Development" environment from the dropdown in the top right corner of Postman
2. The `baseUrl` is set to `https://localhost:5001` by default. Update this value if your API is running on a different URL

### Authentication

1. First, use the "Register" request to create a new user
2. Then use the "Login" request to authenticate and get tokens
   - The collection automatically saves the access and refresh tokens to environment variables
3. All authenticated requests will use the access token automatically

### Testing Endpoints

The collection is organized into folders:

- **Authentication**: User registration, login, and token refreshing
- **Tasks**: All task management endpoints (CRUD operations)
- **Categories**: Category management 
- **Tags**: Tag management
- **Health & Monitoring**: System health checks and performance metrics (admin only)
- **Security**: Tests for security features implemented in Day 32, including security headers, resource ownership validation, rate limiting, role restrictions, and admin-only access controls
- **DataProtection**: Endpoints for encrypting/decrypting data and managing encryption keys (admin only)
- **Family Tasks**: Endpoints for family task assignments and approvals
- **Focus**: Endpoints for managing focus sessions and distractions
- **Task Priority**: Endpoints for automatic task prioritization

## Environment Variables

| Variable | Description |
|----------|-------------|
| baseUrl | The base URL of the API |
| accessToken | JWT access token (populated automatically after login) |
| refreshToken | JWT refresh token (populated automatically after login) |
| userId | User ID for testing |
| testTaskId | Task ID for testing specific task operations |
| testCategoryId | Category ID for testing specific category operations |
| testTagId | Tag ID for testing specific tag operations |
| childAccessToken | JWT access token for a child user account (for testing role restrictions) |
| familyId | Family ID for testing family-related operations |

## Tips for Using the Collection

1. The collection includes test scripts that automatically save authentication tokens from login responses
2. Use the "Health Check" request to verify the API is running before testing other endpoints
3. For admin-only endpoints (like metrics), ensure you're logged in with an admin account
4. Remember to refresh your access token if it expires using the "Refresh Token" request 