# Task Tracker API Endpoints

This document provides a comprehensive list of all API endpoints available in the Task Tracker application.

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Auth/register` | Register a new user |
| POST | `/api/Auth/login` | Login and receive JWT token |
| POST | `/api/Auth/refresh-token` | Refresh an expired JWT token |
| GET | `/api/Auth/profile` | Get current user profile |
| PUT | `/api/Auth/profile` | Update user profile |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/TaskItems` | Get all tasks for current user |
| GET | `/api/TaskItems/{id}` | Get a specific task by ID |
| POST | `/api/TaskItems` | Create a new task |
| PUT | `/api/TaskItems/{id}` | Update an existing task |
| DELETE | `/api/TaskItems/{id}` | Delete a task |
| GET | `/api/TaskItems/status/{status}` | Get tasks by status |
| GET | `/api/TaskItems/category/{categoryId}` | Get tasks by category |
| GET | `/api/TaskItems/tag/{tagId}` | Get tasks by tag |
| GET | `/api/TaskItems/due-date-range` | Get tasks by due date range |
| GET | `/api/TaskItems/overdue` | Get overdue tasks |
| GET | `/api/TaskItems/due-today` | Get tasks due today |
| GET | `/api/TaskItems/due-this-week` | Get tasks due this week |
| POST | `/api/TaskItems/{id}/tags/{tagId}` | Add a tag to a task |
| DELETE | `/api/TaskItems/{id}/tags/{tagId}` | Remove a tag from a task |
| PUT | `/api/TaskItems/{id}/tags` | Update all tags for a task |
| GET | `/api/TaskItems/{id}/tags` | Get all tags for a task |
| POST | `/api/TaskItems/complete-batch` | Complete multiple tasks at once |
| PUT | `/api/TaskItems/{id}/status/{status}` | Update task status |

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Categories` | Get all categories for current user |
| GET | `/api/Categories/{id}` | Get a specific category by ID |
| POST | `/api/Categories` | Create a new category |
| PUT | `/api/Categories/{id}` | Update an existing category |
| DELETE | `/api/Categories/{id}` | Delete a category |

## Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Tags` | Get all tags for current user |
| GET | `/api/Tags/{id}` | Get a specific tag by ID |
| POST | `/api/Tags` | Create a new tag |
| PUT | `/api/Tags/{id}` | Update an existing tag |
| DELETE | `/api/Tags/{id}` | Delete a tag |
| GET | `/api/Tags/search/{searchTerm}` | Search for tags by name |
| GET | `/api/Tags/{id}/tasks` | Get all tasks with a specific tag |

## Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Reminders` | Get all reminders for current user |
| GET | `/api/Reminders/{id}` | Get a specific reminder by ID |
| POST | `/api/Reminders` | Create a new reminder |
| PUT | `/api/Reminders/{id}` | Update an existing reminder |
| DELETE | `/api/Reminders/{id}` | Delete a reminder |
| GET | `/api/Reminders/upcoming` | Get upcoming reminders |
| GET | `/api/Reminders/overdue` | Get overdue reminders |
| GET | `/api/Reminders/status/{status}` | Get reminders by status |

## Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Boards` | Get all boards for current user |
| GET | `/api/Boards/{id}` | Get a specific board by ID |
| POST | `/api/Boards` | Create a new board |
| PUT | `/api/Boards/{id}` | Update an existing board |
| DELETE | `/api/Boards/{id}` | Delete a board |
| GET | `/api/Boards/{id}/tasks` | Get all tasks for a board |
| PUT | `/api/Boards/{id}/tasks/order` | Update task order on a board |

## Families

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Family` | Get all families for current user |
| GET | `/api/Family/{id}` | Get a specific family by ID |
| POST | `/api/Family/createFamily` | Create a new family (creator becomes leader) |
| PUT | `/api/Family/{id}` | Update an existing family |
| DELETE | `/api/Family/{id}` | Delete a family |
| GET | `/api/Family/{id}/members` | Get all members of a family |
| POST | `/api/Family/{id}/members` | Add a member to a family |
| DELETE | `/api/Family/{id}/members/{memberId}` | Remove a member from a family |
| PUT | `/api/Family/{id}/members/{memberId}/role` | Update a member's role |
| POST | `/api/Family/{familyId}/invitations` | Create invitation for a new family member |
| GET | `/api/Family/{familyId}/invitations` | Get all invitations for a family |
| POST | `/api/Family/members/{memberId}/complete-profile` | Complete member profile |
| GET | `/api/Family/pending-members` | Get pending family members (admin only) |
| POST | `/api/Family/members/{memberId}/approve` | Approve a pending member (admin only) |
| POST | `/api/Family/members/{memberId}/reject` | Reject a pending member (admin only) |

## Family Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/FamilyMembers` | Get all family members for current user |
| GET | `/api/FamilyMembers/{id}` | Get a specific family member by ID |
| PUT | `/api/FamilyMembers/{id}` | Update a family member |
| DELETE | `/api/FamilyMembers/{id}` | Delete a family member |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Notifications` | Get all notifications for current user |
| GET | `/api/Notifications/{id}` | Get a specific notification by ID |
| PUT | `/api/Notifications/{id}/read` | Mark a notification as read |
| PUT | `/api/Notifications/mark-all-read` | Mark all notifications as read |
| DELETE | `/api/Notifications/{id}` | Delete a notification |
| GET | `/api/Notifications/unread` | Get unread notifications |
| GET | `/api/Notifications/unread-count` | Get count of unread notifications |

## Gamification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Gamification/progress` | Get user progress |
| POST | `/api/Gamification/points` | Add points to a user (Admin only) |
| GET | `/api/Gamification/achievements` | Get user achievements |
| GET | `/api/Gamification/achievements/available` | Get available achievements |
| GET | `/api/Gamification/badges` | Get user badges |
| POST | `/api/Gamification/badges/toggle` | Toggle badge display status |
| GET | `/api/Gamification/rewards` | Get available rewards |
| POST | `/api/Gamification/rewards/claim/{rewardId}` | Claim a reward |
| POST | `/api/Gamification/rewards/use` | Use a claimed reward |
| GET | `/api/Gamification/challenges` | Get active challenges |
| GET | `/api/Gamification/challenges/current` | Get the current challenge |
| GET | `/api/Gamification/login/status` | Get daily login status |
| POST | `/api/Gamification/login/claim` | Claim daily login reward |
| GET | `/api/Gamification/stats` | Get user gamification stats |
| GET | `/api/Gamification/suggestions` | Get personalized gamification suggestions |
| GET | `/api/Gamification/leaderboard` | Get user leaderboard |

