/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external connections for mobile testing
  experimental: {
    // Enable external access
  },
  // Configure hostname for network access
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
