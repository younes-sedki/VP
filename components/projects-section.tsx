"use client"

import { ExternalLink, Github, Folder } from "lucide-react"
import RevealOnView from "./reveal-on-view"
import DotGridShader from "./DotGridShader"

const projects = [
  {
    title: "DevOps Pipeline",
    description: "Automated CI/CD pipeline with Docker, GitHub Actions, and Nginx for seamless deployments.",
    tech: ["Docker", "GitHub Actions", "Nginx", "Linux"],
    github: "https://github.com/younes",
    live: "#",
  },
  {
    title: "Auth System",
    description: "Secure authentication system with JWT, bcrypt hashing, and role-based access control.",
    tech: ["Node.js", "JWT", "PostgreSQL", "Express"],
    github: "https://github.com/younes",
    live: "#",
  },
  {
    title: "Server Monitor",
    description: "Real-time server monitoring dashboard with alerts, metrics visualization, and logging.",
    tech: ["React", "WebSocket", "Redis", "Grafana"],
    github: "https://github.com/younes",
    live: "#",
  },
]

export default function ProjectsSection() {
  return (
    <section className="px-4 py-16 lg:py-24" aria-labelledby="projects-heading">
      <RevealOnView as="div" intensity="medium" className="mb-8">
        <div className="flex items-center gap-3">
          <h2 id="projects-heading" className="text-2xl font-bold tracking-tight">PROJECTS</h2>
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
          </div>
        </div>
        <p className="mt-2 text-white/60">Some of my recent work and experiments</p>
      </RevealOnView>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <RevealOnView key={project.title} as="div" intensity="medium" delay={index * 0.1}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-6 transition-all hover:border-white/30">
              {/* Texture background */}
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <Folder className="h-8 w-8 text-emerald-500" />
                  <div className="flex gap-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500 rounded"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <Github className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500 rounded"
                      aria-label={`View ${project.title} live demo`}
                    >
                      <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
                <p className="mb-4 flex-1 text-sm text-white/60">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/70">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnView>
        ))}
      </div>
    </section>
  )
}
