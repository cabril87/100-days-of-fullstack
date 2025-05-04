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