## Family Gamification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/FamilyAchievements` | Get all family achievements (admin access) |
| GET | `/api/FamilyAchievements/{id}` | Get a specific family achievement |
| GET | `/api/FamilyAchievements/family/{familyId}` | Get all achievements for a family |
| GET | `/api/FamilyAchievements/family/{familyId}/completed` | Get completed achievements for a family |
| GET | `/api/FamilyAchievements/family/{familyId}/in-progress` | Get in-progress achievements for a family |
| POST | `/api/FamilyAchievements` | Create a new family achievement |
| PUT | `/api/FamilyAchievements/{id}` | Update an existing family achievement |
| DELETE | `/api/FamilyAchievements/{id}` | Delete a family achievement |
| POST | `/api/FamilyAchievements/{id}/progress` | Update progress on a family achievement |
| GET | `/api/FamilyAchievements/leaderboard` | Get family leaderboard |
| GET | `/api/FamilyAchievements/family/{familyId}/stats` | Get achievement stats for a family |
| POST | `/api/FamilyAchievements/task/{taskId}/complete` | Track task completion for family achievements |

## Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Invitation/token/{token}` | Get invitation details by token |
| POST | `/api/Invitation/accept` | Accept a family invitation |

## Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/TaskStatistics/by-status` | Get task counts by status |
| GET | `/api/TaskStatistics/by-category` | Get task counts by category |
| GET | `/api/TaskStatistics/by-priority` | Get task counts by priority |
| GET | `/api/TaskStatistics/completed-over-time` | Get completed tasks over time |
| GET | `/api/TaskStatistics/completion-rate` | Get task completion rate |
| GET | `/api/TaskStatistics/average-completion-time` | Get average task completion time |
| GET | `/api/TaskStatistics/dashboard` | Get dashboard statistics |

## Real-Time Synchronization (SignalR)

The API provides real-time updates via SignalR for task synchronization across devices.

### SignalR Hub Connection

| Connection URL                  | Description                                               |
|---------------------------------|-----------------------------------------------------------|
| `/hubs/tasks`                   | SignalR hub for real-time task updates                    |

### SignalR Client Methods

These are the methods that the client can call on the server:

| Method                          | Parameters                     | Description                                               |
|---------------------------------|--------------------------------|-----------------------------------------------------------|
| `JoinBoardRoom`                 | boardId: number                | Join a specific board room to receive updates for that board |
| `LeaveBoardRoom`                | boardId: number                | Leave a specific board room                               |

### SignalR Server Events

These are the events that clients can subscribe to:

| Event                           | Data Type                      | Description                                               |
|---------------------------------|--------------------------------|-----------------------------------------------------------|
| `TaskCreated`                   | TaskItemDTO                    | Triggered when a new task is created                      |
| `TaskUpdated`                   | TaskUpdatePayload              | Triggered when a task is updated                          |
| `TaskDeleted`                   | number (taskId)                | Triggered when a task is deleted                          |
| `TaskBatchUpdated`              | TaskStatusUpdateResponseDTO[]  | Triggered when multiple tasks are updated in a batch      |
| `TaskConflict`                  | TaskConflictDTO                | Triggered when there's a conflict during concurrent updates |

### TaskUpdatePayload Structure

```typescript
interface TaskUpdatePayload {
  current: TaskItemDTO;    // Current state of the task after update
  previous: TaskItemDTO;   // Previous state of the task before update
  updatedAt: string;       // ISO date string of when the update occurred
}
```

### Optimistic Concurrency Support

The API implements optimistic concurrency with version tracking to handle simultaneous updates:

1. Each task has a `version` property that is incremented on every update
2. When updating a task, clients must include the current version
3. If the server version doesn't match the client version, a `TaskConflict` event is triggered
4. The client can resolve conflicts using the provided conflict information

### Client Reconnection Strategy

The client should implement reconnection logic to handle temporary connection loss:

1. Automatic reconnection attempts with exponential backoff
2. Offline cache of pending changes during disconnection
3. Synchronization of pending changes upon reconnection
4. Conflict resolution for changes made during offline period 