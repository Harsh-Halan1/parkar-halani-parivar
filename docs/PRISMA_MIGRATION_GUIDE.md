# Prisma Migration Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create PostgreSQL Database
```bash
psql -U postgres -c "CREATE DATABASE parakar_halani_parivar;"
```

### 3. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env - update DATABASE_URL
# Windows: notepad .env
# macOS/Linux: nano .env

# Example:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parakar_halani_parivar"
```

### 4. Run Migration
```bash
npx prisma migrate dev --name init
```

This will:
- Create migration files
- Apply schema to database
- Generate Prisma Client

### 5. Seed Test Data (Optional)
```bash
npm run db:seed
```

✅ **Done!** Your database is ready.

---

## Migration Workflow

### Scenario 1: First-Time Setup

```bash
# 1. Ensure .env has correct DATABASE_URL
# 2. Run initial migration
npx prisma migrate dev --name init

# 3. (Optional) Add sample data
npm run db:seed

# 4. Verify in Prisma Studio
npx prisma studio
```

### Scenario 2: Modify Schema

After editing `schema.prisma`:

```bash
# 1. Create migration
npx prisma migrate dev --name <descriptive_name>

# Example: Add new field to members
npx prisma migrate dev --name add_phone_to_members

# 2. The tool will:
#    - Create migration file in prisma/migrations/
#    - Apply SQL changes
#    - Regenerate Prisma Client

# 3. Verify changes
npx prisma studio
```

### Scenario 3: Push Schema Without Creating Migration

For development environments (sync schema instantly):

```bash
npx prisma db push
```

⚠️ **Warning:** Only use in development. `db push` doesn't create migration history needed for production.

### Scenario 4: Reset Database (Development Only)

⚠️ **DANGER:** This deletes all data!

```bash
npx prisma migrate reset
```

This will:
- Drop all tables
- Recreate schema
- Re-run all migrations
- Re-seed database (if seed script exists)

---

## Common Tasks

### View Database State
```bash
npx prisma studio
```

Opens GUI at http://localhost:5555

### Check Migration Status
```bash
npx prisma migrate status
```

Output:
```
Following migrations have not yet been applied:
  20260103121234_add_phone_to_members

Currently applied migrations:
  20260103120000_init
```

### Manually Run Seed Script
```bash
npm run db:seed
```

### Generate Prisma Client Only
```bash
npx prisma generate
```

Use when:
- Updating package.json
- After pulling latest code
- Before building for production

### Format Schema File
```bash
npx prisma format
```

---

## Troubleshooting

### ❌ "Cannot connect to database"

**Check PostgreSQL is running:**
```bash
# Windows (Check Services)
Get-Service PostgreSQL*

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

**Check connection string:**
```env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parakar_halani_parivar"
```

### ❌ "Error: P1002 - The inferred schema of this prisma schema is invalid"

**Check schema.prisma syntax:**
```bash
npx prisma format
npx prisma validate
```

### ❌ "Migration conflicts detected"

When pulling team changes with new migrations:

```bash
# 1. Pull latest migrations
git pull

# 2. Apply migrations
npx prisma migrate dev

# 3. If conflicts, reset and reapply
npx prisma migrate reset
```

### ❌ "Database already exists but schema differs"

Your database has tables not matching schema.prisma.

**Option A: Use existing database (recommended)**
```bash
npx prisma db pull
```

This updates schema.prisma to match database.

**Option B: Reset database (development only)**
```bash
npx prisma migrate reset
```

### ❌ "Seed script fails with bcrypt error"

Install bcrypt types:
```bash
npm install --save-dev @types/bcrypt
```

### ❌ Port 5432 Already in Use

PostgreSQL default port is 5432. If in use:

```env
# Change to different port in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/parakar_halani_parivar"

# And start PostgreSQL on that port
```

---

## Production Deployment

### Before Deploying

1. **Test locally first**
   ```bash
   npx prisma migrate deploy
   ```

2. **Create backup**
   ```bash
   pg_dump parakar_halani_parivar > backup.sql
   ```

3. **Review migration SQL**
   ```bash
   cat prisma/migrations/20260103_*/migration.sql
   ```

### Deploy to Production

```bash
# 1. Set production DATABASE_URL in environment
export DATABASE_URL="postgresql://user:pass@prod-host:5432/parakar_halani_parivar"

# 2. Run migrations (applies all pending)
npx prisma migrate deploy

# 3. Verify
npx prisma db execute --stdin < verify.sql
```

### Rollback (if needed)

Prisma doesn't have built-in rollback. To revert:

```bash
# 1. Create manual rollback migration
npx prisma migrate dev --name rollback_feature_x

# 2. Edit migration to reverse changes
# 3. Apply it
npx prisma migrate deploy
```

---

## Migration Files Structure

Migrations stored in `prisma/migrations/`:

```
prisma/migrations/
├── migration_lock.toml          # Database system lock
├── 20260103120000_init/
│   └── migration.sql            # Initial schema
├── 20260103120500_add_users/
│   └── migration.sql            # User table addition
└── 20260103121000_add_relationships/
    └── migration.sql            # Relationship table
```

Each migration folder contains:
- **migration.sql** - SQL commands to apply
- **Timestamp** - Applied in order by date

### Example Migration SQL

```sql
-- CreateTable "User"
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT UNIQUE,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
```

---

## Schema Changes Reference

### Add New Table

1. **Edit schema.prisma:**
   ```prisma
   model Event {
     id      String @id @default(cuid())
     title   String
     date    DateTime
     familyId String
     family  Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_events_table
   ```

3. **Regenerate client (automatic):**
   ```bash
   npx prisma generate
   ```

### Add Field to Existing Table

1. **Edit schema.prisma:**
   ```prisma
   model Member {
     // ... existing fields
     phoneNumber String? // New field
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_phone_to_members
   ```

### Remove Field

1. **Edit schema.prisma:**
   ```prisma
   model Member {
     // Remove the field
     // phoneNumber String? // DELETED
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name remove_phone_from_members
   ```

### Change Field Type

1. **Edit schema.prisma:**
   ```prisma
   model Member {
     dateOfBirth DateTime? // Changed from String
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name change_dob_to_datetime
   ```

---

## Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `npx prisma migrate dev --name <name>` | Create and apply migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma migrate status` | Show migration status |
| `npx prisma migrate reset` | Reset database (⚠️ deletes data) |
| `npx prisma db push` | Sync schema (development only) |
| `npx prisma db pull` | Update schema from database |
| `npx prisma studio` | Open GUI (http://localhost:5555) |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma format` | Format schema.prisma |
| `npx prisma validate` | Validate schema syntax |
| `npm run db:seed` | Run seed script |

---

## Resources

- **[Prisma Documentation](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)**
- **[Migration Reference](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)**
- **[PostgreSQL Docs](https://www.postgresql.org/docs)**
- **[NestJS + Prisma](https://docs.nestjs.com/recipes/prisma)**

---

**Last Updated:** January 3, 2026  
**Status:** Ready for Development
