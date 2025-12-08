# Deployment Guide

## 🏠 Local Development Setup (Windows)

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/windows/))
- pnpm (Package Manager) - Install with: `npm install -g pnpm`
- Git for version control

### Step 1: Clone Repository

```powershell
git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
cd Parakar-Halani-Parivar
```

### Step 2: Database Setup

**Option A: Local PostgreSQL**
```powershell
# Create database
psql -U postgres
CREATE DATABASE parkar_halani_dev;
\q
```

**Option B: Supabase Cloud (Recommended for testing)**
- Go to https://supabase.com and create a free project
- Copy your connection string

### Step 3: Backend Setup

```powershell
cd backend

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env

# Edit .env with your database URL:
# DATABASE_URL="postgresql://username:password@localhost:5432/parkar_halani_dev"
```

**Generate Prisma Client:**
```powershell
pnpm prisma:generate
pnpm prisma migrate dev
```

**Start Backend Server:**
```powershell
pnpm run start:dev
```
Backend runs at: `http://localhost:3001/api/v1`

### Step 4: Frontend Setup

```powershell
cd ../frontend

# Install dependencies
pnpm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Start Frontend Server:**
```powershell
pnpm run dev
```
Frontend runs at: `http://localhost:3000`

### Step 5: Access Application

Open browser and visit: **http://localhost:3000**

### Troubleshooting Local Setup

**Database Connection Failed:**
```powershell
# Verify PostgreSQL is running
psql -U postgres -d parkar_halani_dev

# If connection string is wrong, update .env:
DATABASE_URL="postgresql://user:password@localhost:5432/parkar_halani_dev"
```

**Port Already in Use:**
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Frontend Can't Connect to Backend:**
- Ensure backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Check CORS setting in backend/src/main.ts

**Prisma Errors:**
```powershell
cd backend
pnpm prisma:generate
pnpm prisma migrate reset  # ⚠️ WARNING: Deletes all data
```

---

## ⚠️ Mobile App Status (Important)

**Current Status:** Mobile application is NOT yet available on Play Store or App Store.

### Mobile App Development

The mobile application (Flutter-based) is still in development:
- ❌ Not available on Google Play Store
- ❌ Not available on Apple App Store
- 🔄 APK development in progress
- 📅 Expected release timeline: Q1 2026

### Current Options

Users can currently access the platform:
- ✅ **Web Application:** Full featured, available at your domain
- ✅ **Progressive Web App (PWA):** Add to home screen on mobile
- ⏳ **APK:** Direct download coming soon (check back after January 2026)

### Future Mobile Release

When mobile app is ready:
1. APK will be available for direct Android download
2. Play Store listing will be published
3. App Store listing will be published
4. Automatic notifications will alert users

### Deploy Mobile App (When Ready)

**For Android APK:**
```bash
cd mobile
flutter build apk --release
# Output: build/app/outputs/flutter-app.apk
```

**For Play Store Release:**
1. Build Android App Bundle: `flutter build appbundle --release`
2. Sign with release key
3. Upload to Play Store Console
4. Complete store listing
5. Submit for review

**For App Store Release:**
1. Build iOS: `flutter build ios --release`
2. Archive and sign
3. Upload to App Store Connect
4. Complete app information
5. Submit for review

---

## Overview

This guide covers deployment of all three components:
- Backend (NestJS API)
- Frontend (Next.js Web App)
- Database (PostgreSQL)

## Database Deployment

### Option 1: Supabase (Recommended for MVP)

**Pros:** Free tier, automatic backups, encryption at rest, hosted PostgreSQL

1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Update `DATABASE_URL` in backend `.env`

**Free tier limits:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth

### Option 2: Railway

1. Create account at https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy `DATABASE_URL`

**Pricing:** $5/month credit (enough for MVP)

### Option 3: Render

1. Create PostgreSQL database
2. Free tier available (expires after 90 days)
3. Copy connection string

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Connect GitHub Repository**
   - Go to https://railway.app

   - Create new project from GitHub repo
   - Select backend folder

2. **Configure Build**
   - Root directory: `backend`
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-production-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
   - Railway auto-deploys on push to main branch
   - Copy the generated URL for frontend config

**Pricing:** ~$5-10/month depending on usage

1. **Create Web Service**
   - Connect GitHub repository
   - Root directory: `backend`
   - Environment: Node
   - Build: `pnpm install && pnpm prisma:generate && pnpm build`
   - Start: `pnpm start:prod`

2. **Add Environment Variables** (same as Railway)

3. **Deploy**

**Pricing:** Free tier available (spins down after inactivity)

### Option 3: Vercel (Serverless)

Not recommended for this project due to WebSocket/long-running process needs.

## Frontend Deployment

### Vercel (Recommended)

1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Import project

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `pnpm build`
   - Output Directory: `.next`
3. **Environment Variables**
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
   - Free SSL certificate

**Pricing:** Free for hobby projects

### Alternative: Netlify

Similar to Vercel, same pricing model.

## SSL Certificates

