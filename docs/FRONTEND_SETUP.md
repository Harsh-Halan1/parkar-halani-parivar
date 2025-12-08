# Frontend Setup Guide

## Prerequisites

- Node.js 20.x or higher
- pnpm (recommended) or npm

## Installation Steps

### 1. Install Dependencies

```powershell
cd frontend
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```powershell
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Start Development Server

```powershell
pnpm dev
```

Frontend will be available at: `http://localhost:3000`

Default language: Gujarati (`http://localhost:3000/gu`)

## Features

### Internationalization (i18n)

Supported languages:
- Gujarati (gu) - Default
- English (en)
- Hindi (hi)

Access different languages:
- Gujarati: `http://localhost:3000/gu`
- English: `http://localhost:3000/en`
- Hindi: `http://localhost:3000/hi`

### Dark Mode

- Default theme: Dark
- Toggle between dark/light in settings
- System theme detection enabled

### Responsive Design

- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1400px

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── [locale]/          # Internationalized routes
│   │       ├── layout.tsx     # Root layout
│   │       ├── page.tsx       # Home page
│   │       ├── login/
│   │       ├── dashboard/
│   │       └── ...
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Custom components
│   ├── lib/
│   │   ├── api.ts             # API client with auth
│   │   └── utils.ts           # Utilities
│   ├── i18n.ts                # i18n config
│   ├── middleware.ts          # Locale routing
│   └── navigation.ts          # Typed navigation
├── messages/
│   ├── gu.json                # Gujarati translations
│   ├── en.json                # English translations
│   └── hi.json                # Hindi translations
└── public/                    # Static assets
```

## Adding New Pages

1. Create page in `src/app/[locale]/your-page/page.tsx`
2. Add translations to all language files
3. Add route to `src/navigation.ts`

Example:

```tsx
// src/app/[locale]/my-page/page.tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations();
  return <h1>{t('myPage.title')}</h1>;
}
```

## Adding Translations

Edit all language files:

```json
// messages/gu.json
{
  "myPage": {
    "title": "મારું પેજ"
  }
}

// messages/en.json
{
  "myPage": {
    "title": "My Page"
  }
}

// messages/hi.json
{
  "myPage": {
    "title": "मेरा पेज"
  }
}
```

## Production Build

Build for production:

```powershell
pnpm build
```

Start production server:

```powershell
pnpm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

Auto-deployment on push to main branch.

### Manual Deploy

Build and export:

```powershell
pnpm build
```

Upload `.next` folder and `package.json` to server.

## Component Library

We use **shadcn/ui** components:

Install new components:

```powershell
npx shadcn-ui@latest add <component-name>
```

Examples:
- `npx shadcn-ui@latest add dialog`
- `npx shadcn-ui@latest add dropdown-menu`
- `npx shadcn-ui@latest add toast`

## Styling

- **Tailwind CSS** for utility classes
- **CSS Variables** for theming
- **Dark mode** via `next-themes`

Customize colors in `tailwind.config.js` and `src/app/globals.css`

## API Integration

API client is configured in `src/lib/api.ts` with:
- Automatic token injection
- Token refresh on 401
- Redirect to login on auth failure

Usage:

```tsx
import apiClient from '@/lib/api';

const response = await apiClient.get('/persons');
const persons = response.data;
```

## Troubleshooting

### Hydration errors

Ensure server/client rendering matches. Use `'use client'` directive when needed.

### Translation missing

Check all three language files have the same keys.

### API connection failed

Verify `NEXT_PUBLIC_API_URL` in `.env.local` and backend is running.

### Build errors

Clear cache and rebuild:

```powershell
rm -rf .next
pnpm build
```
