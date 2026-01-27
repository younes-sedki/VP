"use client"

import { Github, Gitlab, Mail, Linkedin } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"

const contactLinks = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:younes_sedki@hotmail.fr",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/younes-sedki",
  },
  {
    name: "GitLab",
    icon: Gitlab,
    href: "https://gitlab.com/younes-sedki",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/in/younes-sedki",
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
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3" role="list">
              {contactLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500"
                    aria-label={`${link.name} - ${link.href.startsWith("mailto") ? "Send email" : "Open in new tab"}`}
                    role="listitem"
                  >
                    <div className="flex h-5 w-5 items-center justify-center text-white" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-white text-center sm:text-sm">
                      {link.name}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </RevealOnView>

        <div className="mt-12 border-t border-white/10 pt-8">
          <RevealOnView as="div" intensity="soft">
            <div className="flex items-center justify-center">
              <p className="text-sm text-white/60">
                © 2025 YOUNES SEDKI
              </p>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  )
}
