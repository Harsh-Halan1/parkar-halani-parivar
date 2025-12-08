# Backend Setup Guide

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- pnpm (recommended) or npm

## Installation Steps

### 1. Install Dependencies

```powershell
cd backend
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```powershell
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/parkar_halani_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
# ... other variables
```

### 3. Database Setup

Generate Prisma client:

```powershell
pnpm prisma:generate
```

Run migrations:

```powershell
pnpm prisma:migrate
```

(Optional) Seed initial data:

```powershell
pnpm seed
```

View database in Prisma Studio:

```powershell
pnpm prisma:studio
```

### 4. Start Development Server

```powershell
pnpm run start:dev
```

Backend will be available at: `http://localhost:3001/api/v1`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/phone and password
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/google` - Google OAuth
- `GET /auth/me` - Get current user

### Families
- `GET /families` - List all families
- `GET /families/:id` - Get family details
- `POST /families` - Create family (Admin only)
- `PATCH /families/:id` - Update family
- `DELETE /families/:id` - Delete family (Admin only)

### Persons
- `GET /persons` - List all persons (with filters)
- `GET /persons/:id` - Get person details
- `POST /persons` - Add person
- `PATCH /persons/:id` - Update person
- `DELETE /persons/:id` - Delete person (Admin only)

### Relationships
- `POST /relationships` - Create relationship
- `GET /relationships/person/:personId` - Get person's relationships
- `GET /relationships/family-tree/:familyId` - Get family tree
- `PATCH /relationships/:id` - Update relationship
- `DELETE /relationships/:id` - Delete relationship (Admin only)

### Events
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Announcements
- `GET /announcements` - List announcements
- `GET /announcements/:id` - Get announcement details
- `POST /announcements` - Create announcement
- `PATCH /announcements/:id` - Update announcement
- `DELETE /announcements/:id` - Delete announcement

## Production Deployment

### Using Railway

1. Create a new project on Railway
2. Add PostgreSQL database addon
3. Connect your GitHub repository
4. Set environment variables
5. Deploy!

### Using Render

1. Create new Web Service
2. Connect repository
3. Build command: `pnpm install && pnpm prisma:generate && pnpm run build`
4. Start command: `pnpm run start:prod`
5. Add PostgreSQL database
6. Set environment variables

## Security Checklist

- [x] Bcrypt password hashing (12 rounds)
- [x] JWT with short-lived access tokens
- [x] Refresh token rotation
- [x] Rate limiting (10 requests/minute)
- [x] Helmet.js security headers
- [x] CORS configuration
- [x] Input validation
- [x] SQL injection prevention (Prisma)
- [x] Account lockout after 5 failed attempts
- [ ] 2FA implementation (Phase 2)
- [ ] Advanced audit logging (Phase 2)

## Testing

Run unit tests:

```powershell
pnpm test
```

Run E2E tests:

```powershell
pnpm test:e2e
```

Coverage report:

```powershell
pnpm test:cov
```

## Troubleshooting

### Database connection issues

Check PostgreSQL is running:

```powershell
pg_isready
```

Verify DATABASE_URL in `.env`

### Migration errors

Reset database (⚠️ DANGER - loses all data):

```powershell
pnpm prisma migrate reset
```

### Port already in use

Change PORT in `.env` or kill the process using port 3001
