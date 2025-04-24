# TaskTrackerAPI Documentation

This directory contains comprehensive documentation for the TaskTrackerAPI project.

## Documentation Structure

### API Documentation
- [API Endpoints Reference](API/API_ENDPOINTS.md) - Complete list of all available API endpoints
- [Postman Collections](API/Postman.md) - Guide to using the included Postman collections for API testing

### Gamification System
- [Gamification Overview](Gamification/Overview.md) - Introduction to the gamification features
- [Individual Gamification](Gamification/GamificationSystem.md) - Detailed documentation of the core gamification system
- [Family Gamification](Gamification/Family/FamilyGamification.md) - Documentation for family-based gamification features
- [Future Enhancements](Gamification/GamificationSystemFutureEnhancements.md) - Planned improvements for the gamification system

## Models

The TaskTrackerAPI includes the following key model types:

### Core Models
- User - Core user entity with authentication details
- TaskItem - Individual task that can be managed by users
- Category - Classification for tasks
- Tag - Flexible labeling system for tasks

### Gamification Models
- UserProgress - Tracks points, streaks, and levels
- Achievement - Milestones that users can unlock
- Badge - Visual rewards that users can display on profiles
- Reward - Items or privileges that users can redeem with points
- Challenge - Time-limited activities with specific goals
- PointTransaction - Record of point accrual and expenditure

### Family Models
- Family - Group of related users
- FamilyMember - User's membership in a family
- FamilyAchievement - Goals that family members can work toward together
- FamilyAchievementMember - Individual contribution to family achievements

## Getting Started

To understand the TaskTrackerAPI, we recommend reviewing the documentation in this order:

1. API Endpoints Reference for an overview of available functionality
2. Gamification Overview to understand the motivation and rewards systems
3. Individual and Family Gamification details for specific implementation details

## Testing the API

The fastest way to get familiar with the API is to use the included Postman collections:

1. Follow the [Postman Collections](API/Postman.md) guide to import the collections
2. Use the authentication endpoints to get a token
3. Explore the various endpoints available in the collections 