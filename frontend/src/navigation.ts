import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['gu', 'en', 'hi'] as const;
export const defaultLocale = 'gu' as const;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames: {
      '/': '/',
      '/login': '/login',
      '/register': '/register',
      '/dashboard': '/dashboard',
      '/families': '/families',
      '/persons': '/persons',
      '/events': '/events',
      '/announcements': '/announcements',
      '/family-tree': '/family-tree',
    },
  });
