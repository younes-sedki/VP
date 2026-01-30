import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import storage from '@/lib/supabase-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.default)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.default.max.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        }
      }
    )
  }

  try {
    // Sanitize tweet ID
    const id = sanitizeInput(params.id)
    
    if (!id || id.length === 0) {
      return NextResponse.json(
        { error: 'Invalid tweet ID' },
        { status: 400 }
      )
    }

    // Read both admin and user tweets using storage
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    // Extract admin tweets and admin replies
    const adminTweets = adminData.adminTweets || []
    const adminReplies = adminData.adminReplies || []

    const adminTweet = adminTweets.find((t: any) => t.id === id)
    if (adminTweet) {
      return NextResponse.json({ success: true, tweet: adminTweet, isAdmin: true })
    }

    const userTweet = userTweets.find((t: any) => t.id === id)
    if (userTweet) {
      // Merge admin replies into user tweet
      const tweetAdminReplies = adminReplies.filter((reply: any) => reply.userTweetId === id)
      
      if (tweetAdminReplies.length > 0) {
        const comments = [...(userTweet.comments || [])]
        
        // Sort admin replies by commentIndex
        const sortedReplies = [...tweetAdminReplies].sort((a: any, b: any) => {
          if (a.commentIndex === null || a.commentIndex === undefined) return 1
          if (b.commentIndex === null || b.commentIndex === undefined) return -1
          return a.commentIndex - b.commentIndex
        })

        // Insert admin replies after their corresponding comments
        sortedReplies.forEach((reply: any) => {
          if (reply.commentIndex !== null && reply.commentIndex !== undefined) {
            const insertIndex = Math.min(reply.commentIndex + 1, comments.length)
            comments.splice(insertIndex, 0, {
              author: reply.author,
              content: reply.content,
              timestamp: reply.timestamp
            })
          } else {
            comments.push({
              author: reply.author,
              content: reply.content,
              timestamp: reply.timestamp
            })
          }
        })

        return NextResponse.json({ 
          success: true, 
          tweet: { ...userTweet, comments }, 
          isAdmin: false 
        })
      }

      return NextResponse.json({ success: true, tweet: userTweet, isAdmin: false })
    }

    return NextResponse.json({ success: false, error: 'Tweet not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching tweet by id:', error)
    return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 500 })
  }
}

