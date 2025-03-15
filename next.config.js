const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'efootballhub.net',
      'api.dicebear.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',  // For Google authentication profile pictures
      'avatars.githubusercontent.com', // For GitHub profile photos
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = withPWA(nextConfig) 