"use client"

import Link from "next/link"
import { ArrowLeft, Github, Linkedin, Mail, ExternalLink, MessageSquare, Smartphone } from "lucide-react"
import { useState } from "react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

const contactMethods = [
  {
    name: "Email",
    icon: Mail,
    value: "younes_sedki@hotmail.fr",
    href: "mailto:younes_sedki@hotmail.fr",
    description: "Send me an email and I'll respond within 24 hours",
  },
  {
    name: "GitHub",
    icon: Github,
    value: "@younes-sedki",
    href: "https://github.com/younes-sedki",
    description: "Check out my projects and contributions",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    value: "@younes-sedki",
    href: "https://linkedin.com/in/younes-sedki",
    description: "Connect with me professionally",
  },
]

const quickLinks = [
  {
    icon: MessageSquare,
    label: "Message",
    href: "mailto:younes_sedki@hotmail.fr",
  },
  {
    icon: Smartphone,
    label: "WhatsApp",
    href: "https://wa.me/212",
  },
  {
    icon: ExternalLink,
    label: "Website",
    href: "https://sedkiy.dev",
  },
]

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    try {
      // In production, you'd send this to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitStatus("success")
      setFormState({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-neutral-950 text-white min-h-screen" id="main-content">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <section className="px-4 pt-8 pb-12" aria-label="Contact header">
        <div className="mx-auto max-w-4xl">
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
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">CONTACT</h1>
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-75" />
              </div>
            </div>
            <p className="text-white/60 text-lg">
              Get in touch with me for opportunities, collaborations, or just to say hello.
            </p>
          </RevealOnView>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="px-4 pb-12" aria-label="Quick contact methods">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <RevealOnView key={method.name} as="div" intensity="medium" delay={index * 0.05}>
                  <a
                    href={method.href}
                    target={method.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={method.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-6 transition-all hover:border-emerald-500/50 hover:bg-neutral-900/80"
                  >
                    {/* Texture background */}
                    <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                      <DotGridShader />
                    </div>

                    <div className="relative z-10 flex flex-col">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                        <IconComponent className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      </div>
                      <h3 className="mb-1 font-semibold text-emerald-400">{method.name}</h3>
                      <p className="text-xs text-white/50 mb-3">{method.value}</p>
                      <p className="text-sm text-white/60 flex-1">{method.description}</p>
                    </div>
                  </a>
                </RevealOnView>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="px-4 pb-20" aria-label="Contact section">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <RevealOnView as="div" intensity="medium">
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8">
                <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                  <DotGridShader />
                </div>

                <div className="relative z-10">
                  <h2 className="mb-2 text-2xl font-bold">Send a Message</h2>
                  <p className="mb-6 text-white/60">Fill out the form below and I'll get back to you soon.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/80">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2 text-white placeholder-white/40 transition-all hover:bg-white/10 focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/80">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2 text-white placeholder-white/40 transition-all hover:bg-white/10 focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2 text-white/80">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleInputChange}
                        placeholder="What is this about?"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2 text-white placeholder-white/40 transition-all hover:bg-white/10 focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-white/80">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleInputChange}
                        placeholder="Your message here..."
                        required
                        rows={5}
                        className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-2 text-white placeholder-white/40 transition-all hover:bg-white/10 focus:border-emerald-500 focus:bg-white/10 focus:outline-none resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>

                    {submitStatus === "success" && (
                      <p className="text-sm text-emerald-400">Message sent successfully!</p>
                    )}
                    {submitStatus === "error" && (
                      <p className="text-sm text-red-400">Error sending message. Please try again.</p>
                    )}
                  </form>
                </div>
              </div>
            </RevealOnView>

            {/* Animated Social Links */}
            <RevealOnView as="div" intensity="medium" delay={0.1} className="flex flex-col gap-6">
              {/* Large Animated Icons */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-12">
                <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                  <DotGridShader />
                </div>

                <div className="relative z-10">
                  <h3 className="mb-8 text-lg font-semibold">Connect with Me</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {contactMethods.map((method, index) => {
                      const IconComponent = method.icon
                      return (
                        <a
                          key={method.name}
                          href={method.href}
                          target={method.href.startsWith("mailto") ? undefined : "_blank"}
                          rel={method.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                          className="flex flex-col items-center justify-center gap-3 group"
                          aria-label={method.name}
                        >
                          <div className="relative">
                            {/* Animated glow background */}
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/40 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                            
                            {/* Icon container with animation */}
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 group-hover:border-emerald-500/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                              <IconComponent className="h-8 w-8 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300" aria-hidden="true" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-white/70 group-hover:text-emerald-400 transition-colors">
                            {method.name}
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Action Links */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-6">
                <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                  <DotGridShader />
                </div>

                <div className="relative z-10">
                  <h3 className="mb-4 text-sm font-semibold text-white/80">Quick Links</h3>
                  <div className="space-y-2">
                    {quickLinks.map((link) => {
                      const IconComponent = link.icon
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10 hover:text-emerald-400 group"
                        >
                          <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                          <span className="text-sm font-medium">{link.label}</span>
                          <ExternalLink className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </RevealOnView>
          </div>
        </div>
      </section>
    </main>
  )
}
