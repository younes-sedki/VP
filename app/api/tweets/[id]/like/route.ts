import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import storage from '@/lib/supabase-storage'

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.likeTweet)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...corsHeaders(),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        }
      }
    )
  }

  try {
    const tweetId = sanitizeInput(params.id)
    
    if (!tweetId || tweetId.length === 0) {
      return NextResponse.json(
        { error: 'Invalid tweet ID' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action === 'unlike' ? 'unlike' : 'like' // Default to 'like'

    // Fetch all tweets to find the one to update
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    const adminTweets = adminData.adminTweets || []
    let tweet = adminTweets.find((t: any) => t.id === tweetId)
    let isAdminTweet = true

    if (!tweet) {
      tweet = userTweets.find((t: any) => t.id === tweetId)
      isAdminTweet = false
    }

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    // Update likes count
    const currentLikes = tweet.likes || 0
    const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1)
    
    // Update the tweet
    const updatedTweet = { ...tweet, likes: newLikes }

    if (isAdminTweet) {
      // Update admin tweet
      const updatedAdminTweets = adminTweets.map((t: any) => 
        t.id === tweetId ? updatedTweet : t
      )
      await storage.setAdminData({
        adminTweets: updatedAdminTweets,
        adminReplies: adminData.adminReplies || []
      })
    } else {
      // Update user tweet
      const updatedUserTweets = userTweets.map((t: any) =>
        t.id === tweetId ? updatedTweet : t
      )
      await storage.setUserTweets(updatedUserTweets)
    }

    return NextResponse.json(
      { 
        success: true, 
        likes: newLikes,
        action 
      },
      {
        headers: {
          ...corsHeaders(),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error updating like:', error)
    return NextResponse.json(
      { error: 'Failed to update like' },
      { 
        status: 500,
        headers: {
          ...corsHeaders(),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        }
      }
    )
  }
}
