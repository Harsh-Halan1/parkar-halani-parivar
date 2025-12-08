# Online Deployment Guide - Parkar Halani Parivar

Complete guide for deploying the application to production for public use.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Backend Deployment](#backend-deployment)
4. [Database Deployment](#database-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain & DNS Setup](#domain--dns-setup)
7. [SSL/HTTPS Configuration](#sslhttps-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Post-Deployment](#post-deployment)

---

## Deployment Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users (Public)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        CDN / WAF                                │
│                  (Cloudflare / AWS CloudFront)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              Frontend (Next.js)                                │
│  Vercel / Netlify / AWS Amplify                               │
│  - Static files, API routes                                  │
│  - Auto scaling, CDN                                         │
│  - SSL certificates                                          │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              Backend (NestJS)                                  │
│  Railway / Render / AWS EC2 / DigitalOcean                   │
│  - REST API endpoints                                        │
│  - Authentication, authorization                            │
│  - Business logic                                           │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│           Database (PostgreSQL)                               │
│  Supabase / Railway / AWS RDS                               │
│  - Data storage                                            │
│  - Automated backups                                      │
│  - Encryption                                            │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              Storage (Optional)                               │
│  Supabase Storage / AWS S3                                  │
│  - File uploads                                           │
│  - Media storage                                         │
└────────────────────────────────────────────────────────────────┘
```

### Deployment Strategies

#### Option 1: Vercel + Railway (Recommended for Startups)
**Best for:** Quick setup, low cost, scalability
- **Frontend:** Vercel (free tier available)
- **Backend:** Railway (free tier $5/month)
- **Database:** Supabase (free tier available)
- **Estimated Cost:** $0-30/month

#### Option 2: AWS (Enterprise)
**Best for:** Large scale, compliance requirements
- **Frontend:** AWS Amplify / CloudFront
- **Backend:** EC2 / ECS / Lambda
- **Database:** RDS PostgreSQL
- **Estimated Cost:** $50-500+/month

#### Option 3: DigitalOcean (Balanced)
**Best for:** Developers, mid-scale applications
- **Frontend:** DigitalOcean App Platform
- **Backend:** DigitalOcean App Platform
- **Database:** DigitalOcean Managed Database
- **Estimated Cost:** $10-100/month

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Linting clean (`npm run lint`)
- [ ] Code formatted properly
- [ ] Git history clean (no sensitive data)
- [ ] Environment variables documented

### Security

- [ ] All dependencies updated to latest secure versions
- [ ] No hardcoded secrets in code
- [ ] Environment variables for all credentials
- [ ] HTTPS/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] XSS protection enabled

### Performance

- [ ] Frontend Lighthouse score > 80
- [ ] Backend API response time < 200ms
- [ ] Database queries optimized
- [ ] Images optimized and lazy loaded
- [ ] Code splitting implemented
- [ ] Caching strategy defined

### Documentation

- [ ] README.md complete
- [ ] API documentation updated
- [ ] Deployment guide prepared
- [ ] Admin guide available
- [ ] Testing guide available
- [ ] Troubleshooting guide ready

### Database

- [ ] All migrations created
- [ ] Seed data prepared
- [ ] Backup strategy planned
- [ ] Recovery plan documented
- [ ] Database performance tested

---

## Backend Deployment

### Option 1: Railway (Recommended)

#### Step 1: Prepare Repository

```powershell
# Ensure all code is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub account
3. Authorize Railway to access repositories

#### Step 3: Create New Project

1. Click "Create New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Parakar-Halani-Parivar repository
4. Railway auto-detects NestJS

#### Step 4: Configure Environment Variables

In Railway Dashboard:
1. Go to Project → Variables
2. Add all required variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/parkar_halani
NODE_ENV=production
JWT_SECRET=your-secure-secret-key-change-this
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_REFRESH_EXPIRY=30d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
ENVIRONMENT=production
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

#### Step 5: Configure Build Settings

Railway auto-detects, but verify:
1. **Root Directory:** `backend`
2. **Start Command:** `node dist/main`
3. **Build Command:** `npm install && npm run build`

#### Step 6: Deploy

```powershell
# Push to trigger deployment
git push origin main

# Monitor in Railway dashboard
# Railway → Deployments → View logs
```

#### Step 7: Get Backend URL

Railway assigns a public URL (e.g., `https://api-xxxx.railway.app`)

**Save this URL** - needed for frontend deployment

### Option 2: Render.com

#### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up and link GitHub

#### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select `Parakar-Halani-Parivar` repo

#### Step 3: Configure Service

```
Name: parkar-halani-backend
Environment: Node
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
Plan: Free (starter, then upgrade as needed)
```

#### Step 4: Set Environment Variables

In Render Dashboard:
1. Go to Service → Environment
2. Add all required variables (same as Railway)

#### Step 5: Deploy

Push to GitHub → Render auto-deploys

---

## Database Deployment

### Option 1: Supabase (Recommended for Postgres)

#### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Sign up with email/GitHub
3. Create new organization

#### Step 2: Create Database Project

1. Click "New Project"
2. **Project name:** `parkar-halani`
3. **Database password:** Generate strong password
4. **Region:** Closest to your users (e.g., Asia - Singapore)
5. Click "Create new project"

#### Step 3: Get Connection String

In Supabase Dashboard:
1. Go to Project Settings → Database
2. Copy connection string
3. Update backend `.env` with `DATABASE_URL`

#### Step 4: Run Migrations

```powershell
# Connect to production database
cd backend

# Set production database URL temporarily
$env:DATABASE_URL = "postgresql://user:pass@host/db"

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate
```

#### Step 5: Seed Database (Optional)

```powershell
# If you have seed data
pnpm seed
```

#### Step 6: Enable Backup

In Supabase Dashboard:
1. Go to Project Settings → Backups
2. Enable Point-in-time Recovery (PITR)
3. Enable daily backups

### Option 2: Railway Database

Railway can also host PostgreSQL:

1. In Railway Dashboard → Create Database
2. Select PostgreSQL 15
3. Database auto-created with connection string
4. Follow same migration steps as Supabase

### Option 3: AWS RDS

For enterprise deployments:

```powershell
# Create RDS instance via AWS Console
# Then run migrations:
pnpm prisma migrate deploy

# Monitor via AWS CloudWatch
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Install Vercel CLI: `npm install -g vercel`

#### Step 2: Import Project

```powershell
cd frontend

# Deploy to Vercel
vercel --prod
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. "Add New..." → "Project"
3. Select repository
4. Vercel auto-detects Next.js

#### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add for Production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Step 4: Configure Domains

1. Go to Settings → Domains
2. Add your custom domain (e.g., `parkarhalani.com`)
3. Point domain DNS to Vercel nameservers

#### Step 5: Deploy

```powershell
# Push to main triggers auto-deploy
git push origin main

# Monitor deployments in Vercel dashboard
```

### Option 2: Netlify

#### Step 1: Connect Repository

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select GitHub → Choose repository

#### Step 2: Configure Build

```
Base directory: frontend
Build command: pnpm build
Publish directory: out
```

#### Step 3: Set Environment Variables

1. Go to Site settings → Build & deploy → Environment
2. Add production environment variables

#### Step 4: Deploy

Git push triggers auto-deploy

### Option 3: AWS Amplify

```powershell
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Deploy
amplify publish
```

---

## Domain & DNS Setup

### Register Domain

**Recommended Registrars:**
- GoDaddy
- Namecheap
- Route 53 (AWS)
- Google Domains

**Example:** `parkarhalani.com`

### DNS Configuration

#### For Vercel + Railway Setup

**Step 1: Add DNS Records**

In your domain registrar's DNS settings, add:

```
Type        Name            Value
─────────────────────────────────────────────────────────────
CNAME       www             cname.vercel-dns.com
CNAME       api             api-xxxx.railway.app
A           @               76.76.19.124 (Vercel IP)
MX          @               mx.parkarhalani.com
TXT         @               v=spf1 include:sendgrid.net ~all
```

**Step 2: Verify DNS**

```powershell
nslookup parkarhalani.com
# Should resolve to Vercel IP

ping api.parkarhalani.com
# Should resolve to Railway IP
```

#### DNS Propagation

DNS changes take 2-48 hours to propagate globally.
Check propagation: https://dnschecker.org

### API Domain Configuration

Update frontend to use custom API domain:

```env
NEXT_PUBLIC_API_URL=https://api.parkarhalani.com
```

Redeploy frontend after environment variable change.

---

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)

Both Vercel and Railway provide automatic SSL certificates.

**Vercel:**
- Automatic SSL for all domains
- Certificate auto-renewal
- No additional configuration needed

**Railway:**
- Automatic SSL for generated domain
- Custom domain SSL included

### Manual SSL Setup (If Needed)

Using Let's Encrypt with Certbot:

```powershell
# Install Certbot
choco install certbot

# Generate certificate
certbot certonly --standalone -d parkarhalani.com -d api.parkarhalani.com

# Certificates stored in:
# C:\Certbot\live\parkarhalani.com\

# Configure in backend (if self-hosted)
# Use cert files in NestJS config
```

### Verify SSL

```powershell
# Check certificate
curl -I https://parkarhalani.com

# Should return: SSL certificate is valid
```

---

## Monitoring & Logging

### Backend Logging

#### Railway Logging

```powershell
# View logs in Railway dashboard
# Project → Deployments → View logs

# Or via CLI
railway logs -f
```

#### Sentry Error Tracking

1. Create Sentry account: https://sentry.io
2. Create project for NestJS
3. Add to backend `.env`:

```env
SENTRY_DSN=your-sentry-dsn
```

4. Configure in `main.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
```

### Frontend Monitoring

#### Vercel Analytics

Automatically enabled in Vercel dashboard:
1. Go to Project → Analytics
2. View Core Web Vitals
3. Performance metrics

#### Google Analytics

```typescript
// Add to app/layout.tsx
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
></script>
<script>
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  `}
</script>
```

### Uptime Monitoring

#### Uptime Robot (Free)

1. Go to https://uptimerobot.com
2. Create monitor for API endpoint
3. Get alerts if service is down

```
Monitor URL: https://api.parkarhalani.com/health
Interval: 5 minutes
Alert email: ops@parkarhalani.com
```

#### Health Check Endpoint

Backend should provide health check:

```typescript
// src/health.controller.ts
@Get('/health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  };
}
```

### Database Monitoring

#### Supabase Dashboard

Monitor database in Supabase:
- Query performance
- Connection count
- Storage usage
- Real-time activity

---

## Backup & Recovery

### Automated Backups

#### Supabase Backups

1. Go to Project Settings → Backups
2. Enable Point-in-Time Recovery (PITR)
3. Daily backups automatic
4. 30-day retention

To restore from backup:
```
Supabase Dashboard → Backups → Restore point-in-time
```

#### Railway Backups

Railway doesn't have built-in backups. Use Supabase for database instead.

### Manual Backups

```powershell
# Backup database
pg_dump -U postgres -h hostname parkar_halani > backup.sql

# Store in secure location (AWS S3, Google Drive, etc.)

# Restore from backup
psql -U postgres -h hostname parkar_halani < backup.sql
```

### Backup Strategy

```
Daily automated backups (Supabase)
  ↓
Weekly backup to AWS S3
  ↓
Monthly backup to encrypted external storage
  ↓
Test restoration quarterly
```

### Disaster Recovery

**If database is corrupted:**

1. **Stop writes:** Block all API traffic
2. **Assess damage:** Check when corruption started
3. **Restore backup:** Use closest clean backup
4. **Verify data:** Run integrity checks
5. **Resume:** Gradually restore service

**Recovery Time Objective (RTO):** < 1 hour
**Recovery Point Objective (RPO):** < 1 day

---

## Post-Deployment

### Smoke Tests

After deployment, verify basic functionality:

```powershell
# 1. Frontend loads
curl https://parkarhalani.com
# Expected: 200 OK

# 2. API responds
curl https://api.parkarhalani.com/health
# Expected: { status: "ok" }

# 3. User can login
# Test via browser

# 4. Database connection
# Check backend logs for DB connection success
```

### Monitor for Issues

**First 24 hours:**
- [ ] Check error logs every hour
- [ ] Monitor API response times
- [ ] Verify all features working
- [ ] Check user feedback

**First week:**
- [ ] Check daily for errors
- [ ] Monitor performance metrics
- [ ] Verify backups working
- [ ] Test critical user journeys

### Set Up Alerts

#### Email Alerts

Configure alerts for:
- API downtime (Uptime Robot)
- High error rate (Sentry)
- Database issues (Supabase alerts)
- Performance degradation

#### Slack Alerts (Optional)

```
Sentry → Integrations → Slack
Configure channel for error notifications
```

### Performance Tuning

If performance issues detected:

1. **Check API response times:**
   ```
   Vercel Analytics → Performance tab
   Railway → Metrics
   ```

2. **Optimize slow queries:**
   ```typescript
   // Add database indexes
   // Use Prisma select to minimize data transfer
   ```

3. **Enable caching:**
   ```typescript
   @Get('/families')
   @CacheKey('families')
   @CacheTTL(3600) // 1 hour cache
   async getFamilies() { }
   ```

4. **Increase resources** (if needed):
   - Railway: Upgrade plan
   - Vercel: Already scales automatically

---

## Troubleshooting

### Issue: Backend Not Connecting to Database

**Solution:**
```powershell
# 1. Verify DATABASE_URL is set
railway logs
# Should see "Connected to database"

# 2. Check database is running
# Supabase dashboard → Database → Status

# 3. Verify firewall/IP allowlist
# Supabase → Project settings → Database → Allowed IP
# Add: 0.0.0.0/0 (or restrict to Railway IPs)
```

### Issue: Frontend Can't Connect to API

**Solution:**
```powershell
# 1. Verify NEXT_PUBLIC_API_URL is set
# Vercel dashboard → Settings → Environment variables

# 2. Check CORS configuration
# Backend should allow frontend domain
# .env: CORS_ORIGIN=https://parkarhalani.com

# 3. Verify API is accessible
curl https://api.parkarhalani.com/health
```

### Issue: SSL Certificate Error

**Solution:**
```powershell
# Let Vercel/Railway handle automatically
# If manual setup:
certbot renew

# Verify certificate
openssl s_client -connect api.parkarhalani.com:443
```

### Issue: High API Latency

**Solution:**
- Check Railway resource usage
- Look for N+1 queries (Prisma)
- Enable query caching
- Upgrade database plan
- Use connection pooling (PgBouncer)

### Issue: Database Disk Full

**Solution:**
- Check Supabase storage usage
- Delete old logs/audit records
- Archive historical data
- Upgrade database plan

---

## Post-Launch Maintenance

### Weekly Tasks

- [ ] Review error logs (Sentry)
- [ ] Check performance metrics
- [ ] Monitor user feedback
- [ ] Verify backups completed

### Monthly Tasks

- [ ] Update dependencies
- [ ] Security audit (npm audit)
- [ ] Review database size
- [ ] Test disaster recovery
- [ ] Review cost/usage

### Quarterly Tasks

- [ ] Major version updates
- [ ] Full security audit
- [ ] Capacity planning
- [ ] Architecture review

---

## Production Checklist

Before going live to public:

- [ ] All tests passing
- [ ] Production database migrated
- [ ] Admin accounts created
- [ ] SSL certificates active
- [ ] Domain configured
- [ ] Monitoring/alerting enabled
- [ ] Backup/recovery tested
- [ ] Team trained
- [ ] Communication plan ready
- [ ] Launch announcement prepared

---

## Deployment Quick Reference

### Command Checklist

```powershell
# Backend deployment
cd backend
pnpm install
pnpm build
pnpm prisma migrate deploy
# Deploy to Railway/Render

# Frontend deployment
cd frontend
pnpm install
pnpm build
# Deploy to Vercel/Netlify

# Verify deployment
curl https://api.parkarhalani.com/health
curl https://parkarhalani.com
```

### Important URLs

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | https://parkarhalani.com | User interface |
| Backend API | https://api.parkarhalani.com | API endpoints |
| Admin Panel | https://parkarhalani.com/admin | Admin interface |
| Database | Supabase console | Data management |
| Monitoring | Sentry.io | Error tracking |

---

**Deployment Guide Last Updated:** December 8, 2025  
**Version:** 1.0  
**Status:** Ready for Production
