import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Younes SEDKI',
  description: 'Full-stack developer portfolio',
  generator: 'sedkiy.dev',

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Font variables */}
        <style>{`
          :root {
            --font-sans: "Geist", ui-sans-serif, system-ui, -apple-system,
              Segoe UI, Roboto, Helvetica, Arial,
              "Apple Color Emoji", "Segoe UI Emoji";
            --font-mono: "Geist Mono", ui-monospace, SFMono-Regular,
              Menlo, Monaco, Consolas, "Liberation Mono",
              "Courier New", monospace;
          }
          html {
            font-family: var(--font-sans);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
