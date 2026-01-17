"use client"

import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"

const skillCategories = [
  {
    category: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "REST APIs" , "Laravel"],
  },
  {
    category: "Tools",
    skills: ["Git", "Linux & Terminal", "Vercel", "Databases (SQL / NoSQL)"],
  },
]

export default function SkillsSection() {
  return (
    <section className="px-4 py-16 lg:py-24" aria-labelledby="skills-heading">
      <div className="mx-auto max-w-6xl">
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2 id="skills-heading" className="text-3xl font-black tracking-tight sm:text-4xl">Skills & Expertise</h2>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            A blend of design thinking, technical skills, and creative problem-solving to bring ideas to life.
          </p>
        </RevealOnView>

        <div className="grid gap-6 md:grid-cols-3">
          {skillCategories.map((category, idx) => (
            <RevealOnView
              key={category.category}
              as="div"
              intensity="soft"
              delay={idx * 0.1}
              className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/40 p-6 backdrop-blur-sm"
            >
              {/* Texture background */}
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div className="relative z-10">
                <h3 className="mb-4 text-lg font-bold text-white">{category.category}</h3>
                <ul className="space-y-2" aria-label={`${category.category} skills`}>
                  {category.skills.map((skill) => (
                    <li key={skill} className="text-sm text-white/70 hover:text-white/90 transition-colors">
                      <span aria-hidden="true">•</span> <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  )
}
