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
    <section className="px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Let&apos;s Connect
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            English & French — choose what fits you best.
          </p>
        </RevealOnView>

        <RevealOnView
          as="div"
          intensity="hero"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8"
        >
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-2">
            {/* EN */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                1-Month Internship — 23/02/2026 to 22/03/2026
              </div>

              <h3 className="text-xl font-bold mb-3">
                Internship Availability
              </h3>

              <p className="max-w-lg text-white/60 leading-relaxed mb-8 text-sm">
                I am seeking a 1-month internship (stage) scheduled from
                <span className="text-white"> 23 February 2026 </span>
                to
                <span className="text-white"> 22 March 2026</span>.
                This internship will allow me to apply my academic knowledge
                and gain practical experience in a professional environment.
              </p>
            </div>

            {/* FR */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 mb-4">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                Stage d’un mois — 23/02/2026 au 22/03/2026
              </div>

              <h3 className="text-xl font-bold mb-3">
                Disponibilité pour un stage
              </h3>

              <p className="max-w-lg text-white/60 leading-relaxed mb-8 text-sm">
                Je suis à la recherche d’un stage d’un mois prévu du
                <span className="text-white"> 23 février 2026 </span>
                au
                <span className="text-white"> 22 mars 2026</span>.
                Ce stage me permettra de mettre en pratique mes connaissances
                dans un cadre professionnel.
              </p>
            </div>

            {/* SMALL CONTACT LINKS */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {contactLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-white">
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