All recommended platforms (Railway, Vercel, Render) provide **free automatic SSL** via Let's Encrypt.

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && pnpm install
      - run: cd backend && pnpm test
      # Railway/Render auto-deploys from GitHub

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && pnpm install
      - run: cd frontend && pnpm build
      # Vercel auto-deploys from GitHub
```

## Environment Variables

### Backend Production

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=use-strong-random-string-min-32-chars
JWT_REFRESH_SECRET=another-strong-random-string
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# OTP/SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/google/callback

# Encryption
ENCRYPTION_KEY=32-character-encryption-key!!

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### Frontend Production

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Security Checklist

### Before Going Live

- [ ] All environment variables use strong, unique values
- [ ] CORS restricted to your domain only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] Database backups enabled (daily)
- [ ] SSL certificates active
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Sensitive data encrypted at rest
- [ ] Logs don't contain sensitive info
- [ ] Error messages don't leak system info
- [ ] Dependencies updated to latest secure versions

## Monitoring & Logging

### Recommended Tools

**Application Monitoring:**
- Sentry (error tracking) - Free tier available
- LogRocket (session replay) - For debugging

**Uptime Monitoring:**
- UptimeRobot - Free for 50 monitors
- Better Uptime - Comprehensive monitoring

**Performance:**
- Vercel Analytics (built-in)
- Google Analytics / Plausible

### Setup Sentry

Backend:

```bash
pnpm add @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

Frontend:

```bash
pnpm add @sentry/nextjs
```

## Backup Strategy

### Database Backups

**Supabase:** Automatic daily backups (7-day retention on free tier)

**Railway:** Enable automatic backups in dashboard

**Manual Backups:**

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

Automate with cron job or GitHub Actions.

### Code Backups

- Primary: GitHub repository
- Mirror: GitLab or Bitbucket (optional)

## Scaling Considerations

### Current MVP Limits

- **Users:** 100-1000 concurrent
- **Database:** 500 MB (Supabase free tier)
- **API:** 100k requests/month (Railway free credit)

### When to Scale

**Database:**
- Storage > 400 MB → Upgrade Supabase or migrate to dedicated PostgreSQL
- Queries slow → Add indexes, optimize queries

**Backend:**
- CPU/Memory > 80% → Upgrade Railway plan
- Response time > 1s → Add Redis caching

**Frontend:**
- No scaling needed (Vercel handles automatically)

## Cost Estimate

### MVP (First 3 months)

- **Database (Supabase):** Free
- **Backend (Railway):** $5-10/month
- **Frontend (Vercel):** Free
- **Domain (.com):** $12/year
- **Email (Resend/SendGrid):** Free tier

**Total:** ~$10-15/month

### After MVP (100-500 active users)

- **Database:** $10-25/month
- **Backend:** $20-50/month
- **Frontend:** Free-$20/month
- **Monitoring:** Free-$29/month

**Total:** ~$30-100/month

## Domain Setup

1. **Purchase Domain** (Namecheap, Google Domains, etc.)

2. **Configure DNS:**

   ```
   A     @           76.76.21.21         (Vercel IP)
   CNAME www         cname.vercel-dns.com
   CNAME api         your-backend.railway.app
   ```

3. **Add to Vercel:**
   - Project Settings → Domains
   - Add `yourdomain.com` and `www.yourdomain.com`

4. **Update CORS:**
   - Backend `.env`: `CORS_ORIGIN=https://yourdomain.com`

## Post-Deployment

### 1. Smoke Testing

- [ ] User registration works
- [ ] Login works
- [ ] OTP verification works
- [ ] Create family works
- [ ] Add person works
- [ ] Create event works
- [ ] Dark/light mode toggle works
- [ ] Language switching works
- [ ] Mobile responsive

### 2. Performance Testing

- Use Lighthouse (should score >90)
- Check API response times (<200ms)
- Monitor initial page load (<2s)

### 3. Load Testing

Use k6 or Artillery:

```bash
npx artillery quick --count 10 --num 50 https://api.yourdomain.com/api/v1/families
```

## Rollback Procedure

If deployment fails:

1. **Revert Git commit:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Railway/Vercel auto-redeploys previous version**

3. **Database rollback:**
   ```bash
   pnpm prisma migrate down
   ```

## Support & Maintenance

### Weekly Tasks
- Check error logs
- Review Sentry errors
- Monitor uptime

### Monthly Tasks
- Review security updates
- Update dependencies
- Database backup verification
- Performance audit

### Quarterly Tasks
- Security audit
- DPDP compliance review
- Backup restoration test

## Emergency Contacts

- **Database Down:** Check Supabase status page
- **Backend Down:** Check Railway dashboard
- **Frontend Down:** Check Vercel dashboard
- **DNS Issues:** Check domain registrar

## Next Steps After Deployment

1. Set up monitoring alerts
2. Configure automated backups
3. Add custom domain
4. Enable CDN for media files
5. Set up staging environment
6. Implement advanced logging
7. Create deployment runbook
