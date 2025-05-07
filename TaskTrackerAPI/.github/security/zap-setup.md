# OWASP ZAP Setup Instructions

## Overview

This document provides instructions for setting up and using OWASP ZAP (Zed Attack Proxy) for security testing of the TaskTrackerAPI.

## Installation

### Windows

1. Download the ZAP installer from [https://www.zaproxy.org/download/](https://www.zaproxy.org/download/)
2. Run the installer and follow the prompts
3. Launch ZAP from the Start menu

### macOS

```bash
brew install --cask owasp-zap
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install openjdk-11-jre
wget https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2.14.0_Linux.tar.gz
tar -xf ZAP_2.14.0_Linux.tar.gz
cd ZAP_2.14.0
./zap.sh
```

## Initial Configuration

1. Launch ZAP
2. Go to Tools > Options
3. Under API, enable the API and set a strong API key
4. Under Connections > Server Certificates, generate a new Root CA certificate
5. Install the ZAP Root CA certificate in your browser/system

## Project-Specific Configuration

### Import TaskTrackerAPI Context

1. In ZAP, go to File > Import Context
2. Select the `TaskTrackerAPI_ZAP_Context.context` file from the repository's `.github/security` directory
3. The context includes:
   - Target scope set to TaskTrackerAPI endpoints
   - Authentication configuration
   - User credentials for testing
   - Input vectors configured for API testing

### Authentication Setup

1. Go to the Authentication panel under the TaskTrackerAPI context
2. Verify that JSON-based authentication is selected
3. The login URL should be set to `http://localhost:5000/api/auth/login` (or your deployment URL)
4. The JSON request body should be:
   ```json
   {
     "email": "security-test@example.com",
     "password": "TestPassword1!"
   }
   ```
5. The verification regex should match the authentication success response

## Running Scans

### Active Scan

1. Start your TaskTrackerAPI locally or point to a test environment
2. In ZAP, right-click on the site URL (e.g., `http://localhost:5000`) and select "Attack" > "Active Scan"
3. Ensure you're using the TaskTrackerAPI context
4. Click Start Scan
5. Review results in the Alerts tab

### API Scan (Using ZAP CLI)

For automated testing, use the ZAP CLI with this repository's configuration:

```bash
# Install ZAP CLI
pip install zapcli

# Run API scan using our standard configuration
zap-cli quick-scan --self-contained \
  --start-options "-config api.disablekey=true" \
  --spider http://localhost:5000 \
  --ajax \
  --scan \
  --recursive \
  --api-key "your-api-key" \
  --format html \
  --output-file zap-scan-report.html
```

## Interpreting Results

### Alert Levels

- **High**: Critical security vulnerabilities requiring immediate attention
- **Medium**: Significant security issues that should be addressed soon
- **Low**: Minor security concerns with limited risk
- **Informational**: Best practice suggestions or informational findings

### Standard Report Format

Security test reports should include:

1. Executive Summary
2. Findings by Severity
3. Technical Details
4. Remediation Steps
5. Verification Tests

## ZAP Integration with CI/CD

Our CI/CD pipeline includes automated ZAP scans. To view the most recent results:

1. Go to the GitHub Actions tab for this repository
2. Look for the "OWASP ZAP API Security Scan" workflow
3. Download the artifacts from the most recent successful run

## Custom Rules

We use a custom ruleset for TaskTrackerAPI security testing. The ruleset is defined in `.github/security/zap-rules.tsv` and includes:

- Disabled rules that cause false positives in our API
- Modified thresholds for certain tests
- Custom rules specific to our application architecture

## Update Process

The ZAP configuration is updated quarterly or when significant changes are made to the API. To propose updates:

1. Make your changes to the ZAP context or rules
2. Export the context file
3. Create a PR with the updated files and justification

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API is running and accessible
   - Check credentials in the authentication configuration
   - Ensure authentication regex is correctly matching responses

2. **False Positives**
   - Document in the issue tracker with evidence
   - Update the rules file to exclude verified false positives

3. **Scan Timeouts**
   - Increase the timeout settings in ZAP options
   - Reduce the scope of the scan to target specific endpoints

### Getting Help

For assistance with ZAP setup or scan issues:
- Check the [OWASP ZAP documentation](https://www.zaproxy.org/docs/)
- Contact the security team via the #security Slack channel 