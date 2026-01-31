import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import storage from '@/lib/supabase-storage'
import { getAdminCookieName, verifyAdminSessionToken } from '@/lib/admin-session'

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
  { params }: { params: Promise<{ id: string }> | { id: string } }
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

  let tweetId: string | undefined
  try {
    // Handle both Promise and direct params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params
    tweetId = sanitizeInput(resolvedParams.id)
    
    if (!tweetId || tweetId.length === 0) {
      return NextResponse.json(
        { error: 'Invalid tweet ID' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action === 'unlike' ? 'unlike' : 'like' // Default to 'like'

    // Check if requester is admin
    const cookieStore = await cookies()
    const adminToken = cookieStore.get(getAdminCookieName())?.value
    const isAdmin = verifyAdminSessionToken(adminToken)

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
    
    // Track admin likes for user tweets
    let likedByAdmin = false
    if (!isAdminTweet && isAdmin) {
      // Admin is liking/unliking - set based on action
      likedByAdmin = action === 'like'
    } else if (!isAdminTweet) {
      // Not admin and not admin tweet - preserve existing status
      likedByAdmin = tweet.likedByAdmin || false
    }
    
    // Use direct Supabase update for better performance and reliability
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.TWEET_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.TWEET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      // Use Supabase directly for update
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const tableName = isAdminTweet ? 'admin_tweets' : 'user_tweets'
      
      const updateData: any = { likes: newLikes }
      
      // Only add likedByAdmin if it's a user tweet and column exists
      // Gracefully handle if column doesn't exist yet (migration not run)
      if (!isAdminTweet) {
        try {
          // Try to update with likedByAdmin
          const updateWithAdminLike = { ...updateData, likedByAdmin }
          const { error: updateError } = await supabase
            .from(tableName)
            .update(updateWithAdminLike)
            .eq('id', tweetId)
          
          if (updateError) {
            // If column doesn't exist, fall back to just updating likes
            if (updateError.message?.includes('likedByAdmin') || updateError.message?.includes('schema cache')) {
              console.warn('likedByAdmin column not found, updating likes only. Please run migration: supabase-migration-admin-likes.sql')
              const { error: likesOnlyError } = await supabase
                .from(tableName)
                .update(updateData)
                .eq('id', tweetId)
              
              if (likesOnlyError) {
                throw new Error(`Failed to update likes: ${likesOnlyError.message}`)
              }
            } else {
              throw new Error(`Failed to update likes: ${updateError.message}`)
            }
          }
        } catch (err) {
          // Fallback: try updating just likes if likedByAdmin fails
          const { error: likesOnlyError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', tweetId)
          
          if (likesOnlyError) {
            console.error('Supabase update error:', likesOnlyError)
            throw new Error(`Failed to update likes: ${likesOnlyError.message}`)
          }
        }
      } else {
        // Admin tweet - just update likes
        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', tweetId)
        
        if (error) {
          console.error('Supabase update error:', error)
          throw new Error(`Failed to update likes: ${error.message}`)
        }
      }
    } else {
      // Fallback to storage methods (for local development)
      const updatedTweet: any = { ...tweet, likes: newLikes }
      if (!isAdminTweet) {
        updatedTweet.likedByAdmin = likedByAdmin
      }

      if (isAdminTweet) {
        const updatedAdminTweets = adminTweets.map((t: any) => 
          t.id === tweetId ? updatedTweet : t
        )
        await storage.setAdminData({
          adminTweets: updatedAdminTweets,
          adminReplies: adminData.adminReplies || []
        })
      } else {
        const updatedUserTweets = userTweets.map((t: any) =>
          t.id === tweetId ? updatedTweet : t
        )
        await storage.setUserTweets(updatedUserTweets)
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        likes: newLikes,
        likedByAdmin: !isAdminTweet ? likedByAdmin : undefined,
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to update like'
    console.error('Error details:', {
      tweetId: tweetId || 'unknown',
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to update like',
        details: errorMessage 
      },
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
