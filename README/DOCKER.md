# Docker Setup for TaskTrackerAPI

This document explains how to use Docker to run the TaskTrackerAPI project with all its dependencies.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine
- [Azure Data Studio](https://azure.microsoft.com/en-us/products/data-studio/) (optional, for database management)

## Quick Start

1. Open a terminal in the project root directory (where the `docker-compose.yml` file is located)
2. Run the following command to start all services:

```bash
docker-compose up -d
```

3. The following services will be started:
   - SQL Server database (accessible at localhost:1433)
   - TaskTrackerAPI (accessible at http://localhost:5000 or https://localhost:5001)

4. To stop all services:

```bash
docker-compose down
```

## Connecting to the Database

### Using Azure Data Studio:

1. Open Azure Data Studio
2. Click "New Connection"
3. Enter the following details:
   - Connection type: Microsoft SQL Server
   - Server: localhost,1433
   - Authentication type: SQL Login
   - User name: sa
   - Password: TaskTracker_StrongP@ssw0rd!
   - Database: TaskTrackerDB (leave empty for first connection)
   - Trust server certificate: Check this option
4. Click "Connect"

### Using SQL Server Management Studio:

1. Open SQL Server Management Studio
2. Enter the following in the Connect dialog:
   - Server type: Database Engine
   - Server name: localhost,1433
   - Authentication: SQL Server Authentication
   - Login: sa
   - Password: TaskTracker_StrongP@ssw0rd!
3. Click "Connect"

## Docker Commands Reference

### View running containers

```bash
docker ps
```

### View logs for a specific service

```bash
docker-compose logs -f tasktracker-api
```

### Restart a specific service

```bash
docker-compose restart tasktracker-api
```

### Rebuild and restart services after code changes

```bash
docker-compose up -d --build
```

### Stop and remove all containers, networks, and volumes

```bash
docker-compose down -v
```

## Volumes and Persistence

The following persistent volumes are created:

- `tasktracker-sqlserver-data`: Stores SQL Server database files
- `tasktracker-api-keys`: Stores encryption keys for Data Protection API

Data in these volumes persists even when containers are stopped or removed.

## Environment Variables

The following environment variables can be modified in the `docker-compose.yml` file:

- Database connection string
- JWT token keys
- Password encryption keys
- Application environment (Development/Production)

**Note:** In a production environment, you should never store sensitive information in the docker-compose.yml file. Use Docker secrets or environment variables instead.

## Troubleshooting Common Issues

### String truncation errors in database

If you encounter errors like "String or binary data would be truncated in table", this is likely due to encrypted data being too large for the column size.

**Solution:** Increase the string length for columns with the `[Encrypt]` attribute:

```csharp
[StringLength(500)]  // Increase from default 100/50
[Encrypt(purpose: "PII")]
public required string Email { get; set; }
```

The encrypted size is typically 4-5x larger than the original text.

### Port mapping issues

If you're unable to access the API at http://localhost:5000, check the port mapping in docker-compose.yml:

```yaml
ports:
  - "5000:8080"  # Maps host port 5000 to container port 8080
  - "5001:443"   # Maps host port 5001 to container port 443
```

The API listens on port 8080 inside the container, not port 80.

### CORS issues with file:// protocol

When testing with local HTML files using the file:// protocol, make sure your CORS policy is properly configured:

1. The API detects Docker environment using the `DOCKER_ENVIRONMENT` variable
2. In development, it uses `AllowAnyOrigin()` for local testing
3. In Docker and production environments, it uses specific origins

See Program.cs for the complete CORS configuration.

### Checking API logs

If you're having issues, check the API logs:

```bash
docker-compose logs tasktracker-api
```

This will display startup errors, connection issues, and other helpful debugging information. 