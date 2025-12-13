import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // Used to determine where the locale is in the URL
  localePrefix: 'always',
  
  // Don't redirect default locale to /gu
  localeDetection: true,
});
// add a temporary log in here to verify it runs for every request
console.log('Next.js middleware is running');
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
