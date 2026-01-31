import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { containsBadWords } from '@/lib/bad-words'
import storage from '@/lib/supabase-storage'

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

// Moderate content and delete inappropriate tweets
export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.default)
  
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
          'Retry-After': rateLimit.reset.toString(),
        }
      }
    )
  }

  try {
    const body = await request.json()
    const { adminKey } = body

    // Simple admin key verification (in production, use proper authentication)
    if (adminKey !== process.env.MODERATION_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      )
    }

    // Get all tweets
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    const adminTweets = adminData.adminTweets || []
    const allTweets = [...adminTweets, ...userTweets]

    let deletedCount = 0
    const deletedTweets: string[] = []

    // Check each tweet for bad words
    for (const tweet of allTweets) {
      const contentToCheck = `${tweet.content} ${tweet.author} ${tweet.handle}`
      
      if (containsBadWords(contentToCheck)) {
        console.log(`Deleting tweet with inappropriate content: ${tweet.id}`)
        
        // Delete the tweet
        if (tweet.id.startsWith('admin-')) {
          await storage.deleteAdminTweet(tweet.id)
        } else {
          await storage.deleteUserTweet(tweet.id)
        }
        
        deletedCount++
        deletedTweets.push(tweet.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Content moderation completed. Deleted ${deletedCount} tweets with inappropriate content.`,
      deletedCount,
      deletedTweets
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('Error in content moderation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Content moderation failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// Get moderation status
export async function GET(request: NextRequest) {
  try {
    // Get all tweets
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    const adminTweets = adminData.adminTweets || []
    const allTweets = [...adminTweets, ...userTweets]

    let flaggedCount = 0
    const flaggedTweets: any[] = []

    // Check each tweet for bad words
    for (const tweet of allTweets) {
      const contentToCheck = `${tweet.content} ${tweet.author} ${tweet.handle}`
      
      if (containsBadWords(contentToCheck)) {
        flaggedCount++
        flaggedTweets.push({
          id: tweet.id,
          author: tweet.author,
          handle: tweet.handle,
          content: tweet.content.substring(0, 100) + (tweet.content.length > 100 ? '...' : ''),
          created_at: tweet.created_at,
          reason: 'Contains inappropriate words'
        })
      }
    }

    return NextResponse.json({
      totalTweets: allTweets.length,
      flaggedCount,
      flaggedTweets
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('Error getting moderation status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to get moderation status'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}
