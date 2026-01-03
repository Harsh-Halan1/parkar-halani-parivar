# Database Schema Visualization

**Status:** ✅ Ready for Migration  
**Database:** PostgreSQL  
**ORM:** Prisma 5.8.0

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ phone (UNIQUE)  │────┐
│ passwordHash    │    │
│ firstName       │    │
│ lastName        │    │ 1:1 Relationship
│ memberId (FK)   │◄───┘
│ createdAt       │
│ updatedAt       │
│ lastLogin       │
└─────────────────┘


        ┌──────────────────────┐
        │     Member           │
        ├──────────────────────┤
        │ id (PK)              │
        │ firstName            │
        │ lastName             │
        │ dateOfBirth          │
        │ profession (optional) │
        │ maritalStatus        │
        │ photoUrl (optional)  │
        │ createdAt            │
        │ updatedAt            │
        └──────────┬───────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         │ 1:N Relationship   │
         │ (via FamilyMember) │
         │                    │
    ┌────▼──────────┐    ┌────▼──────────────┐
    │ Relationship  │    │  FamilyMember     │
    ├───────────────┤    ├───────────────────┤
    │ id (PK)       │    │ id (PK)           │
    │ fromMemberId  │    │ familyId (FK)     │
    │ toMemberId    │    │ memberId (FK)     │
    │ type          │    │ relationshipType  │
    │ familyId (FK) │    │ joinedAt          │
    │ createdAt     │    └───────────┬───────┘
    │ updatedAt     │                │
    └───────────────┘                │
                                     │
                             ┌───────▼─────────┐
                             │   Family        │
                             ├─────────────────┤
                             │ id (PK)         │
                             │ name            │
                             │ city            │
                             │ description     │
                             │ createdAt       │
                             │ updatedAt       │
                             └────────┬────────┘
                                      │
                                      │ 1:N
                                      │
                              ┌───────▼────────────┐
                              │  Announcement      │
                              ├────────────────────┤
                              │ id (PK)            │
                              │ title              │
                              │ content            │
                              │ type (Birthday,    │
                              │        Birth,      │
                              │        Death,      │
                              │        Wedding,    │
                              │        General)    │
                              │ familyId (FK)      │
                              │ createdAt          │
                              │ updatedAt          │
                              └────────────────────┘


┌──────────────────────┐
│   RefreshToken       │
├──────────────────────┤
│ id (PK)              │
│ token (UNIQUE)       │
│ expiresAt            │
│ userId (FK)──────────┼──────┐
│ createdAt            │      │
└──────────────────────┘      │
                              │
                    ┌─────────┘
                    │ 1:N Relationship
                    │
              (User table above)


┌──────────────────────┐
│   FileStorage        │
├──────────────────────┤
│ id (PK)              │
│ fileName             │
│ fileUrl              │
│ bucketPath           │
│ fileSize             │
│ mimeType             │
│ memberId (FK)        │
│ (optional)           │
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
```

---

## Table Definitions

### 1. User Table
**Purpose:** Authentication accounts linked to members

```sql
CREATE TABLE "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    passwordHash TEXT,
    firstName TEXT,
    lastName TEXT,
    memberId TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    lastLogin TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES "Member"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_phone ON "User"(phone);
