# Family Gamification System Documentation

This document provides detailed information about the Family Gamification System implemented in the Task Tracker API.

## Overview

The Family Gamification System allows families to track collaborative achievements, challenges, and compete on leaderboards. It enhances task management by adding social motivation through gamification elements like points, achievements, and rewards.

## Core Components

### Models

#### FamilyAchievement

The central model that represents a specific achievement or challenge for a family:

```csharp
public class FamilyAchievement
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int PointValue { get; set; }
    public string? IconUrl { get; set; }
    public int ProgressCurrent { get; set; }
    public int ProgressTarget { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public AchievementType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual Family Family { get; set; }
    public virtual ICollection<FamilyAchievementMember> MemberContributions { get; set; }
}
```

#### FamilyAchievementMember

Tracks individual contributions from family members to a specific achievement:

```csharp
public class FamilyAchievementMember
{
    public int Id { get; set; }
    public int AchievementId { get; set; }
    public int FamilyMemberId { get; set; }
    public int ContributionPoints { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual FamilyAchievement Achievement { get; set; }
    public virtual FamilyMember Member { get; set; }
}
```

#### AchievementType Enum

Defines the different types of achievements available:

```csharp
public enum AchievementType
{
    Individual = 0,
    Family = 1,
    Challenge = 2,
    Daily = 3,
    Weekly = 4,
    Monthly = 5
}
```

### DTOs

The system uses several DTOs to transfer data between the API and clients:

- `FamilyAchievementDTO`: Full achievement details including member contributions
- `FamilyAchievementMemberDTO`: Member contribution details
- `FamilyAchievementCreateDTO`: Data required to create a new achievement
- `FamilyAchievementUpdateDTO`: Data for updating an existing achievement
- `FamilyLeaderboardDTO`: Family stats for leaderboard display
- `ProgressUpdateDTO`: For updating achievement progress
- `TaskCompletionDTO`: For tracking task completion impact on achievements

### Repository Layer

The `IFamilyAchievementRepository` interface and its implementation provide database access for achievement data:

```csharp
public interface IFamilyAchievementRepository
{
    Task<IEnumerable<FamilyAchievement>> GetAllAsync();
    Task<FamilyAchievement?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyAchievement>> GetByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyAchievement>> GetCompletedByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyAchievement>> GetInProgressByFamilyIdAsync(int familyId);
    Task<FamilyAchievement> CreateAsync(FamilyAchievement achievement);
    Task<FamilyAchievement?> UpdateAsync(FamilyAchievement achievement);
    Task<bool> DeleteAsync(int id);
    
    Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease);
    Task<bool> AddMemberContributionAsync(int achievementId, int memberId, int points);
    Task<IEnumerable<FamilyAchievementMember>> GetMemberContributionsAsync(int achievementId);
    Task<int> GetFamilyPointsTotalAsync(int familyId);
}
```

### Service Layer

The `IFamilyAchievementService` interface and its implementation handle business logic:

```csharp
public interface IFamilyAchievementService
{
    Task<IEnumerable<FamilyAchievementDTO>> GetAllAsync();
    Task<FamilyAchievementDTO?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyAchievementDTO>> GetByFamilyIdAsync(int familyId, int userId);
    Task<IEnumerable<FamilyAchievementDTO>> GetCompletedByFamilyIdAsync(int familyId, int userId);
    Task<IEnumerable<FamilyAchievementDTO>> GetInProgressByFamilyIdAsync(int familyId, int userId);
    Task<FamilyAchievementDTO> CreateAsync(FamilyAchievementCreateDTO achievementDto, int userId);
    Task<FamilyAchievementDTO?> UpdateAsync(int id, FamilyAchievementUpdateDTO achievementDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    
    Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease, int memberId, int userId);
    Task<IEnumerable<FamilyLeaderboardDTO>> GetLeaderboardAsync(int limit = 10);
    Task<FamilyLeaderboardDTO?> GetFamilyStatsAsync(int familyId, int userId);
    Task<bool> TrackTaskCompletionAsync(int taskId, int memberId, int userId);
}
```

## API Endpoints

