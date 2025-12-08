# Admin Guide - Parkar Halani Parivar

## Overview

This guide explains the admin panel features, responsibilities, and how to manage the Parkar Halani Parivar family system effectively.

---

## Table of Contents

1. [Admin Roles & Permissions](#admin-roles--permissions)
2. [Initial Admin Setup](#initial-admin-setup)
3. [User Management](#user-management)
4. [Family Management](#family-management)
5. [Announcements & Events Moderation](#announcements--events-moderation)
6. [Audit Logs](#audit-logs)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Admin Roles & Permissions

### Admin Responsibilities

**ADMIN role can:**
- ✅ Grant/revoke admin permissions to other users
- ✅ View all families and persons in the system
- ✅ Moderate announcements and events
- ✅ Access audit logs for compliance
- ✅ Manage user accounts (deactivate/reactivate)
- ✅ View system statistics and activity

### Role-Based Access Control

```
User Roles:
├── ADMIN - Full system access + moderation
└── FAMILY_MEMBER - Limited to their family
```

---

## Initial Admin Setup

### First Admin Account Creation

The first admin account is created during initial database setup:

```powershell
cd backend

# During prisma migrate dev, seed script runs:
# - Creates initial admin user
# - Sets up system defaults
# - Initializes audit logging
```

**Default Credentials:**
```env
INITIAL_ADMIN_EMAIL=admin@parkarhalani.local
INITIAL_ADMIN_PHONE=+919876543210
INITIAL_ADMIN_PASSWORD=SetInEnv  # Change this!
```

**First Steps:**
1. Login with initial admin credentials
2. Change password immediately
3. Update profile information
4. Invite other admins if needed

### Creating Additional Admins

Via API:
```bash
POST /api/v1/admin/grant-moderation
{
  "targetUserId": "user-id-to-promote"
}
```

Requirements:
- Must be authenticated as ADMIN
- Target user must exist
- Target user will be promoted to ADMIN role
- See `BACKEND_SETUP.md` for initial admin creation

---

## 3. Admin Dashboard

### Dashboard Overview

The admin dashboard displays:

- **System Statistics**
  - Total users
  - Total families
  - Total persons
---

## User Management

### View All Users

**API Endpoint:**
```bash
GET /api/v1/admin/moderators
```

**Response:**
```json
[
  {
    "id": "user-123",
    "email": "user@example.com",
    "phone": "+919876543210",
    "role": "ADMIN",
    "person": {...},
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

### Grant Admin Permissions

**Endpoint:**
```bash
POST /api/v1/admin/grant-moderation
Body: { "targetUserId": "user-id" }
```

**Process:**
1. Verify requestor is ADMIN
2. Find target user
3. Update user role to ADMIN
4. Log action in audit log
5. Return success confirmation

### Revoke Admin Permissions

**Endpoint:**
```bash
POST /api/v1/admin/revoke-moderation
Body: { "targetUserId": "user-id" }
```

**Safeguards:**
- Cannot revoke from last admin account
- Logs all permission changes
- Requires ADMIN authentication

---

## Family Management

### View All Families

**API Endpoint:**
```bash
GET /api/v1/families
```

### Validate Family Structure

Check before approving:
- ✅ Family head is correctly assigned
- ✅ All members have valid relationships
- ✅ No circular relationships
- ✅ Age progression makes logical sense
- ✅ Marital status is consistent

### Common Family Issues

**Issue: Invalid Age Relationships**
- Parent is younger than child
- Solution: Review birth dates and correct

**Issue: Circular Relationships**
- Person A → B → C → A
- Solution: Review relationships and remove invalid links

**Issue: Missing Family Head**
- Family has no designated head
- Solution: Select appropriate family member as head

---

## Announcements & Events Moderation

### Announcement Approval Workflow

**Status Flow:**
```
Draft → Pending → Approved → Published
               ↘ Rejected
```

### Moderate Content

Check each announcement for:
- ✅ **Appropriate Content** - No spam or abuse
- ✅ **Accuracy** - Correct family information
- ✅ **Relevance** - Appropriate for family
- ✅ **Privacy** - Doesn't expose sensitive data

### Event Management

**Types of Events:**
- BIRTH - New family member
- DEATH - Family member deceased
- ACHIEVEMENT - Education, career, milestones
- BIRTHDAY - Celebration reminder
- GENERAL - Other important events

### Event Notification System

When BIRTH or DEATH events are created:
1. System suggests profile updates
2. Notification popup appears to family
3. Guides them to complete information
4. Tracks acknowledgment

**Suggestions for BIRTH:**
- Add birth date details
- Link to parents
- Update family tree
- Add birth place/medical info

**Suggestions for DEATH:**
- Mark person as deceased
- Add death date and place
- Update family relationships
- Create memorial announcement

---

## Audit Logs

### Audit Logging System

Every admin action is logged:
- **Action:** CREATE, UPDATE, DELETE, GRANT_MODERATION, REVOKE_MODERATION, etc.
- **Entity:** User, Person, Family, Event, Announcement
- **User ID:** Who performed the action
- **Timestamp:** When it happened
- **Data:** Before/after state (oldData, newData)

### View Audit Logs

**API Endpoint:**
```bash
GET /api/v1/admin/audit-logs
Query params:
  - userId: Filter by user
  - action: Filter by action type
  - startDate: From date
  - endDate: To date
  - limit: Results per page (default 50)
  - offset: Pagination offset
```

### Sample Audit Log Entry

```json
{
  "id": "log-123",
  "userId": "admin-001",
  "action": "GRANT_MODERATION",
  "entity": "USER",
  "entityId": "user-456",
  "oldData": { "role": "FAMILY_MEMBER" },
  "newData": { "role": "ADMIN" },
  "ipAddress": "192.168.1.100",
  "createdAt": "2025-01-15T14:30:00Z"
}
```

### Compliance & Audits

Use audit logs for:
- **DPDP Compliance:** Track data access and modifications
- **Security Audit:** Identify suspicious activity
- **Accountability:** Who made what changes
- **Troubleshooting:** Understand data history

---

## Best Practices

### Security

- 🔒 **Strong Passwords:** Use 12+ characters with mixed case
- 🔒 **Regular Updates:** Change admin password monthly
- 🔒 **Audit Review:** Check logs weekly for anomalies
- 🔒 **Principle of Least Privilege:** Only grant necessary permissions
- 🔒 **Backup Admins:** Have at least 2-3 admins

### Data Integrity

- ✅ **Verify Before Approving:** Always review announcements/events
- ✅ **Correct Spelling:** Check multilingual content (Gujarati, English, Hindi)
- ✅ **Validate Relationships:** Ensure family tree accuracy
- ✅ **Consistent Information:** Age, dates, and relationships should align

### Communication

- 📧 **Respond Promptly:** Answer user questions within 24 hours
- 📧 **Explain Rejections:** If you reject content, tell them why
- 📧 **Professional Tone:** Maintain respectful communication
- 📧 **Document Decisions:** Keep notes on important decisions

### Performance

- ⚡ **Monitor System Health:** Check error rates and response times
- ⚡ **Database Maintenance:** Optimize queries, cleanup old data
- ⚡ **Backup Schedule:** Daily encrypted backups
- ⚡ **Capacity Planning:** Monitor growth and plan accordingly

---

## Troubleshooting

### User Cannot Login

**Possible Causes:**
1. Account locked (5 failed attempts)
2. Email/phone not verified
3. Account deactivated

**Solution:**
```bash
# Reset login attempts
POST /api/v1/admin/reset-user-login
{ "userId": "user-id" }
```

### Missing or Corrupted Family Data

**Steps:**
1. Check audit logs for deletion
2. Verify relationships are intact
3. Check database backups
4. Contact support if needed

### Performance Issues

**Checklist:**
- [ ] Database connection is stable
- [ ] No long-running queries
- [ ] API response times < 200ms
- [ ] Server CPU/Memory usage normal
- [ ] Recent schema changes applied

### Notification System Not Working

**Check:**
1. Event created successfully
2. Person linked to event
3. Family members have email/phone set
4. Email/SMS service configured

---

## Admin Commands Reference

### Critical Commands

| Action | Endpoint | Method |
|--------|----------|--------|
| List Admins | `/admin/moderators` | GET |
| Grant Admin | `/admin/grant-moderation` | POST |
| Revoke Admin | `/admin/revoke-moderation` | POST |
| View Audit Logs | `/admin/audit-logs` | GET |

### Monitoring

| Action | Endpoint | Method |
|--------|----------|--------|
| Get System Stats | `/admin/stats` | GET |
| Check Health | `/health` | GET |
| View Error Logs | `/admin/logs` | GET |

---

## Support & Escalation

### Getting Help

**For Technical Issues:**
- Check documentation at `docs/` folder
- Review BACKEND_SETUP.md for API details
- Check KNOWN_ISSUES.md for common problems

**For User Issues:**
- Respond via email within 24 hours
- Document the issue and resolution
- Update knowledge base if common

### Emergency Contacts

- **Database Down:** Check Supabase/Railway dashboard
- **API Errors:** Check error logs and Sentry
- **Data Corruption:** Stop accepting requests, check backups

---

## Appendix: Admin Checklist

### Daily Tasks
- [ ] Check system error logs
- [ ] Review new user registrations
- [ ] Moderate pending announcements
- [ ] Monitor API response times

### Weekly Tasks
- [ ] Review audit logs for suspicious activity
- [ ] Verify database backups completed
- [ ] Update admin passwords
- [ ] Check user support tickets

### Monthly Tasks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Update documentation
- [ ] Compliance checks (DPDP)

### Quarterly Tasks
- [ ] Full system security audit
- [ ] Backup restoration test
- [ ] Capacity planning review
- [ ] Feature roadmap planning

---

**Last Updated:** January 15, 2025  
**Version:** 2.0  
**Audience:** System Administrators

```
1. Admin Panel → Families → Add Family
2. Enter family name
3. Search and select family head
4. Add family members
5. Validate relationships
6. Save and confirm
```

### Task: Resolve Relationship Conflict

```
1. Admin Panel → Relationships → Pending
2. Click problematic relationship
3. Review age/status of both persons
4. Either approve or request correction from user
5. Log decision in audit
```

### Task: Monthly System Report

```
1. Admin Panel → Reports → Monthly Report
2. Review stats (users, families, events)
3. Check audit logs for issues
4. Generate PDF report
5. Send to stakeholders
```

---

**Last Updated:** December 8, 2025
**Version:** 1.0
