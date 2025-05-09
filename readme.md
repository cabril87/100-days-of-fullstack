# 💻 100 Days of Code – Full Stack with C#/.NET & Next.js

## Hi, I'm Carlos Abril Jr. 👋

I'm a Sys Admin and Full Stack Developer expanding my backend skills in C#/.NET and building modern frontends with Next.js 14. I'm using the #100DaysOfCode challenge to sharpen my skills in secure coding, API design, and full-stack app development.

## 🎯 Goals

- Dive deeper into C# and ASP.NET Core Web API
- Build secure, scalable full-stack applications
- Strengthen frontend architecture using Next.js App Router
- Apply real-world secure coding practices throughout the stack
- Share daily/weekly progress to stay accountable

## 🏗️ Planned Projects

### Advanced Task Tracker API

- Build a comprehensive task management API with ASP.NET Core
- Implement Entity Framework for database operations with complex relationships
- Integrate authentication/authorization with JWT
- Add advanced features like notifications, reminders, and analytics
- Build a modern frontend using Next.js to consume the API
- Include real-time notifications and dashboard visualizations

## 🧰 Tech Stack

### 🔙 Backend
- **Language**: C#
- **Framework**: ASP.NET Core Web API (.NET 9)
- **ORM**: Entity Framework Core
- **Database**: SQL Server / SQLite
- **Security**: Secure coding patterns, validation, error handling

### 🔜 Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript / React
- **Styling**: Tailwind CSS (optional)
- **API Handling**: Fetch / Axios

### ⚙️ Dev Tools
- VS Code + Cursor (AI-powered coding)
- Git & GitHub
- Postman (API testing)
- Docker (optional)
- SQL Management Studio / DB tools

## 📅 Daily Log

