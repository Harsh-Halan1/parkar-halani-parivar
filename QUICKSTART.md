# Quick Start Guide

Get the Parkar Halani Parivar system running in 15 minutes.

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 20+ installed ([Download](https://nodejs.org/))
- ✅ PostgreSQL 15+ installed ([Download](https://www.postgresql.org/download/))
- ✅ pnpm installed: `npm install -g pnpm`
- ✅ Git installed

## Step 1: Clone Repository

```powershell
git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
cd Parakar-Halani-Parivar
```

## Step 2: Database Setup

### Create Database

```powershell
# Using psql
psql -U postgres

# In psql prompt:
CREATE DATABASE parkar_halani_db;
\q
```

## Step 3: Backend Setup

```powershell
cd backend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env and update DATABASE_URL:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/parkar_halani_db"
```

**Edit `.env`** with your database credentials and generate secrets:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/parkar_halani_db"
JWT_SECRET="your-random-32-character-secret"
JWT_REFRESH_SECRET="another-random-32-character-secret"
```

Generate random secrets (PowerShell):

```powershell
# Generate random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Initialize Database

```powershell
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# (Optional) View database
pnpm prisma:studio
```

### Start Backend

```powershell
pnpm run start:dev
```

✅ Backend running at: http://localhost:3001/api/v1

## Step 4: Frontend Setup

**Open new terminal:**

```powershell
cd frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Start Frontend

```powershell
pnpm dev
```

✅ Frontend running at: http://localhost:3000

## Step 5: Test the System

1. **Open browser:** http://localhost:3000/gu (Gujarati)

2. **Register an account:**
   - Click "નોંધણી કરો" (Register)
   - Enter email/phone and password
   - Verify OTP (check console logs for OTP code)

3. **Login and explore!**

## Language Options

- **Gujarati:** http://localhost:3000/gu
- **English:** http://localhost:3000/en
- **Hindi:** http://localhost:3000/hi

## Common Issues

### Database connection failed

**Error:** `Can't reach database server`

**Fix:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists:
   ```powershell
   psql -U postgres -l
   ```

### Port already in use

**Error:** `Port 3001 is already in use`

**Fix:**
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Frontend can't connect to backend

**Error:** `Network Error`

**Fix:**
1. Ensure backend is running on port 3001
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Check CORS settings in `backend/src/main.ts`

### Prisma errors

**Error:** `Schema parsing errors`

**Fix:**
```powershell
cd backend
pnpm prisma:generate
pnpm prisma migrate deploy
```

## Next Steps

### Create Admin Account

By default, all users are `FAMILY_MEMBER`. To create an admin:

```powershell
# Connect to database
psql -U postgres -d parkar_halani_db

# Update user role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Create First Family

1. Login as admin
2. Navigate to Families section
3. Click "Add Family"
4. Fill in family name in all languages

### Add Family Members

1. Go to Persons section
2. Click "Add Person"
3. Fill in details
4. Link to family

## Development Workflow

### Backend Changes

```powershell
cd backend

# After schema changes
pnpm prisma:generate
pnpm prisma migrate dev --name your_migration_name

# After code changes
# (auto-reloads with --watch)
```

### Frontend Changes

```powershell
cd frontend

# Changes auto-reload
# Add new shadcn component:
npx shadcn-ui@latest add <component>
```

## Documentation

- **Backend API:** See `docs/BACKEND_SETUP.md`
- **Frontend:** See `docs/FRONTEND_SETUP.md`
- **Mobile:** See `docs/MOBILE_SETUP.md`
- **Deployment:** See `docs/DEPLOYMENT.md`

## Support

- Check `docs/` folder for detailed guides
- Review code comments
- Open GitHub issue for bugs

## Useful Commands

### Backend

```powershell
pnpm run start:dev    # Start development server
pnpm run build        # Build for production
pnpm run start:prod   # Start production server
pnpm test             # Run tests
pnpm prisma:studio    # Open database GUI
```

### Frontend

```powershell
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

## Default Credentials

There are no default credentials. You must register a new account.

**First user should be promoted to admin** using the SQL command above.

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Database connected successfully
- [ ] Can register new user
- [ ] Can login
- [ ] Can switch languages (gu/en/hi)
- [ ] Can toggle dark/light mode
- [ ] Can create family (as admin)
- [ ] Can add person

## What's Next?

1. Explore the UI in all three languages
2. Test creating families and persons
3. Add relationships
4. Create events and announcements
5. Review `docs/ROADMAP.md` for upcoming features

## Production Deployment

When ready to deploy:

1. Read `docs/DEPLOYMENT.md`
2. Set up Supabase for database
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Configure environment variables
6. Set up monitoring

---

**Congratulations! 🎉** You now have a fully functional family management system running locally.

For questions or issues, check the detailed documentation in the `docs/` folder.
