# Parakar Halani Parivar Backend (NestJS Skeleton)

This is a lightweight NestJS starter to serve Families, Members, and Announcements APIs. It uses in-memory data for now; swap the services to Prisma/PostgreSQL later.

## Structure
```
backend/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ main.ts            # Bootstraps Nest app with CORS + /api prefix
   ├─ app.module.ts      # Wires feature modules
   ├─ families/          # Families CRUD (in-memory)
   ├─ members/           # Members CRUD (in-memory)
   └─ announcements/     # Announcements CRUD (in-memory)
```

## Quick start
```bash
cd backend
npm install
npm run start:dev
```
API base: `http://localhost:3001/api`

### Endpoints (in-memory)
- `GET /api/families` — list families
- `POST /api/families` — create family `{ headFirstName, city?, description? }`
- `PATCH /api/families/:id` — update
- `DELETE /api/families/:id`

- `GET /api/members` — list members
- `POST /api/members` — `{ name, familyHeadFirstName, role, age?, location?, phone?, email?, tags? }`
- `PATCH /api/members/:id`
- `DELETE /api/members/:id`

- `GET /api/announcements` — list announcements
- `POST /api/announcements` — `{ name, date, type, attendees?, description? }`
- `PATCH /api/announcements/:id`
- `DELETE /api/announcements/:id`

## Next steps
- Replace in-memory services with Prisma + PostgreSQL
- Add DTO validation pipes and error handling
- Add auth guard + JWT strategy when backend auth is ready
- Add pagination/filtering for list endpoints
- Align models with frontend naming (family head → `<FirstName>'s family`)
