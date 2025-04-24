# Gamification System Documentation

## Overview

The Gamification System adds engagement and motivation elements to the Task Tracker application through points, achievements, badges, challenges, and rewards. This system is designed to incentivize users to regularly interact with the application and complete tasks.

## Key Components

### 1. User Progress Tracking
- **Points**: Users earn points for completing tasks, daily logins, and other activities
- **Streaks**: Consecutive days of activity are tracked to reward consistency
- **Levels**: Users progress through levels as they accumulate points

### 2. Achievements
- Pre-defined milestones that users can unlock
- Categorized by difficulty and topic area
- Award points when unlocked

### 3. Badges
- Visual rewards that users can display on their profile
- Earned through special activities or achievements
- Can be toggled for display on user profiles

### 4. Rewards
- Items or privileges that users can redeem with earned points
- Include both digital and potentially physical rewards
- Track usage status (redeemed vs. used)

### 5. Challenges
- Time-limited activities for users to complete
- Track progress toward completion goal
- Award points upon completion

### 6. Daily Login System
- Encourages regular engagement
- Provides increasing rewards for longer streaks
- Displays status information to users

### 7. Leaderboards
- Compare user progress against others
- Multiple categories (points, tasks completed, etc.)

## API Endpoints

### User Progress
- `GET /api/gamification/progress` - Get current user progress information
- `POST /api/gamification/points` - Add points manually (admin only)

### Achievements
- `GET /api/gamification/achievements` - List user's achievements
- `GET /api/gamification/achievements/available` - List achievements available to unlock
- `POST /api/gamification/achievements/{id}/unlock` - Unlock a specific achievement

### Badges
- `GET /api/gamification/badges` - List user's badges
- `PUT /api/gamification/badges/{id}/toggle` - Toggle badge display status

### Rewards
- `GET /api/gamification/rewards` - List available rewards
- `POST /api/gamification/rewards/{id}/redeem` - Redeem a reward
- `PUT /api/gamification/rewards/{id}/use` - Mark a redeemed reward as used

### Challenges
- `GET /api/gamification/challenges` - List active challenges
- `POST /api/gamification/challenges/{id}/enroll` - Enroll in a challenge
- `GET /api/gamification/challenges/{id}/progress` - Check progress on a challenge

### Suggestions and Stats
- `GET /api/gamification/suggestions` - Get personalized activity suggestions
- `GET /api/gamification/stats` - Get comprehensive gamification statistics
- `GET /api/gamification/leaderboard` - View leaderboard in specified category

## Data Models

### Core Models
- `UserProgress` - Tracks points, streaks, and levels
- `Achievement` and `UserAchievement` - Define and track unlocked achievements
- `Badge` and `UserBadge` - Define and track earned badges
- `Reward` and `UserReward` - Define and track redeemed rewards
- `Challenge`, `UserChallenge`, and `ChallengeProgress` - Define and track challenge participation
- `PointTransaction` - Record all point-related activities

### Supporting Models
- `GamificationSuggestion` - Structure for activity recommendations
- `GamificationStats` - Comprehensive statistics aggregation
- `LeaderboardEntry` - Structure for leaderboard display

## Implementation Notes

* All user progress is isolated by user ID for security
* Point transactions are logged for audit and troubleshooting
* Challenge progress is updated automatically based on user actions
* Achievements can trigger automatically when conditions are met

## Model Definitions

### UserProgress

```csharp
public class UserProgress
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int Level { get; set; } = 1;
    
    [Required]
    public int CurrentPoints { get; set; } = 0;
    
    [Required]
    public int TotalPointsEarned { get; set; } = 0;
    
    [Required]
    public int NextLevelThreshold { get; set; } = 100;
    
    [Required]
    public int CurrentStreak { get; set; } = 0;
    
    [Required]
    public int LongestStreak { get; set; } = 0;
    
    public DateTime? LastActivityDate { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
```

### Achievement

```csharp
public class Achievement
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    public string Criteria { get; set; } = string.Empty;
    
    [Required]
    public int PointValue { get; set; } = 50;
    
    [MaxLength(250)]
    public string? IconPath { get; set; }
    
    [Required]
    public bool IsHidden { get; set; } = false;
    
    [Required]
    public int Difficulty { get; set; } = 1;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<UserAchievement>? UserAchievements { get; set; }
}
```

### Badge

```csharp
public class Badge
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    public int PointValue { get; set; } = 100;
    
    [Required]
    [MaxLength(250)]
    public string IconPath { get; set; } = string.Empty;
    
    public int? RequiredAchievementId { get; set; }
    
    [Required]
    public bool IsSpecial { get; set; } = false;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<UserBadge>? UserBadges { get; set; }
}
```

For detailed information about the integration with family achievements and challenges, see [Family/FamilyGamification.md](Family/FamilyGamification.md).

## Future Enhancements (Day 22)

* Social features - sharing achievements, team challenges
* Additional achievement types and categories
* Advanced analytics and insights for user progress
* Customizable reward systems 