# Postman API Testing Guide

## Phase 2B: API Testing Setup

This folder contains Postman collections and environments for testing the Parakar Halani Parivar backend APIs.

---

## 📁 Files

- **Parakar-Halani-Parivar-API.postman_collection.json** - Complete API collection
- **Development.postman_environment.json** - Development environment variables

---

## 🚀 Quick Start

### 1. Import Collection into Postman

1. Open Postman
2. Click **Import** (top left)
3. Select **File** tab
4. Choose: `Parakar-Halani-Parivar-API.postman_collection.json`
5. Click **Import**

### 2. Import Environment

1. Click **Import** again
2. Select: `Development.postman_environment.json`
3. Click **Import**
4. Select **"Parakar Halani Parivar - Development"** from environment dropdown (top right)

### 3. Start Backend Server

```powershell
cd backend
npm run start:dev
```

Backend should start on **http://localhost:3001**

---

## 📋 Test Execution Order

### **Step 1: Get Existing Data (Read Operations)**

1. **GET All Families** - Should return 2 seeded families
2. **GET All Members** - Should return 8 seeded members
3. **GET All Announcements** - Should return 3 seeded announcements

**Verification:**
- Status: `200 OK`
- Response contains array of objects with database data

---

### **Step 2: Test Single Resource Retrieval**

1. From "Get All Families" response, copy a family `id` (CUID string)
2. Set environment variable: `FAMILY_ID` = copied ID
3. Run: **GET Family by ID**
4. Repeat for Members and Announcements

**Verification:**
- Status: `200 OK`
- Response contains single object with all related data
- Family should include: `familyMembers`, `announcements`
- Member should include: `families`, `relationships`

---

### **Step 3: Test Create Operations**

#### Create a New Family:
```json
POST /families
{
  "name": "Postman Test Family",
  "description": "Created via API testing",
  "village": "Test Village"
}
```

#### Create a New Member:
```json
POST /members
{
  "firstName": "API",
  "lastName": "Tester",
  "gender": "MALE",
  "dateOfBirth": "1995-06-15T00:00:00.000Z",
  "phone": "+919876543210",
  "email": "api.tester@example.com",
  "address": "123 Test Street",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "country": "India",
  "pincode": "380001",
  "bloodGroup": "O_POSITIVE",
  "occupation": "QA Engineer",
  "education": "B.Tech"
}
```

#### Create an Announcement:
```json
POST /announcements
{
  "title": "API Test Announcement",
  "content": "This announcement was created via Postman testing",
  "familyId": "{{FAMILY_ID}}"
}
```

**Verification:**
- Status: `201 Created`
- Response contains created object with generated `id`
- **Save the returned `id` to environment variables for next tests**

---

### **Step 4: Test Update Operations**

Use the IDs from Step 3 (or existing seeded data IDs):

#### Update Family:
```json
PATCH /families/{{FAMILY_ID}}
{
  "name": "Updated via Postman",
  "description": "Description modified during testing"
}
```

#### Update Member:
```json
PATCH /members/{{MEMBER_ID}}
{
  "phone": "+919999999999",
  "occupation": "Senior QA Engineer"
}
```

**Verification:**
- Status: `200 OK`
- Response shows updated fields
- Unchanged fields remain intact

---

### **Step 5: Test Delete Operations**

⚠️ **Warning:** These operations permanently delete data from the database.

1. Run: **DELETE Family** with test family ID
2. Run: **DELETE Member** with test member ID
3. Run: **DELETE Announcement** with test announcement ID

**Verification:**
- Status: `200 OK` or `204 No Content`
- Re-running GET should return `404 Not Found`

---

### **Step 6: Error Handling Tests**

#### Test Invalid ID:
```
GET /families/invalid-id-format
Expected: 404 Not Found or 500 Internal Server Error
```

#### Test Missing Required Fields:
```json
POST /members
{
  "firstName": "Incomplete"
}
Expected: 400 Bad Request with validation errors
```

#### Test Non-Existent Resource:
```
GET /families/00000000-0000-0000-0000-000000000000
Expected: 404 Not Found
```

---

## 🧪 Test Coverage

| Resource | Create | Read All | Read One | Update | Delete | Status |
|----------|--------|----------|----------|--------|--------|--------|
| Families | ✅ | ✅ | ✅ | ✅ | ✅ | Ready |
| Members | ✅ | ✅ | ✅ | ✅ | ✅ | Ready |
| Announcements | ✅ | ✅ | ✅ | ✅ | ✅ | Ready |

---

## 📊 Expected Results from Seeded Data

### Families (2 total):
- Halani Family (Pali Village)
- Shah Family (Surat City)

### Members (8 total):
- Rajesh Halani (grandfather)
- Meena Halani (grandmother)
- Amit Halani (father)
- Priya Halani (mother)
- Arjun Halani (son)
- Ananya Halani (daughter)
- Ravi Shah (uncle)
- Kavita Shah (aunt)

### Announcements (3 total):
- Family Gathering announcement
- Marriage Ceremony
- Festival Celebration

---

## 🔧 Environment Variables

Set these in Postman environment after creating/retrieving resources:

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| BASE_URL | Backend API base URL | http://localhost:3001 |
| FAMILY_ID | Test family CUID | cm5abc123... |
| MEMBER_ID | Test member CUID | cm5def456... |
| ANNOUNCEMENT_ID | Test announcement CUID | cm5ghi789... |

---

## 📝 Testing Checklist

Phase 2B completion requires:

- [ ] All 15 API endpoints tested (5 per resource × 3 resources)
- [ ] GET operations return seeded data correctly
- [ ] POST operations create new resources with valid IDs
- [ ] PATCH operations update only specified fields
- [ ] DELETE operations remove resources successfully
- [ ] Error responses validated (404, 400, 500)
- [ ] Response schemas match Prisma models
- [ ] Relationships populated correctly (includes work)
- [ ] All status codes appropriate (200, 201, 404, etc.)
- [ ] No compilation or runtime errors in backend logs

---

## 🚨 Troubleshooting

### Backend Not Responding
```powershell
# Check if server is running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Restart backend
cd backend
npm run start:dev
```

### "Cannot GET /families" Error
- Verify BASE_URL is `http://localhost:3001` (no trailing slash)
- Check backend console for startup errors
- Ensure Prisma Client generated: `npx prisma generate`

### Database Connection Errors
```powershell
# Verify PostgreSQL is running
Get-Service PostgreSQL*

# Test database connection
cd backend
npx prisma studio
```

### Invalid IDs in Responses
- Prisma uses CUID format (not numeric)
- Copy exact ID strings from GET responses
- IDs look like: `cm5a1b2c3d4e5f6g7h8i9j0k`

---

## 📚 Next Steps

After Phase 2B completion:
- **Phase 2C:** Families Management Feature Completion
- **Phase 2D:** Members Management Feature Completion
- **Phase 2E:** Authentication & Authorization Testing
- **Phase 2F:** Relationships & Advanced Queries

---

## 💡 Tips

1. **Use Postman Tests Tab** to add automated assertions:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has id", function () {
       pm.expect(pm.response.json()).to.have.property('id');
   });
   ```

2. **Save IDs Automatically** with Postman scripts:
   ```javascript
   // In Tests tab of POST request
   const response = pm.response.json();
   pm.environment.set("FAMILY_ID", response.id);
   ```

3. **Use Postman Console** (View → Show Postman Console) to debug requests

4. **Collection Runner** to execute all tests in sequence

---

**Created:** Phase 2B  
**Last Updated:** January 3, 2026  
**Backend Port:** 3001  
**Database:** PostgreSQL (parakar_halani_parivar)
