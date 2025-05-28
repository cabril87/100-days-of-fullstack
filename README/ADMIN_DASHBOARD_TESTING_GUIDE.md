# Admin Dashboard Testing Guide

## Overview
The Admin Dashboard provides comprehensive security monitoring, performance metrics, and system health information. This guide will walk you through testing all features systematically.

## Prerequisites

### 1. Start the Backend API
```bash
cd TaskTrackerAPI
dotnet run
```
The API should be running on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd tasktracker-fe
npm run dev
```
The frontend should be running on `http://localhost:3000`

### 3. Admin Access
- **Email**: `admin@tasktracker.com`
- **Password**: `Admin123!`
- **Role**: Admin

## Step-by-Step Testing Guide

### Phase 1: Authentication & Access Control

#### 1.1 Test Admin Login
1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials:
   - Email: `admin@tasktracker.com`
   - Password: `Admin123!`
3. Click "Sign In"
4. **Expected**: Successful login and redirect to dashboard

#### 1.2 Test Admin Dashboard Access
1. Navigate to `http://localhost:3000/admin`
2. **Expected**: Admin dashboard loads successfully
3. **Verify**: No "Access Denied" message appears

#### 1.3 Test Non-Admin Access Control
1. Logout and login with regular user credentials
2. Try to access `http://localhost:3000/admin`
3. **Expected**: "Access Denied" page with red error message

### Phase 2: Dashboard Overview Testing

#### 2.1 Test Dashboard Loading
1. Login as admin and navigate to `/admin`
2. **Verify Loading States**:
   - Loading spinner appears initially
   - "Loading Admin Dashboard..." message shows
   - Dashboard loads within 5-10 seconds
3. **Expected**: Dashboard displays without errors

#### 2.2 Test Quick Stats Cards
1. **Security Score Card** (Blue):
   - Shows score out of 100
   - Displays "PROTECTED" status
   - Has animated pulse dot
   - Hover effect works (scale + shadow)

2. **Active Users Card** (Green):
   - Shows current active user count
   - Displays "ONLINE" status
   - Has animated pulse dot
   - Hover effect works

3. **Active Alerts Card** (Red):
   - Shows unresolved alert count
   - Displays "MONITORING" status
   - Has animated pulse dot
   - Hover effect works

4. **System Health Card** (Purple):
   - Shows system status (healthy/degraded/critical)
   - Color-coded status indicator
   - Displays "SYSTEM" status
   - Hover effect works

### Phase 3: Tab Navigation Testing

#### 3.1 Test Tab Switching
1. Click each tab in the navigation:
   - **Overview** (Blue gradient when active)
   - **Security** (Red gradient when active)
   - **Performance** (Green gradient when active)
   - **Rate Limits** (Amber gradient when active)
   - **System** (Purple gradient when active)
   - **Audit Logs** (Indigo gradient when active)
   - **Alerts** (Orange gradient when active)

2. **Verify**:
   - Active tab has gradient background
   - Content changes for each tab
   - Icons display correctly
   - Smooth transitions

### Phase 4: Feature-Specific Testing

#### 4.1 Overview Tab
1. **Security Overview Component**:
   - Security score progress bar
   - Request distribution pie chart
   - Security features status list
   - Recent activity timeline
   - System health indicators

2. **Interactive Elements**:
   - Charts are responsive
   - Hover effects on chart elements
   - Data tooltips appear

#### 4.2 Security Tab
1. **Security Metrics**:
   - Threat detection charts
   - Security event timeline
   - Risk assessment indicators
   - Vulnerability status

#### 4.3 Performance Tab
1. **Performance Metrics**:
   - Response time charts
   - Throughput indicators
   - Resource usage graphs
   - Performance trends

#### 4.4 Rate Limits Tab
1. **Rate Limiting Status**:
   - Current rate limit settings
   - Request count tracking
   - Blocked request statistics
   - Rate limit rules

#### 4.5 System Tab
1. **System Health**:
   - Service status indicators
   - Uptime statistics
   - System resource usage
   - Health check results

#### 4.6 Audit Logs Tab
1. **Security Audit Logs**:
   - Paginated log entries
   - Search functionality
   - Filter by severity
   - Export capabilities

2. **Test Search & Filters**:
   - Enter search terms
   - Select severity filters
   - Verify results update
   - Test pagination

#### 4.7 Alerts Tab
1. **Security Alerts**:
   - Active alerts list
   - Alert severity indicators
   - Resolve alert functionality
   - Create new alerts

2. **Test Alert Management**:
   - Click "Resolve" on an alert
   - Create a new test alert
   - Filter alerts by type/severity
   - Export alerts data

### Phase 5: Interactive Features Testing

#### 5.1 Test Refresh Functionality
1. **Manual Refresh**:
   - Click "Refresh" button in header
   - Verify data updates
   - Check for success toast notification

2. **Auto-Refresh**:
   - Toggle "Auto-refresh" button
   - Verify it changes from OFF to ON
   - Wait 30 seconds and check if data refreshes
   - Toggle back to OFF

#### 5.2 Test Export Functionality
1. Click "Export" button in header
2. **Expected**: JSON file downloads with dashboard data
3. **Verify**: File contains timestamp and complete dashboard data

#### 5.3 Test Real-Time Notifications
1. **Check Notification Widget** (bottom-right):
   - Connection status indicator
   - Real-time notification display
   - Auto-hide functionality

2. **Test Connection States**:
   - Green = Connected ("Real-time Active")
   - Red = Disconnected ("Offline Mode")
   - Animated icons and pulse effects

