#!/bin/bash

echo -e "\e[36mStarting TaskTracker Docker containers...\e[0m"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "\e[31mError: Docker is not running. Please start Docker and try again.\e[0m"
    exit 1
fi

# Clean previous builds (optional, uncomment if needed)
# echo -e "\e[33mCleaning previous Docker containers and volumes...\e[0m"
# docker-compose down -v

# Start building and running containers
echo -e "\e[33mBuilding and starting containers...\e[0m"
docker-compose up -d --build

echo -e "\e[33mWaiting for services to initialize...\e[0m"
sleep 10

# Print information about running containers
echo -e "\e[32mTaskTracker containers are up and running:\e[0m"
docker-compose ps

echo -e "\n\e[36mAPI endpoints:\e[0m"
echo -e "- API: http://localhost:5000/api/v1"
echo -e "- Swagger: http://localhost:5000/swagger"
echo -e "- Frontend: http://localhost:3000"

echo -e "\n\e[36mDefault credentials:\e[0m"
echo -e "- Admin: emailOrUsername='admin@tasktracker.com', password='password'"
echo -e "- User: emailOrUsername='user@tasktracker.com', password='password'"

echo -e "\n\e[33mImportant notes for login:\e[0m"
echo -e "1. Make sure to use 'emailOrUsername' field in your login request, not 'email'"
echo -e "2. Get a CSRF token first by calling GET /api/v1/auth/csrf before login"
echo -e "3. Include the CSRF token in X-CSRF-TOKEN header for POST requests"

echo -e "\n\e[33mTo stop containers, run: docker-compose down\e[0m" 