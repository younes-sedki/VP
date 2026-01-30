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
  // Exclude problematic packages from server bundle
  serverComponentsExternalPackages: [
    'html-encoding-sniffer',
    '@exodus/bytes',
    'jsdom',
    'dompurify',
    'isomorphic-dompurify'
  ],
  
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
      
      // Prevent these from being bundled
      config.externals = config.externals || []
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals
        config.externals = [
          originalExternals,
          (context, request, callback) => {
            const problematic = [
              'html-encoding-sniffer',
              '@exodus/bytes',
              'jsdom',
              'dompurify',
              'isomorphic-dompurify'
            ]
            if (problematic.some(pkg => request === pkg || request?.startsWith(pkg + '/'))) {
              return callback(null, `commonjs ${request}`)
            }
            callback()
          }
        ]
      } else {
        config.externals.push({
          'html-encoding-sniffer': 'commonjs html-encoding-sniffer',
          '@exodus/bytes': 'commonjs @exodus/bytes',
          'jsdom': 'commonjs jsdom',
          'dompurify': 'commonjs dompurify',
          'isomorphic-dompurify': 'commonjs isomorphic-dompurify',
        })
      }
    }
    return config
  },
}

export default nextConfig
