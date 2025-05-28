#!/usr/bin/env pwsh

Write-Host "🚀 Generating user activity for rate limit testing..." -ForegroundColor Green

# Disable SSL certificate validation
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Login function
function Get-AuthToken {
    $loginData = @{
        username = "admin"
        password = "Admin123!"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://localhost:5001/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SkipCertificateCheck
        return $response.data.token
    }
    catch {
        Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Make API request function
function Invoke-ApiRequest {
    param(
        [string]$Endpoint,
        [string]$Token,
        [string]$Method = "GET"
    )
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "https://localhost:5001$Endpoint" -Method $Method -Headers $headers -SkipCertificateCheck
        return $response
    }
    catch {
        Write-Host "❌ Request to $Endpoint failed" -ForegroundColor Red
        return $null
    }
}

# Main execution
try {
    Write-Host "📝 Logging in..." -ForegroundColor Yellow
    $token = Get-AuthToken
    
    if (-not $token) {
        Write-Host "❌ Failed to get authentication token" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    # Define endpoints to test
    $endpoints = @(
        "/api/v1/auth/csrf",
        "/api/v1/security/dashboard", 
        "/api/v1/notifications",
        "/api/v1/gamification/progress",
        "/api/v1/invitation/pending",
        "/api/v1/auth/refresh-token"
    )
    
    Write-Host "📊 Making API requests to generate user activity..." -ForegroundColor Yellow
    
    # Make multiple requests to generate activity
    for ($i = 1; $i -le 20; $i++) {
        foreach ($endpoint in $endpoints) {
            $result = Invoke-ApiRequest -Endpoint $endpoint -Token $token
            if ($result) {
                Write-Host "✅ Request $i to $endpoint : Success" -ForegroundColor Green
            }
            
            # Small delay between requests
            Start-Sleep -Milliseconds 200
        }
        
        # Progress indicator
        if ($i % 5 -eq 0) {
            Write-Host "📈 Completed $i batches of requests..." -ForegroundColor Cyan
        }
        
        # Longer delay between batches
        Start-Sleep -Milliseconds 1000
    }
    
    Write-Host "🎉 User activity generation complete!" -ForegroundColor Green
    Write-Host "📊 Check the admin dashboard rate limit tab for updated data" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 