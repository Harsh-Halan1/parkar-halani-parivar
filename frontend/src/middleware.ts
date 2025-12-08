import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['gu', 'en', 'hi'],
  defaultLocale: 'gu',
});

export const config = {
  matcher: ['/', '/(gu|en|hi)/:path*'],
};
