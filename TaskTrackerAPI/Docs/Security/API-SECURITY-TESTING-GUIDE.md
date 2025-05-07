# TaskTrackerAPI Security Testing Guide

## Introduction

This guide provides methodologies and examples for testing the security of TaskTrackerAPI. It covers common attack vectors, testing tools, and approaches to verify security controls are functioning properly.

## Testing Environment Setup

### Required Tools

1. **OWASP ZAP**: Main security testing tool for API scanning
   - Download: https://www.zaproxy.org/download/
   - Setup instructions included in `/TaskTrackerAPI/.github/security/zap-setup.md`

2. **Postman**: For manual security testing
   - Collection: `/TaskTrackerAPI/Security/TaskTrackerAPI-Security-Tests.postman_collection.json`

3. **JWT Debugger**: For token manipulation tests
   - Online: https://jwt.io/

4. **SQLMap**: For database injection testing
   - Setup with safe mode for non-destructive testing only

### Environment Configuration

1. Create a dedicated testing database
2. Set up a testing user with known credentials
3. Enable the security test endpoints in `appsettings.Development.json`:
   ```json
   "SecurityTesting": {
     "EnableTestEndpoints": true,
     "CSPReportOnly": true
   }
   ```

## Authentication Testing

### JWT Token Testing

1. **Token Expiration Test**:
   ```
   1. Obtain a valid JWT token
   2. Wait for token expiration (15 minutes)
   3. Attempt to use the expired token
   4. Verify 401 Unauthorized response
   ```

2. **Token Manipulation Test**:
   ```
   1. Obtain a valid JWT token
   2. Modify the payload (e.g., change userId or role)
   3. Attempt to use the modified token
   4. Verify signature validation rejects the token
   ```

3. **Brute Force Protection Test**:
   ```
   1. Send 11+ invalid login attempts within 1 minute
   2. Verify rate limiting response (429 Too Many Requests)
   3. Verify account lockout after threshold reached
   ```

## Authorization Testing

1. **Resource Isolation Test**:
   ```
   1. Create two test users (User A, User B)
   2. User A creates a task
   3. Log in as User B and attempt to access User A's task by ID
   4. Verify 403 Forbidden response
   ```

2. **Role-Based Access Test**:
   ```
   1. Create test accounts with different roles (Admin, User, Child)
   2. Test access to family creation endpoints with Child role
   3. Verify 403 Forbidden response for unauthorized operations
   ```

3. **IDOR Vulnerability Test**:
   ```
   1. Identify endpoints with resource IDs
   2. Authenticate as one user
   3. Attempt to manipulate IDs to access other users' resources
   4. Verify proper authorization checks prevent access
   ```

## Input Validation Testing

1. **SQL Injection Test**:
   ```
   1. Identify endpoints that accept text input
   2. Test with SQL injection payloads:
      - ' OR 1=1 --
      - '; DROP TABLE Users; --
   3. Verify sanitization prevents execution
   ```

2. **XSS Attack Test**:
   ```
   1. Add tasks/notes with XSS payloads:
      - <script>alert('XSS')</script>
      - <img src="x" onerror="alert('XSS')">
   2. Retrieve and render data
   3. Verify payload is properly encoded/sanitized
   ```

3. **Input Length Test**:
   ```
   1. Generate extremely long inputs (10,000+ characters)
   2. Send to various endpoints
   3. Verify proper length validation
   ```

## HTTP Security Headers Testing

1. **CSP Verification**:
   ```
   1. Send request to any API endpoint
   2. Examine Content-Security-Policy header
   3. Verify all directives are present and restrictive
   4. Test with CSP Evaluator: https://csp-evaluator.withgoogle.com/
   ```

2. **Security Headers Test**:
   ```
   1. Send request to any API endpoint
   2. Verify presence of all security headers:
      - Strict-Transport-Security
      - X-Content-Type-Options
      - X-Frame-Options
      - Content-Security-Policy
      - Referrer-Policy
      - Permissions-Policy
   ```

## CSRF Protection Testing

1. **Double-Submit Cookie Test**:
   ```
   1. Authenticate and capture anti-CSRF token
   2. Attempt a state-changing request without the token
   3. Verify 400 Bad Request response
   4. Attempt with invalid token
   5. Verify request is rejected
   ```

## Automated Scanning

### OWASP ZAP Scanning

1. **Full API Scan**:
   ```
   1. Import OpenAPI/Swagger definition
   2. Configure authentication in ZAP
   3. Run full API scan
   4. Generate report and analyze findings
   ```

2. **Active Scan Configuration**:
   ```
   1. Exclude destructive test policies
   2. Set thread count to 5
   3. Target specific API endpoints first
   ```

### Example ZAP Script

```bash
#!/bin/bash
# Example ZAP scanning script
zap-cli quick-scan --self-contained \
  --start-options "-config api.disablekey=true" \
  --spider https://api.tasktracker.test \
  --ajax \
  --scan \
  --recursive \
  --api-key "api-key-here" \
  --format html \
  --output-file zap-scan-report.html
```

## Security Integration Tests

### Example Security Tests

1. **Authentication Tests**:
   ```csharp
   [Test]
   public async Task ExpiredToken_ShouldReturn401()
   {
       // Test implementation
   }
   
   [Test]
   public async Task ModifiedToken_ShouldReturn401()
   {
       // Test implementation
   }
   ```

2. **Authorization Tests**:
   ```csharp
   [Test]
   public async Task UserAccessingOtherUserResource_ShouldReturn403()
   {
       // Test implementation
   }
   ```

3. **Input Validation Tests**:
   ```csharp
   [Test]
   public async Task MaliciousInput_ShouldBeSanitized()
   {
       // Test implementation
   }
   ```

## Common Attack Patterns and Defenses

| Attack Pattern | Test Case | Defense |
|----------------|-----------|---------|
| JWT Token Tampering | Modify token payload | Token signature validation |
| SQL Injection | `' OR 1=1 --` | Parameterized queries |
| XSS | `<script>alert('XSS')</script>` | Output encoding, CSP |
| CSRF | Cross-site POST request | Anti-forgery tokens |
| Broken Authentication | Brute force login | Rate limiting, account lockout |
| Excessive Data Exposure | Request sensitive fields | DTO mapping, field filtering |
| Mass Assignment | Send extra properties | Explicit property binding |
| SSRF | Request internal resources | URL validation, allowlists |

## Security Testing Results

1. Create reports using the template at `/TaskTrackerAPI/Docs/Security/Templates/security-test-report.md`
2. Document:
   - Test date and tester
   - Tools used
   - Findings with severity ratings
   - Recommendations
   - Retest plans

## Continuous Security Testing

1. **CI/CD Integration**:
   - ZAP scans run on PR builds
   - Security unit tests run on every build
   - Dependency scanning in pipeline

2. **Regular Testing Schedule**:
   - Weekly automated scans
   - Monthly manual penetration tests
   - Quarterly comprehensive security review

## References

1. OWASP API Security Testing Guide: https://owasp.org/www-project-api-security/
2. API Security Testing Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
3. JWT Security Best Practices: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/ 