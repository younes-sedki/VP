"use client"

import { Github, Gitlab, Mail, Linkedin } from "lucide-react"
import { useEffect, useState } from "react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

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
    href: "https://www.linkedin.com/in/younes-sedki",
  },
]

export default function ContactSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Let&apos;s Connect</h2>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Reach out through any of these channels. I&apos;m always interested in new projects and collaborations.
          </p>
        </RevealOnView>

        <RevealOnView as="div" intensity="soft" className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
          {/* Texture background with dots */}
          {mounted && (
            <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
              <DotGridShader />
            </div>
          )}

          <div className="relative z-10 p-8 sm:p-12">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for a 1-Month Internship
              </div>
              <h3 className="mb-3 text-2xl font-bold">Get in Touch</h3>
              <p className="text-white/60 max-w-lg leading-relaxed">
              I&apos;am currently looking for a 1-month internship (stage) to learn, contribute where possible, and gain practical experience in web development and infrastructure fundamentals.             
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
              {contactLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="group flex items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 p-4 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-white">{link.name}</span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* CTA Button */}
          </div>
        </RevealOnView>

        {/* Footer */}
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