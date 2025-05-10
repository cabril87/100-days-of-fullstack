# TaskTracker API Testing Guide

This guide will help you test the TaskTracker API, especially the authentication endpoints.

## Prerequisites

- Docker and Docker Compose installed
- Postman (for API testing)

## Getting Started

1. Start the Docker containers using one of the provided scripts:
   - Windows: Run `.\start-docker.ps1` in PowerShell
   - Unix/Linux/Mac: Run `./start-docker.sh` in a terminal (make it executable first with `chmod +x start-docker.sh`)
   - Alternatively, run these commands manually:
     ```
     docker-compose down
     docker-compose up -d
     ```

2. Wait for the containers to start up (this may take a minute or two)

3. Import the Postman collection:
   - Open Postman
   - Click "Import" and select the `tasktracker-postman.json` file
   - This will create a "TaskTracker API" collection with pre-configured requests

## Authentication Testing

### Important Authentication Notes

For successful authentication:

1. Always use `emailOrUsername` in your request, NOT `email`
2. Always get a CSRF token first before making POST requests
3. Include the CSRF token in the `X-CSRF-TOKEN` header for POST requests

### Testing Steps in Postman

1. **Get CSRF Token**:
   - Execute the "Get CSRF Token" request from the collection
   - This will make a GET request to `http://localhost:5000/api/v1/auth/csrf`
   - The CSRF token will be automatically saved as a cookie and as a variable in Postman

2. **Login with Admin**:
   - Execute the "Login - Admin" request from the collection
   - The request body should be:
     ```json
     {
         "emailOrUsername": "admin@tasktracker.com",
         "password": "password"
     }
     ```
   - The request should include the CSRF token in the X-CSRF-TOKEN header
   - This should return a successful response with access and refresh tokens

3. **Try User Profile**:
   - Execute the "Get User Profile" request
   - This will use the access token from login automatically
   - You should see the admin user's profile information

### Testing with curl

If you prefer to use curl, here's the sequence:

```bash
# Get CSRF token
curl -v -c cookies.txt http://localhost:5000/api/v1/auth/csrf

# Extract token from cookies.txt and use it for login
curl -v -b cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: YOUR_CSRF_TOKEN" \
  -d '{"emailOrUsername": "admin@tasktracker.com", "password": "password"}' \
  http://localhost:5000/api/v1/auth/login
```

## Troubleshooting

### Login Issues

- **401 Unauthorized**: Possible causes:
  - CSRF token is missing or invalid
  - Using `email` field instead of `emailOrUsername`
  - Incorrect password
  - User does not exist

- **400 Bad Request**: Possible causes:
  - Request format is incorrect
  - Required fields are missing
  - Using `email` field instead of `emailOrUsername`

### CSRF Token Issues

- Make sure to get a fresh CSRF token before login attempts
- The token is typically returned as a cookie called "XSRF-TOKEN"
- Check that your Postman is configured to store and send cookies

### Docker Issues

If containers are not starting properly:

1. Check the docker-compose.yml file to ensure ports are mapped correctly:
   - The API container should map port 5000->8080 (not 5000->80)
   
2. Check container logs:
   ```
   docker logs tasktracker-api
   docker logs tasktracker-sqlserver
   ```

3. Reset containers if needed:
   ```
   docker-compose down -v
   docker-compose up -d
   ```

### Database Seeding Issues

If the seeded users are not working:

1. Check if the database was properly initialized
2. Look for migration or seeding errors in the API logs:
   ```
   docker logs tasktracker-api
   ```
3. Reset the database:
   ```
   docker-compose down -v
   docker-compose up -d
   ```

## Default Credentials

- **Admin User**:
  - EmailOrUsername: `admin@tasktracker.com`
  - Password: `password`
  - Role: `Admin`

- **Regular User**:
  - EmailOrUsername: `user@tasktracker.com`
  - Password: `password`
  - Role: `User` 