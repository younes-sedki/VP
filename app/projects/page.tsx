"use client"

import Link from "next/link"
import { ExternalLink, Github, ArrowLeft } from "lucide-react"
import { useState } from "react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

const allProjects = [
  {
    id: 1,
    title: "DevOps Pipeline",
    description: "Automated CI/CD pipeline with Docker, GitHub Actions, and Nginx for seamless deployments. Includes automated testing, security scanning, and multi-environment deployment strategies.",
    fullDescription: "A comprehensive DevOps solution featuring containerized applications, automated testing pipelines, and production-ready deployment infrastructure.",
    tech: ["Docker", "GitHub Actions", "Nginx", "Linux", "CI/CD"],
    category: "DevOps",
    github: "https://github.com/younes",
    live: "#",
    year: "2024",
  },
  {
    id: 2,
    title: "Auth System",
    description: "Secure authentication system with JWT, bcrypt hashing, and role-based access control. Features password reset, email verification, and session management.",
    fullDescription: "Enterprise-grade authentication with advanced security features including 2FA, OAuth integration, and comprehensive audit logging.",
    tech: ["Node.js", "JWT", "PostgreSQL", "Express", "bcrypt"],
    category: "Backend",
    github: "https://github.com/younes",
    live: "#",
    year: "2024",
  },
  {
    id: 3,
    title: "Server Monitor",
    description: "Real-time server monitoring dashboard with alerts, metrics visualization, and logging. Built with WebSocket for live updates and Redis for caching.",
    fullDescription: "Full-stack monitoring solution with custom metrics, alerting system, and interactive dashboards for infrastructure oversight.",
    tech: ["React", "WebSocket", "Redis", "Grafana", "Node.js"],
    category: "Full-Stack",
    github: "https://github.com/younes",
    live: "#",
    year: "2024",
  },
  {
    id: 4,
    title: "E-commerce Platform",
    description: "Full-featured e-commerce platform with product catalog, shopping cart, and payment integration. Responsive design with advanced search and filtering.",
    fullDescription: "Modern e-commerce solution with inventory management, order tracking, and customer dashboard.",
    tech: ["Next.js", "React", "Stripe", "PostgreSQL", "Tailwind"],
    category: "Full-Stack",
    github: "https://github.com/younes",
    live: "#",
    year: "2024",
  },
  {
    id: 5,
    title: "API Gateway",
    description: "Microservices API gateway with rate limiting, request validation, and request/response logging. Load balancing and caching built-in.",
    fullDescription: "Robust API gateway handling service orchestration, authentication, and traffic management.",
    tech: ["Node.js", "Express", "Redis", "Docker", "Nginx"],
    category: "Backend",
    github: "https://github.com/younes",
    live: "#",
    year: "2023",
  },
  {
    id: 6,
    title: "Real-time Chat App",
    description: "Real-time messaging application with WebSocket support, user presence, and message history. Mobile-responsive design with typing indicators.",
    fullDescription: "Full-featured chat platform with room management, file sharing, and user authentication.",
    tech: ["React", "Node.js", "Socket.io", "MongoDB", "JWT"],
    category: "Full-Stack",
    github: "https://github.com/younes",
    live: "#",
    year: "2023",
  },
]

const categories = ["All", ...Array.from(new Set(allProjects.map(p => p.category)))]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProjects = selectedCategory === "All" 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory)

  return (
    <main className="bg-neutral-950 text-white min-h-screen" id="main-content">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <section className="px-4 pt-8 pb-12" aria-label="Projects header">
        <div className="mx-auto max-w-6xl">
          <RevealOnView as="div" intensity="medium" className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back Home
              </Button>
            </Link>
          </RevealOnView>

          <RevealOnView as="div" intensity="medium">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">PROJECTS</h1>
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-75" />
              </div>
            </div>
            <p className="text-white/60 text-lg">
              A collection of projects showcasing my expertise in full-stack development, DevOps, and system design.
            </p>
          </RevealOnView>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-12" aria-label="Filter projects">
        <div className="mx-auto max-w-6xl">
          <RevealOnView as="div" intensity="medium" className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </RevealOnView>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 pb-20" aria-label="Projects list">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <RevealOnView key={project.id} as="div" intensity="medium" delay={index * 0.05}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-6 transition-all hover:border-white/30 hover:bg-neutral-900/80">
                  {/* Texture background */}
                  <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                    <DotGridShader />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col">
                    {/* Header with category and year */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 mb-2">
                          {project.category}
                        </span>
                        <p className="text-xs text-white/50">{project.year}</p>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/50 transition-colors hover:text-emerald-400 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500 rounded"
                          aria-label={`View ${project.title} on GitHub`}
                        >
                          <Github className="h-5 w-5" aria-hidden="true" />
                        </a>
                        {project.live !== "#" && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 transition-colors hover:text-emerald-400 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500 rounded"
                            aria-label={`View ${project.title} live demo`}
                          >
                            <ExternalLink className="h-5 w-5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Title and description */}
                    <h3 className="mb-2 text-xl font-semibold">{project.title}</h3>
                    <p className="mb-4 flex-1 text-sm text-white/60">{project.description}</p>

                    {/* Tech stack */}
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

          {filteredProjects.length === 0 && (
            <RevealOnView as="div" intensity="medium" className="text-center py-12">
              <p className="text-white/60">No projects found in this category.</p>
            </RevealOnView>
          )}
        </div>
      </section>
    </main>
  )
}
