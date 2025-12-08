/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = withNextIntl({
  images: {
    domains: ['localhost'],
  },
});

module.exports = nextConfig;
