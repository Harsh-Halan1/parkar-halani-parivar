# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for production)
- Git

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
cd Parakar-Halani-Parivar
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: postgresql://localhost:5432

### 4. Run Migrations
```bash
docker-compose exec backend npm run migrate
```

### 5. View Logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

## Production Deployment

### 1. Build Production Images
```bash
docker-compose -f docker-compose.yml build
```

### 2. Set Environment Variables
```bash
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@prod-host:5432/db
export JWT_SECRET=<generate-strong-secret>
```

### 3. Push Images to Registry
```bash
docker tag parakar-halani-parivar-frontend myregistry/frontend:latest
docker tag parakar-halani-parivar-backend myregistry/backend:latest
docker push myregistry/frontend:latest
docker push myregistry/backend:latest
```

### 4. Deploy to Kubernetes/Cloud
- Update image tags in manifests
- Apply configurations
- Set up SSL/TLS certificates
- Configure domain DNS records

### 5. Database Migrations
```bash
# Run migrations in production
docker run --env-file .env.prod myregistry/backend:latest npm run migrate
```

## Testing

### Run All Tests
```bash
docker-compose exec frontend npm test
docker-compose exec backend npm test
```

### Lint Code
```bash
docker-compose exec frontend npm run lint
docker-compose exec backend npm run lint
```

## Monitoring & Maintenance

### Health Checks
```bash
curl http://localhost:3000       # Frontend
curl http://localhost:3001/health # Backend
```

### Database Backups
```bash
docker-compose exec postgres pg_dump -U parivar_user parivar_db > backup.sql
```

### Scale Services
```bash
docker-compose up -d --scale backend=3
```

## Troubleshooting

### Database Connection Issues
```bash
docker-compose exec postgres psql -U parivar_user -d parivar_db
```

### Clear Docker Resources
```bash
docker-compose down -v
docker system prune -a --volumes
```

### View Build Logs
```bash
docker-compose build --no-cache frontend
```

## CI/CD Pipeline

Automated workflows run on:
- Push to main/develop
- Pull requests
- Manual trigger

See `.github/workflows/ci-cd.yml` for detailed configuration.
