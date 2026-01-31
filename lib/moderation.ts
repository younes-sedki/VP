/**
 * Content moderation utilities
 * Provides functions for automatic content moderation
 */

import { containsBadWords } from './bad-words'
import storage from './supabase-storage'

/**
 * Moderate a single tweet and delete if inappropriate
 */
export async function moderateTweet(tweetId: string): Promise<{ deleted: boolean; reason?: string }> {
  try {
    // Get the tweet
    const [adminData, userTweets] = await Promise.all([
      storage.getAdminData(),
      storage.getUserTweets()
    ])

    const adminTweets = adminData.adminTweets || []
    const allTweets = [...adminTweets, ...userTweets]
    
    const tweet = allTweets.find(t => t.id === tweetId)
    
    if (!tweet) {
      return { deleted: false, reason: 'Tweet not found' }
    }

    // Check for bad words
    const contentToCheck = `${tweet.content} ${tweet.author} ${tweet.handle}`
    
    if (containsBadWords(contentToCheck)) {
      // Delete the tweet
      if (tweet.id.startsWith('admin-')) {
        await storage.deleteAdminTweet(tweet.id)
      } else {
        await storage.deleteUserTweet(tweet.id)
      }
      
      console.log(`Moderated and deleted tweet ${tweetId} for inappropriate content`)
      return { deleted: true, reason: 'Contains inappropriate words' }
    }

    return { deleted: false }
  } catch (error) {
    console.error(`Error moderating tweet ${tweetId}:`, error)
    return { deleted: false, reason: 'Moderation failed' }
  }
}

/**
 * Moderate all tweets and delete inappropriate ones
 */
export async function moderateAllTweets(): Promise<{ deletedCount: number; deletedTweets: string[] }> {
  try {
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
        // Delete the tweet
        if (tweet.id.startsWith('admin-')) {
          await storage.deleteAdminTweet(tweet.id)
        } else {
          await storage.deleteUserTweet(tweet.id)
        }
        
        deletedCount++
        deletedTweets.push(tweet.id)
        console.log(`Auto-moderated: Deleted tweet ${tweet.id} for inappropriate content`)
      }
    }

    console.log(`Auto-moderation completed: Deleted ${deletedCount} tweets`)
    return { deletedCount, deletedTweets }
  } catch (error) {
    console.error('Error in auto-moderation:', error)
    throw error
  }
}

/**
 * Get moderation status for all tweets
 */
export async function getModerationStatus(): Promise<{
  totalTweets: number;
  flaggedCount: number;
  flaggedTweets: Array<{
    id: string;
    author: string;
    handle: string;
    content: string;
    created_at: string;
    reason: string;
  }>;
}> {
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

    return {
      totalTweets: allTweets.length,
      flaggedCount,
      flaggedTweets
    }
  } catch (error) {
    console.error('Error getting moderation status:', error)
    throw error
  }
}
