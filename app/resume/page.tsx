"use client"

import Link from "next/link"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

const experience = [
  {
    title: "Full-Stack Developer",
    company: "Tech Startup",
    period: "2024 - Present",
    description: "Building scalable web applications with React, Next.js, and Node.js. Implementing real-time features and optimizing database queries for high-performance systems.",
    achievements: [
      "Reduced API response time by 40% through query optimization",
      "Implemented real-time messaging system handling 5K+ concurrent users",
      "Led migration from monolith to microservices architecture",
    ],
  },
  {
    title: "Backend Engineer",
    company: "Digital Agency",
    period: "2023 - 2024",
    description: "Developed REST APIs and microservices using Node.js and Express. Managed PostgreSQL databases and implemented caching strategies with Redis.",
    achievements: [
      "Designed and deployed CI/CD pipeline reducing deployment time by 60%",
      "Implemented authentication system with JWT and 2FA",
      "Created comprehensive API documentation with OpenAPI",
    ],
  },
  {
    title: "Junior Developer",
    company: "Web Development Agency",
    period: "2022 - 2023",
    description: "Contributed to multiple client projects using React and vanilla JavaScript. Collaborated with design team to implement responsive UI designs.",
    achievements: [
      "Built 15+ responsive web applications from design to deployment",
      "Improved code quality through implementation of automated testing",
      "Mentored 2 junior developers on React best practices",
    ],
  },
]

const education = [
  {
    degree: "Diploma in Advanced Web Development",
    institution: "ISTA Rabat",
    period: "2023 - Present",
    details: "Specializing in Full-Stack Development with focus on modern frameworks and DevOps practices.",
  },
  {
    degree: "Certification in Cloud Architecture",
    institution: "AWS Academy",
    period: "2023",
    details: "Completed AWS Solutions Architect Associate certification covering cloud infrastructure design.",
  },
]

const skills = {
  "Frontend": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS", "JavaScript", "Vue.js"],
  "Backend": ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs"],
  "DevOps": ["Docker", "GitHub Actions", "CI/CD", "Linux", "Nginx", "AWS", "Vercel"],
  "Tools": ["Git", "VS Code", "Figma", "Postman", "Docker Desktop", "DBeaver"],
}

const certifications = [
  {
    name: "AWS Solutions Architect Associate",
    issuer: "Amazon Web Services",
    date: "2023",
  },
  {
    name: "Full-Stack JavaScript Developer",
    issuer: "Udemy",
    date: "2023",
  },
]

export default function ResumePage() {
  return (
    <main className="bg-neutral-950 text-white min-h-screen" id="main-content">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <section className="px-4 pt-8 pb-12" aria-label="Resume header">
        <div className="mx-auto max-w-4xl">
          <RevealOnView as="div" intensity="medium" className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back Home
              </Button>
            </Link>
          </RevealOnView>

          <RevealOnView as="div" intensity="medium" className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">RESUME</h1>
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-75" />
                </div>
              </div>
              <p className="text-white/60 text-lg">
                Full-Stack Developer & DevOps Engineer
              </p>
            </div>
            <Button asChild className="gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600">
              <a href="/resume.pdf" download>
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </RevealOnView>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20" aria-label="Resume content">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Experience */}
          <RevealOnView as="div" intensity="medium">
            <div className="rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8">
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10">
                <h2 className="mb-8 text-2xl font-bold flex items-center gap-3">
                  <span className="text-emerald-400">01</span>
                  Experience
                </h2>

                <div className="space-y-8">
                  {experience.map((exp, index) => (
                    <div
                      key={index}
                      className="relative border-l-2 border-emerald-500/30 pl-6"
                    >
                      <div className="absolute -left-3 top-0 h-4 w-4 rounded-full bg-emerald-500/50 border-2 border-neutral-950" />

                      <div className="flex flex-col gap-2 mb-4">
                        <h3 className="text-lg font-semibold">{exp.title}</h3>
                        <p className="text-emerald-400 font-medium">{exp.company}</p>
                        <time className="text-xs text-white/50">{exp.period}</time>
                      </div>

                      <p className="text-white/70 text-sm mb-4">{exp.description}</p>

                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-3 text-sm text-white/60">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnView>

          {/* Skills */}
          <RevealOnView as="div" intensity="medium" delay={0.1}>
            <div className="rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8">
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10">
                <h2 className="mb-8 text-2xl font-bold flex items-center gap-3">
                  <span className="text-emerald-400">02</span>
                  Skills
                </h2>

                <div className="grid gap-8 md:grid-cols-2">
                  {Object.entries(skills).map(([category, skillList]) => (
                    <div key={category}>
                      <h3 className="mb-4 font-semibold text-emerald-400">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/70 border border-white/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnView>

          {/* Education */}
          <RevealOnView as="div" intensity="medium" delay={0.2}>
            <div className="rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8">
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10">
                <h2 className="mb-8 text-2xl font-bold flex items-center gap-3">
                  <span className="text-emerald-400">03</span>
                  Education
                </h2>

                <div className="space-y-8">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="relative border-l-2 border-emerald-500/30 pl-6"
                    >
                      <div className="absolute -left-3 top-0 h-4 w-4 rounded-full bg-emerald-500/50 border-2 border-neutral-950" />

                      <div className="flex flex-col gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{edu.degree}</h3>
                        <p className="text-emerald-400 font-medium">{edu.institution}</p>
                        <time className="text-xs text-white/50">{edu.period}</time>
                      </div>

                      <p className="text-white/60 text-sm">{edu.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnView>

          {/* Certifications */}
          <RevealOnView as="div" intensity="medium" delay={0.3}>
            <div className="rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8">
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10">
                <h2 className="mb-8 text-2xl font-bold flex items-center gap-3">
                  <span className="text-emerald-400">04</span>
                  Certifications
                </h2>

                <div className="space-y-4">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                    >
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-white/60">{cert.issuer}</p>
                      <time className="text-xs text-white/50">{cert.date}</time>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>
    </main>
  )
}
