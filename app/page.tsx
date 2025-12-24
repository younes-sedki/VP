import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"

import AnimatedHeading from "@/components/animated-heading"
import RevealOnView from "@/components/reveal-on-view"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"
import TerminalAnimation from "@/components/terminal-animation"
import ProjectsSection from "@/components/projects-section"

// ===========================================
// SECTION VISIBILITY CONFIG
// Set to false to hide a section
// ===========================================
const SHOW_SECTIONS = {
  projects: false, // Set to false to hide Projects
  skills: true, // Set to false to hide Skills
  contact: true, // Set to false to hide Contact
}

export default function Page() {
  return (
    <main className="bg-neutral-950 text-white">
      {/* HERO: full-viewport section */}
      <section className="px-4 pt-4 pb-16 lg:pb-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
          {/* LEFT: sticky and full height */}
          <aside className="lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]">
            <RevealOnView
              as="div"
              intensity="hero"
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8"
              staggerChildren
            >
              {/* Texture background */}
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>
              <div>
                <div className="mb-8 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-extrabold tracking-tight">YOUNES</div>
                    <div className="relative">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <div
                        className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500 opacity-75"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Headline with intro blur effect */}
                <AnimatedHeading
                  className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl"
                  lines={["I build what", "people need"]}
                />

                <p className="mt-4 max-w-[42ch] text-lg text-white/70 tabular-nums">
                  I&apos;m a second-year student at the Institut Spécialisé de Technologie Appliquée de Hay Riad, Rabat
                  (ISTA). I&apos;m a Full-Stack Developer with a strong interest in infrastructure, DevOps, and
                  security. Continuously learning and improving through hands-on projects and practical experiments.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="mailto:younes_sedki@hotmail.fr">
                      DM ME
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {/* <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-transparent hover:bg-white/10"
                  >
                    <a href="/resume.pdf" download>
                      <Download className="mr-2 h-4 w-4" />
                      Resume
                    </a>
                  </Button> */}       
                </div>
              </div>
            </RevealOnView>
          </aside>

          {/* Terminal container with fixed height on mobile to prevent layout shifts */}
          <div className="h-[520px] sm:h-[700px] lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]">
            <RevealOnView as="div" intensity="hero" delay={0.2} className="h-full">
              <TerminalAnimation />
            </RevealOnView>
          </div>
        </div>
      </section>

      {SHOW_SECTIONS.projects && <ProjectsSection />}
      {SHOW_SECTIONS.skills && <SkillsSection />}
      {SHOW_SECTIONS.contact && <ContactSection />}
    </main>
  )
}