# Parkar Halani Parivar - Family Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

A secure, multilingual family management platform with interactive family tree visualization, built for the Parkar Halani community.

## ✨ Features

### 🔐 Authentication & Security
- Multi-method authentication (Email/Phone + Password, OTP, Google OAuth)
- JWT with refresh tokens
- Role-based access control (Admin, Family Member)
- Rate limiting & DDoS protection
- Bcrypt password hashing (12 rounds)
- DPDP Act compliance

### 👨‍👩‍👧‍👦 Family Management
- Create and manage multiple families
- Multilingual support (Gujarati, English, Hindi)
- Comprehensive person profiles (50+ fields)
- Interactive family tree visualization (ReactFlow)
- Relationship tracking (marriages, parent-child, adoptions)
- Deceased member support

### 📅 Events & Announcements
- Birthday tracking & notifications
- Family events management
- Announcements feed
- Event filtering & search

### 🌍 Internationalization
- **Default Language:** Gujarati (ગુજરાતી)
- **Supported Languages:** English, Hindi (हिन्दी)
- Multilingual database fields (names, descriptions)
- Language switcher in UI

### 🎨 User Experience
- Dark mode (default) + Light mode
- Responsive design (mobile, tablet, desktop)
- Modern UI with Tailwind CSS + shadcn/ui
- Form validation with Zod
- Toast notifications

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS | REST API framework |
| TypeScript | Type-safe development |
| Prisma | ORM for PostgreSQL |
| PostgreSQL | Relational database |
| JWT | Authentication tokens |
| Nodemailer | Email delivery (OTP) |
| Helmet.js | Security headers |
| class-validator | DTO validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library |
| React Hook Form | Form management |
| Zod | Schema validation |
| ReactFlow | Family tree visualization |
| next-intl | Internationalization |

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway / Render
- **Database:** Supabase / Railway PostgreSQL
- **Storage:** Local / Supabase Storage
- **Email:** SMTP / SendGrid

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- pnpm (recommended) or npm

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Harsh-Halani/Parakar-Halani-Parivar.git
cd Parakar-Halani-Parivar
```

2. **Backend Setup**
```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your database credentials
pnpm prisma generate
pnpm prisma migrate dev
pnpm run start:dev
```
Backend runs at `http://localhost:3001`

3. **Frontend Setup**
```bash
cd frontend
pnpm install
cp .env.example .env.local
# Edit .env.local with API URL
pnpm run dev
```
Frontend runs at `http://localhost:3000`

4. **Access the application**
- Open http://localhost:3000
- Register a new account
- Start managing your family!

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview & status |
| [QUICKSTART.md](QUICKSTART.md) | Quick setup guide |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker & production deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Development roadmap |
| [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) | Backend architecture |
| [docs/FRONTEND_SETUP.md](docs/FRONTEND_SETUP.md) | Frontend architecture |
| [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) | **Production: Vercel + Railway + Supabase** ⭐ |
| [docs/ONLINE_DEPLOYMENT_GUIDE.md](docs/ONLINE_DEPLOYMENT_GUIDE.md) | Alternative deployment options |
| [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | E2E testing with Playwright |

## 🧪 Testing

### E2E Tests (Playwright)
```bash
cd frontend
pnpm run e2e        # Run all tests
pnpm run e2e:ui     # Run with UI mode
pnpm run e2e:report # View test report
```

### Backend Tests
```bash
cd backend
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm test:cov       # Coverage report
```

## 🚀 Deployment

### Production Stack (Finalized)

**Stack Architecture:**
- **Frontend:** Vercel (Next.js hosting with auto-deploy)
- **Backend:** Railway (NestJS API with GitHub integration)
- **Database:** Supabase PostgreSQL (managed, RLS, backups)
- **Storage:** Supabase Storage (avatars & event images)

**Rationale:** Supabase provides superior database DX with RLS, SQL editor, and integrated storage. Railway handles backend API deployment seamlessly.

See [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for complete step-by-step guide (30-45 minutes to live!)

### Alternative Deployments

- **Docker:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Other platforms:** [docs/ONLINE_DEPLOYMENT_GUIDE.md](docs/ONLINE_DEPLOYMENT_GUIDE.md)

### Quick Deployment Checklist

- [ ] Create Supabase project & setup database
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Test all services
- [ ] Setup custom domain (optional)

**Estimated Cost:** $5-10/month (free tier) or $50-100/month at scale

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed - December 2025)
- Authentication & security
- Family & person management
- Interactive family tree
- Events & announcements
- Multilingual support

### 🔄 Phase 2: Enhancements (Q1 2026)
- Two-factor authentication
- Photo galleries
- Advanced search
- Email notifications
- Mobile app (Flutter)

### 🌟 Phase 3: Advanced Features (Q2 2026)
- Collaboration tools
- Document storage
- Timeline view
- Analytics dashboard

See [docs/ROADMAP.md](docs/ROADMAP.md) for complete roadmap.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Harsh Halani**
- GitHub: [@Harsh-Halani](https://github.com/Harsh-Halani)

## 🙏 Acknowledgments

- Built with ❤️ for the Parkar Halani community
- Inspired by the need for preserving family heritage
- Special thanks to all contributors

---

**Made with 💙 in India**

## 📅 Timeline

**Target MVP Completion:** December 29, 2025 (1 month)

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Developed for the Parkar Halani Parivar community.
