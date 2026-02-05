"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const newsletterTopics = [
  {
    title: "Project Progress Reports",
    description: "Weekly updates on challenges overcome and milestones reached",
  },
  {
    title: "Work Showcases",
    description: "Recently completed projects with behind-the-scenes insights",
  },
  {
    title: "Work-in-Progress Previews",
    description: "Exclusive early looks at what I'm currently developing",
  },
  {
    title: "Skills & Tools Updates",
    description: "New techniques and tools discovering that improve my work",
  },
  {
    title: "Industry Observations",
    description: "Reflections on trends and changes in the field",
  },
  {
    title: "Wins & Lessons",
    description: "Celebrating successes and sharing valuable learnings",
  },
]

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Insert email into Supabase newsletter_subscribers table
      const { error: supabaseError } = await supabase
        .from("newsletter_subscribers")
        .insert([
          {
            email: email.toLowerCase().trim(),
            is_active: true,
          },
        ])

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          // Unique constraint violation - email already subscribed
          setError("This email is already subscribed")
        } else {
          setError("Failed to subscribe. Please try again.")
          console.error("Supabase error:", supabaseError)
        }
        setIsLoading(false)
        return
      }

      setSubmitted(true)
      setEmail("")

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Subscription error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="px-4 py-16 lg:py-24" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <RevealOnView as="div" intensity="soft" className="mb-12">
          <h2
            id="newsletter-heading"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Weekly Newsletter
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Stay updated with my latest projects, insights, and learnings delivered straight to your inbox every week.
          </p>
        </RevealOnView>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Newsletter Topics */}
          {newsletterTopics.map((topic, idx) => (
            <RevealOnView
              key={topic.title}
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
                <h3 className="mb-2 text-sm font-bold text-white">{topic.title}</h3>
                <p className="text-xs text-white/60">{topic.description}</p>
              </div>
            </RevealOnView>
          ))}
        </div>

        {/* Subscription Section */}
        <div className="mt-12">
          <RevealOnView
            as="div"
            intensity="soft"
            className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/40 p-6 sm:p-8 backdrop-blur-sm"
          >
            {/* Texture background */}
            <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
              <DotGridShader />
            </div>

            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-bold text-white">Subscribe to my newsletter</h3>
                <p className="text-sm text-white/60">
                  Get exclusive insights about my work, projects, and lessons learned.
                </p>
              </div>

              {submitted ? (
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-white/60 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-white">Thank you for subscribing!</p>
                    <p className="text-xs text-white/60">Check your email to confirm.</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 border border-red-500/30">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="flex-1 rounded-lg border-2 border-white/20 bg-neutral-900/50 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none transition-colors"
                      aria-label="Email address for newsletter subscription"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="rounded-lg bg-white text-neutral-950 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium px-6"
                      aria-label="Subscribe to newsletter"
                    >
                      {isLoading ? "..." : "Subscribe"}
                    </Button>
                  </div>
                  <p className="text-xs text-white/40">
                    No spam. Unsubscribe anytime. I respect your inbox.
                  </p>
                </form>
              )}
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  )
}