| Day | Summary |
|-----|---------|
| 1 | Created GitHub repo + README. Defined stack and roadmap for challenge. |
| 2 | Project Setup Only: Created ASP.NET Core Web API and tested default endpoints (no DB config yet). |
| 3 | Database Integration: Installed EF Core & Dapper; configured MSSQL; added DbContext; tested DB. |
| 4 | Data Model Expansion: Added User, Category, Tag, and TaskTag models with relationships. Implemented entity configurations and proper foreign key constraints. Set up seed data for initial testing. |
| 5 | DTOs & API Security: Created DTOs for all models (User, TaskItem, Category, Tag) to properly separate data concerns and improve security. Implemented validation attributes for input sanitization. Set up authentication infrastructure with JWT token support. |
| 6 | Task Controller Implementation: Created TaskItemsController with CRUD operations (GET all tasks, GET by ID, POST new task, PUT/PATCH for updates, DELETE). Implemented user-specific task filtering so users can only see their own tasks. Added basic query parameters for filtering tasks by status and category. |
| 7 | Category Management: Implemented CategoryController with basic CRUD operations and proper user isolation. Added validation to ensure users can only manage their own categories. Added protection against deleting categories that have associated tasks. |
| 8 | Tag Management: Implemented TagController with CRUD operations. Added endpoints to get all tasks with a specific tag. Ensured proper user isolation for tag operations. |
| 9 | Auth Controller (Part 1): Implemented AuthController with user registration endpoint. Set up password hashing with Argon2id. Created JWT token configuration. |
| 10 | Auth Controller (Part 2): Added login endpoint with JWT token generation. Implemented input validation and error handling. Set up configuration for token lifetime and secret key. |
| 11 | Auth Controller (Part 3): Added refresh token functionality. Implemented user profile endpoints. Set up role-based authorization for admin operations. |
| 12 | Repository Pattern (Part 1): Created IUserRepository and implementation. Refactored AuthController to use the repository. Added dependency injection for repositories. |
| 13 | Repository Pattern (Part 2-A): Designed ITaskItemRepository interface with CRUD and filtering operations. Implemented TaskItemRepository with proper data access methods. Added dependency injection setup. |
| 14 | Repository Pattern (Part 2-B): Created TaskStatisticsDTO for dashboard view. Implemented ITaskService interface and TaskService with business logic. Added methods for task filtering and statistics. |
| 15 | Repository Pattern (Part 2-C): Refactored TaskItemsController to use the service layer. Added new endpoints for task statistics and due date filtering. Improved error handling across the task management system. |
| 16 | Repository Pattern (Part 3): Creating ICategoryRepository and ITagRepository. Refactoring remaining controllers to use repositories. Adding unit tests for repository classes. |
| 17 | Unit Testing and API Fixes: Fixed integration tests by adding missing endpoint aliases in TaskStatisticsController. Fixed unit tests by resolving type mismatches between TaskStatisticsDTO and TaskServiceStatisticsDTO in task service tests. Added comprehensive tests for CategoryRepository, TaskItemRepository, and TagRepository. |
| 18 | Reminder Feature Implementation: Created Reminder model with appropriate relationships. Implemented IReminderService and ReminderController with full CRUD operations. Added specialized endpoints for upcoming, overdue, and status-based reminder filtering. Fixed null reference handling and improved error responses across the API. |
| 19 | Notification System Implementation: Developed comprehensive notification system with repository pattern and service layers. Created NotificationsController with endpoints for retrieving, filtering, creating, and managing notifications. Implemented support for marking notifications as read, counting unread notifications, and bulk operations. Added proper error handling and user-based security. |
| 20 | Gamification System Implementation: Added core gamification elements including user progress tracking, achievements, badges, and leaderboards. Implemented GamificationController with endpoints for user progress, achievements, badges, and stats. Created data models for tracking user accomplishments and progress. Added functionality for displaying badges and tracking user point totals. |
| 21 | Gamification Documentation (Part 1): Created comprehensive documentation for the Gamification System. Documented key components including User Progress, Achievements, Badges, Rewards, Challenges, Daily Login, and Leaderboards. Detailed all API endpoints, data models, and implementation notes. Set up structure for future enhancements in Part 2. |
| 22 | Team/Family Gamification Integration: Implemented family-based achievements and challenges with a complete backend system. Created FamilyAchievement and FamilyAchievementMember models with full repository and service layers. Added FamilyAchievementsController with endpoints for achievement tracking, leaderboards, and progress management. Implemented security to ensure users can only access/modify their family's achievements. Connected task completion to achievement progress for automatic tracking. Fixed application errors and successfully tested the integration. |
| 23 | Family Management Permission Fix: Fixed family deletion functionality by adding proper permission checks for family creators. Improved error handling with precise HTTP status codes. Added cascade deletion for family members and invitations. Enhanced logging throughout the family management system for better diagnostics. Successfully tested with Postman to verify the security improvements. |
| 24 | Role-Based Child Restrictions: Implemented role-based permissions for children in the family system instead of using birthdate calculations. Children (users with "Child" role) are restricted from creating families and can only receive tasks, not create them. Added proper permission enforcement for family membership and task assignments based on roles. This approach provides more flexibility by allowing family administrators to designate users as children regardless of age, giving more control to parents and guardians. |
| 25 | Gamification Mapping Profiles: Created comprehensive AutoMapper profiles for all gamification components. Implemented profiles for Rewards, Badges, PointTransactions, UserProgress, and Challenges to standardize object mapping across the application. Replaced manual property mapping with AutoMapper configurations to improve code maintainability and reduce boilerplate code. Fixed ambiguous type references between models in different namespaces. Successfully eliminated linter errors and improved code quality across the gamification system. |
| 26 | API Rate Limiting and Throttling: Implemented comprehensive rate limiting system with dual protection strategies. Created a global middleware using ASP.NET Core's RateLimiter for service-wide protection and attribute-based limiting for endpoint-specific control. Configured tiered limits for different operations (50 requests per 30 seconds for resource-intensive endpoints, 30 requests per 60 seconds for create operations, 10 requests per 60 seconds for complex algorithms). Added X-RateLimit-* response headers for client transparency. Implemented both IP-based limiting for anonymous users and user ID-based for authenticated requests. Enhanced security by setting strict limits on authentication endpoints to mitigate brute force attacks. Maintained performance by using in-memory caching to track request counts efficiently. |
| 27 | Focus Mode Implementation & Architecture Improvements: Implemented Focus feature with a proper layered architecture. Created FocusController with endpoints for getting/setting current focus item, ending focus sessions, tracking distractions, and retrieving focus statistics. Developed complete repository and service layers for Focus with IFocusRepository/FocusRepository and IFocusService/FocusService. Implemented task prioritization algorithms that consider due dates, task priority, and status. Added distraction tracking system to help users identify productivity blockers. Created comprehensive statistics endpoints for analyzing focus patterns and productivity data. |
| 28 | Family Calendar & Batch Operations: Implemented family calendar system for scheduling and coordination between family members. Added FamilyCalendarController, FamilyAvailabilityController for managing family events and member availability. Created BatchOperationsController to support efficient bulk operations. Added ChecklistItem functionality with dedicated repository and profiles. Implemented response caching middleware and query batching for performance optimization. Added concurrency handling with proper exception management. Developed TaskSyncService for synchronizing shared tasks between family members. Enhanced rate limiting with backoff helper for graceful degradation under load. |
| 29 | Task Priority Auto-Adjustment System: Implemented intelligent priority adjustment for tasks based on due dates and completion patterns. Created TaskPriorityService with algorithms to detect when tasks should be escalated in priority (e.g., approaching due dates) or lowered (tasks far in the future). Added TaskPriorityController with rate-limited endpoint to trigger auto-adjustment. Created DTOs (PriorityAdjustmentSummaryDTO, TaskPriorityAdjustmentDTO) to track adjustment history and reasoning. Implemented detailed logging for transparency in how priorities are determined. This system addresses the common problem of tasks becoming urgent without sufficient warning by proactively adjusting priorities to keep important tasks visible before they become critical. |
| 30 | API Refinement & Consolidation: Resolved redundancy between tasks and todos by consolidating endpoints and standardizing nomenclature. Enhanced the Task API with a "due" query parameter to replace the redundant "todo/today" endpoint. Standardized on "NotStarted" status by removing the redundant "ToDo" alias in TaskItemStatus enum. Made checklist API more RESTful by restructuring paths from "todo/checklist/{taskId}" to "{taskId}/checklist". Added batch operations for checklist items with complete and delete endpoints. Implemented task prioritization sorting with multiple criteria options. Created a notification system for task deadlines with a background service to check for upcoming due dates. Enhanced task templates with checklist support, updating models, DTOs and database relationships. Added comprehensive task search functionality to the main controller. Successfully built and tested all implementations. |
| 31 | Field-Level Encryption, Docker & Next.js Frontend Setup: Implemented sensitive data protection using .NET's Data Protection API for field-level encryption to protect PII (personally identifiable information) and sensitive user data. Created `DataProtectionService` with encrypt/decrypt methods for use across the application. Added `[Encrypt]` attribute for model properties that need encryption. Modified entity framework configuration to handle encrypted fields transparently during read/write operations. Set up a key rotation schedule for encryption keys. Added Docker support with Dockerfile and docker-compose.yml for consistent development and deployment environments, including containerized SQL Server and API services with proper CORS configurations. Implemented environment-specific CORS policies for different deployment scenarios. Fixed database encryption issues by expanding column sizes to accommodate encrypted data. Created a migration to update the User model for proper field-level encryption support. Added CORS test tools for verifying cross-origin functionality. Created initial Next.js 15 frontend (tasktracker-fe) with TypeScript, configured for API connectivity, and set up the project structure with proper authentication flows. |
| 32 | API Endpoint Security Audit & Hardening: Implemented comprehensive security audit and hardening of API endpoints based on OWASP API Security Top 10. Created SecurityRequirementsAttribute to enforce consistent security standards across controllers with granular permission checks and resource ownership verification. Developed SecurityService to handle security verification with proper resource isolation. Implemented SecurityHeadersMiddleware with strict Content Security Policy and other security headers. Added SecurityAuditMiddleware for comprehensive security event logging with PII protection. Refactored controllers to use the new security infrastructure, ensuring all API endpoints have appropriate authentication and authorization. |
| 33 | Validation Pipeline & Input Sanitization: Implemented a comprehensive validation pipeline that sanitizes and validates all input at multiple layers. Created custom model binding providers to intercept and sanitize potentially harmful inputs. Added automatic HTML encoding of strings to protect against XSS attacks. Created a custom SanitizedString type that applies input cleansing appropriate to the context. Implemented validation attributes that enforce input constraints while protecting against injection attacks. Added ModelState validation filter to ensure all requests are automatically validated. Created anti-CSRF protection middleware with token validation and automatic integration. Developed a central validation service for complex domain validation rules that span multiple properties or entities. |
| 34 | Security Headers Middleware Enhancement: Upgraded security headers middleware with OWASP-recommended settings and enhanced CSP policies. Added strict CSP configuration with nonce-based script execution for improved protection. Implemented comprehensive Permissions-Policy with fine-grained browser feature control. Added smart Cache-Control headers customized by endpoint sensitivity and resource type. Enhanced Cross-Origin policies (Resource/Opener/Embedder) for better isolation. Implemented CSP violation reporting endpoint with support for various report formats. Added Clear-Site-Data header on logout for secure session termination. Created comprehensive Postman test suite to verify security header implementation. Pre-computed static header values for performance optimization. Implemented centralized security configuration section in appsettings.json. |
| 35 | API Security Documentation & Penetration Testing Infrastructure: Developed comprehensive security documentation covering implementation details, assumptions, and best practices. Created API security testing guide with examples of common attacks and defenses. Set up infrastructure for regular security scanning and penetration testing using OWASP ZAP. Integrated security scanning into CI/CD pipeline to catch vulnerabilities early. Created custom security test suite focused on API vulnerabilities. Added security-focused integration tests for authentication, authorization, and data protection features. Documented incident response procedures for potential security breaches. Implemented vulnerability disclosure policy and process. |
| 36 | API Rate Limiting, Throttling & Quota Management: Implemented comprehensive subscription-based rate limiting with IP-based and user-based limits. Added tiered throttling based on user subscription type. Created quota management system to limit API usage per day. Implemented circuit breaker pattern to prevent cascading failures. Added retry policies with exponential backoff for temporary failures. Developed rate limit monitoring and reporting dashboard. Implemented automatic throttling of requests during high server load. Added bypass mechanisms for trusted system accounts. |
| 37 | API Rate Limiting & Performance Optimization: Enhanced rate limiting with adaptive throttling based on server load metrics. Implemented subscription-based quota management with tiered access levels. Created comprehensive monitoring dashboard for rate limits and quota usage. Fixed build issues in RateLimitBackoffHelper and CircuitBreaker utilities. Added hardware performance monitoring for dynamic resource allocation. Implemented circuit breaker pattern to prevent cascading failures. Added detailed telemetry with rate limit headers for client transparency. Ensured compatibility with both Windows and non-Windows environments for monitoring metrics. |
| 38 | Next.js Frontend Auth & CSRF Integration: Set up a modern Next.js 15 frontend for the TaskTracker app with Tailwind CSS. Created project structure with App Router and implemented API service layers with proper CSRF token protection. Fixed critical authentication middleware issues by adding proper AllowAnonymous attributes and configuring endpoint exclusions. Implemented authentication flow with JWT token management and secure CSRF token retrieval. Set up ESLint configuration to enhance code quality and fixed TypeScript errors across components. Implemented core task display components and API connectivity for data fetching. Encountered some integration issues between frontend and API authentication that will be addressed in Day 39. |
| 39 | Next.js Task Management UI & API Integration: Reorganized the application structure to implement proper separation between dashboard and task management. Created dedicated task pages for listing, creating, editing and viewing individual tasks with appropriate routing. Implemented proper redirection system between old and new routes. Fixed type errors in task handling code and enhanced frontend components for better UX. Added task summary statistics to the dashboard with filtering by status and due date. Implemented components for task display with proper error handling and loading states. |

