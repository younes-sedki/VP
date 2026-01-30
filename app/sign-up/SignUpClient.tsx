'use client'

import { useSearchParams } from 'next/navigation'
import { AuthProvider } from '@/lib/auth-context'
import { SignInForm } from '@/components/sign-in-form'

export function SignUpClient() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/blog'

  return (
    <AuthProvider>
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          <section className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Create your account.
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-xl">
              Use the twitter-clone style fields (display name, @username, email, password). After
              creating your account, you’ll go back automatically.
            </p>
          </section>

          <SignInForm redirectTo={redirectTo} />
        </div>
      </main>
    </AuthProvider>
  )
}

