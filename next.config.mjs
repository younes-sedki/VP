/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/identicons/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for ES module compatibility issues in serverless environment
      config.externals = config.externals || []
      config.externals.push({
        'html-encoding-sniffer': 'commonjs html-encoding-sniffer',
        '@exodus/bytes': 'commonjs @exodus/bytes',
      })
    }
    return config
  },
  // Handle ES modules in serverless functions
  experimental: {
    serverComponentsExternalPackages: ['dompurify'],
  },
}

export default nextConfig
