"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid unsubscribe link. Missing token or email.")
    }
  }, [token, email])

  const handleUnsubscribe = async () => {
    if (!token || !email) return

    setStatus("loading")

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus("success")
        setMessage("You have been successfully unsubscribed.")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to unsubscribe. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-white/10 bg-neutral-900/60 p-8 text-center backdrop-blur-sm">
        {status === "success" ? (
          <>
            <div className="mb-4 text-4xl">✓</div>
            <h1 className="mb-3 text-xl font-bold text-white">Unsubscribed</h1>
            <p className="mb-6 text-sm text-white/60">{message}</p>
            <a
              href="/"
              className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90"
            >
              Back to Website
            </a>
          </>
        ) : status === "error" ? (
          <>
            <div className="mb-4 text-4xl">✕</div>
            <h1 className="mb-3 text-xl font-bold text-white">Something went wrong</h1>
            <p className="mb-6 text-sm text-white/60">{message}</p>
            <a
              href="/"
              className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90"
            >
              Back to Website
            </a>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-xl font-bold text-white">Unsubscribe</h1>
            <p className="mb-2 text-sm text-white/60">
              Are you sure you want to unsubscribe?
            </p>
            {email && (
              <p className="mb-6 text-sm font-medium text-white/80">{email}</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleUnsubscribe}
                disabled={status === "loading"}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90 disabled:opacity-50"
              >
                {status === "loading" ? "Processing..." : "Yes, unsubscribe"}
              </button>
              <a
                href="/"
                className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                No, go back
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-neutral-950">
          <p className="text-white/60">Loading...</p>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
