Write-Host "Applying migrations for Gamification enhancements" -ForegroundColor Cyan

# Navigate to the API project directory
Set-Location -Path .\TaskTrackerAPI

# Apply the migrations
Write-Host "Applying migration: AddDifficultyToChallenge" -ForegroundColor Yellow
dotnet ef database update 20250417000000_AddDifficultyToChallenge

Write-Host "Applying migration: AddDifficultyToAchievement" -ForegroundColor Yellow
dotnet ef database update 20250417001000_AddDifficultyToAchievement

Write-Host "All migrations completed successfully!" -ForegroundColor Green 