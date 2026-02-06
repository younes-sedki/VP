"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
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
        {/* Newsletter Card */}
        <RevealOnView
          as="div"
          intensity="medium"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 backdrop-blur-sm"
        >
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          {/* Subtle gradient accent */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 p-8 sm:p-10 md:p-12">
            {/* Left: Text */}
            <div className="flex-1 max-w-lg">
              <div className="flex items-center gap-3 mb-3">
                <h2 id="newsletter-heading" className="text-2xl font-bold tracking-tight sm:text-3xl text-white">Stay in the loop</h2>
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-blue-500 opacity-75" />
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Get updates on my latest projects, insights, and discoveries. No spam, unsubscribe anytime.
              </p>
            </div>

            {/* Right: Form / Status */}
            <div className="flex-1 max-w-md w-full">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-5 py-3.5 border border-emerald-500/20"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-white">Subscribed!</p>
                    <p className="text-xs text-white/50">Check your email to confirm.</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-red-500/10 px-5 py-3.5 border border-red-500/20"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-0 focus:outline-none transition-colors text-sm h-11 px-4"
                      aria-label="Email address for newsletter subscription"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="rounded-xl bg-white text-neutral-950 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold px-6 h-11 text-sm whitespace-nowrap"
                      aria-label="Subscribe to newsletter"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Subscribing...
                        </>
                      ) : "Subscribe"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
