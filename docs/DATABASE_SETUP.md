# Database Setup Guide - Parakar Halani Parivar

## Overview

This guide walks through setting up PostgreSQL and Prisma ORM for local development.

**Stack:**
- **Database:** PostgreSQL 14+
- **ORM:** Prisma v5.8.0
- **Driver:** pg (Node.js PostgreSQL driver)

---

## Prerequisites

### 1. PostgreSQL Installation

**Windows (Using chocolatey):**
```powershell
choco install postgresql
```

Or download from: https://www.postgresql.org/download/windows/

**macOS (Using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Verify PostgreSQL Installation

```bash
psql --version
```

---

## Local Development Setup

### Step 1: Create Local Database

```bash
# Connect to PostgreSQL (default user: postgres)
psql -U postgres

# In psql console, create database:
CREATE DATABASE parakar_halani_parivar;

# Create a dedicated user (optional but recommended):
CREATE USER parakar_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE parakar_halani_parivar TO parakar_user;

# Exit psql
\q
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cd backend

# Copy template
cp .env.example .env

# Edit .env with your database credentials
# Windows PowerShell:
notepad .env

# Or macOS/Linux:
nano .env
```

**Example .env configuration:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parakar_halani_parivar"
PORT=3001
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Create Initial Migration

```bash
# Generate Prisma client and create migration
npx prisma migrate dev --name init
```

This will:
1. Create migration files
2. Apply migrations to PostgreSQL
3. Generate Prisma Client

### Step 5: Seed Initial Data (Optional)

```bash
npx prisma db seed
```

---

## Prisma Studio (GUI Database Browser)

Useful for visualizing and debugging data:

```bash
npx prisma studio
```

Opens at http://localhost:5555

---

## Common Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create New Migration
```bash
# After modifying schema.prisma
npx prisma migrate dev --name <migration_name>
```

Example:
```bash
npx prisma migrate dev --name add_announcements_table
```

### Reset Database (⚠️ CAUTION - Deletes all data)
```bash
npx prisma migrate reset
```

### View Database Status
```bash
npx prisma migrate status
```

### Format Schema
```bash
npx prisma format
```

---

## Troubleshooting

### Error: "cannot connect to database"

**Check PostgreSQL is running:**
```bash
# Windows (Check services)
services.msc

# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

**Verify connection string in .env:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
```

### Error: "Migration failed"

1. Check database exists
2. Verify user has permissions
3. Check schema.prisma for syntax errors

### Port 5432 Already in Use

PostgreSQL default port is 5432. If already in use:

```bash
# Change connection string to different port
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/parakar_halani_parivar"
```

---

## Schema Overview

### Core Tables

**users** - Authentication accounts
- id (CUID)
- email (unique, nullable)
- phone (unique, nullable)
- passwordHash
- firstName, lastName
- createdAt, updatedAt, lastLogin

**members** - Family members (individuals)
- id (CUID)
- firstName, lastName
- dateOfBirth (nullable)
- profession (nullable)
- maritalStatus (nullable)
- photoUrl (nullable)
- createdAt, updatedAt

**families** - Family groups
- id (CUID)
- name
- city
- description (nullable)
- createdAt, updatedAt

**family_members** - Join table (member ↔ family association)
- id (CUID)
- familyId, memberId
- relationshipType (e.g., "Head", "Spouse", "Child")
- joinedAt

**relationships** - Genealogical connections
- id (CUID)
- fromMemberId, toMemberId
- type (e.g., "Parent", "Child", "Spouse")
- familyId
- createdAt, updatedAt

**announcements** - Family announcements
- id (CUID)
- title, content
- type (e.g., "Birth", "Death", "Wedding", "Birthday")
- familyId
- createdAt, updatedAt

**refresh_tokens** - Session management
- id (CUID)
- token (unique)
- expiresAt
- userId (foreign key)

**file_storage** - File metadata (for Supabase)
- id (CUID)
- fileName, fileUrl
- bucketPath
- fileSize, mimeType
- memberId (optional, for linking)

---

## Relationship Integrity

### Key Constraints

1. **User → Member (One-to-One)**
   - Each user links to exactly one member
   - A member may have no user account

2. **Member ↔ Family (Many-to-Many via FamilyMember)**
   - A member can belong to multiple families
   - Each family_member record defines relationship context

3. **Relationships (Genealogical)**
   - Directed graph (fromMember → toMember)
   - Family-scoped (same relationship may differ across families)
   - Prevents duplicate relationships with unique constraint

4. **Announcements**
   - Belong to a family
   - Deleted when family is deleted (cascade)

---

## Development Workflow

1. **Modify schema.prisma** - Update data models
2. **Create migration** - `npx prisma migrate dev --name description`
3. **Update services** - Use `prisma` client to query database
4. **Test with Postman** - Validate API endpoints
5. **Check data** - Open Prisma Studio: `npx prisma studio`
6. **Commit changes** - Include migration files in git

---

## Production Considerations

- Use environment variables for connection strings
- Enable SSL/TLS for database connections
- Setup automated backups
- Use connection pooling (PgBouncer)
- Keep migration history
- Monitor query performance

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [NestJS + Prisma](https://docs.nestjs.com/recipes/prisma)

---

**Last Updated:** January 3, 2026  
**Maintainer:** Development Team
