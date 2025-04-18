# Run integration tests for TaskTrackerAPI without building the entire solution

Write-Host "Starting TaskTrackerAPI integration tests..." -ForegroundColor Cyan

# Ensure only the API and the integration tests are built
Write-Host "Building TaskTrackerAPI project..." -ForegroundColor Yellow
dotnet build ../TaskTrackerAPI/TaskTrackerAPI.csproj

if ($LASTEXITCODE -ne 0) {
    Write-Host "TaskTrackerAPI build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Building integration tests project..." -ForegroundColor Yellow
dotnet build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Integration tests build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Optional: Clean test results directory
if (Test-Path "./TestResults") {
    Write-Host "Cleaning previous test results..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "./TestResults"
}

# Run the tests with detailed output
Write-Host "Running integration tests..." -ForegroundColor Yellow
dotnet test --no-build --logger "console;verbosity=detailed" --logger "trx;LogFileName=integrationtests.trx" --collect:"XPlat Code Coverage"

$testExitCode = $LASTEXITCODE

# Output test results
if ($testExitCode -eq 0) {
    Write-Host "All integration tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed with exit code $testExitCode" -ForegroundColor Red
    
    # Optional: If you want to automatically open the test results
    if (Test-Path "./TestResults") {
        $trxFile = Get-ChildItem -Path "./TestResults" -Filter "*.trx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($trxFile) {
            Write-Host "Test results available at: $($trxFile.FullName)" -ForegroundColor Yellow
        }
    }
}

exit $testExitCode 