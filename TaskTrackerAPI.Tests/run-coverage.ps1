# Run tests with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/"

# Check if the report file was created
if (Test-Path "./TestResults/coverage.cobertura.xml") {
    # Install the report generator tool if not already installed
    if (-not (Get-Command reportgenerator -ErrorAction SilentlyContinue)) {
        dotnet tool install -g dotnet-reportgenerator-globaltool
    }
    
    # Generate HTML report
    reportgenerator "-reports:./TestResults/coverage.cobertura.xml" "-targetdir:./TestResults/CoverageReport" "-reporttypes:Html"
    
    # Open the report in the default browser
    Invoke-Item "./TestResults/CoverageReport/index.html"
} else {
    Write-Host "Coverage file not found. Make sure the tests ran successfully."
} 