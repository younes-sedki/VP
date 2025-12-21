"use client"

import { Github, Gitlab, Mail, Linkedin } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
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
  return (
    <section className="px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Let&apos;s Connect</h2>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Reach out through any of these channels. I&apos;m always interested in new projects and collaborations.
          </p>
        </RevealOnView>

        <RevealOnView as="div" intensity="soft" className="relative overflow-hidden rounded-3xl border border-white/10">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-emerald-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

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
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-all duration-300 hover:border-white/20 hover:scale-[1.02]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white group-hover:bg-white/15 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-white">{link.name}</span>
                      <span className="text-xs text-white/50">Connect with me</span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* CTA Button */}
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
