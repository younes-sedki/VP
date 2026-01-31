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
  
  // Exclude problematic packages from serverless function file tracing
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/.pnpm/html-encoding-sniffer@*/**',
        'node_modules/.pnpm/@exodus+bytes@*/**',
        'node_modules/.pnpm/jsdom@*/**',
        'node_modules/.pnpm/dompurify@*/**',
        'node_modules/.pnpm/isomorphic-dompurify@*/**',
        'node_modules/html-encoding-sniffer/**',
        'node_modules/@exodus/bytes/**',
        'node_modules/jsdom/**',
        'node_modules/dompurify/**',
        'node_modules/isomorphic-dompurify/**',
      ],
    },
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://jdenticon.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://jdenticon.com https://github.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://dev.to https://hacker-news.firebaseio.com https://www.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  
  webpack: (config, { isServer }) => {
    // Windows-specific fixes for case sensitivity issues
    config.resolve.symlinks = false
    
    // Normalize paths to handle Windows case-insensitive filesystem
    if (process.platform === 'win32') {
      // Use case-sensitive module resolution
      config.resolve.cacheWithContext = false
      
      // Normalize module paths
      const originalResolve = config.resolve.resolve || config.resolve
      if (originalResolve) {
        config.resolve.resolve = {
          ...originalResolve,
          cachePredicate: () => true,
        }
      }
    }
    
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