### Phase 6: Light/Dark Mode Testing

#### 6.1 Test Theme Toggle
1. **Locate Theme Toggle**:
   - Usually in navbar or settings
   - May be a sun/moon icon

2. **Test Light Mode**:
   - Background: Light gray/white
   - Cards: White backgrounds
   - Text: Dark colors
   - Borders: Light gray

3. **Test Dark Mode**:
   - Background: Dark gray/black
   - Cards: Dark backgrounds
   - Text: Light colors
   - Borders: Dark gray

#### 6.2 Verify Theme Consistency
1. **Check All Components**:
   - Header and navigation
   - Quick stats cards
   - Tab navigation
   - Chart components
   - Modal dialogs
   - Notification widget

2. **Test Theme Persistence**:
   - Switch to dark mode
   - Refresh page
   - **Expected**: Theme remains dark
   - Switch back to light mode
   - Refresh page
   - **Expected**: Theme remains light

### Phase 7: Responsive Design Testing

#### 7.1 Test Different Screen Sizes
1. **Desktop (1920x1080)**:
   - 4-column grid for stats cards
   - Full tab navigation visible
   - Charts display properly

2. **Tablet (768px)**:
   - 2-column grid for stats cards
   - Tab navigation may scroll
   - Charts remain readable

3. **Mobile (375px)**:
   - Single column layout
   - Stacked navigation
   - Touch-friendly buttons

#### 7.2 Test Mobile Navigation
1. Resize browser to mobile width
2. **Verify**:
   - Hamburger menu appears
   - Navigation is accessible
   - Cards stack vertically
   - Charts are responsive

### Phase 8: Error Handling Testing

#### 8.1 Test Network Errors
1. **Disconnect Internet**:
   - Refresh dashboard
   - **Expected**: Error state with retry button

2. **API Unavailable**:
   - Stop backend API
   - Refresh dashboard
   - **Expected**: Connection error message

#### 8.2 Test Invalid Data
1. **Check Error Boundaries**:
   - Dashboard should handle missing data gracefully
   - Fallback values should display
   - No JavaScript errors in console

### Phase 9: Performance Testing

#### 9.1 Test Loading Performance
1. **Initial Load**:
   - Dashboard should load within 5 seconds
   - Progressive loading of components
   - Smooth animations

2. **Data Refresh**:
   - Manual refresh should complete within 3 seconds
   - Auto-refresh should be seamless
   - No UI blocking during updates

#### 9.2 Test Memory Usage
1. **Long-term Usage**:
   - Leave dashboard open for 30 minutes
   - Monitor browser memory usage
   - Check for memory leaks

### Phase 10: Security Testing

#### 10.1 Test Authentication
1. **Token Expiration**:
   - Wait for token to expire
   - Try to access admin features
   - **Expected**: Redirect to login

2. **Direct URL Access**:
   - Logout and try accessing `/admin` directly
   - **Expected**: Redirect to login or access denied

#### 10.2 Test Authorization
1. **Role-Based Access**:
   - Login with different user roles
   - Verify admin-only features are restricted
   - Check API endpoint access

## Common Issues & Troubleshooting

### Issue 1: Dashboard Won't Load
**Symptoms**: Loading spinner never disappears
**Solutions**:
1. Check backend API is running on port 5000
2. Verify admin credentials are correct
3. Check browser console for errors
4. Clear browser cache and cookies

### Issue 2: Charts Not Displaying
**Symptoms**: Empty chart containers
**Solutions**:
1. Check data is being returned from API
2. Verify chart library dependencies
3. Check for JavaScript errors
4. Test with different browsers

### Issue 3: Real-Time Features Not Working
**Symptoms**: No live updates or notifications
**Solutions**:
1. Check SignalR connection status
2. Verify WebSocket support in browser
3. Check firewall/proxy settings
4. Test with different network connections

### Issue 4: Theme Toggle Not Working
**Symptoms**: Theme doesn't change or persist
**Solutions**:
1. Check localStorage permissions
2. Verify theme provider is properly configured
3. Clear browser storage
4. Test in incognito mode

### Issue 5: Mobile Layout Issues
**Symptoms**: Layout broken on mobile devices
**Solutions**:
1. Check CSS media queries
2. Verify responsive breakpoints
3. Test with browser dev tools
4. Check for CSS conflicts

## Success Criteria

### ✅ All Features Working
- [ ] Admin authentication works
- [ ] Dashboard loads without errors
- [ ] All 7 tabs display content
- [ ] Quick stats show real data
- [ ] Charts and graphs render
- [ ] Search and filters work
- [ ] Export functionality works
- [ ] Real-time updates work
- [ ] Light/dark mode works
- [ ] Mobile responsive design
- [ ] Error handling works
- [ ] Performance is acceptable

### ✅ User Experience
- [ ] Smooth animations and transitions
- [ ] Intuitive navigation
- [ ] Clear visual feedback
- [ ] Consistent design language
- [ ] Accessible interface
- [ ] Fast loading times

### ✅ Security & Reliability
- [ ] Proper access control
- [ ] Secure data handling
- [ ] Graceful error recovery
- [ ] No memory leaks
- [ ] Cross-browser compatibility

## Conclusion

This comprehensive testing guide ensures that the Admin Dashboard is fully functional, secure, and provides an excellent user experience across all devices and scenarios. Each phase builds upon the previous one to systematically verify all features and edge cases.

For any issues encountered during testing, refer to the troubleshooting section or check the browser console for detailed error messages. 