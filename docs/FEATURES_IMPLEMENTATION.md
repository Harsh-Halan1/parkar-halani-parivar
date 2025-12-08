# Implementation Guide - New Features

Complete implementation guide for all requested features with code examples.

---

## 1. Admin Moderation System

### Overview
- Initial admin account created once during first setup
- Admins can grant moderation permissions to existing family members
- Role-based access control throughout application
- Audit logging for all moderation changes

### Database Schema
```prisma
enum Role {
  ADMIN          # Full permissions + moderation
  FAMILY_MEMBER  # Standard user
}

model User {
  id    String @id
  role  Role   @default(FAMILY_MEMBER)
  // ... other fields
}

model AuditLog {
  id        String @id
  action    String  # GRANT_MODERATION, REVOKE_MODERATION
  entityId  String
  changedBy String
  createdAt DateTime @default(now())
}
```

### Implementation Files

**Backend:**
- `backend/src/admin/admin.service.ts` - Service layer with moderation logic
- `backend/src/admin/admin.controller.ts` - API endpoints
- `backend/src/admin/admin.module.ts` - Module setup

**API Endpoints:**

```
POST   /admin/initial-setup
       Create initial admin account (call once only)
       Body: { email, phone, password }

POST   /admin/moderators/:userId
       Grant moderation permissions to user
       Requires: Admin role
       
DELETE /admin/moderators/:userId
       Revoke moderation permissions
       Requires: Admin role

GET    /admin/moderators
       List all moderators/admins
       Requires: Admin role

GET    /admin/moderation-logs
       Get audit logs of moderation changes
       Requires: Admin role
```

### Setup Steps

**Step 1: Initialize Admin Account (One-time)**

```bash
curl -X POST http://localhost:3001/api/v1/admin/initial-setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@parkarhalani.com",
    "phone": "+919876543210",
    "password": "StrongPassword123!"
  }'
```

**Step 2: Grant Moderation to User**

```bash
curl -X POST http://localhost:3001/api/v1/admin/moderators/user-uuid \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Step 3: View All Moderators**

```bash
curl http://localhost:3001/api/v1/admin/moderators \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Frontend Integration

Add to navigation (only show to admins):

```typescript
// In your navigation component
const { user } = useAuth();

if (user?.role === 'ADMIN') {
  return (
    <Link href="/admin/moderators">
      Manage Moderators
    </Link>
  );
}
```

---

## 2. Event-Triggered Update Suggestions

### Overview
- When BIRTH or DEATH events are recorded, suggest updating person's profile
- Show popup with suggestions (no forced redirect)
- Track suggested updates (optional acknowledgment)
- Non-intrusive - user can dismiss and continue

### Implementation Files

**Backend:**
- `backend/src/events/event-notifications.service.ts` - Service for generating suggestions

**API Endpoints:**

```
GET    /events/suggestions?familyId=uuid
       Get pending suggestions for family
       Returns: Array of EventSuggestion objects

POST   /events/:eventId/acknowledge
       Mark suggestion as acknowledged by user
```

### Features

**Auto-Generated Suggestions:**

- **BIRTH Event:**
  - Update parents' relationships
  - Add birth date to profile
  - Update family tree
  - Add birth place and medical info

- **DEATH Event:**
  - Mark person as deceased
  - Add death date
  - Update family relationships
  - Add death place/cause
  - Create memorial announcement

- **BIRTHDAY Event:**
  - Verify birth date
  - Update age and milestones

### Frontend Component

**EventNotificationPopup.tsx** - Provides:
- Popup with event details and suggestions
- Dismiss button (non-intrusive)
- "Update Profile" button (optional navigation)
- Auto-close after acknowledgment

**useEventNotifications Hook** - Provides:
- Fetch pending notifications
- Manage notification state
- Navigate between multiple notifications

### Usage Example

```typescript
// In your dashboard layout
export default function DashboardLayout() {
  const { familyId } = useAuth();
  const { 
    isOpen, 
    currentNotification, 
    dismissNotification 
  } = useEventNotifications(familyId);

  return (
    <>
      <DashboardContent />
      <EventNotificationPopup
        isOpen={isOpen}
        notification={currentNotification}
        onClose={dismissNotification}
        onGoToProfile={(personId) => {
          router.push(`/persons/${personId}/edit`);
        }}
      />
    </>
  );
}
```

### Translation Keys Added

```json
"events": {
  "eventNotification": "Family Update Needed",
  "suggestedUpdates": "Suggested Updates",
  "notificationAcknowledged": "Thank you for acknowledging"
}
```

---

## 3. Age Calculation & Display

### Overview
- Auto-calculate age from date of birth
- Display age alongside date of birth
- Update age in real-time
- Support multiple formats (years, years+months)

### Implementation Files

**Frontend Utility:**
- `frontend/src/lib/utils/age-calculator.ts` - Utility functions

### Functions Provided

```typescript
// Calculate age (returns number)
calculateAge(dateOfBirth) // 30

// Format age for display
formatAge(dateOfBirth, exactFormat) 
// "30 years" or "30 years, 5 months"

// Format date of birth with locale support
formatDateOfBirth(dateOfBirth, locale)
// "जनवरी 15, 1990" (Hindi) / "15 જાન્યુ, 1990" (Gujarati)

// Get age category for UI
getAgeCategory(dateOfBirth)
// "infant", "child", "teenager", "adult", "senior"

// Check if birthday is today
isBirthdayToday(dateOfBirth) // true/false

// Days until next birthday
daysUntilBirthday(dateOfBirth) // 45
```

### Usage in Profile Component

