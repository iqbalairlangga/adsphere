# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. Please report vulnerabilities to **security@adsphere.io**.

Do not disclose vulnerabilities publicly until we have had a chance to address them.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Assessment and prioritization
- **30 days**: Fix deployed (critical issues)

## Security Measures

- JWT with short expiration + refresh tokens
- bcrypt password hashing (cost factor 12)
- Helmet.js for HTTP headers
- Rate limiting on all endpoints
- CSRF protection
- SQL injection prevention via Prisma
- XSS sanitization
- Input validation via class-validator
- RBAC + ABAC authorization
- Audit logging for all sensitive operations
- Data encryption at rest and in transit
- OWASP Top 10 compliance
