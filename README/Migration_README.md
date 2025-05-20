# Task Tracker API Gamification Migrations

This repository contains migrations to enhance the gamification features of the Task Tracker API.

## Available Migrations

### 1. AddDifficultyToChallenge Migration

This migration adds a new `Difficulty` property to the `Challenge` model, allowing for better organization and filtering of challenges based on their difficulty level.

#### Migration Details

- **File:** `20250417000000_AddDifficultyToChallenge.cs`
- **Property Added:** `Difficulty` (int)
- **Default Value:** 1

### 2. AddDifficultyToAchievement Migration

This migration adds a new `Difficulty` property to the `Achievement` model, allowing for better ordering of achievements by difficulty and suggesting appropriate achievements to users.

#### Migration Details

- **File:** `20250417001000_AddDifficultyToAchievement.cs`
- **Property Added:** `Difficulty` (int)
- **Default Value:** 1

## How to Apply the Migrations

### Option 1: Using PowerShell Script

Run the provided PowerShell script:

```powershell
.\apply_migration.ps1
```

### Option 2: Manual Application

1. Navigate to the TaskTrackerAPI project directory:
   ```
   cd .\TaskTrackerAPI
   ```

2. Run the Entity Framework migration command:
   ```
   dotnet ef database update
   ```

## Verification

After applying the migrations, you can verify that the properties have been added to the respective tables in your database by:

1. Checking the database schema
2. Creating new entries with specified difficulty levels
3. Querying existing entries (they will have the default difficulty value of 1)

## Usage in Code

The `Difficulty` properties are now available in the models and can be used for:

- Ordering challenges and achievements by difficulty
- Filtering items based on user progress/level
- Providing appropriate content to users based on their experience

Example:
```csharp
// Get challenges ordered by difficulty
var challenges = await _context.Challenges
    .Where(c => c.IsActive)
    .OrderBy(c => c.Difficulty)
    .ToListAsync();

// Get achievements ordered by difficulty
var achievements = await _context.Achievements
    .Where(a => !a.IsHidden)
    .OrderBy(a => a.Difficulty)
    .ToListAsync();
``` 