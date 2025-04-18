# Script to test the TaskTracker API ProductivitySummary endpoint
# This script focuses on the specific endpoint that's causing test failures

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
    
    # Step 2: Test the productivity summary endpoint with detailed diagnostics
    Write-Host "`nTesting /Statistics/productivity-summary endpoint..." -ForegroundColor Cyan
    
    try {
        # First, make the request with error action preference set to stop to catch HTTP errors
        $response = Invoke-RestMethod -Uri "$baseUrl/Statistics/productivity-summary" -Method Get -Headers $headers -ErrorAction Stop
        
        # If we get here, the request was successful
        Write-Host "SUCCESS: Received response from productivity-summary endpoint" -ForegroundColor Green
        
        # Check the response structure against what the test expects
        Write-Host "`nVerifying response structure..." -ForegroundColor Yellow
        
        # 1. Check if all required properties exist
        $requiredProps = @(
            "averageTasksPerDay", 
            "averageTasksPerWeek", 
            "averageCompletionRate", 
            "averageTimeToComplete", 
            "generatedAt"
        )
        
        $missingProps = @()
        foreach ($prop in $requiredProps) {
            if ($null -eq $response.$prop) {
                $missingProps += $prop
            }
        }
        
        if ($missingProps.Count -gt 0) {
            Write-Host "WARNING: Missing expected properties in response: $($missingProps -join ', ')" -ForegroundColor Yellow
        } else {
            Write-Host "All required properties are present in the response." -ForegroundColor Green
        }
        
        # 2. Check averageTimeToComplete structure
        if ($null -ne $response.averageTimeToComplete) {
            $timeProps = @("days", "hours", "minutes", "totalHours")
            $missingTimeProps = @()
            
            foreach ($prop in $timeProps) {
                if ($null -eq $response.averageTimeToComplete.$prop) {
                    $missingTimeProps += $prop
                }
            }
            
            if ($missingTimeProps.Count -gt 0) {
                Write-Host "WARNING: Missing expected properties in averageTimeToComplete: $($missingTimeProps -join ', ')" -ForegroundColor Yellow
            } else {
                Write-Host "All required time properties are present in the response." -ForegroundColor Green
            }
        }
        
        # Print the full response for inspection
        Write-Host "`nFull Response:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 4
        
    } catch {
        Write-Host "ERROR: Failed to access productivity-summary endpoint" -ForegroundColor Red
        
        # Get detailed error information
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Try to get response body for more details if available
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorResponse = $reader.ReadToEnd()
            Write-Host "Error Response: $errorResponse" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response body: $_" -ForegroundColor Red
        }
        
        # Detailed exception information
        Write-Host "`nException details:" -ForegroundColor Yellow
        Write-Host "Exception Type: $($_.Exception.GetType().FullName)" -ForegroundColor Yellow
        Write-Host "Exception Message: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "Stack Trace:" -ForegroundColor Yellow
        Write-Host $_.Exception.StackTrace -ForegroundColor Yellow
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