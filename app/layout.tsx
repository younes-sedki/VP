import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import StructuredData from "./structured-data"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: {
    default: "Younes SEDKI - Full-Stack Developer",
    template: "%s | Younes SEDKI",
  },
  description: "Full-Stack Developer specializing in React, Next.js, Node.js, and DevOps. Second-year student at ISTA Rabat seeking internship opportunities. Building scalable web applications with modern technologies.",
  keywords: [
    "Full-Stack Developer",
    "React Developer",
    "Next.js Developer",
    "Node.js Developer",
    "DevOps Engineer",
    "Web Developer Morocco",
    "Rabat Developer",
    "ISTA Student",
    "TypeScript Developer",
    "Laravel Developer",
    "Portfolio",
  ],
  authors: [{ name: "Younes SEDKI" }],
  creator: "Younes SEDKI",
  publisher: "Younes SEDKI",
  generator: "Next.js",
  applicationName: "Younes SEDKI Portfolio",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sedkiy.dev"), // Update with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sedkiy.dev", // Update with your actual domain
    siteName: "Younes SEDKI Portfolio",
    title: "Younes SEDKI - Full-Stack Developer & DevOps Engineer",
    description: "Full-Stack Developer specializing in React, Next.js, Node.js, and DevOps. Building scalable web applications with modern technologies.",
    images: [
      {
        url: "/og-image.png", // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Younes SEDKI - Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Younes SEDKI - Full-Stack Developer & DevOps Engineer",
    description: "Full-Stack Developer specializing in React, Next.js, Node.js, and DevOps.",
    images: ["/og-image.png"], // Same image as Open Graph
    creator: "@younes_sedki", // Update with your Twitter handle if you have one
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* ================= iOS Safari Safe Area ================= */}
        <meta name="theme-color" content="#030712" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* ==================================================== */}
        {/* ================= Structured Data for SEO ================= */}
        <StructuredData />
        {/* ================= Google Analytics ================= */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5HFB8EHCJP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5HFB8EHCJP', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        {/* ==================================================== */}

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

      <body className="bg-neutral-950">
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