```typescript
import { 
  formatAge, 
  formatDateOfBirth, 
  calculateAge 
} from '@/lib/utils/age-calculator';

export function PersonProfile({ person }) {
  const age = calculateAge(person.dateOfBirth);
  const formattedDOB = formatDateOfBirth(person.dateOfBirth, locale);

  return (
    <div>
      <h2>{person.firstName} ({age} years)</h2>
      <p>Born: {formattedDOB}</p>
    </div>
  );
}
```

### Translation Keys Added

```json
"person": {
  "age": "Age",
  "birthDetails": "Birth Details",
  "deathDetails": "Death Details"
}
```

---

## 4. Mobile App Download Section

### Overview
- Dedicated download page for mobile app
- Support Android APK direct download + Play Store
- Support iOS App Store
- Web version link
- QR codes for quick access
- System requirements & features list

### Implementation Files

**Frontend Component:**
- `frontend/src/components/MobileAppDownload.tsx` - Complete download section

### Features

- **Android APK** - Direct download
- **Play Store** - Official distribution
- **iOS App Store** - Official distribution
- **Web Version** - Link to web
- **QR Codes** - Camera scan for instant download
- **Feature List** - What's included in app
- **System Requirements** - Device compatibility

### Usage in Page

```typescript
// pages/download.tsx
import { MobileAppDownload } from '@/components/MobileAppDownload';

export default function DownloadPage() {
  return (
    <main>
      <MobileAppDownload 
        appVersion="1.0.0"
        showQRCode={true}
      />
    </main>
  );
}
```

### Download Links Configuration

Update these in the component:

```typescript
const downloadLinks = {
  android: {
    url: 'https://your-domain.com/downloads/parkar-halani-v1.0.0.apk',
    // ... other properties
  },
  android_play_store: {
    url: 'https://play.google.com/store/apps/details?id=com.parkarhalani.mobile',
  },
  ios: {
    url: 'https://apps.apple.com/app/parkar-halani-parivar/id0000000000',
  },
};
```

### Translation Keys Added

```json
"download": {
  "title": "Download Our App",
  "android": "Android",
  "ios": "iOS",
  "playStore": "Play Store",
  "version": "Version",
  "size": "Size",
  "feature1": "Offline family tree access",
  "feature2": "Push notifications for events",
  // ... more features
}
```

### Hosting APK File

**On Railway:**

```bash
# Create public folder structure
mkdir -p public/downloads

# Upload APK file
# Place your .apk file in this directory
# Access via: https://your-backend.railway.app/downloads/app.apk
```

Or use cloud storage:

```typescript
// Use Supabase Storage for APK
// Instructions in ENVIRONMENT_SETUP.md
```

---

## 5. NestJS 10.3+ Compatibility & Concurrency

### Confirmation

✅ **NestJS 10.3.0 is fully compatible** - No version issues
✅ **Concurrency is well-handled** - See NESTJS_CONCURRENCY.md for details

### What's Already Implemented

1. **Database Transactions** - Atomic operations
2. **Connection Pooling** - Via Railway PostgreSQL
3. **Rate Limiting** - Throttler module (10 req/60s)
4. **Request Isolation** - Per-request context
5. **JWT Per-Request** - Isolated sessions
6. **Row-level Locking** - PostgreSQL handles it

### Testing Concurrent Operations

```bash
# Load test your backend
npm install --save-dev autocannon

# Run test
npx autocannon http://localhost:3001/api/v1/health -c 50 -d 30
```

See `NESTJS_CONCURRENCY.md` for complete details.

---

## 6. Database Migrations for New Features

### Step 1: Update Prisma Schema

The schema already has all required fields. If you need to add new fields:

```bash
cd backend

# Create migration
npx prisma migrate dev --name add_new_feature

# Review migration file and apply
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Deploy to Production

```bash
# On Railway, push changes
git push origin main

# Railway auto-runs migrations
```

---

## 7. Environment Variables Needed

Update `.env` files:

```env
# backend/.env
CORS_ORIGIN="https://your-vercel-app.vercel.app"
FRONTEND_URL="https://your-vercel-app.vercel.app"

# For admin setup
INITIAL_ADMIN_EMAIL="admin@parkarhalani.com"
INITIAL_ADMIN_PHONE="+919876543210"
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL="https://your-railway-backend.railway.app/api/v1"
```

---

## 8. Testing Checklist

- [ ] Admin account creation works
- [ ] Can grant moderation permissions
- [ ] Moderation logs show audit trail
- [ ] Event suggestions popup shows for BIRTH/DEATH
- [ ] Age calculated correctly from DOB
- [ ] Age displayed in profile
- [ ] Download page loads all links
- [ ] APK download works
- [ ] Concurrent requests handled properly
- [ ] Rate limiting kicks in at 10 req/60s

---

## 9. Deployment Checklist

- [ ] Backend code deployed to Railway
- [ ] Frontend code deployed to Vercel
- [ ] Environment variables set in both
- [ ] Admin account initialized
- [ ] Database migrations completed
- [ ] APK file hosted and accessible
- [ ] Download links point to correct URLs
- [ ] QR codes generated and tested
- [ ] All endpoints tested in production
- [ ] Error handling working properly

---

## 10. Next Steps

1. **Add Admin UI Dashboard** - Frontend page to manage moderators
2. **Enhance Notifications** - Email/SMS for events
3. **Birthday Reminder System** - Auto-send reminders
4. **Advanced Analytics** - Track family metrics
5. **Mobile App Release** - Publish to app stores
6. **Push Notifications** - FCM integration for mobile

See `ROADMAP.md` for detailed Phase 2+ plans.