CREATE INDEX idx_user_memberId ON "User"(memberId);
```

**Data Example:**
```
id | email              | phone       | firstName | lastName
---|--------------------|-----------  |-----------|----------
1  | rajesh@halani.com  | 9876543210  | Rajesh    | Halani
2  | arjun@halani.com   | 8765432109  | Arjun     | Halani
```

---

### 2. Member Table
**Purpose:** Individual people in the system

```sql
CREATE TABLE "Member" (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    dateOfBirth DATE,
    profession TEXT,
    maritalStatus TEXT,
    photoUrl TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE INDEX idx_member_name ON "Member"(firstName, lastName);
```

**Data Example:**
```
id | firstName | lastName | dateOfBirth | profession      | maritalStatus
---|-----------|----------|-------------|-----------------|---------------
1  | Rajesh    | Halani   | 1965-05-15  | Business Owner  | Married
2  | Arjun     | Halani   | 1990-03-10  | Software Eng.   | Single
3  | Priya     | Halani   | 1968-08-22  | Educator        | Married
```

---

### 3. Family Table
**Purpose:** Family groups that contain members

```sql
CREATE TABLE "Family" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE INDEX idx_family_name ON "Family"(name);
CREATE INDEX idx_family_city ON "Family"(city);
```

**Data Example:**
```
id | name            | city      | description
---|-----------------|-----------|----------------------------
1  | Halani Family   | Mumbai    | Halani family from Mumbai
2  | Parivar Family  | Bangalore | Parivar family from Bangalore
```

---

### 4. FamilyMember Table
**Purpose:** Junction table: Links members to families with relationship context

```sql
CREATE TABLE "FamilyMember" (
    id TEXT PRIMARY KEY,
    familyId TEXT NOT NULL,
    memberId TEXT NOT NULL,
    relationshipType TEXT,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (familyId) REFERENCES "Family"(id) ON DELETE CASCADE,
    FOREIGN KEY (memberId) REFERENCES "Member"(id) ON DELETE CASCADE,
    UNIQUE(familyId, memberId)
);

CREATE INDEX idx_familyMember_familyId ON "FamilyMember"(familyId);
CREATE INDEX idx_familyMember_memberId ON "FamilyMember"(memberId);
```

**Data Example:**
```
id | familyId | memberId | relationshipType | joinedAt
---|----------|----------|------------------|----------
1  | fam1     | mem1     | Head             | 2026-01-03
2  | fam1     | mem2     | Spouse           | 2026-01-03
3  | fam1     | mem3     | Child            | 2026-01-03
```

---

### 5. Relationship Table
**Purpose:** Genealogical connections between members (family tree)

```sql
CREATE TABLE "Relationship" (
    id TEXT PRIMARY KEY,
    fromMemberId TEXT NOT NULL,
    toMemberId TEXT NOT NULL,
    type TEXT NOT NULL, -- Parent, Child, Spouse, Sibling
    familyId TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    FOREIGN KEY (fromMemberId) REFERENCES "Member"(id) ON DELETE CASCADE,
    FOREIGN KEY (toMemberId) REFERENCES "Member"(id) ON DELETE CASCADE,
    FOREIGN KEY (familyId) REFERENCES "Family"(id) ON DELETE CASCADE,
    UNIQUE(fromMemberId, toMemberId, familyId)
);

CREATE INDEX idx_relationship_from ON "Relationship"(fromMemberId);
CREATE INDEX idx_relationship_to ON "Relationship"(toMemberId);
CREATE INDEX idx_relationship_family ON "Relationship"(familyId);
```

**Data Example:**
```
id | fromMemberId | toMemberId | type   | familyId
---|--------------|-----------|--------|----------
1  | mem1         | mem3      | Parent | fam1
2  | mem3         | mem1      | Child  | fam1
3  | mem1         | mem2      | Spouse | fam1
```

---

### 6. Announcement Table
**Purpose:** Family announcements (births, deaths, weddings, birthdays, general)

```sql
CREATE TABLE "Announcement" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL, -- Birth, Death, Wedding, Birthday, General
    familyId TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    FOREIGN KEY (familyId) REFERENCES "Family"(id) ON DELETE CASCADE
);

