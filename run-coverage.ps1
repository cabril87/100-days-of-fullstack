# Check for required tools
if (-not (Get-Command reportgenerator -ErrorAction SilentlyContinue)) {
    Write-Host "Installing reportgenerator tool..."
    dotnet tool install -g dotnet-reportgenerator-globaltool
}

if (-not (Get-Command dotnet-coverage -ErrorAction SilentlyContinue)) {
    Write-Host "Installing dotnet-coverage tool..."
    dotnet tool install -g dotnet-coverage
}

# Create output directory
$outputDir = "coverage-report"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Remove old coverage files
Remove-Item -Path "*.cobertura.xml" -ErrorAction SilentlyContinue

# Run tests with coverage
Write-Host "Running tests with coverage collection..."

# Run Unit Tests with coverage
dotnet-coverage collect --output "coverage.unitTests.cobertura.xml" --output-format cobertura "dotnet test TaskTrackerAPI.UnitTests"

# Run Service Tests with coverage
dotnet-coverage collect --output "coverage.serviceTests.cobertura.xml" --output-format cobertura "dotnet test TaskTrackerAPI.ServiceTests"

# Run Integration Tests with coverage
dotnet-coverage collect --output "coverage.integrationTests.cobertura.xml" --output-format cobertura "dotnet test TaskTrackerAPI.IntegrationTests"

# Generate combined report
Write-Host "Generating combined coverage report..."
reportgenerator `
  -reports:"*.cobertura.xml" `
  -targetdir:$outputDir `
  -reporttypes:HtmlInline_AzurePipelines_Dark `
  -title:"TaskTrackerAPI Coverage Report"

# Open the report
Write-Host "Opening coverage report..."
Start-Process "$outputDir\index.html"

Write-Host "Coverage report generated at $outputDir\index.html" 