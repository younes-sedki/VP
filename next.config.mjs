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
  serverExternalPackages: [
    'html-encoding-sniffer',
    '@exodus/bytes',
    'jsdom',
    'dompurify',
    'isomorphic-dompurify'
  ],
  
  // Exclude problematic packages from serverless function file tracing
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
  
}

export default nextConfig
