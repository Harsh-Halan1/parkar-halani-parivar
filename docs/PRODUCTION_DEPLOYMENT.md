# Production Deployment Guide - Vercel + Railway + Supabase

Complete guide for deploying **Parkar Halani Parivar** to production using:
- **Frontend:** Vercel (Next.js hosting)
- **Backend:** Railway (NestJS API)
- **Database:** Supabase (PostgreSQL - managed, RLS, backups)
- **Storage:** Supabase (File storage for avatars & images)

**Why this stack?**
- Supabase provides superior database management, RLS, and integrated storage
- Railway focuses on backend API with excellent GitHub integration
- Best developer experience and observability

**Estimated Time:** 30-45 minutes  
**Cost:** Free tier available for all services

> **Note:** Mobile app deployment will be handled after web deployment is live.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Supabase Setup](#step-1-supabase-setup)
3. [Step 2: Railway Backend Deployment](#step-2-railway-backend-deployment)
4. [Step 3: Vercel Frontend Deployment](#step-3-vercel-frontend-deployment)
5. [Step 4: Environment Configuration](#step-4-environment-configuration)
6. [Step 5: Verification & Testing](#step-5-verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before starting, ensure you have:

- ✅ GitHub account with repository pushed
- ✅ Supabase account ([Create free](https://supabase.com))
- ✅ Railway account ([Create free](https://railway.app))
- ✅ Vercel account ([Create free](https://vercel.com))
- ✅ Project cloned locally (for testing)
- ✅ Domain name (optional - can use free *.vercel.app)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Project Name:** `parkar-halani`
   - **Password:** Strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for MVP

4. Wait 2-3 minutes for project creation

### 1.2 Get Database Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Copy the connection string (URI format)
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Important:** Replace `[PASSWORD]` with your actual password

### 1.3 Run Database Migrations

1. **Clone repository locally (if not already done)**
   ```bash
   git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
   cd Parakar-Halani-Parivar/backend
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with Supabase connection**
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   NODE_ENV="production"
   ```

4. **Run migrations**
   ```bash
   pnpm install
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```

   ✅ Database is now set up!

### 1.4 Enable Row Level Security (RLS)

For production security:

1. Go to **Supabase → SQL Editor**
2. Run this query:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Family" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Person" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Relationship" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
   ```

### 1.5 Setup Supabase Storage for Images

1. Go to **Supabase → Storage**
2. Create new bucket: `family-avatars`
   - Make it **Private**
3. Create new bucket: `event-images`
   - Make it **Private**

---

## Step 2: Railway Backend Deployment

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select repository: `Parakar-Halani-Parivar`

### 2.2 Add Database to Railway (Optional)

Railway can provision PostgreSQL, but we're using Supabase, so skip this.

### 2.3 Configure Backend Environment Variables

1. In Railway dashboard, go to your project
2. Click on the "backend" service
3. Go to **Variables** tab
4. Add these environment variables:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[SUPABASE_HOST]:5432/postgres
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# JWT Secrets (Generate random 32+ character strings)
JWT_SECRET=your-production-jwt-secret-here
JWT_REFRESH_SECRET=your-production-refresh-secret-here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS - Update with your frontend URL
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Email Configuration (Choose one)
# Option 1: Gmail (recommended for free tier)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@your-domain.com

# OR Option 2: SendGrid (sign up free at sendgrid.com)
# SENDGRID_API_KEY=your-sendgrid-api-key

# OAuth (Optional - Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain/api/v1/auth/google/callback

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app

# OTP Settings
OTP_EXPIRY_MINUTES=10

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Supabase Storage URLs (if using for file uploads)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2.4 Generate JWT Secrets

Run this in PowerShell to generate secure random strings:

```powershell
# Generate random string for JWT_SECRET
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$secret"

# Generate random string for JWT_REFRESH_SECRET
$refresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_REFRESH_SECRET=$refresh"
```

### 2.5 Deploy Backend

1. In Railway, go to **Deployments** tab
2. Click latest deployment
3. Monitor logs - wait for "Server running on port 3001"
4. Copy the Railway domain (e.g., `parkar-halani-api.up.railway.app`)

✅ **Backend URL:** `https://your-railway-domain.up.railway.app`

---

## Step 3: Vercel Frontend Deployment

### 3.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Connect GitHub and select your repository
5. Select "frontend" as root directory
6. Click "Deploy"

### 3.2 Configure Frontend Environment Variables

Before deployment, add environment variables:

1. Go to **Settings → Environment Variables**
2. Add these variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-domain.up.railway.app/api/v1
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_DEFAULT_LOCALE=gu
```

3. Click **Save**
4. Go to **Deployments** and click latest deployment
5. Click "Redeploy" to rebuild with new environment variables

### 3.3 Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain (e.g., `parkarhalani.com`)
3. Follow DNS configuration steps
4. Wait for SSL certificate (5-10 minutes)

---

## Step 4: Environment Configuration

### 4.1 Configure Gmail for OTP Emails

1. **Enable 2-Factor Authentication on Gmail**
   - Go to myaccount.google.com
   - Security → 2-Step Verification
   - Follow setup

2. **Create App Password**
   - Go to myaccount.google.com
   - Security → App passwords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Use this in `SMTP_PASS`

3. **Update Railway environment variable**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### 4.2 Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Type: Web Application
   - Authorized redirect URIs:
     - `https://your-railway-backend.up.railway.app/api/v1/auth/google/callback`
     - `http://localhost:3001/api/v1/auth/google/callback` (for local testing)
5. Copy Client ID and Secret
6. Update environment variables in Railway and Vercel

### 4.3 Configure Supabase Storage Keys

1. Go to **Supabase → Settings → API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

3. Add to Railway backend environment variables

---

## Step 5: Verification & Testing

### 5.1 Test Backend API

```bash
# Test API health
curl https://your-railway-backend.up.railway.app/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-08T...","version":"1.0.0"}
```

### 5.2 Test Frontend

1. Open `https://your-vercel-domain.vercel.app`
2. You should see the login page
3. Try registering a new account
4. Check backend logs for OTP email sending

### 5.3 Test Database Connection

```bash
# From backend logs in Railway, you should see:
# "Database connected successfully"
# "Prisma Client initialized"
```

### 5.4 Run E2E Tests Against Production

```bash
cd frontend

# Update playwright.config.ts baseURL
# NEXT_PUBLIC_API_URL=https://your-railway-backend...

pnpm run e2e
```

---

## Troubleshooting

### Issue: "Failed to connect to database"

**Solution:**
1. Verify DATABASE_URL in Railway environment variables
2. Check Supabase is running (dashboard → Health)
3. Test connection locally:
   ```bash
   psql postgresql://postgres:password@host:5432/postgres
   ```

### Issue: "CORS error - blocked by policy"

**Solution:**
1. Update `CORS_ORIGIN` in Railway to match your frontend URL
2. Restart Railway deployment
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Email not sending"

**Solution:**
1. Verify SMTP credentials are correct
2. Check "Less secure app access" is enabled (if using Gmail)
3. Check Railway logs for SMTP errors
4. Test with local backend first

### Issue: "Frontend shows blank page"

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check Vercel deployment logs
4. Clear browser cache and hard refresh (Ctrl+F5)

### Issue: "Images not loading"

**Solution:**
1. Verify Supabase storage buckets are created
2. Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
3. Verify RLS policies are set correctly
4. Test Supabase storage access directly

---

## Monitoring & Maintenance

### Daily Checks

1. **Railway Dashboard**
   - Check deployment status
   - Monitor CPU/Memory usage
   - Review error logs

2. **Vercel Dashboard**
   - Check build status
   - Monitor page load times
   - Check error logs

3. **Supabase Dashboard**
   - Check database connections
   - Monitor storage usage
   - Review RLS policies

### Weekly Maintenance

```bash
# Update dependencies
cd backend
pnpm update
pnpm audit fix

cd ../frontend
pnpm update
pnpm audit fix

# Run E2E tests
cd frontend
pnpm run e2e
```

### Monthly Tasks

1. Review and rotate JWT secrets
2. Update packages to latest versions
3. Monitor and optimize database queries
4. Review user feedback and error logs
5. Backup database (Supabase → Backups)

---

## Deployment Checklist

Before going live, verify:

- ✅ Supabase database is set up and migrated
- ✅ Supabase storage buckets are created
- ✅ Railway backend is deployed and running
- ✅ Environment variables are configured
- ✅ Vercel frontend is deployed
- ✅ Frontend can reach backend API
- ✅ Email sending is working
- ✅ OAuth is configured (if using)
- ✅ SSL/HTTPS is enabled
- ✅ E2E tests pass against production
- ✅ Database backups are enabled
- ✅ Monitoring is set up

---

## Production URLs

Once deployed, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-domain.vercel.app` |
| **Backend API** | `https://your-railway-domain.up.railway.app` |
| **Database** | `your-project.supabase.co` |
| **Storage** | `your-project.supabase.co/storage/` |

---

## Cost Summary

| Service | Free Tier | Paid (if needed) |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth/month | $20/month |
| **Railway** | $5 credit/month | Pay as you go |
| **Supabase** | 500MB storage, 1GB egress | $25/month |

**Total Free:** $5-10/month for MVP  
**Estimated Paid:** $50-100/month at scale

---

## Next Steps

1. ✅ Set up Supabase (10 mins)
2. ✅ Deploy backend to Railway (10 mins)
3. ✅ Deploy frontend to Vercel (10 mins)
4. ✅ Test all services (10 mins)
5. ✅ Configure custom domain (optional, 5 mins)

**Total Time:** 45 minutes to live production!

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **Issues:** Check GitHub issues
- **Questions:** Email or create discussion

---

**🎉 You're ready for production deployment!**
