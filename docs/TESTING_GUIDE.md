# Testing Guide - Parkar Halani Parivar

Complete guide for testing the application before public deployment.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Environment Setup](#environment-setup)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [User Acceptance Testing](#user-acceptance-testing)
9. [Deployment Testing](#deployment-testing)
10. [Test Checklist](#test-checklist)

---

## Testing Overview

### Testing Pyramid

```
       UI/E2E Tests
      /          \
   Integration Tests
   /              \
Unit Tests
```

### Test Coverage Goals

- **Unit Tests:** 80% code coverage
- **Integration Tests:** All API endpoints
- **E2E Tests:** Critical user journeys
- **Performance:** < 200ms API response, < 3s page load
- **Security:** No vulnerabilities in dependencies

---

## Environment Setup

### Prerequisites

```powershell
# Backend testing
cd backend
pnpm install

# Frontend testing
cd frontend
pnpm install
```

### Test Database Setup

**Option 1: Docker PostgreSQL (Recommended)**
```powershell
docker run --name test-postgres `
  -e POSTGRES_PASSWORD=testpass `
  -e POSTGRES_USER=testuser `
  -e POSTGRES_DB=parkar_test `
  -p 5433:5432 `
  -d postgres:15
```

**Option 2: Local PostgreSQL**
```powershell
# Create test database
psql -U postgres -c "CREATE DATABASE parkar_test;"
psql -U postgres -c "CREATE USER testuser WITH PASSWORD 'testpass';"
psql -U postgres -c "ALTER ROLE testuser CREATEDB;"
```

### Environment Variables

**.env.test (Backend)**
```env
DATABASE_URL=postgresql://testuser:testpass@localhost:5433/parkar_test
JWT_SECRET=test-secret-key-change-in-production
JWT_EXPIRY=1h
JWT_REFRESH_SECRET=test-refresh-secret
JWT_REFRESH_EXPIRY=7d
GOOGLE_CLIENT_ID=test-google-id
GOOGLE_CLIENT_SECRET=test-google-secret
ENVIRONMENT=test
LOG_LEVEL=debug
```

**.env.test.local (Frontend)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=test
```

---

## Backend Testing

### Unit Tests

**Run all unit tests:**
```powershell
cd backend
pnpm test
```

**Run specific test file:**
```powershell
pnpm test src/auth/auth.service.spec.ts
```

**Watch mode (for development):**
```powershell
pnpm test:watch
```

**With coverage:**
```powershell
pnpm test:cov
```

### Test Files Structure

```
backend/src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   ├── auth.controller.spec.ts
├── users/
│   ├── users.service.spec.ts
├── families/
│   ├── families.service.spec.ts
└── ...
```

### Key Test Cases

**Authentication Tests**
```typescript
describe('AuthService', () => {
  it('should register user with valid email', async () => {
    // Test implementation
  });
  
  it('should hash password before storing', async () => {
    // Test password hashing
  });
  
  it('should generate JWT token on login', async () => {
    // Test token generation
  });
  
  it('should reject invalid credentials', async () => {
    // Test invalid login
  });
});
```

**Family Management Tests**
```typescript
describe('FamiliesService', () => {
  it('should create family with valid data', async () => {
    // Test family creation
  });
  
  it('should validate family relationships', async () => {
    // Test relationship validation
  });
  
  it('should prevent circular relationships', async () => {
    // Test circular prevention
  });
});
```

### Running Specific Test Suites

```powershell
# Auth module tests
pnpm test -- --testPathPattern="auth"

# Users module tests
pnpm test -- --testPathPattern="users"

# Families module tests
pnpm test -- --testPathPattern="families"
```

---

## Frontend Testing

### Unit & Component Tests

**Install test dependencies (if not installed):**
```powershell
cd frontend
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

**Run tests:**
```powershell
pnpm test
```

**Watch mode:**
```powershell
pnpm test --watch
```

### Component Testing Examples

**Button Component Test**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should handle click event', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Testing i18n/Localization

```typescript
describe('Localization', () => {
  it('should render content in Gujarati', () => {
    render(<App locale="gu" />);
    // Check for Gujarati text
  });
  
  it('should render content in English', () => {
    render(<App locale="en" />);
    // Check for English text
  });
  
  it('should render content in Hindi', () => {
    render(<App locale="hi" />);
    // Check for Hindi text
  });
});
```

---

## Integration Testing

### API Integration Tests

**Backend E2E Tests**
```powershell
cd backend
pnpm test:e2e
```

**Test file location:** `backend/test/`

### Common Integration Test Scenarios

#### 1. User Registration & Login Flow

```powershell
# Test Case: User Registration
1. POST /api/v1/auth/register
   Body: { email: "test@example.com", password: "Test123!" }
   Expected: 201 Created, user ID returned

# Test Case: User Login
2. POST /api/v1/auth/login
   Body: { email: "test@example.com", password: "Test123!" }
   Expected: 200 OK, JWT token returned

# Test Case: Access Protected Route
3. GET /api/v1/users/profile
   Headers: Authorization: Bearer <token>
   Expected: 200 OK, user profile returned
```

#### 2. Family Management Flow

```powershell
# Test Case: Create Family
1. POST /api/v1/families
   Body: { name: { en: "Test Family", gu: "...", hi: "..." } }
   Expected: 201 Created

# Test Case: Add Person to Family
2. POST /api/v1/persons
   Body: { familyId: "...", firstName: {...}, lastName: {...} }
   Expected: 201 Created

# Test Case: Create Relationship
3. POST /api/v1/relationships
   Body: { person1Id: "...", person2Id: "...", type: "PARENT" }
   Expected: 201 Created

# Test Case: Validate Family Tree
4. GET /api/v1/families/{id}/tree
   Expected: 200 OK, valid tree structure
```

#### 3. Event & Announcement Flow

```powershell
# Test Case: Create Event
1. POST /api/v1/events
   Body: { familyId: "...", type: "BIRTH", date: "..." }
   Expected: 201 Created, notifications triggered

# Test Case: Create Announcement
2. POST /api/v1/announcements
   Body: { familyId: "...", content: "..." }
   Expected: 201 Created, pending moderation

# Test Case: Admin Approves Announcement
3. POST /api/v1/admin/announcements/{id}/approve
   Expected: 200 OK, announcement published
```

### Using Postman for Integration Testing

**Create Postman Collection:**

1. Import environment variables:
```json
{
  "baseUrl": "http://localhost:3001",
  "token": "",
  "userId": "",
  "familyId": ""
}
```

2. Pre-request script for token refresh:
```javascript
const token = pm.environment.get('token');
if (token) {
  pm.request.headers.add({key: 'Authorization', value: `Bearer ${token}`});
}
```

3. Test scripts for response validation:
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.access_token).to.be.a('string');
    pm.environment.set('token', jsonData.access_token);
});
```

---

## Performance Testing

### Load Testing with Artillery

**Installation:**
```powershell
npm install -g artillery
```

**Create load test config (load-test.yml):**
```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"

scenarios:
  - name: "API Endpoints"
    flow:
      - get:
          url: "/api/v1/families"
          headers:
            Authorization: "Bearer {{ $processEnvironment.TOKEN }}"
      - post:
          url: "/api/v1/events"
          json:
            familyId: "test-id"
            type: "BIRTH"
            date: "2025-01-15"
      - get:
          url: "/api/v1/announcements"
```

**Run load test:**
```powershell
artillery run load-test.yml
```

### Performance Benchmarks

**Expected Response Times:**

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| GET /families | < 100ms | --- | ⏳ |
| POST /families | < 150ms | --- | ⏳ |
| GET /families/{id}/tree | < 200ms | --- | ⏳ |
| GET /announcements | < 100ms | --- | ⏳ |
| POST /events | < 150ms | --- | ⏳ |

**Front-end Performance:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| First Contentful Paint | < 1.5s | --- | ⏳ |
| Largest Contentful Paint | < 2.5s | --- | ⏳ |
| Cumulative Layout Shift | < 0.1 | --- | ⏳ |
| Time to Interactive | < 3s | --- | ⏳ |

---

## Security Testing

### Dependency Vulnerabilities

**Check for security vulnerabilities:**
```powershell
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit
```

**Fix vulnerabilities:**
```powershell
npm audit fix
```

### OWASP Security Tests

#### 1. Authentication & Authorization

```powershell
# Test Case: Invalid JWT Token
GET /api/v1/users/profile
Headers: Authorization: Bearer invalid-token
Expected: 401 Unauthorized

# Test Case: Expired Token
GET /api/v1/users/profile
Headers: Authorization: Bearer <expired-token>
Expected: 401 Unauthorized, refresh token required

# Test Case: Missing Authorization Header
GET /api/v1/users/profile
Expected: 401 Unauthorized

# Test Case: Role-Based Access Control
GET /api/v1/admin/audit-logs
User role: FAMILY_MEMBER
Expected: 403 Forbidden
```

#### 2. Input Validation

```powershell
# Test Case: SQL Injection Prevention
POST /api/v1/families
Body: { name: "'; DROP TABLE families; --" }
Expected: 400 Bad Request, sanitized input

# Test Case: XSS Prevention
POST /api/v1/announcements
Body: { content: "<script>alert('xss')</script>" }
Expected: Sanitized/escaped in response

# Test Case: CSRF Protection
POST /api/v1/families
Headers: Origin: https://malicious-site.com
Expected: 403 Forbidden (CORS blocked)
```

#### 3. Data Protection

```powershell
# Test Case: Password Hashing
1. Register user with password "Test123!"
2. Query database directly
3. Verify password is hashed (not plain text)
Expected: Password is bcrypt hash, not readable

# Test Case: Encryption at Rest
1. Store sensitive data (phone, email)
2. Check database
3. Verify encryption if configured
Expected: Sensitive data is encrypted
```

#### 4. Rate Limiting

```powershell
# Test Case: Rate Limit on Login
For i in 1..15:
  POST /api/v1/auth/login
  Invalid credentials
  
After 10 failed attempts:
Expected: 429 Too Many Requests

# Test Case: Rate Limit Reset
Wait 15 minutes, try again
Expected: Rate limit reset, can attempt login
```

### Security Checklist

- [ ] HTTPS/TLS enabled in production
- [ ] All passwords hashed with bcrypt (12+ rounds)
- [ ] JWT tokens properly signed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] OWASP dependencies checked
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Sensitive data encrypted
- [ ] No secrets in code/git
- [ ] API authentication required
- [ ] Admin endpoints role-protected

---

## User Acceptance Testing

### Test Scenarios

#### Scenario 1: New User Registration & Profile Setup

**Precondition:** User has not registered

**Steps:**
1. Navigate to `/register`
2. Enter email: `testuser@example.com`
3. Enter password: `SecurePass123!`
4. Click "Register"
5. Verify email/OTP (use test email)
6. Complete profile:
   - First Name: "John"
   - Last Name: "Doe"
   - Phone: "+919876543210"
7. Click "Save Profile"

**Expected Results:**
- ✅ Account created successfully
- ✅ Redirected to dashboard
- ✅ Profile information saved
- ✅ Welcome email received

#### Scenario 2: Create Family & Add Members

**Precondition:** User is logged in, no families exist

**Steps:**
1. Click "Add Family"
2. Enter family name in all languages:
   - English: "Doe Family"
   - Gujarati: "ડો ફેમિલી"
   - Hindi: "डो परिवार"
3. Click "Create"
4. Click "Add Person"
5. Enter person details:
   - Name: "Jane Doe"
   - Gender: Female
   - DOB: "1980-05-15"
6. Click "Save"

**Expected Results:**
- ✅ Family created
- ✅ Family appears in families list
- ✅ Person added to family
- ✅ Multilingual names preserved

#### Scenario 3: Create Relationships & Family Tree

**Precondition:** Family exists with 2+ persons

**Steps:**
1. Select family
2. Click "Add Relationship"
3. Select "Person 1: John Doe"
4. Select "Relationship: PARENT"
5. Select "Person 2: Jane Doe"
6. Click "Create"
7. View family tree

**Expected Results:**
- ✅ Relationship created
- ✅ Tree visualization shows connection
- ✅ Age validation passed
- ✅ No circular relationships

#### Scenario 4: Create Event & Receive Notifications

**Precondition:** Family with members exists

**Steps:**
1. Click "Add Event"
2. Select type: "BIRTH"
3. Enter date: "2025-01-01"
4. Enter details
5. Click "Create"
6. Verify notifications popup
7. Review suggested updates

**Expected Results:**
- ✅ Event created
- ✅ Family members receive notification
- ✅ Suggested updates appear
- ✅ Can acknowledge updates

#### Scenario 5: Create & Approve Announcement

**Precondition:** User is family member

**Steps:**
1. Click "Add Announcement"
2. Enter content in any language
3. Click "Submit"
4. Verify status: "Pending"
5. Switch to admin account
6. Navigate to announcements
7. Click "Approve"

**Expected Results:**
- ✅ Announcement submitted
- ✅ Appears in pending queue for admin
- ✅ Admin can approve/reject
- ✅ Announcement published and visible

#### Scenario 6: Multilingual Experience

**Precondition:** User is logged in

**Steps:**
1. Click Settings
2. Change language to Gujarati
3. Verify all UI text in Gujarati
4. Change language to Hindi
5. Verify all UI text in Hindi
6. Change back to English

**Expected Results:**
- ✅ All UI text changes language
- ✅ App name, buttons, labels in correct language
- ✅ Family/person data multilingual
- ✅ No broken text or missing translations

#### Scenario 7: Admin Moderation

**Precondition:** Admin account, pending content exists

**Steps:**
1. Login as admin
2. Navigate to "Announcements"
3. Review pending announcement
4. Click "Approve"
5. Verify announcement published
6. Review audit log

**Expected Results:**
- ✅ Admin can view pending content
- ✅ Can approve/reject with reasons
- ✅ Action logged in audit log
- ✅ User notified of decision

#### Scenario 8: Mobile Responsiveness

**Precondition:** Desktop browser with device emulation

**Steps:**
1. Open DevTools (F12)
2. Select mobile view (iPhone 12)
3. Navigate through app
4. Click buttons, fill forms
5. Test on tablet (iPad)
6. Test on phone (Android)

**Expected Results:**
- ✅ Layout responsive at all breakpoints
- ✅ Buttons clickable (48x48px minimum)
- ✅ Forms readable and usable
- ✅ Images scale properly
- ✅ Modals work on mobile

### UAT Sign-off Template

```markdown
## UAT Sign-off

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [STAGING/PRODUCTION]

### Test Results
- [ ] User Registration: PASS / FAIL
- [ ] Family Management: PASS / FAIL
- [ ] Relationships: PASS / FAIL
- [ ] Events & Notifications: PASS / FAIL
- [ ] Announcements: PASS / FAIL
- [ ] Multilingual Support: PASS / FAIL
- [ ] Admin Functions: PASS / FAIL
- [ ] Mobile Experience: PASS / FAIL

### Issues Found
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

### Sign-off
- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] UAT approved for deployment

**Tester Signature:** ________________
**Date:** ________________
```

---

## Deployment Testing

### Staging Environment Testing

Before pushing to production, test on staging:

```powershell
# Deploy to staging
npm run build
npm run deploy:staging

# Run smoke tests
npm run test:smoke

# Run performance tests
artillery run load-test.yml

# Test critical user journeys
npm run test:critical-paths
```

### Smoke Tests

```powershell
# Quick verification after deployment
1. [ ] Frontend loads at staging URL
2. [ ] Backend API responds
3. [ ] Database connection works
4. [ ] User can login
5. [ ] Can create family
6. [ ] Can view announcements
7. [ ] Admin panel accessible
8. [ ] No 500 errors in logs
```

### Rollback Plan

```powershell
# If issues found, rollback:

# Backend rollback
git revert <commit-hash>
npm run build
npm run deploy:production

# Frontend rollback (Vercel)
# Vercel dashboard → Deployments → Rollback to previous

# Database rollback (if migrations failed)
pnpm prisma migrate resolve --rolled-back "migration_name"
pnpm prisma migrate deploy
```

---

## Test Checklist

### Pre-Deployment Testing

#### Frontend
- [ ] All pages load without errors
- [ ] No console errors or warnings
- [ ] All links work
- [ ] Forms submit correctly
- [ ] Images load
- [ ] Responsive design works
- [ ] Dark/Light mode toggles
- [ ] Multilingual switching works
- [ ] Performance > 80 Lighthouse score

#### Backend
- [ ] All endpoints respond correctly
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] Input validation working
- [ ] Error messages appropriate
- [ ] Database queries optimized
- [ ] Logs clear and helpful
- [ ] Rate limiting working

#### Database
- [ ] All migrations applied
- [ ] Schema matches models
- [ ] Backups working
- [ ] No orphaned records
- [ ] Indexes created
- [ ] Foreign keys valid

#### Security
- [ ] Dependencies audited
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CORS configured
- [ ] JWT validation working
- [ ] Password hashing verified
- [ ] Rate limiting tested
- [ ] HTTPS enabled

#### Infrastructure
- [ ] Environment variables set
- [ ] Secrets not in git
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] SSL certificate valid
- [ ] CDN configured (if applicable)

### Final Sign-off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Documentation complete
- [ ] Performance meets targets
- [ ] Security verified
- [ ] UAT approved
- [ ] Deployment plan ready

---

**Test Plan Last Updated:** December 8, 2025  
**Version:** 1.0  
**Status:** Ready for Testing
