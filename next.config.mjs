import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
      // Replace problematic packages with stub modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'html-encoding-sniffer': path.resolve(__dirname, 'lib/stubs/html-encoding-sniffer.js'),
        '@exodus/bytes': path.resolve(__dirname, 'lib/stubs/bytes.js'),
        'jsdom': false,
        'dompurify': false,
        'isomorphic-dompurify': false,
      }
      
      // Also add to externals to prevent bundling
      config.externals = config.externals || []
      config.externals.push({
        'jsdom': 'commonjs jsdom',
        'dompurify': 'commonjs dompurify',
        'isomorphic-dompurify': 'commonjs isomorphic-dompurify',
      })
    }
    return config
  },
}

export default nextConfig
