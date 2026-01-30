"use client"

import { AuthProvider } from "@/lib/auth-context"
import { SignInForm } from "@/components/sign-in-form"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/blog"

  return (
    <AuthProvider>
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          <section className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Welcome back.
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-xl">
              Use a twitter-style form with display name, @username, email, and password to create
              your demo account. Then join the tweet section in the blog to like and comment.
            </p>
          </section>

          <SignInForm redirectTo={redirectTo} />
        </div>
      </main>
    </AuthProvider>
  )
}

