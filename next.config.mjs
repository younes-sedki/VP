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
      // Completely exclude problematic packages from server-side bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'html-encoding-sniffer': false,
        '@exodus/bytes': false,
        'jsdom': false,
        'dompurify': false,
        'isomorphic-dompurify': false,
      }
      
      // Also add to externals to prevent bundling
      config.externals = config.externals || []
      config.externals.push({
        'html-encoding-sniffer': 'commonjs html-encoding-sniffer',
        '@exodus/bytes': 'commonjs @exodus/bytes',
        'jsdom': 'commonjs jsdom',
        'dompurify': 'commonjs dompurify',
        'isomorphic-dompurify': 'commonjs isomorphic-dompurify',
      })
    }
    return config
  },
}

export default nextConfig
