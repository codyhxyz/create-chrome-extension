const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The screenshots subproject has its own lockfile. Pin tracing root to
  // this directory so Next.js doesn't pick up the repo's root or parent
  // lockfile and warn about multiple lockfiles.
  outputFileTracingRoot: path.resolve(__dirname),
  // Capture runs against `next start`; no static export complexity required.
};

module.exports = nextConfig;
