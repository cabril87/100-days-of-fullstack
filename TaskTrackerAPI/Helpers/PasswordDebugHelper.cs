using System;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.Extensions.Configuration;

namespace TaskTrackerAPI.Helpers;

public class PasswordDebugHelper
{
    private readonly IConfiguration _configuration;

    public PasswordDebugHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string hash, string salt) GeneratePasswordHashForSeed(string password)
    {
        // Generate a fixed salt for reproducible tests
        byte[] saltBytes = new byte[16]; // 128 bits
        
        // Use a fixed salt for reproducibility
        for (int i = 0; i < saltBytes.Length; i++)
        {
            saltBytes[i] = (byte)i;
        }
        
        string salt = Convert.ToBase64String(saltBytes);

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
        string passwordHash = Convert.ToBase64String(hashBytes);

        return (passwordHash, salt);
    }
} 