'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import TwitterPostFeed from '@/components/twitter-post-feed'

type TweetFromApi = {
  id: string
  author: string
  handle: string
  avatar: string
  avatarImage?: string | null
  content: string
  image?: string | null
  images?: string[] | null
  fileType?: string | null
  fileName?: string | null
  created_at: string
  likes: number
  edited?: boolean
  updatedAt?: string
}

export default function TweetDetailClient({ tweet }: { tweet: TweetFromApi }) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 bg-neutral-950/80 backdrop-blur-sm z-10">
        <button
          onClick={() => router.push('/blog')}
          className="rounded-full p-2 hover:bg-white/10 transition-colors"
          aria-label="Back to blog"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Post</h1>
      </header>

      <section className="max-w-2xl mx-auto border-x border-white/10 min-h-[60vh]">
        <TwitterPostFeed data={tweet} isDetailPage={true} />
      </section>
    </main>
  )
}
