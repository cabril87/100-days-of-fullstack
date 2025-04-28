# Using Postman with EmersSuite API

This guide will help you set up and use Postman to interact with the EmersSuite API instead of Swagger UI.

## Getting Started

1. Download and install [Postman](https://www.postman.com/downloads/) if you haven't already.

2. Import the provided Postman collection:
   - Open Postman
   - Click on "Import" button in the top left corner
   - Select the `EmersSuite_Postman_Collection.json` file from this directory
   - Click "Import"

## Setting Up Environment Variables

1. Create a new Environment in Postman:
   - Click on the "Environments" tab in Postman
   - Click "Create New Environment"
   - Name it "EmersSuite Local"
   - Add the following variables:
     - `baseUrl`: `http://localhost:5211` (or whatever port your API runs on)
     - `authToken`: Leave empty (this will be auto-filled after login)
     - `refreshToken`: Leave empty (this will be auto-filled after login)
   - Click "Save"

2. Select the environment from the dropdown in the top right corner of Postman.

## Authentication

1. First, use the "Login" request under the Authentication folder:
   - This will automatically save your access token to the environment variables
   - Default credentials: `admin@tasktracker.com` / `password`

2. After successful login, subsequent requests will automatically use the saved token.

## API Endpoints

The collection is organized into folders:

- **Authentication**: Login, Register, and Refresh Token
- **Tasks**: CRUD operations for tasks
- **Categories**: List and create categories
- **Family**: Family management
- **Statistics**: Get task statistics

## Making Requests

1. The collection already includes sample requests for all major endpoints
2. Each request has examples of required parameters and body data
3. Just select a request and click "Send" to test

## Adding Your Own Requests

1. You can duplicate existing requests to create new ones
2. Make sure to include the correct headers:
   - For authenticated requests: `Authorization: Bearer {{authToken}}`
   - For requests with a body: `Content-Type: application/json`

## API Versions

The API supports versioning. You can specify the API version in three ways:

1. URL path: `/api/v2/...`
2. Query parameter: `?api-version=2.0`
3. Header: `X-API-Version: 2.0`

## Troubleshooting

- If you get 401 Unauthorized errors, try logging in again
- Check the console output in your API for detailed error messages
- Ensure your API is running on the correct port that matches the `baseUrl` in your environment 