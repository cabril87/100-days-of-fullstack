Write-Host "Starting TaskTracker Docker containers..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Clean previous builds (optional, uncomment if needed)
# Write-Host "Cleaning previous Docker containers and volumes..." -ForegroundColor Yellow
# docker-compose down -v

# Start building and running containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Print information about running containers
Write-Host "TaskTracker containers are up and running:" -ForegroundColor Green
docker-compose ps

Write-Host "`nAPI endpoints:" -ForegroundColor Cyan
Write-Host "- API: http://localhost:5000/api/v1" -ForegroundColor White
Write-Host "- Swagger: http://localhost:5000/swagger" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White

Write-Host "`nDefault credentials:" -ForegroundColor Cyan
Write-Host "- Admin: emailOrUsername='admin@tasktracker.com', password='password'" -ForegroundColor White
Write-Host "- User: emailOrUsername='user@tasktracker.com', password='password'" -ForegroundColor White

Write-Host "`nImportant notes for login:" -ForegroundColor Yellow
Write-Host "1. Make sure to use 'emailOrUsername' field in your login request, not 'email'" -ForegroundColor White
Write-Host "2. Get a CSRF token first by calling GET /api/v1/auth/csrf before login" -ForegroundColor White
Write-Host "3. Include the CSRF token in X-CSRF-TOKEN header for POST requests" -ForegroundColor White

Write-Host "`nTo stop containers, run: docker-compose down" -ForegroundColor DarkYellow 