# Supabase Storage Setup Guide

## Overview
This guide covers setting up Supabase Storage for file uploads (profile photos, documents, etc.) in the Parakar Halani Parivar application.

---

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign up for Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign in with GitHub (recommended) or Email

### 1.2 Create New Project
1. Click **New Project**
2. Fill in details:
   - **Name:** `parakar-halani-parivar`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to you (e.g., Southeast Asia)
   - **Plan:** Free tier is sufficient for development
3. Click **Create new project**
4. Wait 2-3 minutes for project provisioning

---

## Step 2: Create Storage Bucket (3 minutes)

### 2.1 Navigate to Storage
1. In Supabase dashboard, click **Storage** in left sidebar
2. Click **Create a new bucket**

### 2.2 Configure Bucket
**Name:** `parakar-storage`
**Public bucket:** ✅ **Yes** (for public access to profile photos)
**File size limit:** `10 MB` (or customize)

Click **Create bucket**

### 2.3 Setup Folder Structure (Optional but Recommended)
Create folders inside the bucket:
- `members/photos/` - Profile pictures
- `documents/` - PDFs, docs
- `announcements/` - Event images
- `uploads/` - General uploads

---

## Step 3: Get API Credentials (2 minutes)

### 3.1 Get Project URL
1. Click **Settings** (⚙️) in left sidebar
2. Click **API**
3. Find **Project URL**
   - Example: `https://abc123xyz.supabase.co`
4. **Copy this URL**

### 3.2 Get Anon/Public Key
1. Still in **Settings → API**
2. Find **Project API keys** section
3. Copy **`anon` `public`** key (long string starting with `eyJ...`)
4. ⚠️ **Never commit this to public repos!**

---

## Step 4: Configure Backend Environment (2 minutes)

### 4.1 Update `.env` file
Open `backend/.env` and add/update:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=parakar-storage
```

**Replace:**
- `SUPABASE_URL` with your Project URL from Step 3.1
- `SUPABASE_KEY` with your anon key from Step 3.2
- `SUPABASE_BUCKET` should match bucket name from Step 2.2

### 4.2 Verify Configuration
```powershell
cd backend
npm run start:dev
```

Check console output:
- ✅ `Supabase client initialized` → Success!
- ⚠️ `Supabase credentials not configured` → Check .env file

---

## Step 5: Test Storage with Postman (10 minutes)

### 5.1 Import Storage Collection
The Postman collection already includes storage endpoints.

### 5.2 Upload a File

**Request:**
```http
POST http://localhost:3001/storage/upload?uploadedBy=user123&bucketPath=members/photos
Content-Type: multipart/form-data

Body:
- Select "form-data"
- Key: "file" (change type to "File")
- Value: Choose an image file (e.g., profile.jpg)
```

**Expected Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "cm5abc123...",
    "fileName": "profile_1234567890.jpg",
    "fileUrl": "https://abc123xyz.supabase.co/storage/v1/object/public/parakar-storage/members/photos/profile_1234567890.jpg",
    "bucketPath": "members/photos/profile_1234567890.jpg",
    "fileSize": 245678,
    "mimeType": "image/jpeg",
    "uploadedBy": "user123",
    "memberId": null,
    "createdAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Save the `id` for next tests!**

### 5.3 Get File Metadata

**Request:**
```http
GET http://localhost:3001/storage/files/{{FILE_ID}}
```

**Response:**
```json
{
  "id": "cm5abc123...",
  "fileName": "profile_1234567890.jpg",
  "fileUrl": "https://...",
  ...
}
```

### 5.4 Download File

**Request:**
```http
GET http://localhost:3001/storage/download/{{FILE_ID}}
```

**Response:** Binary file download

### 5.5 Delete File

**Request:**
```http
DELETE http://localhost:3001/storage/files/{{FILE_ID}}?userId=user123
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

### 5.6 Get Storage Statistics

**Request:**
```http
GET http://localhost:3001/storage/stats
```

**Response:**
```json
{
  "totalFiles": 5,
  "totalSize": 1234567,
  "totalSizeMB": "1.18",
  "filesByType": [
    { "mimeType": "image/jpeg", "_count": 3 },
    { "mimeType": "application/pdf", "_count": 2 }
  ]
}
```

---

## Storage API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/storage/upload` | POST | Upload file (multipart/form-data) |
| `/storage/files/:id` | GET | Get file metadata |
| `/storage/files/user/:userId` | GET | List all files by user |
| `/storage/files/member/:memberId` | GET | List all files for a member |
| `/storage/download/:id` | GET | Download file content |
| `/storage/files/:id` | DELETE | Delete file (requires userId) |
| `/storage/stats` | GET | Get storage statistics |

---

## File Upload Constraints

### Allowed MIME Types:
- **Images:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
- **Documents:** `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### File Size Limit:
- **Maximum:** 10 MB per file
- Configured in: `backend/src/storage/storage.service.ts`

### Security:
- File names are sanitized (special characters removed)
- Unique timestamp added to prevent overwrites
- User authorization checked on delete operations

---

## Supabase Storage Pricing (as of 2026)

### Free Tier:
- ✅ 1 GB storage
- ✅ 2 GB bandwidth per month
- ✅ 50 MB file size limit (configurable)

### Pro Tier ($25/month):
- ✅ 100 GB storage
- ✅ 200 GB bandwidth
- ✅ 5 GB file size limit

**For development:** Free tier is perfect!

---

## Troubleshooting

### "Supabase client not initialized"
**Fix:**
1. Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
2. Restart backend: `npm run start:dev`
3. Verify keys are correct (no extra spaces)

### "Failed to upload file: Bucket not found"
**Fix:**
1. Go to Supabase dashboard → Storage
2. Verify bucket `parakar-storage` exists
3. Check `SUPABASE_BUCKET` in `.env` matches bucket name

### "File type not allowed"
**Fix:**
Upload only supported file types (see "Allowed MIME Types" above)

### Files not showing in Supabase dashboard
**Fix:**
1. Go to Storage → `parakar-storage`
2. Navigate to correct folder (e.g., `members/photos/`)
3. Files should appear there

### CORS errors from frontend
**Fix:**
1. Supabase dashboard → Settings → API
2. Add frontend URL to allowed origins:
   - `http://localhost:5173`
   - `http://localhost:3000`

---

## Next Steps: Authentication

Now that storage is configured, you have **two options** for authentication:

### Option A: Supabase Auth (Recommended ✅)
**Pros:**
- OAuth providers (Google, GitHub, Facebook, etc.)
- Built-in email verification & password reset
- Session management with refresh tokens
- Multi-factor authentication support
- Row Level Security (RLS) policies
- Less backend code to maintain

**Cons:**
- Vendor lock-in to Supabase
- Must learn Supabase Auth API

### Option B: Custom NestJS Auth
**Pros:**
- Full control over auth logic
- No vendor dependencies
- Already have bcrypt + JWT setup

**Cons:**
- Must implement OAuth manually
- Must handle email verification manually
- More code to maintain

**Recommendation:** Use **Supabase Auth** since you're already using Supabase for storage!

---

## Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [File Upload API Reference](https://supabase.com/docs/reference/javascript/storage-from-upload)

---

**Created:** Phase 2 - Storage Implementation  
**Last Updated:** January 3, 2026  
**Status:** ✅ Ready for Testing
