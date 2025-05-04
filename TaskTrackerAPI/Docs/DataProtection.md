# Field-Level Encryption in TaskTrackerAPI

## Overview

The TaskTrackerAPI implements field-level encryption to protect sensitive user data at rest. This ensures that even if the database is compromised, sensitive personal information remains encrypted and secure.

## Implementation Details

### Technical Implementation

1. **Data Protection API**: We use ASP.NET Core's Data Protection API to handle encryption and decryption.

2. **Attribute-Based Approach**: The `[Encrypt]` attribute marks properties that should be encrypted.

3. **Transparent Encryption**: Entity Framework Core value converters automatically encrypt data before saving to the database and decrypt when reading.

4. **Key Management**: Encryption keys are stored separately from the database in a secure location and can be rotated.

### Protected Data Fields

The following fields are currently encrypted:

- `User.Email` - User email addresses
- `User.FirstName` - User first names
- `User.LastName` - User last names
- `UserDevice.DeviceToken` - Device push notification tokens
- `UserDevice.VerificationCode` - Device verification codes

## How It Works

### Encryption Process

1. When an entity is saved to the database, EF Core checks for properties with the `[Encrypt]` attribute.
2. For each marked property, the value converter calls `DataProtectionService.Encrypt()`.
3. The encrypted value is stored in the database column.

### Decryption Process

1. When an entity is read from the database, EF Core applies the same value converters.
2. For encrypted properties, `DataProtectionService.Decrypt()` converts the data back to its original form.
3. The application receives the decrypted values automatically.

## Key Rotation

Regular key rotation is an important security practice. The system supports key rotation without requiring re-encryption of all data:

1. Create a new key version using the `DataProtectionController.CreateNewKey` endpoint.
2. Update the `CurrentVersion` constant in `DataProtectionService`.
3. New data will be encrypted with the new key.
4. Existing data can be re-encrypted by running a migration script.

## Security Considerations

- The encryption used is AES-256, which is considered secure by industry standards.
- Keys are stored outside the database to maintain security in case of database breach.
- Authorization is enforced for all key management operations.
- Highly sensitive fields (marked with `IsHighlySensitive = true`) have additional protections.

## Best Practices for Developers

When adding new properties to models:

1. Consider if the data is sensitive (PII, financial, health information, etc.).
2. If sensitive, add the `[Encrypt]` attribute to the property.
3. Use the appropriate purpose string to document why encryption is needed.
4. For extremely sensitive data, set `isHighlySensitive = true`.

Example:

```csharp
[Encrypt(purpose: "Financial", isHighlySensitive: true)]
public string? CreditCardNumber { get; set; }
``` 