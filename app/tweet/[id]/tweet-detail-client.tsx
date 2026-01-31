'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Heart, Share2, Crown } from 'lucide-react'
import TwitterPostFeed from '@/components/twitter-post-feed'
import TwitterAvatar from '@/components/twitter-avatar'
import { formatDistanceToNowStrict } from 'date-fns'
import { BadgeCheck } from 'lucide-react'
import { ADMIN_CONFIG } from '@/lib/admin-config'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
  likedByAdmin?: boolean
  edited?: boolean
  updatedAt?: string
}

export default function TweetDetailClient({ tweet }: { tweet: TweetFromApi }) {
  const router = useRouter()
  
  const createdAt = formatDistanceToNowStrict(new Date(tweet.created_at), { addSuffix: true })
  const isAdmin = tweet.avatar === 'admin'

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
        {/* Enhanced Profile Header */}
        <div className="border-b border-white/10 px-6 py-6 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-start gap-4">
            <TwitterAvatar
              username={tweet.handle || tweet.author}
              avatar={tweet.avatar}
              avatarImage={tweet.avatarImage}
              size="large"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">
                  {tweet.author}
                </h2>
                {isAdmin && (
                  <BadgeCheck 
                    className="w-5 h-5 text-emerald-400 fill-emerald-400 flex-shrink-0" 
                    aria-label="Verified admin"
                  />
                )}
                {tweet.likedByAdmin && !isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Crown 
                          className="w-4 h-4 text-emerald-400 fill-emerald-400/20" 
                          aria-label="Liked by admin"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10 text-xs">
                      Liked by Younes SEDKI
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-white/60 text-sm mt-0.5">
                @{tweet.handle || tweet.author}
              </p>
              
              {/* Date and Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Heart className="w-4 h-4" />
                  <span>{tweet.likes || 0} likes</span>
                </div>
                {tweet.edited && (
                  <span className="text-white/40 text-xs">· Edited</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tweet Content - TwitterPostFeed will handle the content display without duplicate header */}
        <TwitterPostFeed data={tweet} isDetailPage={true} />
      </section>
    </main>
  )
}
