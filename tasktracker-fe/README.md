# TaskTracker Frontend

This is the Next.js 14 frontend for the TaskTracker application. It consumes the TaskTrackerAPI and provides a modern, responsive user interface.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Fetch/Axios
- **Authentication**: JWT with HttpOnly cookies

## Features

- Task management with drag-and-drop interface
- Real-time updates using SignalR
- Responsive design for mobile and desktop
- Authentication and authorization
- Family/team collaboration tools
- Gamification elements

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_HUB_URL=http://localhost:5000/hubs
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   [http://localhost:3000](http://localhost:3000)

## Integration with TaskTrackerAPI

This frontend integrates with the TaskTrackerAPI to provide secure, real-time task management. Key integration points:

- RESTful API calls for CRUD operations
- SignalR connection for real-time updates
- JWT authentication with secure token handling
- Implements all security best practices from the API

## Security Features

- CSRF protection
- Content Security Policy enforcement
- Input validation and sanitization
- Secure authentication flows
- Protection against XSS attacks

## Family Authentication & Security Checklist

### ✅ **Phase 1: Dashboard Enhancement (COMPLETED)**
- [x] **Dashboard Integration** - Real family data integration with graceful error handling
- [x] **Type System Consolidation** - Centralized type definitions in `lib/types`
- [x] **Enhanced Loading States** - Professional skeleton components instead of mock data
- [x] **Backend Alignment** - UI matches actual backend models and properties

### ✅ **Phase 2: Email Service & Password Reset (COMPLETED)**
- [x] **Email Service Implementation** - Complete SMTP service with HTML templates
  - [x] Password reset emails with secure token links
  - [x] Welcome emails for new users  
  - [x] Family invitation emails with custom styling
  - [x] Test email functionality for verification
  - [x] Configuration in `appsettings.Development.json` with enable/disable toggle
- [x] **Password Reset Flow** - Full backend and frontend implementation
  - [x] `PasswordResetToken` model in Models directory with Entity Framework attributes
  - [x] `IPasswordResetTokenRepository` interface and implementation following existing patterns
  - [x] Complete repository with CRUD operations, token validation, cleanup
  - [x] Updated `PasswordResetService` using repository instead of in-memory storage
  - [x] 24-hour token expiration, single-use tokens, security audit logging
  - [x] Added `PasswordResetTokens` DbSet to `ApplicationDbContext`
  - [x] Registered services in `Program.cs`
  - [x] Frontend password reset page at `/auth/reset-password` with validation
  - [x] **Database Migration**: `AddPasswordResetTokens` migration created and applied
- [x] **Repository Pattern Compliance** - Proper architecture following existing patterns
  - [x] All models in `/Models` directory with explicit types only
  - [x] Repository interfaces in `/Repositories/Interfaces`
  - [x] Service implementations using dependency injection
- [x] **Code Standards Compliance** 
  - [x] Explicit types throughout (no `var` declarations)
  - [x] Proper using statements and namespace organization
  - [x] Security logging and error handling

### 🚀 **Phase 3: MFA Implementation (NEXT PRIORITY - 8-12 hours)**
- [ ] **TOTP/Authenticator App Support**
  - [ ] QR code generation for setup
  - [ ] TOTP validation service
  - [ ] Backup codes generation
- [ ] **MFA Setup Flow**
  - [ ] User onboarding for MFA
  - [ ] Recovery options
  - [ ] Device management
- [ ] **Enhanced Login Flow**
  - [ ] Two-step verification UI
  - [ ] Remember device functionality
  - [ ] Fallback authentication methods

### 📋 **Phase 4: Task Management API Integration (4-6 hours)**
- [ ] **Task CRUD Operations**
  - [ ] Create, read, update, delete tasks
  - [ ] Task status management
  - [ ] Priority and category assignment
- [ ] **Real-time Task Updates**
  - [ ] SignalR integration for live updates
  - [ ] Family task sharing
  - [ ] Activity feed implementation
- [ ] **Dashboard Data Integration**
  - [ ] Replace skeleton loading with real task statistics
  - [ ] Family progress tracking
  - [ ] Achievement and points system

### 🔒 **Phase 5: Advanced Security Features (6-8 hours)**
- [ ] **Account Security Dashboard**
  - [ ] Active sessions management
  - [ ] Login history and device tracking
  - [ ] Security alerts and notifications
- [ ] **Enhanced Password Policy**
  - [ ] Strength requirements and validation
  - [ ] Password history prevention
  - [ ] Forced password updates
- [ ] **Audit Logging**
  - [ ] User activity tracking
  - [ ] Security event monitoring
  - [ ] Admin audit dashboard

## Implementation Notes

- **Repository Pattern**: All new services follow established repository pattern with interfaces
- **Type Safety**: All models in `/Models` directory, DTOs in `/DTOs` directory  
- **Code Standards**: Explicit types only (no `var`), proper namespace organization
- **Email Configuration**: Located in `appsettings.Development.json` with toggle for enable/disable
- **Security**: All password reset tokens expire in 24 hours and are single-use
- **Database**: Migration `AddPasswordResetTokens` applied successfully
- **Frontend Routes**: Password reset accessible at `/auth/reset-password?token=<token>`

## Project Structure

- `src/app` - App router pages and layouts
- `src/components` - Reusable UI components
- `src/lib` - Utility functions and helpers
- `src/services` - API service layer
- `src/types` - TypeScript type definitions
- `src/hooks` - Custom React hooks
- `src/contexts` - React context providers

## Development Notes

- Use the API documentation to understand available endpoints
- Implement proper error handling for all API calls
- Follow the established styling patterns
- Test on multiple devices and browsers

## Current Status

**Phase 2: Email Service & Password Reset** has been successfully completed with:
- ✅ Database schema updated with new migration
- ✅ Repository pattern implementation with explicit types
- ✅ Email service with SMTP and HTML templates
- ✅ Secure password reset flow with token validation
- ✅ Frontend integration with validation and error handling
- ✅ Code standards compliance (explicit types, proper architecture)

## Next Steps

Ready to begin **Phase 3: MFA Implementation** - Multi-factor authentication with TOTP/authenticator app support, enhanced login flow, and device management capabilities.
