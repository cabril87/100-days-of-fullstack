# Run integration tests for TaskTrackerAPI

Write-Host "Starting TaskTrackerAPI integration tests..." -ForegroundColor Cyan

# Ensure the solution is built
Write-Host "Building solution..." -ForegroundColor Yellow
dotnet build ..\100-days-of-fullstack.sln

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Optional: Clean test results directory
if (Test-Path "./TestResults") {
    Write-Host "Cleaning previous test results..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "./TestResults"
}

# Run the tests with detailed output
Write-Host "Running integration tests..." -ForegroundColor Yellow
dotnet test --logger "console;verbosity=detailed" --logger "trx;LogFileName=integrationtests.trx" --collect:"XPlat Code Coverage"

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