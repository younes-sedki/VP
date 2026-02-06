import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeInput, validateTweetContent, validateCommentContent, validateEmailFormat, validateDisplayName, validateUrl } from '@/lib/validation'
import { containsBadWords } from '@/lib/bad-words'
import { TWEET_CONFIG } from '@/lib/config'
import { ADMIN_CONFIG } from '@/lib/admin-config'
import { getAdminCookieName, verifyAdminSessionToken } from '@/lib/admin-session'
import { validateCsrfToken, verifyOrigin } from '@/lib/csrf'
import storage from '@/lib/supabase-storage'

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function sanitizeImageUrl(url: unknown): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Only allow data URLs (image uploads) or same-origin relative paths
  if (trimmed.startsWith('data:image/')) return trimmed
  if (trimmed.startsWith('/')) return trimmed

  return null
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams
    // Sanitize and validate limit/offset
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')
    
    const limit = limitParam && !isNaN(parseInt(limitParam)) 
      ? Math.min(Math.max(parseInt(limitParam), 1), 100) // Clamp between 1-100
      : 50
    const offset = offsetParam && !isNaN(parseInt(offsetParam))
      ? Math.max(parseInt(offsetParam), 0) // Must be >= 0
      : 0

    // Read both admin and user tweets using storage
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    // Extract admin tweets and admin replies
    const adminTweets = adminData.adminTweets || []
    const adminReplies = adminData.adminReplies || []

    // Merge admin replies into user tweets
    const userTweetsWithAdminReplies = userTweets.map((tweet: any) => {
      const tweetAdminReplies = adminReplies.filter((reply: any) => reply.userTweetId === tweet.id)
      
      if (tweetAdminReplies.length === 0) {
        return tweet
      }

      // Merge admin replies into comments
      const comments = [...(tweet.comments || [])]
      
      // Sort admin replies by commentIndex (null/undefined first, then by index)
      const sortedReplies = [...tweetAdminReplies].sort((a: any, b: any) => {
        if (a.commentIndex === null || a.commentIndex === undefined) return 1
        if (b.commentIndex === null || b.commentIndex === undefined) return -1
        return a.commentIndex - b.commentIndex
      })

      // Process admin replies (including nested replies)
      sortedReplies.forEach((reply: any) => {
        if (reply.commentIndex === null || reply.commentIndex === undefined) {
          // Reply to the tweet itself - append to comments
          comments.push({
            author: reply.author,
            content: reply.content,
            timestamp: reply.timestamp
          })
        } else {
          // Reply to a specific comment or nested reply
          const comment = comments[reply.commentIndex]
          if (comment) {
            if (reply.replyId) {
              // Reply to a specific nested reply by ID
              if (!comment.replies) comment.replies = []
              const replyIndex = comment.replies.findIndex((r: any) => r.id === reply.replyId)
              if (replyIndex !== -1) {
                // Insert after the specific reply
                comment.replies.splice(replyIndex + 1, 0, {
                  author: reply.author,
                  content: reply.content,
                  timestamp: reply.timestamp
                })
              } else {
                // If reply ID not found, append to replies
                comment.replies.push({
                  author: reply.author,
                  content: reply.content,
                  timestamp: reply.timestamp
                })
              }
            } else {
              // Reply to the comment itself - add as nested reply
              if (!comment.replies) comment.replies = []
              comment.replies.push({
                author: reply.author,
                content: reply.content,
                timestamp: reply.timestamp
              })
            }
          }
        }
      })

      return {
        ...tweet,
        comments
      }
    })

    // Merge and sort by created_at (newest first)
    const allTweets = [...adminTweets, ...userTweetsWithAdminReplies].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Apply pagination
    const paginatedTweets = allTweets.slice(offset, offset + limit)

    console.log(`Fetched ${paginatedTweets.length} tweets (${adminTweets.length} admin + ${userTweets.length} user)`)

    return NextResponse.json({
      success: true,
      tweets: paginatedTweets,
      total: allTweets.length,
      limit,
      offset
    }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tweets'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.commentTweet)
  
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
    
    // Sanitize inputs
    const tweetId = sanitizeInput(body.tweetId || '')
    const isAdminTweet = body.isAdmin === true
    const isAdminReply = body.isAdminReply === true // New flag: admin replying to user tweet
    const commentIndex = typeof body.commentIndex === 'number' ? body.commentIndex : null
    const replyId = body.replyId ? sanitizeInput(body.replyId) : null
    
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Sanitize comments if provided (including nested replies)
    let comments = body.comments
    if (comments && Array.isArray(comments)) {
      const makeId = (prefix: string) =>
        `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const sanitizeComment = (comment: any): any => {
        const sanitized: any = {
          // Ensure every comment/reply has a stable id in JSON
          id: sanitizeInput(comment.id || '') || makeId('c'),
          author: sanitizeInput(comment.author || ''),
          content: sanitizeInput(comment.content || ''),
          timestamp: comment.timestamp || new Date().toISOString()
        }
        
        // Include optional fields
        if (comment.avatarImage) sanitized.avatarImage = sanitizeInput(comment.avatarImage)
        
        // Recursively sanitize nested replies
        if (comment.replies && Array.isArray(comment.replies)) {
          sanitized.replies = comment.replies.map(sanitizeComment)
        }
        
        return sanitized
      }
      
      comments = comments.map(sanitizeComment)
      
      // Validate each comment (including nested replies)
      const validateComment = (comment: any): boolean => {
        const validation = validateCommentContent(comment.content)
        if (!validation.valid) return false
        
        if (comment.replies && Array.isArray(comment.replies)) {
          return comment.replies.every(validateComment)
        }
        
        return true
      }
      
      for (const comment of comments) {
        if (!validateComment(comment)) {
          return NextResponse.json(
            { error: 'Invalid comment content' },
            { status: 400, headers: corsHeaders() }
          )
        }
      }
    }

    const likes = typeof body.likes === 'number' ? Math.max(0, Math.floor(body.likes)) : undefined

    // If admin is replying to a user tweet, store reply using storage
    if (isAdminReply && !isAdminTweet && comments && comments.length > 0) {
      const adminData = await storage.getAdminData()

      // Add admin reply with reference to user tweet
      const lastComment = comments[comments.length - 1]
      const newAdminReply: any = {
        userTweetId: tweetId,
        commentIndex: commentIndex,
        author: lastComment.author,
        content: lastComment.content,
        timestamp: lastComment.timestamp
      }
      
      // Include replyId if replying to a specific nested reply
      if (replyId) {
        newAdminReply.replyId = replyId
      }

      await storage.addAdminReply(newAdminReply)
      
      return NextResponse.json({ success: true, adminReply: newAdminReply }, { headers: corsHeaders() })
    }

    // Regular update: Use storage based on tweet type
    if (isAdminTweet) {
      const adminData = await storage.getAdminData()
      const updatedAdminTweets = adminData.adminTweets.map((tweet: any) => {
        if (tweet.id === tweetId) {
          const updatedTweet = { ...tweet }
          if (likes !== undefined) updatedTweet.likes = likes
          if (comments !== undefined) updatedTweet.comments = comments
          updatedTweet.updatedAt = new Date().toISOString()
          return updatedTweet
        }
        return tweet
      })
      
      await storage.setAdminData({ ...adminData, adminTweets: updatedAdminTweets })
    } else {
      const userTweets = await storage.getUserTweets()
      const updatedUserTweets = userTweets.map((tweet: any) => {
        if (tweet.id === tweetId) {
          const updatedTweet = { ...tweet }
          if (likes !== undefined) updatedTweet.likes = likes
          if (comments !== undefined) updatedTweet.comments = comments
          updatedTweet.updatedAt = new Date().toISOString()
          return updatedTweet
        }
        return tweet
      })
      
      await storage.setUserTweets(updatedUserTweets)
    }

    return NextResponse.json({ success: true, likes, comments }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error updating tweet:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update tweet'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PATCH endpoint for editing tweets (within 1 hour)
export async function PATCH(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.commentTweet)
  
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
    
    // Sanitize inputs
    const tweetId = sanitizeInput(body.tweetId || '')
    const newContent = sanitizeInput(body.content || '')
    const isAdminTweet = body.isAdmin === true
    
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!newContent || newContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet content is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Validate tweet content
    const contentValidation = validateTweetContent(newContent, TWEET_CONFIG.MAX_LENGTH)
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Use storage based on whether it's admin or user tweet
    let tweets: any[] = []
    if (isAdminTweet) {
      const adminData = await storage.getAdminData()
      tweets = adminData.adminTweets || []
    } else {
      tweets = await storage.getUserTweets()
    }

    // Find the tweet
    const tweet = tweets.find((t: any) => t.id === tweetId)
    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    // Check if tweet can be edited (within 1 hour)
    const createdAt = new Date(tweet.created_at)
    const now = new Date()
    const timeSinceCreation = now.getTime() - createdAt.getTime()

    if (timeSinceCreation > TWEET_CONFIG.EDIT_TIME_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Tweet can only be edited within 1 hour of creation' },
        { status: 403, headers: corsHeaders() }
      )
    }

    // Update the tweet
    const updatedTweet = {
      ...tweet,
      content: newContent.trim(),
      updatedAt: new Date().toISOString(),
      edited: true,
    }

    // Update in storage
    if (isAdminTweet) {
      const adminData = await storage.getAdminData()
      const updatedAdminTweets = adminData.adminTweets.map((t: any) =>
        t.id === tweetId ? updatedTweet : t
      )
      await storage.setAdminData({ ...adminData, adminTweets: updatedAdminTweets })
    } else {
      const userTweets = await storage.getUserTweets()
      const updatedUserTweets = userTweets.map((t: any) =>
        t.id === tweetId ? updatedTweet : t
      )
      await storage.setUserTweets(updatedUserTweets)
    }

    return NextResponse.json({ success: true, tweet: updatedTweet }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error editing tweet:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to edit tweet'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function POST(request: NextRequest) {
  // CSRF Protection (only for state-changing operations)
  // Note: CSRF validation is optional in development for easier testing
  if (process.env.NODE_ENV === 'production') {
    try {
      if (!(await validateCsrfToken(request))) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403, headers: corsHeaders() }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403, headers: corsHeaders() }
      )
    }

    // Verify origin in production
    if (!verifyOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403, headers: corsHeaders() }
      )
    }
  }

  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.createTweet)
  
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
    
    // Sanitize and validate inputs
    const content = sanitizeInput(body.content || '')
    const isAdminPost = body.isAdmin === true

    const author = sanitizeInput(body.author || '')
    const handle = sanitizeInput(body.handle || '')
    const email = sanitizeInput(body.email || '')
    const avatarImage = body.avatarImage && typeof body.avatarImage === 'string' && body.avatarImage.startsWith('data:image/') ? body.avatarImage : null
    const imageUrl = sanitizeImageUrl(body.imageUrl || body.fileUrl || null)
    const fileType = body.fileType || (imageUrl ? 'image' : null)
    const fileName = sanitizeInput(body.fileName || '')

    // Validate tweet content
    const contentValidation = validateTweetContent(content)
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Additional content moderation check for bad words
    const contentToCheck = `${content} ${author} ${handle}`
    if (containsBadWords(contentToCheck)) {
      return NextResponse.json(
        { error: 'Content contains inappropriate language and cannot be posted.' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Validate email format (format only, no sending)
    if (email) {
      const emailValidation = validateEmailFormat(email)
      if (!emailValidation.valid) {
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400, headers: corsHeaders() }
        )
      }
    }

    // Admin tweets go to storage (requires valid admin session cookie)
    if (isAdminPost) {
      const store = await cookies()
      const token = store.get(getAdminCookieName())?.value
      const ok = verifyAdminSessionToken(token)
      if (!ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
      }

      const newTweet = {
        id: `admin-${Date.now()}`,
        author: ADMIN_CONFIG.name,
        handle: ADMIN_CONFIG.handle.replace(/^@/, ''),
        avatar: 'admin',
        avatarImage: null,
        content,
        image: imageUrl,
        fileType: fileType || null,
        fileName: fileName || null,
        created_at: new Date().toISOString(),
        updatedAt: null,
        likes: 0,
        comments: [],
        retweets: 0,
        replies: 0
      }

      await storage.addAdminTweet(newTweet)
      return NextResponse.json(
        { success: true, tweet: newTweet },
        {
          headers: {
            ...corsHeaders(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          }
        }
      )
    }

    // Validate author (display name) and handle for user posts
    const displayNameValidation = validateDisplayName(author)
    if (!displayNameValidation.valid) {
      return NextResponse.json(
        { error: displayNameValidation.error || 'Invalid display name' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!handle || handle.length < 1 || handle.length > 20) {
      return NextResponse.json(
        { error: 'Handle must be between 1 and 20 characters' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // User tweets go to storage
    const userTweets = await storage.getUserTweets()

    // Create new tweet with unique ID
    const newTweet = {
      id: `user-${Date.now()}`,
      author,
      handle,
      avatar: 'user',
      avatarImage: avatarImage || null,
      content,
      image: imageUrl || null,
      created_at: new Date().toISOString(),
      updatedAt: null,
      likes: 0,
      comments: [],
      retweets: 0,
      replies: 0
    }

    // Add to storage
    await storage.addUserTweet(newTweet)

    return NextResponse.json(
      { success: true, tweet: newTweet },
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
    console.error('Error creating tweet:', error)
    const message = error instanceof Error ? error.message : 'Failed to create tweet'
    // Check if it's a storage configuration error
    if (message.includes('Production mode requires Supabase')) {
      return NextResponse.json(
        { 
          error: 'Storage not configured. Please configure Supabase environment variables in your deployment settings.',
          details: message
        },
        { status: 503, headers: corsHeaders() }
      )
    }
    return NextResponse.json(
      { error: message || 'Failed to create tweet' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// DELETE endpoint for removing tweets
export async function DELETE(request: NextRequest) {
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
        }
      }
    )
  }

  try {
    const body = await request.json()
    
    // Sanitize inputs
    const tweetId = sanitizeInput(body.tweetId || '')
    const isAdmin = body.isAdmin === true
    
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Use storage based on tweet type
    if (isAdmin) {
      await storage.deleteAdminTweet(tweetId)
    } else {
      await storage.deleteUserTweet(tweetId)
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error deleting tweet:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete tweet'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    )
  }
}


