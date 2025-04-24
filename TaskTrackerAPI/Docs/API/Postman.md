# Postman Collections

The TaskTrackerAPI project includes Postman collections to help with API testing and exploration. These collections are located in the `Data/Postman` directory.

## Available Collections

1. **TaskTracker_API_Collection.json** - Core API endpoints for tasks, categories, tags, and user management
2. **FamilyGamification.postman_collection.json** - Endpoints for the family gamification system

## Environment Setup

The collections use environment variables for flexibility. Use the included environment file:

- **TaskTracker_API_Environment.json** - Contains environment variables for base URL and authentication token

## Using the Collections

### Import the Collections and Environment

1. Open Postman
2. Click on "Import" button
3. Select the collection files and environment file from the `Data/Postman` directory

### Configure the Environment

1. In Postman, click on the environments dropdown (top right)
2. Select the "TaskTracker_API" environment
3. Update the variables as needed:
   - `baseUrl`: The base URL of your API (default: http://localhost:5211)
   - `token`: Your JWT authentication token

### Authentication

Most endpoints require authentication. To use authenticated endpoints:

1. First make a request to `POST /api/Auth/login` with your credentials
2. Copy the token from the response
3. Set the token as the environment variable value for `token`

### Using the Family Gamification Collection

The Family Gamification collection includes endpoints for:

- Managing family achievements
- Tracking achievement progress
- Viewing family leaderboards
- Connecting task completion to achievement progress

## Example Workflow

1. Login using the Auth/login endpoint
2. Set the token in your environment
3. Create a new family achievement using the POST /api/FamilyAchievements endpoint
4. Track progress on the achievement as family members complete tasks

## Troubleshooting

If you encounter issues with the collections:

- Ensure your API is running and accessible
- Verify that your authentication token is valid and properly set
- Check that all required request parameters are provided
- Confirm that the user has appropriate permissions for the operation

For more details on API endpoints, see [API_ENDPOINTS.md](API_ENDPOINTS.md). 