## 🚀 UPCOMING PLANNED FEATURES (DAYS 40+)
*Note: These features are planned but not yet implemented. Days 1-39 above represent completed work.*

| Day | Summary |
|-----|---------|
| 40 | Next.js Authentication & User Profile: Will build the complete authentication system with login, registration, and password reset flows. Will implement protected routes with middleware. Will create the user profile dashboard with settings management. Will add subscription tier display and management. Will implement proper token refresh logic and secure storage. |
| 41 | Next.js Dashboard & Analytics: Will create a comprehensive dashboard showing task statistics, completion rates, and upcoming deadlines. Will implement data visualization components using charts and graphs. Will add focus mode tracking statistics. Will create family activity summaries for family accounts. Will add achievement and badge displays. |
| 42 | Next.js Polish & Integration: Will implement comprehensive error handling and loading states. Will add animations and transitions for a polished user experience. Will create comprehensive end-to-end testing for critical flows. Will optimize performance with code splitting and image optimization. Will implement proper SEO metadata. Will connect all frontend components to their corresponding API endpoints. |
| 43 | Advanced Caching & Performance: Will implement distributed caching with Redis for improved performance across multiple instances. Will add response compression for network optimization. Will implement entity-level caching with proper cache invalidation. Will optimize database queries with compiled queries and query hints. Will add batch processing for high-volume operations. Will implement ETags for HTTP caching. |
| 44 | Advanced Monitoring & Telemetry: Will integrate Application Insights for comprehensive monitoring. Will implement custom metrics collection with StatsD. Will add structured logging with Serilog. Will create health checks for all dependencies. Will implement circuit breaker dashboards. Will add performance benchmarking middleware. Will create custom telemetry processors. Will implement distributed tracing. |
| 45 | Globalization & Localization Support: Will implement full i18n/l10n infrastructure. Will add resource-based localization for all user-facing strings. Will implement right-to-left (RTL) support. Will add culture-aware formatting for dates, times, and numbers. Will create language selection UI. Will implement multi-language validation messages. Will add translation admin interface. Will support language/locale URL parameters. |
| 46 | API Documentation & Developer Portal: Will implement OpenAPI/Swagger documentation with detailed examples. Will create interactive API testing interface. Will add code samples in multiple languages. Will implement API changelog tracking. Will create developer onboarding guides. Will add rate limit documentation. Will create interactive schema explorer. Will implement API versioning documentation. |
| 47 | Advanced Search Capabilities: Will implement full-text search across all entities. Will add faceted search and filtering. Will implement search result highlighting. Will add search suggestions and autocomplete. Will implement relevance ranking algorithms. Will create saved searches functionality. Will add search analytics and reporting. Will implement cross-entity search capabilities. |

## 🧠 Reflections & Lessons

This challenge is not just about consistency—it's about writing better code, thinking about security early, and building software that can scale. I'll include key takeaways, fixes, and ah-ha moments here weekly.

## 🔗 Connect with Me

- [LinkedIn](#)
- [GitHub](#)

## 🚀 Inspired by

- #100DaysOfCode movement
- Real-world dev challenges

**Thanks for following along!**