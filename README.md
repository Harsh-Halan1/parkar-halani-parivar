# Parkar Halani Parivar

A comprehensive family management and genealogy web platform for the Parkar Halani community.

## 📁 Project Structure

```
├── PROJECT_REQUIREMENTS.md    # Detailed project specifications & technical architecture
├── ROADMAP.md                 # Development progress tracking & task management
├── frontend/                  # Next.js web application
├── backend/                   # NestJS API server
└── LICENSE                    # Project license
```

## 🚀 Getting Started

1. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Runs on `http://localhost:3000`

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   Runs on `http://localhost:3001/api`

   **Backend env (edit `backend/.env`):**
   - `DATABASE_URL` = Postgres connection (local or Supabase; add `sslmode=require` for Supabase)
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key (needed for server-side logout/storage)
   - `JWT_ACCESS_SECRET` = strong random string
   - `PORT` = 3001 (default)

   **Auth base path:** `http://localhost:3001/api/auth` (email sign-up/sign-in, refresh, logout, update-contact; phone OTP temporarily disabled by Twilio plan)

   **Contact-info completion (recommended):**
   - Endpoint: POST `http://localhost:3001/api/auth/update-contact`
   - Body: `{ "userId": string, "email"?: string, "phone"?: string }` (email required for login; phone is optional profile detail for now)
   - Response: updated user payload; `needsContactInfo` is true only when email is missing
   - Frontend reminder UX: show a dismissable bottom-right toast for 5 minutes after login if `needsContactInfo=true` (missing email); timer does not reset on navigation; once dismissed or expired it stays hidden for the session; hide on logout; CTA should open the contact-info form

## 📋 Development Workflow

1. Check `ROADMAP.md` for current tasks
2. Work on assigned tasks
3. Commit changes when task batch is complete
4. Update `ROADMAP.md` with progress
5. Delete any temporary/debug files
6. Repeat

## 📚 Documentation

- **PROJECT_REQUIREMENTS.md** - Complete project specification, tech stack, features, timeline
- **ROADMAP.md** - Current development progress, completed tasks, in-progress items, pending tasks

## 🌐 Supported Languages

- Gujarati (ગુજરાતી) - Default
- English (અંગ્રેજી)
- Hindi (હિંદી)

## 📝 License

See LICENSE file for details.

---

**Start Date:** December 10, 2025  
**Current Phase:** Phase 1 - Frontend UI Development
