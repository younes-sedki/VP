"use client"

import { Mail } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { ADMIN_PROFILE } from "@/lib/profile-config"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const contactLinks = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:younes_sedki@hotmail.fr",
  },
  {
    name: "GitHub",
    icon: "github",
    href: ADMIN_PROFILE.github || "https://github.com/younes-sedki",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    href: ADMIN_PROFILE.linkedin || "https://linkedin.com/in/younes-sedki",
  },
]

export default function ContactSection() {
  return (
    <section className="px-4 py-16 lg:py-24" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-6xl">
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2 id="contact-heading" className="text-3xl font-black tracking-tight sm:text-4xl">
            Let&apos;s Connect
          </h2>
        </RevealOnView>

        <RevealOnView
          as="div"
          intensity="hero"
          className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900/60 p-6 sm:p-8"
        >
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-2">

            {/* SMALL CONTACT LINKS */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3" role="list">
              {contactLinks.map((link) => {
                const isLucideIcon = typeof link.icon !== 'string'
                const Icon = isLucideIcon ? link.icon : null
                
                return (
                  <Tooltip key={link.name}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.href}
                        target={link.href.startsWith("mailto") ? undefined : "_blank"}
                        rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 transition-all duration-300 hover:shadow-lg hover:bg-white/10 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500"
                        aria-label={`${link.name} - ${link.href.startsWith("mailto") ? "Send email" : "Open in new tab"}`}
                        role="listitem"
                        onClick={(e) => {
                          // Prevent browser from showing URL in status bar
                          e.preventDefault()
                          if (link.href.startsWith("mailto")) {
                            window.location.href = link.href
                          } else {
                            window.open(link.href, '_blank', 'noopener,noreferrer')
                          }
                        }}
                      >
                    <div className="flex h-5 w-5 items-center justify-center text-white" aria-hidden="true">
                      {isLucideIcon && Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : link.icon === 'github' ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      ) : link.icon === 'linkedin' ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ) : null}
                    </div>
                        <span className="text-xs font-medium text-white text-center sm:text-sm">
                          {link.name}
                        </span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                      {link.href.startsWith("mailto") ? "Send email" : `Visit ${link.name}`}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </RevealOnView>

        <div className="mt-12 border-t border-white/10 pt-8">
          <RevealOnView as="div" intensity="soft">
            <div className="flex items-center justify-center">
              <p className="text-sm text-white/60">
                © {new Date().getFullYear()} YOUNES SEDKI
              </p>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  )
}
