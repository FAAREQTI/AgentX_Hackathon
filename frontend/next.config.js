/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack caching in development to prevent ENOENT errors
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig