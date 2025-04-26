# TaskTrackerAPI Security Setup Guide

This guide explains how to securely configure the TaskTrackerAPI application with proper security credentials.

## Security Configuration

The application requires several security keys to be configured. For security reasons, these should NOT be stored directly in the `appsettings.json` file in production environments.

### Required Security Keys

1. **TokenKey**: Used for JWT token signing
2. **PasswordKey**: Used as pepper for password hashing

### Setting Up User Secrets (Development)

For development, use .NET User Secrets:

```bash
# Navigate to the TaskTrackerAPI project directory
cd TaskTrackerAPI

# Initialize user secrets
dotnet user-secrets init

# Set your token key (use a strong random value at least 32 characters)
dotnet user-secrets set "TokenKey" "your_secure_token_key_here_at_least_32_chars"

# Set your password pepper key (use a different strong random value)
dotnet user-secrets set "PasswordKey" "your_secure_password_pepper_here_different_from_token"
```

### Setting Up Environment Variables (Production)

For production environments, use environment variables:

#### Linux/macOS
```bash
export TokenKey="your_secure_token_key_here_at_least_32_chars"
export PasswordKey="your_secure_password_pepper_here_different_from_token"
```

#### Windows (PowerShell)
```powershell
$env:TokenKey="your_secure_token_key_here_at_least_32_chars"
$env:PasswordKey="your_secure_password_pepper_here_different_from_token"
```

### Using Azure Key Vault (Recommended for Production)

For production, consider using Azure Key Vault:

1. Create an Azure Key Vault
2. Add your secrets to the Key Vault
3. Configure your application to access Key Vault

Add the following NuGet packages:
```
dotnet add package Azure.Identity
dotnet add package Azure.Extensions.AspNetCore.Configuration.Secrets
```

Update your `Program.cs`:
```csharp
// Add Azure Key Vault configuration
if (!builder.Environment.IsDevelopment())
{
    string keyVaultUrl = builder.Configuration["KeyVaultUrl"];
    builder.Configuration.AddAzureKeyVault(
        new Uri(keyVaultUrl),
        new DefaultAzureCredential());
}
```

## Generating Secure Keys

Use the following PowerShell command to generate a secure random key:

```powershell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

## Security Best Practices

1. Never commit secrets to source control
2. Rotate keys periodically
3. Use different keys for different environments
4. Use strong, unique keys (at least 32 bytes/256 bits)
5. Restrict access to production keys 