# Known Issues & Improvements

## Current Status: MVP Phase

As of December 8, 2025, the project is in **MVP (Minimum Viable Product)** phase. Below are the identified issues, TODOs, and areas for improvement.

---

## ⚠️ Known Issues

### 1. OTP Delivery Not Implemented (Backend)
**File:** `backend/src/auth/auth.service.ts` (Lines 60, 317)  
**Status:** TODO  
**Priority:** HIGH

**Current State:**
```typescript
private async sendOtp(email: string | null, phone: string | null, otpCode: string) {
  // TODO: Implement actual email/SMS sending
  console.log(`📧 OTP for ${email || phone}: ${otpCode}`);
  
  // Email sending would go here using nodemailer
  // SMS sending would go here using Twilio
}
```

**Impact:** Users cannot receive OTP codes via email or SMS. Currently only logs to console.

**Solution:**
- Integrate **Twilio** for SMS OTP delivery
- Integrate **Nodemailer** or **SendGrid** for email OTP delivery
- Add environment variables: `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**Implementation Priority:** P0 - Critical for production

---

### 2. Type Safety - Using `any` Types (Backend)
**Files:**
- `backend/src/users/users.service.ts` (Line 15)
- `backend/src/users/users.controller.ts` (Lines 11, 16)
- `backend/src/relationships/relationships.controller.ts` (Lines 21, 36, 41)
- `backend/src/persons/persons.controller.ts` (Lines 22, 40, 45)
- `backend/src/families/families.controller.ts` (Lines 21, 36)

**Status:** Code smell / Type safety issue  
**Priority:** MEDIUM

**Current State:**
```typescript
async create(@Body() data: any, @Req() req: any) {
  // ...
}
```

**Recommendation:**
- Create proper DTO (Data Transfer Object) interfaces for each endpoint
- Replace `any` with specific types (CreateFamilyDto, UpdatePersonDto, etc.)
- Improves type safety and API documentation

**Impact:** Reduces IDE autocomplete, makes refactoring harder, increases bug risk

---

### 3. Error Handling - Type Assertion (Frontend)
**File:** `frontend/src/app/[locale]/login/page.tsx` (Line 41)  
**Status:** Requires type safety  
**Priority:** MEDIUM

**Current State:**
```typescript
} catch (err: any) {
  setError(err.response?.data?.message || 'Login failed');
}
```

**Better Practice:**
```typescript
} catch (err) {
  if (axios.isAxiosError(err)) {
    setError(err.response?.data?.message || 'Login failed');
  } else {
    setError('An unexpected error occurred');
  }
}
```

---

## 🚀 Planned Features (Phase 2)

### 1. Email & SMS Notifications
- [ ] OTP delivery via email/SMS (HIGH PRIORITY)
- [ ] Event reminders via email
- [ ] Birthday notifications
- [ ] Announcement notifications
- [ ] System alerts for admins

### 2. Push Notifications
- [ ] Firebase Cloud Messaging (FCM) integration
- [ ] Mobile push notifications
- [ ] Web push notifications (PWA)
- [ ] In-app notification center

### 3. Admin Dashboard UI
- [ ] Admin panel frontend components
- [ ] User management interface
- [ ] Moderation tools
- [ ] Analytics dashboard
- [ ] Audit log viewer

### 4. Two-Factor Authentication (2FA)
- [ ] TOTP (Time-based One-Time Password)
- [ ] Backup codes
- [ ] 2FA enrollment flow
- [ ] 2FA login flow

### 5. Enhanced Audit Logging
- [ ] Detailed audit log persistence
- [ ] Audit log export (CSV, PDF)
- [ ] IP address logging
- [ ] User activity tracking

### 6. Mobile App Release
- [ ] Complete Flutter mobile app
- [ ] Google Play Store release
- [ ] Apple App Store release
- [ ] APK direct download
- [ ] Push notification support

### 7. Advanced Search & Filtering
- [ ] Full-text search across family data
- [ ] Advanced filters (by age, profession, marital status)
- [ ] Search history
- [ ] Saved searches

### 8. Photo & Document Management
- [ ] Family photo gallery
- [ ] Document storage (certificates, IDs)
- [ ] File sharing within family
- [ ] Photo albums
- [ ] Cloud backup

---

## 📋 Improvement Opportunities

### 1. TypeScript Strict Mode
**Current:** `"strict": true` in tsconfig.json may not be fully utilized  
**Action:** Enforce strict types across codebase

### 2. Error Handling
- Implement global error handler in NestJS
- Standardize error response format
- Add more specific HTTP status codes
- Implement retry logic for failed operations

### 3. Testing
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] E2E tests for user flows
- [ ] Frontend component tests
- [ ] API contract tests

### 4. Documentation
- Add JSDoc comments to complex functions
- Document API endpoints with examples
- Create troubleshooting guide for common issues
- Add architecture diagrams for data flow

### 5. Performance
- Implement database query optimization
- Add caching layer (Redis)
- Implement pagination for large datasets
- Optimize API response times (<200ms target)

### 6. Security
- [ ] Implement rate limiting per user (not just global)
- [ ] Add request signing for sensitive operations
- [ ] Implement CSRF protection
- [ ] Add SQL injection tests
- [ ] Implement secrets rotation
- [ ] Add security headers audit

### 7. Deployment
- [ ] Set up CI/CD pipeline
- [ ] Automated tests on PR
- [ ] Code quality checks (SonarQube)
- [ ] Security scanning (SAST)
- [ ] Automated rollback on failure

---

## 🐛 Bug Fixes Needed

### 1. Missing Admin Module (If Not Present)
Check if AdminModule is properly loaded in AppModule

### 2. Prisma Relations Validation
- Verify all relationship constraints
- Test cascade delete scenarios
- Check unique constraints

### 3. CORS Configuration
- Test CORS headers on production
- Verify preflight requests
- Check credentials handling

---

## 📊 Testing Checklist

Before moving to next phase:

- [ ] All TODO items resolved
- [ ] Type safety improved (reduce `any` usage)
- [ ] Unit tests added for critical paths
- [ ] E2E tests for authentication flow
- [ ] Load testing (1000+ concurrent users)
- [ ] Security audit completed
- [ ] Performance baseline established

---

## 🔄 Recommended Order of Work

1. **Highest Priority (Do First):**
   - Implement OTP delivery (email/SMS)
   - Fix TypeScript `any` types
   - Add error handling improvements

2. **High Priority:**
   - Implement 2FA
   - Add push notifications framework
   - Create admin dashboard UI

3. **Medium Priority:**
   - Add comprehensive tests
   - Implement caching
   - Optimize performance

4. **Nice to Have:**
   - Advanced analytics
   - Photo/document management
   - Social sharing features

---

## 📞 Support & Questions

For questions about these issues:
- Check related documentation in `docs/` folder
- Review code comments
- Open GitHub issue for discussion

---

**Last Updated:** December 8, 2025  
**Version:** 1.0  
**Status:** MVP Phase
