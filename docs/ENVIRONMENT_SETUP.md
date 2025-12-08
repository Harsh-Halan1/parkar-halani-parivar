# Environment Setup Guide - Stack Configuration

This guide shows where to find and set connection strings for each service based on your chosen tech stack:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL
- **Storage**: Supabase

---

## 1. DATABASE - Railway PostgreSQL

### Where to Get Connection String
1. Go to [railway.app](https://railway.app)
2. Login to your Railway project
3. Select your PostgreSQL database plugin
4. Click **"Connect"** tab
5. Copy the connection string from **"Postgres Connection URL"** section

### Example Connection String
```
postgresql://postgres:password123@containers.railway.app:8118/railway?sslmode=require
```

### Where to Paste in Backend
**File**: `backend/.env`
```env
DATABASE_URL="postgresql://postgres:password123@containers.railway.app:8118/railway?sslmode=require"
```

### Prisma Configuration
**File**: `backend/prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 2. BACKEND API - Railway

### What You Need
- Backend deployed on Railway
- Railway provides a unique domain for your backend

### Where to Get
1. Go to [railway.app](https://railway.app)
2. Select your backend service
3. Under **"Deployments"**, click on your active deployment
4. Scroll to **"Domain"** section
5. Copy the auto-generated domain (e.g., `https://your-backend.railway.app`)

### Backend Environment Variables
**File**: `backend/.env`

```env
# Database Connection
DATABASE_URL="postgresql://postgres:password@containers.railway.app:8118/railway?sslmode=require"

# Server Configuration
NODE_ENV="production"
PORT=3001
API_PREFIX="api/v1"

# CORS - Update with your Vercel frontend URL
CORS_ORIGIN="https://your-frontend.vercel.app"

# Frontend URL for redirects
FRONTEND_URL="https://your-frontend.vercel.app"

# JWT Tokens (Generate strong 32+ character random strings)
JWT_SECRET="generate-a-random-32-char-string-here-change-in-production"
JWT_REFRESH_SECRET="generate-another-random-32-char-string-here-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# OAuth Configuration
GOOGLE_CLIENT_ID="get-from-google-cloud-console"
GOOGLE_CLIENT_SECRET="get-from-google-cloud-console"
GOOGLE_CALLBACK_URL="https://your-backend.railway.app/api/v1/auth/google/callback"

APPLE_CLIENT_ID="get-from-apple-developer"
APPLE_TEAM_ID="get-from-apple-developer"
APPLE_KEY_ID="get-from-apple-developer"
APPLE_PRIVATE_KEY="get-from-apple-developer"
APPLE_CALLBACK_URL="https://your-backend.railway.app/api/v1/auth/apple/callback"

# SMS/OTP (Twilio)
TWILIO_ACCOUNT_SID="get-from-twilio-console"
TWILIO_AUTH_TOKEN="get-from-twilio-console"
TWILIO_PHONE_NUMBER="+1234567890"

# Email Configuration (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-gmail@gmail.com"
SMTP_PASSWORD="your-app-password-not-actual-password"
SMTP_FROM="noreply@parkarhalani.com"

# Encryption (32-character string)
ENCRYPTION_KEY="your-32-character-encryption-key!!"
```

### Deploy to Railway
1. Connect your GitHub repo to Railway
2. Select the `backend` folder
3. Railway auto-detects Node.js
4. Set environment variables in Railway dashboard
5. Deploy automatically on push

---

## 3. FRONTEND - Vercel

### Where to Get Frontend URL
1. Go to [vercel.com](https://vercel.com)
2. Deploy your `frontend` folder (or connect GitHub)
3. After deployment, Vercel provides a URL like: `https://your-project.vercel.app`

### Frontend Environment Variables
**File**: `frontend/.env.local`

```env
# Backend API URL - Point to your Railway backend
NEXT_PUBLIC_API_URL="https://your-backend.railway.app/api/v1"

# Google OAuth (use same credentials as backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="get-from-google-cloud-console"

# Apple OAuth (optional)
NEXT_PUBLIC_APPLE_CLIENT_ID="get-from-apple-developer"
```

### How to Deploy
1. Push your code to GitHub
2. Import repository to Vercel
3. Select `frontend` folder
4. Set environment variables
5. Deploy with one click
6. Enable automatic deployments on push

### CORS Configuration
Backend needs to know your Vercel URL:
- Update `CORS_ORIGIN` in backend `.env` to your Vercel URL
- This allows frontend to call backend API

---

## 4. STORAGE - Supabase

### What is Supabase?
- PostgreSQL database (we're using Railway instead)
- File storage (S3-compatible bucket)
- Authentication (optional - we're using custom JWT)
- Real-time features (optional)

### For Storage Only
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Storage** → **Buckets**
4. Create buckets for: `family-photos`, `events`, `documents`
5. Get your credentials:
   - **Supabase URL**: From project settings
   - **Supabase Key**: From project settings → API keys

### Supabase Storage Configuration
**File**: `backend/.env`

```env
# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-public-key"
SUPABASE_SECRET="your-supabase-secret-key"

# Or if using service role (recommended for backend)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Upload Files to Supabase
```typescript
// Example: Upload family photo
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.storage
  .from('family-photos')
  .upload(`family-${familyId}/photo.jpg`, file);
```

---

## 5. Complete Environment Variables Summary

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Storage
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Encryption
ENCRYPTION_KEY=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 6. Setup Checklist

- [ ] Railway PostgreSQL: Get connection string
- [ ] Railway Backend: Deploy and get domain
- [ ] Vercel Frontend: Deploy and get URL
- [ ] Supabase: Create storage buckets and get keys
- [ ] Google OAuth: Create credentials in Google Cloud Console
- [ ] Apple OAuth: Create credentials in Apple Developer (optional)
- [ ] Twilio: Get account SID and auth token (for SMS/OTP)
- [ ] Gmail SMTP: Enable 2FA and create app password
- [ ] Update backend `.env` with all values
- [ ] Update frontend `.env.local` with API URL
- [ ] Test API calls from frontend to backend
- [ ] Test file upload to Supabase
- [ ] Test OAuth login flows

---

## 7. Testing Connections

### Test Database Connection
```bash
cd backend
npm run prisma:migrate
# Should create tables successfully
```

### Test Backend API
```bash
cd backend
npm run start:dev
# Visit http://localhost:3001/api/v1/health
```

### Test Frontend → Backend Communication
```bash
cd frontend
npm run dev
# Visit http://localhost:3000
# Try login - should connect to backend
```

### Test Supabase Upload
```typescript
// In your controller/service
const file = new File(['content'], 'test.txt');
await supabaseClient.storage
  .from('family-photos')
  .upload('test/test.txt', file);
```

---

## 8. Production Deployment Checklist

- [ ] All `.env` variables set (no empty values)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong (32+ chars)
- [ ] `ENCRYPTION_KEY` is strong (32 chars)
- [ ] Database backups enabled in Railway
- [ ] HTTPS enabled (automatic on Vercel and Railway)
- [ ] CORS_ORIGIN matches Vercel domain exactly
- [ ] Email/SMS services configured and tested
- [ ] File upload to Supabase tested
- [ ] Rate limiting configured properly
- [ ] Monitoring/logging set up
- [ ] Regular database backups scheduled
