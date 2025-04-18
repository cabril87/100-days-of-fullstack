# Script to test the TaskTracker API Statistics endpoints
# This script will authenticate and make requests to various statistics endpoints

# Configuration
$baseUrl = "http://localhost:5211/api"
$email = "admin@example.com"  # Use a known user from your system
$password = "Password123!"    # Use the correct password for that user

# Step 1: Login to get authentication token
Write-Host "Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $loginResponse.accessToken
    
    # Set the authorization header for subsequent requests
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Step 2: Test various statistics endpoints
    Write-Host "`nTesting Statistics endpoints..." -ForegroundColor Cyan
    
    # Get all statistics
    Write-Host "`n1. Testing /Statistics endpoint" -ForegroundColor Yellow
    try {
        $statsResponse = Invoke-RestMethod -Uri "$baseUrl/Statistics" -Method Get -Headers $headers
        Write-Host "Response:" -ForegroundColor Green
        $statsResponse | ConvertTo-Json -Depth 4
    } catch {
        Write-Host "Error accessing /Statistics: $_" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    # Get productivity summary
    Write-Host "`n2. Testing /Statistics/productivity-summary endpoint" -ForegroundColor Yellow
    try {
        $prodResponse = Invoke-RestMethod -Uri "$baseUrl/Statistics/productivity-summary" -Method Get -Headers $headers
        Write-Host "Response:" -ForegroundColor Green
        $prodResponse | ConvertTo-Json -Depth 4
    } catch {
        Write-Host "Error accessing /Statistics/productivity-summary: $_" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    # Get completion rate
    Write-Host "`n3. Testing /Statistics/completion-rate endpoint" -ForegroundColor Yellow
    try {
        $completionResponse = Invoke-RestMethod -Uri "$baseUrl/Statistics/completion-rate" -Method Get -Headers $headers
        Write-Host "Response:" -ForegroundColor Green
        $completionResponse | ConvertTo-Json -Depth 4
    } catch {
        Write-Host "Error accessing /Statistics/completion-rate: $_" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    # Get tasks by status distribution
    Write-Host "`n4. Testing /Statistics/status-distribution endpoint" -ForegroundColor Yellow
    try {
        $statusResponse = Invoke-RestMethod -Uri "$baseUrl/Statistics/status-distribution" -Method Get -Headers $headers
        Write-Host "Response:" -ForegroundColor Green
        $statusResponse | ConvertTo-Json -Depth 4
    } catch {
        Write-Host "Error accessing /Statistics/status-distribution: $_" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # If the login response has more details
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest complete!" -ForegroundColor Cyan 