CREATE INDEX idx_announcement_family ON "Announcement"(familyId);
CREATE INDEX idx_announcement_type ON "Announcement"(type);
CREATE INDEX idx_announcement_date ON "Announcement"(createdAt);
```

**Data Example:**
```
id | title                        | type     | familyId
---|------------------------------|----------|----------
1  | Arjun Birthday Celebration   | Birthday | fam1
2  | Family Reunion 2026          | General  | fam1
3  | Wedding Anniversary          | Wedding  | fam2
```

---

### 7. RefreshToken Table
**Purpose:** Session management and token refresh for "Remember Me" functionality

```sql
CREATE TABLE "RefreshToken" (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    userId TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX idx_refreshToken_user ON "RefreshToken"(userId);
CREATE INDEX idx_refreshToken_expires ON "RefreshToken"(expiresAt);
```

**Data Example:**
```
id | token              | expiresAt           | userId
---|--------------------|--------------------|--------
1  | eyJhbGc... (JWT)   | 2026-01-10 12:00:00 | user1
2  | eyJhbGc... (JWT)   | 2026-01-17 12:00:00 | user2
```

---

### 8. FileStorage Table
**Purpose:** Metadata for files stored in Supabase Storage

```sql
CREATE TABLE "FileStorage" (
    id TEXT PRIMARY KEY,
    fileName TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    bucketPath TEXT,
    fileSize BIGINT,
    mimeType TEXT,
    memberId TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES "Member"(id) ON DELETE SET NULL
);

CREATE INDEX idx_fileStorage_member ON "FileStorage"(memberId);
CREATE INDEX idx_fileStorage_bucket ON "FileStorage"(bucketPath);
```

**Data Example:**
```
id | fileName        | bucketPath            | fileSize | mimeType  | memberId
---|-----------------|----------------------|----------|-----------|----------
1  | rajesh_photo    | members/mem1/photo    | 524288   | image/jpg | mem1
2  | family_tree.pdf | families/fam1/tree.pdf| 1048576  | app/pdf   | NULL
```

---

## Relationships Summary

| From | To | Type | Constraint | Cascade |
|------|----|----|-----------|---------|
| User | Member | 1:1 | memberId NOT NULL, UNIQUE | CASCADE |
| Member | FamilyMember | 1:N | memberId FK | CASCADE |
| Family | FamilyMember | 1:N | familyId FK | CASCADE |
| Family | Announcement | 1:N | familyId FK | CASCADE |
| Member | Relationship (from) | 1:N | fromMemberId FK | CASCADE |
| Member | Relationship (to) | 1:N | toMemberId FK | CASCADE |
| Family | Relationship | 1:N | familyId FK | CASCADE |
| User | RefreshToken | 1:N | userId FK | CASCADE |
| Member | FileStorage | 1:N | memberId FK (nullable) | SET NULL |

---

## Constraints & Validations

### Unique Constraints
- `User.email` - Prevents duplicate email accounts
- `User.phone` - Prevents duplicate phone accounts
- `User.memberId` - One user per member maximum
- `RefreshToken.token` - Token uniqueness
- `FamilyMember(familyId, memberId)` - Prevent duplicate family memberships
- `Relationship(fromMemberId, toMemberId, familyId)` - Prevent duplicate relationships

### Required Fields
- `User`: email OR phone (at least one)
- `Member`: firstName, lastName
- `Family`: name
- `FamilyMember`: familyId, memberId, relationshipType
- `Relationship`: fromMemberId, toMemberId, type, familyId
- `Announcement`: title, type, familyId
- `RefreshToken`: token, expiresAt, userId
- `FileStorage`: fileName, fileUrl

### Optional Fields
- Member: dateOfBirth, profession, maritalStatus, photoUrl
- Family: description
- FileStorage: memberId

---

## Query Examples

### Get All Members in a Family
```sql
SELECT m.* FROM "Member" m
JOIN "FamilyMember" fm ON m.id = fm.memberId
WHERE fm.familyId = 'fam1';
```

### Get Family Tree (Relationships) for a Family
```sql
SELECT 
    m1.firstName AS from_member,
    m2.firstName AS to_member,
    r.type AS relationship
FROM "Relationship" r
JOIN "Member" m1 ON r.fromMemberId = m1.id
JOIN "Member" m2 ON r.toMemberId = m2.id
WHERE r.familyId = 'fam1';
```

### Get Recent Announcements
```sql
SELECT a.* FROM "Announcement" a
WHERE a.familyId = 'fam1'
ORDER BY a.createdAt DESC
LIMIT 10;
```

### Get User with Member Profile
```sql
SELECT u.*, m.* FROM "User" u
JOIN "Member" m ON u.memberId = m.id
WHERE u.email = 'rajesh@halani.com';
```

---

## Performance Indexes

**All indexes created on:**
- Foreign keys (faster joins)
- Search fields (email, phone, name)
- Date fields (sorting announcements)
- Composite keys (family + member lookups)

**Estimated Query Performance:**
- Get family by ID: O(1) - Primary key
- Get members in family: O(log n) - Indexed join
- Get announcements: O(log n) - Indexed by family + date
- Search members: O(log n) - Indexed by name

---

## Migration Status

✅ **Schema Designed**  
✅ **Seed Script Created**  
⏳ **Ready for PostgreSQL Migration**

**Next Step:** Run `npx prisma migrate dev --name init`

---

**Schema Created:** January 3, 2026  
**Database System:** PostgreSQL 14+  
**ORM:** Prisma 5.8.0  
**Status:** Ready for Development 🚀
