# Script to start the backend API
# This script ensures there are no conflicting processes before starting

Write-Host "Checking for existing TaskTrackerAPI processes..." -ForegroundColor Cyan

# Check for existing processes
$existingProcesses = Get-Process -Name TaskTrackerAPI -ErrorAction SilentlyContinue

if ($existingProcesses) {
    Write-Host "Found existing TaskTrackerAPI processes. Stopping them..." -ForegroundColor Yellow
    
    try {
        $existingProcesses | ForEach-Object {
            Write-Host "Stopping process with ID: $($_.Id)" -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        }
        Write-Host "All conflicting processes stopped." -ForegroundColor Green
    }
    catch {
        Write-Host "Error stopping processes: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "No conflicting processes found." -ForegroundColor Green
}

# Navigate to the TaskTrackerAPI directory
Set-Location -Path "TaskTrackerAPI"

Write-Host "Starting TaskTrackerAPI..." -ForegroundColor Cyan

try {
    # Start the API
    dotnet run
}
catch {
    Write-Host "Error starting API: $_" -ForegroundColor Red
    exit 1
} 