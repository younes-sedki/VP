import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TweetDetailClient from './tweet-detail-client'
import storage from '@/lib/supabase-storage'

export const dynamic = 'force-dynamic'

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

async function getTweet(id: string): Promise<TweetFromApi | null> {
  try {
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    const adminTweets = adminData.adminTweets || []
    const adminTweet = adminTweets.find((t: any) => t.id === id)
    if (adminTweet) {
      return adminTweet as TweetFromApi
    }

    const userTweet = userTweets.find((t: any) => t.id === id)
    if (userTweet) {
      return userTweet as TweetFromApi
    }

    return null
  } catch (error) {
    console.error('Error fetching tweet:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tweet = await getTweet(params.id)
  
  if (!tweet) {
    return {
      title: 'Tweet not found',
      description: 'This tweet is not available.',
    }
  }

  // Get base URL from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sedkiy.dev')
  
  const tweetUrl = `${baseUrl}/tweet/${tweet.id}`
  
  // Prepare title and description
  const title = tweet.author ? `${tweet.author} on ${tweet.handle || 'Blog'}` : 'Tweet'
  const description = tweet.content 
    ? (tweet.content.length > 160 ? tweet.content.substring(0, 157) + '...' : tweet.content)
    : `A post by ${tweet.author || 'user'}`
  
  // Prepare image
  let imageUrl = `${baseUrl}/og-image.png` // Default OG image
  if (tweet.image && tweet.fileType?.startsWith('image/')) {
    // Use tweet image if it's a full URL, otherwise construct it
    if (tweet.image.startsWith('http://') || tweet.image.startsWith('https://')) {
      imageUrl = tweet.image
    } else if (tweet.image.startsWith('/')) {
      imageUrl = `${baseUrl}${tweet.image}`
    } else if (tweet.image.startsWith('data:image/')) {
      // Data URLs are too long for OG tags, use default
      imageUrl = `${baseUrl}/og-image.png`
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: tweetUrl,
      siteName: 'Younes SEDKI Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: tweetUrl,
    },
  }
}

export default async function TweetDetailPage({ params }: { params: { id: string } }) {
  const tweet = await getTweet(params.id)
  
  if (!tweet) {
    notFound()
  }

  return <TweetDetailClient tweet={tweet} />
}
