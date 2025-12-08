# Local Deployment Guide

This guide will walk you through setting up the Parkar Halani Parivar application on your local machine for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 15 or higher ([Download](https://www.postgresql.org/download/))
- **pnpm**: Package manager ([Install](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **Git**: Version control ([Download](https://git-scm.com/downloads))

## Step 1: Clone the Repository

```bash
git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
cd Parakar-Halani-Parivar
```

## Step 2: Database Setup

### Option A: Local PostgreSQL

1. **Create a new database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE parkar_halani_db;

# Create user (optional)
CREATE USER parkar_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE parkar_halani_db TO parkar_user;

# Exit psql
\q
```

2. **Note your connection string**
```
postgresql://postgres:your_password@localhost:5432/parkar_halani_db
```

### Option B: Cloud PostgreSQL (Recommended)

**Using Supabase:**
1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database

**Using Railway:**
1. Create account at https://railway.app
2. Create new PostgreSQL database
3. Copy connection string from database settings

## Step 3: Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
# Copy example file
cp .env.example .env

# Edit .env file (use your preferred editor)
notepad .env  # Windows
nano .env     # Linux/Mac
```

4. **Update .env file with your configuration:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/parkar_halani_db"

# JWT Secrets (Generate random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-change-this"

# JWT Expiry
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Google OAuth (Optional - Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Email Configuration (Choose one)
# Option 1: Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
EMAIL_FROM="your-email@gmail.com"

# Option 2: SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"

# Application
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# OTP
OTP_EXPIRY_MINUTES=10

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=10
```

5. **Generate Prisma Client**
```bash
pnpm prisma generate
```

6. **Run database migrations**
```bash
pnpm prisma migrate dev
```

7. **Seed database (optional)**
```bash
pnpm prisma db seed
```

8. **Start backend server**
```bash
pnpm run start:dev
```

✅ **Backend is running at:** http://localhost:3001
✅ **API Documentation:** http://localhost:3001/api

## Step 4: Frontend Setup

1. **Open new terminal and navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local file
notepad .env.local  # Windows
nano .env.local     # Linux/Mac
```

4. **Update .env.local file:**
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (must match backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE="gu"
```

5. **Start frontend development server**
```bash
pnpm run dev
```

✅ **Frontend is running at:** http://localhost:3000

## Step 5: Test the Application

1. **Open browser and navigate to:** http://localhost:3000

2. **Register a new account:**
   - Click "Register" or "Sign Up"
   - Fill in your details
   - Verify email (check console for OTP if email not configured)

3. **Login:**
   - Use your credentials
   - Explore the dashboard

4. **Create a family:**
   - Navigate to Families
   - Click "Create Family"
   - Add multilingual names

5. **Add family members:**
   - Click on your family
   - Add persons with details

6. **View family tree:**
   - Navigate to Family Tree
   - See interactive visualization

## Step 6: Run E2E Tests (Optional)

```bash
cd frontend

# Install Playwright browsers
pnpm exec playwright install

# Run tests
pnpm run e2e

# Run with UI
pnpm run e2e:ui

# View report
pnpm run e2e:report
```

## Common Issues & Solutions

### Issue: Database connection failed

**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env
- Ensure database exists
- Check firewall/network settings

### Issue: Prisma migration error

**Solution:**
```bash
# Reset database (CAUTION: Deletes all data)
pnpm prisma migrate reset

# Or create new migration
pnpm prisma migrate dev --name init
```

### Issue: Port already in use

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Issue: Email OTP not working

**Solution:**
- For Gmail: Enable 2FA and create App Password
- For testing: Check backend console logs for OTP code
- For production: Use SendGrid or similar service

### Issue: Google OAuth not working

**Solution:**
1. Enable Google OAuth API in Google Cloud Console
2. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
3. Add authorized JavaScript origins: `http://localhost:3000`
4. Copy Client ID and Secret to .env files

## Development Commands

### Backend Commands
```bash
cd backend

# Development
pnpm run start:dev      # Start with hot reload

# Build
pnpm run build          # Build for production
pnpm run start:prod     # Start production build

# Database
pnpm prisma studio      # Open Prisma Studio (database GUI)
pnpm prisma migrate dev # Create and apply migration
pnpm prisma db seed     # Seed database

# Testing
pnpm test               # Run unit tests
pnpm test:e2e          # Run E2E tests
pnpm test:cov          # Test coverage

# Linting
pnpm run lint          # Check code style
```

### Frontend Commands
```bash
cd frontend

# Development
pnpm run dev           # Start development server

# Build
pnpm run build         # Build for production
pnpm run start         # Start production build

# Testing
pnpm run e2e           # Run Playwright tests
pnpm run e2e:ui        # Run tests with UI
pnpm run e2e:report    # View test report

# Linting
pnpm run lint          # Check code style
```

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

## Next Steps

- 📖 Read [BACKEND_SETUP.md](BACKEND_SETUP.md) for backend architecture
- 🎨 Read [FRONTEND_SETUP.md](FRONTEND_SETUP.md) for frontend architecture
- 🧪 Read [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing guidelines
- 🚀 Read [ONLINE_DEPLOYMENT_GUIDE.md](ONLINE_DEPLOYMENT_GUIDE.md) for production deployment

## Support

If you encounter issues:
1. Check [KNOWN_ISSUES.md](KNOWN_ISSUES.md)
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

Happy coding! 🎉
