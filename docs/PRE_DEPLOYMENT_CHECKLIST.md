# Pre-Production Deployment Checklist

Use this checklist before deploying **Parkar Halani Parivar** to production.

---

## 📋 Pre-Deployment (Before Supabase)

- [ ] Repository is clean and committed
- [ ] All tests pass locally
- [ ] No console errors in development
- [ ] All environment variables documented
- [ ] No hardcoded secrets in code
- [ ] README is updated
- [ ] Contributing guidelines are clear
- [ ] License is included (MIT)

---

## 🗄️ Database Setup (Supabase)

- [ ] Create Supabase project
- [ ] Copy database connection string
- [ ] Run `prisma migrate deploy`
- [ ] Verify all tables created
- [ ] Enable Row Level Security (RLS)
- [ ] Create storage buckets:
  - [ ] `family-avatars` (private)
  - [ ] `event-images` (private)
- [ ] Test database connection locally

---

## 🔧 Backend (Railway)

- [ ] Generate JWT secrets (32+ characters)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
- [ ] Configure environment variables:
  - [ ] `DATABASE_URL` (Supabase)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `CORS_ORIGIN` (frontend domain)
  - [ ] `FRONTEND_URL`
  - [ ] `SMTP_*` (Gmail or SendGrid)
  - [ ] `GOOGLE_CLIENT_ID` (if using OAuth)
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Connect GitHub repository to Railway
- [ ] Deploy backend
- [ ] Verify deployment successful
- [ ] Copy backend URL
- [ ] Test API health endpoint

---

## 🎨 Frontend (Vercel)

- [ ] Configure environment variables:
  - [ ] `NEXT_PUBLIC_API_URL` (Railway backend URL)
  - [ ] `NEXT_PUBLIC_APP_URL` (frontend domain)
  - [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - [ ] `NEXT_PUBLIC_DEFAULT_LOCALE=gu`
- [ ] Connect GitHub repository to Vercel
- [ ] Select `frontend` as root directory
- [ ] Deploy frontend
- [ ] Verify deployment successful
- [ ] Copy frontend URL

---

## 🔐 Security & Configuration

- [ ] Enable Gmail App Password for SMTP
  - [ ] 2FA enabled on Gmail
  - [ ] App password generated
  - [ ] Added to Railway env vars
- [ ] Configure Google OAuth (if using)
  - [ ] Google Cloud project created
  - [ ] OAuth credentials created
  - [ ] Redirect URIs configured
  - [ ] Added to both Railway and Vercel
- [ ] Supabase RLS policies checked
- [ ] No sensitive data in git
- [ ] SSL/HTTPS enabled on all services
- [ ] CORS properly configured

---

## 🧪 Testing & Verification

- [ ] Backend API is accessible
  ```bash
  curl https://your-backend.up.railway.app/api/v1/health
  ```
- [ ] Frontend loads without errors
  - [ ] No blank page
  - [ ] Console shows no critical errors
  - [ ] Styles load correctly
- [ ] Frontend can reach backend
  - [ ] Network tab shows API calls
  - [ ] API responds with data
- [ ] Register flow works end-to-end
  - [ ] Can create account
  - [ ] Receives OTP email
  - [ ] Can verify OTP
  - [ ] Can login
- [ ] Family creation works
- [ ] Person creation works
- [ ] Image upload works
- [ ] Family tree visualization loads
- [ ] Multilingual switching works (EN/GU/HI)
- [ ] Dark mode toggle works
- [ ] Run E2E tests against production
  ```bash
  pnpm run e2e
  ```

---

## 📊 Monitoring & Analytics

- [ ] Railway monitoring is enabled
  - [ ] Log streaming configured
  - [ ] Error alerts configured
- [ ] Vercel analytics enabled
- [ ] Supabase monitoring enabled
- [ ] Database backups configured
- [ ] Error tracking set up (optional: Sentry)

---

## 🌐 Domain & DNS (Optional)

- [ ] Custom domain registered
- [ ] DNS records configured
  - [ ] Vercel DNS for frontend
  - [ ] Railway DNS for backend (if needed)
- [ ] SSL certificate installed
- [ ] HTTPS redirects configured
- [ ] Email configured in SMTP_FROM

---

## 📝 Documentation

- [ ] README updated with production URLs
- [ ] Deployment docs reference this checklist
- [ ] Known issues documented
- [ ] Troubleshooting guide reviewed
- [ ] Admin guide is current
- [ ] CONTRIBUTING.md is clear

---

## 🎯 Go/No-Go Decision

Before flipping the switch:

**Critical Items (Must Pass):**
- [ ] Backend API responds to requests
- [ ] Frontend loads without errors
- [ ] Authentication works end-to-end
- [ ] Database migrations succeeded
- [ ] No console errors
- [ ] All environment variables set

**Important Items (Should Pass):**
- [ ] Email sending works
- [ ] Images upload/display correctly
- [ ] E2E tests pass
- [ ] Multi-language switching works
- [ ] All CRUD operations work
- [ ] Family tree visualizes

**Nice to Have (Can Deploy Without):**
- [ ] OAuth configured
- [ ] Custom domain setup
- [ ] Advanced monitoring
- [ ] Error tracking
- [ ] Analytics

---

## ✅ Production Sign-Off

- [ ] Product Lead: Approved
- [ ] Backend Lead: Approved
- [ ] Frontend Lead: Approved
- [ ] Database Admin: Approved
- [ ] Security Review: Approved

**Date Deployed:** ________________  
**Deployed By:** ________________  
**Deployment Notes:** ________________

---

## 📞 Post-Deployment Support

Keep these resources handy:

- **Vercel Support:** https://vercel.com/help
- **Railway Support:** https://docs.railway.app
- **Supabase Support:** https://supabase.com/docs
- **GitHub Issues:** Link to repo issues
- **Emergency Contact:** Your contact info

---

## 🚀 You're Live!

Congratulations! Your production deployment is complete.

**Next Steps:**
1. Monitor logs for 24 hours
2. Gather user feedback
3. Fix any reported bugs
4. Plan Phase 2 features (see ROADMAP.md)

---

**Questions?** See [docs/PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
