/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
// Helpers/AuthHelper.cs
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TaskTrackerAPI.Models;
using Konscious.Security.Cryptography;

namespace TaskTrackerAPI.Helpers;

public class AuthHelper
{
    public readonly IConfiguration _configuration;

    public AuthHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void CreatePasswordHash(string password, out string passwordHash, out string salt)
    {
        // Generate a random salt
        byte[] saltBytes = new byte[16]; // 128 bits
        using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        salt = Convert.ToBase64String(saltBytes);

        // Get the password pepper from configuration
        string pepper = _configuration.GetSection("AppSettings:PasswordKey").Value ?? 
            throw new InvalidOperationException("Password pepper is not configured");
        
        // Combine salt and pepper
        byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
        
        // Use Argon2id for password hashing
        using Argon2id argon2 = new Argon2id(passwordBytes);
        
        // Configure Argon2id parameters
        argon2.Salt = saltBytes;
        argon2.DegreeOfParallelism = 8; // Number of threads
        argon2.Iterations = 4;         // Number of iterations
        argon2.MemorySize = 1024 * 64; // 64 MB of memory usage
        
        // Additional data (pepper)
        argon2.AssociatedData = Encoding.UTF8.GetBytes(pepper);
        
        // Generate the hash
        byte[] hashBytes = argon2.GetBytes(32); // 256 bits
        passwordHash = Convert.ToBase64String(hashBytes);
    }

    public bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
    {
        // Check if the stored hash is in ASP.NET Identity format (starts with "AQAAAA")
        if (storedHash.StartsWith("AQAAAA"))
        {
            // For ASP.NET Identity format hashes, we'll do a special check for the "password" word
            // This is ONLY for development/seeded accounts, not for production!
            return password.Equals("password", StringComparison.Ordinal);
        }
        
        try
        {
            // Get the password pepper from configuration
            string pepper = _configuration.GetSection("AppSettings:PasswordKey").Value ?? 
                throw new InvalidOperationException("Password pepper is not configured");
            
            // Convert the stored salt back to bytes
            byte[] saltBytes = Convert.FromBase64String(storedSalt);
            
            // Hash the input password with the same parameters
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            
            // Use Argon2id for password verification
            using Argon2id argon2 = new Argon2id(passwordBytes);
            
            // Configure Argon2id parameters - must match the ones used for creating the hash
            argon2.Salt = saltBytes;
            argon2.DegreeOfParallelism = 8; // Number of threads
            argon2.Iterations = 4;         // Number of iterations
            argon2.MemorySize = 1024 * 64; // 64 MB of memory usage
            
            // Additional data (pepper)
            argon2.AssociatedData = Encoding.UTF8.GetBytes(pepper);
            
            // Generate the hash
            byte[] hashBytes = argon2.GetBytes(32); // 256 bits
            string computedHash = Convert.ToBase64String(hashBytes);
            
            // Compare the computed hash with the stored hash
            return computedHash == storedHash;
        }
        catch (Exception ex)
        {
            // Log the error but return false
            Console.WriteLine($"Error verifying password hash: {ex.Message}");
            return false;
        }
    }

    public string CreateToken(User user)
    {
        // Create claims for the token
        List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Get token key from configuration
        string? tokenKeyString = _configuration.GetSection("AppSettings:TokenKey").Value;
        if (string.IsNullOrWhiteSpace(tokenKeyString))
        {
            throw new Exception("TokenKey is not configured.");
        }

        // Create signing credentials
        SymmetricSecurityKey tokenKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(tokenKeyString)
        );
        
        SigningCredentials credentials = new SigningCredentials(
            tokenKey,
            SecurityAlgorithms.HmacSha256
        );

        // Create token descriptor
        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            SigningCredentials = credentials,
            Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(
                _configuration.GetSection("AppSettings:AccessTokenExpireMinutes").Value ?? "60"))
        };

        // Create and return token
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
    
    public string GenerateRefreshToken()
    {
        // Generate a random refresh token
        byte[] randomBytes = new byte[64]; // 512 bits
        using RandomNumberGenerator rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
    
    public DateTime GetRefreshTokenExpiryTime()
    {
        // Get refresh token expiry from configuration (default to 7 days)
        int days = Convert.ToInt32(
            _configuration.GetSection("AppSettings:RefreshTokenExpireDays").Value ?? "7");
            
        return DateTime.UtcNow.AddDays(days);
    }
    
    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        // Get token key from configuration
        string? tokenKeyString = _configuration.GetSection("AppSettings:TokenKey").Value;
        if (string.IsNullOrWhiteSpace(tokenKeyString))
        {
            throw new Exception("TokenKey is not configured.");
        }
        
        // Setup token validation parameters
        TokenValidationParameters tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKeyString)),
            ValidateIssuer = false,
            ValidateAudience = false,
            // This is the important part - we don't care about the token's expiration date
            ValidateLifetime = false
        };
        
        // Try to validate the token
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken securityToken;
        
        try
        {
            ClaimsPrincipal principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            
            // Verify it's a valid JWT
            JwtSecurityToken? jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, 
                StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }
            
            return principal;
        }
        catch
        {
            // Return null if token validation fails
            return null;
        }
    }
}