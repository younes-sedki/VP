'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/npe/admin/login')
  }, [router])

  return null
}