### FamilyAchievementsController

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| GET | `/api/FamilyAchievements` | Returns all family achievements | Admin access |
| GET | `/api/FamilyAchievements/{id}` | Returns a specific achievement by ID | Authenticated user |
| GET | `/api/FamilyAchievements/family/{familyId}` | Returns all achievements for a family | Member of family |
| GET | `/api/FamilyAchievements/family/{familyId}/completed` | Returns completed achievements for a family | Member of family |
| GET | `/api/FamilyAchievements/family/{familyId}/in-progress` | Returns in-progress achievements for a family | Member of family |
| POST | `/api/FamilyAchievements` | Creates a new family achievement | Member with manage_achievements permission |
| PUT | `/api/FamilyAchievements/{id}` | Updates an existing achievement | Member with manage_achievements permission |
| DELETE | `/api/FamilyAchievements/{id}` | Deletes an achievement | Member with manage_achievements permission |
| POST | `/api/FamilyAchievements/{id}/progress` | Updates progress on an achievement | Member of family |
| GET | `/api/FamilyAchievements/leaderboard` | Returns the family leaderboard | Authenticated user |
| GET | `/api/FamilyAchievements/family/{familyId}/stats` | Returns achievement stats for a family | Member of family |
| POST | `/api/FamilyAchievements/task/{taskId}/complete` | Tracks task completion impact on achievements | Member of family |

## Request and Response Examples

### Create a Family Achievement

**Request:**
```http
POST /api/FamilyAchievements
Content-Type: application/json
Authorization: Bearer {token}

{
    "familyId": 1,
    "name": "Complete 10 Family Tasks",
    "description": "Work together to complete 10 tasks assigned to family members",
    "pointValue": 50,
    "iconUrl": "https://example.com/icons/family-tasks.png",
    "progressTarget": 10,
    "type": "Family"
}
```

**Response:**
```json
{
    "id": 1,
    "familyId": 1,
    "name": "Complete 10 Family Tasks",
    "description": "Work together to complete 10 tasks assigned to family members",
    "pointValue": 50,
    "iconUrl": "https://example.com/icons/family-tasks.png",
    "progressCurrent": 0,
    "progressTarget": 10,
    "isCompleted": false,
    "completedAt": null,
    "type": "Family",
    "createdAt": "2023-07-15T14:30:00Z",
    "memberContributions": []
}
```

### Update Achievement Progress

**Request:**
```http
POST /api/FamilyAchievements/1/progress
Content-Type: application/json
Authorization: Bearer {token}

{
    "progressIncrease": 1,
    "memberId": 2
}
```

**Response:**
```
204 No Content
```

### Get Family Leaderboard

**Request:**
```http
GET /api/FamilyAchievements/leaderboard?limit=3
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "familyId": 3,
        "familyName": "The Smiths",
        "totalPoints": 250,
        "completedAchievements": 5,
        "lastUpdated": "2023-07-15T15:45:00Z"
    },
    {
        "familyId": 1,
        "familyName": "The Johnsons",
        "totalPoints": 175,
        "completedAchievements": 3,
        "lastUpdated": "2023-07-15T15:45:00Z"
    },
    {
        "familyId": 2,
        "familyName": "The Wilsons",
        "totalPoints": 100,
        "completedAchievements": 2,
        "lastUpdated": "2023-07-15T15:45:00Z"
    }
]
```

## Integration with Task Completion

One of the key features is the automatic integration with task completion. When a task is completed, the system automatically updates progress on relevant family achievements. This is handled through the `TrackTaskCompletionAsync` method in the service layer.

```csharp
public async Task<bool> TrackTaskCompletionAsync(int taskId, int memberId, int userId)
{
    TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
    if (task == null)
        return false;

    // Find the family of the member
    FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
    if (member == null)
        return false;

    // Get in-progress achievements for the family
    IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetInProgressByFamilyIdAsync(member.FamilyId);
    
    // Update relevant achievements
    foreach (FamilyAchievement achievement in achievements)
    {
        if (achievement.Type == AchievementType.Family || 
            achievement.Type == AchievementType.Daily ||
            achievement.Type == AchievementType.Weekly)
        {
            await UpdateProgressAsync(achievement.Id, 1, memberId, userId);
        }
    }

    return true;
}
```

## Security Considerations

- All endpoint access is protected by authentication through JWT tokens
- Family-specific endpoints verify the user is a member of the family
- Achievement management operations require the "manage_achievements" permission
- Input validation is performed through DTO validation attributes

## Best Practices

1. **Creating Effective Family Achievements:**
   - Keep descriptions clear and actionable
   - Set reasonable progress targets
   - Use a mix of easy and challenging achievements
   - Consider different achievement types (daily, weekly, challenge)

2. **Monitoring and Management:**
   - Regularly review family progress
   - Adjust difficulty if progress is too slow or too fast
   - Create seasonal or special event achievements

3. **Rewards and Incentives:**
   - Connect achievement completion to real-world rewards
   - Celebrate family achievement milestones
   - Use the leaderboard to encourage friendly competition

## Conclusion

The Family Gamification System enhances the Task Tracker by adding social motivation through collaborative achievements and friendly competition. It encourages family members to complete tasks together and provides a framework for celebrating shared accomplishments. 