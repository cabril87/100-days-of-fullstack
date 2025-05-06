# TaskTrackerAPI - Running & Deployment Guide

This document provides instructions for running the TaskTrackerAPI in development and production environments, as well as how to build and release it, with and without Docker.

## File Location

This README should be located at the root directory of the TaskTrackerAPI project:
```
C:\Users\Abril\Documents\coding-projects\100-days-of-fullstack\TaskTrackerAPI\runapi.md
```

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) or later
- SQL Server (LocalDB for development, full instance for production)
- PowerShell or Command Prompt
- [Docker](https://www.docker.com/products/docker-desktop/) (optional, for containerized deployment)

## Running Without Docker

### In Development Environment

1. Navigate to the TaskTrackerAPI project directory:
   ```
   cd C:\Users\Abril\Documents\coding-projects\100-days-of-fullstack\TaskTrackerAPI
   ```

2. Run the API with development settings:
   ```
   dotnet run
   ```
   
   By default, this will:
   - Use development environment configurations
   - Listen on http://localhost:5211
   - Connect to the development database
   - Enable detailed error messages and developer exception pages

3. Alternatively, you can explicitly specify the development environment:
   ```
   $env:ASPNETCORE_ENVIRONMENT="Development"
   dotnet run
   ```

4. To change the port (e.g., if port 5211 is already in use):
   ```
   $env:ASPNETCORE_URLS="http://localhost:5222"
   dotnet run
   ```

### In Production Environment

#### Method 1: Direct Production Run (Not Recommended for Actual Deployment)

You can run the application directly in production mode for testing:

```
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

#### Method 2: From Published Build (Recommended)

1. Build a Release version from the TaskTrackerAPI project root:
   ```
   dotnet publish -c Release
   ```

2. Navigate to the published directory:
   ```
   cd bin\Release\net9.0\publish
   ```

3. Run in production mode:
   ```
   $env:ASPNETCORE_ENVIRONMENT="Production"
   dotnet TaskTrackerAPI.dll
   ```

4. To use a specific port:
   ```
   $env:ASPNETCORE_ENVIRONMENT="Production"
   $env:ASPNETCORE_URLS="http://localhost:5222"
   dotnet TaskTrackerAPI.dll
   ```

## Running With Docker

### Prerequisites for Docker

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Make sure Docker is running on your machine

### Create a Dockerfile

Create a file named `Dockerfile` in the root of your TaskTrackerAPI project (same directory as this README) with the following content:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TaskTrackerAPI.csproj", "."]
RUN dotnet restore "TaskTrackerAPI.csproj"
COPY . .
RUN dotnet build "TaskTrackerAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskTrackerAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskTrackerAPI.dll"]
```

### Running Docker in Development Mode

1. From the TaskTrackerAPI directory, build the Docker image:
   ```
   docker build -t tasktracker-api:dev .
   ```

2. Run the container in development mode:
   ```
   docker run -d -p 5211:80 -e ASPNETCORE_ENVIRONMENT=Development --name tasktracker-dev tasktracker-api:dev
   ```

3. Check the logs:
   ```
   docker logs tasktracker-dev
   ```

### Running Docker in Production Mode

1. From the TaskTrackerAPI directory, build the production image:
   ```
   docker build -t tasktracker-api:prod .
   ```

2. Run the container in production mode:
   ```
   docker run -d -p 5222:80 -e ASPNETCORE_ENVIRONMENT=Production --name tasktracker-prod tasktracker-api:prod
   ```

3. Check if the container is running:
   ```
   docker ps
   ```

### Docker Compose (Optional)

For a more complete setup with a database, create a `docker-compose.yml` file in the TaskTrackerAPI root directory:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5222:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=TaskTrackerDB;User=sa;Password=YourStrongPassword!;TrustServerCertificate=True
    depends_on:
      - db
    networks:
      - tasktracker-network

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrongPassword!
    ports:
      - "1433:1433"
    volumes:
      - tasktracker-data:/var/opt/mssql
    networks:
      - tasktracker-network

networks:
  tasktracker-network:
    driver: bridge

volumes:
  tasktracker-data:
```

Run from the TaskTrackerAPI directory:
```
docker-compose up -d
```

## Building for Release

### Standard Release Build (Without Docker)

From the TaskTrackerAPI project root:
```
dotnet publish -c Release
```

This will create a release build in the `bin\Release\net9.0\publish` directory.

### Self-Contained Deployment (Without Docker)

To create a self-contained deployment that includes the .NET runtime:

```
dotnet publish -c Release -r win-x64 --self-contained true
```

Replace `win-x64` with the appropriate runtime identifier for your target platform (e.g., `linux-x64`, `osx-x64`).

### Docker Image Build (With Docker)

For building a production-ready Docker image from the TaskTrackerAPI directory:

```
docker build -t tasktracker-api:prod .
```

To tag it for a container registry:

```
docker tag tasktracker-api:prod your-registry.com/tasktracker-api:latest
docker push your-registry.com/tasktracker-api:latest
```

## Environment Differences

### Development Environment
- Detailed error pages
- Swagger UI enabled at `/swagger`
- Database migrations applied automatically
- CORS set to permissive settings
- Development certificate used for HTTPS

### Production Environment
- Generic error pages (no sensitive information)
- Swagger UI disabled
- Strict CORS policy
- Production-level logging
- HTTPS enforced with HSTS
- Optimized for performance

## Verifying Your Environment

To check which environment your application is running in, look at the startup logs, which should display:

```
Hosting environment: Development
```

or

```
Hosting environment: Production
```

### How to check if you're running with Docker

If you're unsure whether you're running the application in Docker or directly:

1. If you started the application with `docker run` or `docker-compose up`, you are running in Docker.
2. If you started with `dotnet run` or `dotnet TaskTrackerAPI.dll`, you are running directly without Docker.

You can also check running Docker containers with:
```
docker ps
```

If your TaskTrackerAPI is listed, it's running in Docker.

## Troubleshooting

### Port Already in Use

If you see an error like "address already in use":

1. Terminate existing dotnet processes:
   ```
   taskkill /F /IM dotnet.exe
   ```
   
2. Or use a different port:
   ```
   $env:ASPNETCORE_URLS="http://localhost:5222"
   ```

3. If using Docker, check for running containers:
   ```
   docker ps
   ```
   
   And stop any competing containers:
   ```
   docker stop <container-id>
   ```

### Unable to Connect to Database

If you see database connection errors:
1. Verify SQL Server is running
2. Check connection strings in `appsettings.json` and `appsettings.Production.json`
3. If using Docker, make sure your database container is running and accessible
4. Check if you need to migrate the database

### Dependency Injection Errors

If you see errors related to services not being resolved:
1. Make sure your application properly handles scoped services in middleware
2. Verify all required services are registered in Program.cs

### Docker Specific Issues

1. **Image not found**: Make sure you've built the image with `docker build`
2. **Container exits immediately**: Check logs with `docker logs <container-id>`
3. **Cannot connect to SQL Server**: Ensure the connection string is configured for Docker networking 