# ResetDatabase.ps1
# This script resets the database for the TaskTrackerAPI

# Navigate to the project directory
Write-Host "Navigating to TaskTrackerAPI project directory..." -ForegroundColor Cyan
cd $PSScriptRoot\TaskTrackerAPI

# Get the database connection string from appsettings.json
Write-Host "Reading database connection string..." -ForegroundColor Cyan
$appsettingsPath = "appsettings.json"
$appsettingsContent = Get-Content $appsettingsPath -Raw
$appsettingsJson = $appsettingsContent | ConvertFrom-Json
$connectionString = $appsettingsJson.ConnectionStrings.DefaultConnection

# Extract database name from connection string
$databaseName = $connectionString -replace '.*Database=([^;]+).*', '$1'

# Delete existing migrations folder
Write-Host "Deleting existing migrations..." -ForegroundColor Yellow
if (Test-Path "Migrations") {
    Remove-Item -Recurse -Force "Migrations"
    Write-Host "Existing migrations deleted." -ForegroundColor Green
} else {
    Write-Host "No existing migrations folder found." -ForegroundColor Yellow
}

# Create a new initial migration
Write-Host "Creating new initial migration..." -ForegroundColor Cyan
dotnet ef migrations add InitialCreate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create migration." -ForegroundColor Red
    exit 1
}
Write-Host "Migration created successfully." -ForegroundColor Green

# Drop the existing database
Write-Host "Dropping existing database if it exists..." -ForegroundColor Yellow
$dropDbScript = @"
USE master;
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'$databaseName')
BEGIN
    ALTER DATABASE [$databaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [$databaseName];
    PRINT 'Database $databaseName dropped.';
END
ELSE
BEGIN
    PRINT 'Database $databaseName does not exist.';
END
"@

# Save the SQL script
$dropScriptPath = "drop_database.sql"
$dropDbScript | Out-File -FilePath $dropScriptPath -Encoding utf8

# Run the SQL script using sqlcmd if available, otherwise just display it
try {
    sqlcmd -S "(localdb)\MSSQLLocalDB" -i $dropScriptPath
    Write-Host "Database dropped successfully." -ForegroundColor Green
} catch {
    Write-Host "Could not execute sqlcmd. Please run the following SQL manually:" -ForegroundColor Yellow
    Write-Host $dropDbScript -ForegroundColor Gray
}

# Remove the temporary script
if (Test-Path $dropScriptPath) {
    Remove-Item $dropScriptPath
}

# Apply the migration to create a new database
Write-Host "Creating new database with migrations..." -ForegroundColor Cyan
dotnet ef database update
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update database." -ForegroundColor Red
    exit 1
}
Write-Host "Database created and migrations applied successfully." -ForegroundColor Green

# Final message
Write-Host "Database reset completed successfully!" -ForegroundColor Green
Write-Host "The application is now ready to use with a fresh database." -ForegroundColor Green 