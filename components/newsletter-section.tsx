"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
      // Call API route to subscribe and send welcome email
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to subscribe. Please try again.")
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
        {/* Header with Badge */}
        <RevealOnView as="div" intensity="medium" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 id="newsletter-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">NEWSLETTER</h2>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-blue-500 opacity-75" />
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Stay updated with my latest projects, insights, and learnings delivered to your inbox
          </p>
        </RevealOnView>

        {/* Newsletter Card */}
        <RevealOnView
          as="div"
          intensity="medium"
          className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-8 sm:p-10 backdrop-blur-sm"
        >
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10">
            <div className="mb-8 max-w-2xl">
              <h3 className="mb-3 text-2xl font-bold text-white">Subscribe to stay in the loop</h3>
              <p className="text-base text-white/70">
                Get exclusive insights about my work, projects, lessons learned, and discoveries that improve my craft.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 rounded-xl bg-white/5 px-6 py-4 border border-white/10 max-w-md"
              >
                <CheckCircle2 className="h-6 w-6 text-white/60 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-white">Thank you for subscribing!</p>
                  <p className="text-sm text-white/60">Check your email to confirm.</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 rounded-xl bg-red-500/10 px-6 py-4 border border-red-500/30 max-w-md"
              >
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4 max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex-1 rounded-lg border-2 border-white/20 bg-neutral-900/50 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none transition-colors text-base py-3 px-4"
                    aria-label="Email address for newsletter subscription"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="rounded-lg bg-white text-neutral-950 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold px-8 h-12 whitespace-nowrap"
                    aria-label="Subscribe to newsletter"
                  >
                    {isLoading ? "..." : "Subscribe"}
                  </Button>
                </div>
                <p className="text-sm text-white/40">
                  No spam. Unsubscribe anytime. I respect your privacy.
                </p>
              </form>
            )}
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
