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
      'lh3.googleusercontent.com',  // For Google authentication profile pictures
      'firebasestorage.googleapis.com'  // For Firebase Storage images (if you use it)
    ],
  },
}

module.exports = withPWA(nextConfig) 