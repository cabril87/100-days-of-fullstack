// Helpers/AuthHelper.cs
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers;

public class AuthHelper
{
    private readonly IConfiguration _configuration;

    public AuthHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void CreatePasswordHash(string password, out string passwordHash, out string salt)
    {
        // Generate a random salt
        byte[] saltBytes = new byte[128 / 8];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        salt = Convert.ToBase64String(saltBytes);

        // Get password key from configuration and combine with salt
        string passwordSaltPlusString = _configuration.GetSection("AppSettings:PasswordKey").Value +
            salt;

        // Generate password hash using PBKDF2
        byte[] passwordHashBytes = KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.ASCII.GetBytes(passwordSaltPlusString),
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8
        );

        passwordHash = Convert.ToBase64String(passwordHashBytes);
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
            Expires = DateTime.UtcNow.AddDays(1)
        };

        // Create and return token
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}