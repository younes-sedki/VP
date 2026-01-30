// Supabase-based storage system for production deployment
// Falls back to local file system for development

import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

// Types for tweet data
export interface AdminTweet {
  id: string
  author: string
  handle: string
  avatar: string
  avatarImage?: string | null
  content: string
  image?: string | null
  created_at: string
  updatedAt?: string | null
  likes?: number
  comments?: any[]
  retweets?: number
  replies?: number
}

export interface UserTweet {
  id: string
  author: string
  handle: string
  avatar: string
  avatarImage?: string
  content: string
  image?: string | null
  created_at: string
  updatedAt?: string | null
  likes?: number
  comments?: any[]
  retweets?: number
  replies?: number
}

export interface AdminReply {
  id?: string
  userTweetId: string
  commentIndex?: number | null
  replyId?: string
  author: string
  content: string
  timestamp: string
}

export interface AdminData {
  adminTweets: AdminTweet[]
  adminReplies: AdminReply[]
}

// Check if we're in production and have Supabase available
const isProduction = process.env.NODE_ENV === 'production'
// Support both prefixed (TWEET_) and non-prefixed variable names
const supabaseUrl = process.env.TWEET_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.TWEET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const hasSupabase = !!(supabaseUrl && supabaseServiceKey)

// In production, file system is read-only, so we MUST use Supabase
const canUseLocalStorage = !isProduction

// Initialize Supabase client
let supabase: any = null

if (hasSupabase) {
  try {
    supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!
    )
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
  }
}

// Supabase storage functions
async function getSupabaseData(tableName: string): Promise<any[]> {
  if (!supabase) return []
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Supabase get error for ${tableName}:`, error)
    return []
  }
}

async function setSupabaseData(tableName: string, data: any[]): Promise<boolean> {
  if (!supabase) return false
  
  try {
    // Delete existing data
    await supabase.from(tableName).delete().neq('id', 'impossible-id')
    
    // Insert new data
    const { error } = await supabase.from(tableName).insert(data)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error(`Supabase set error for ${tableName}:`, error)
    return false
  }
}

async function addSupabaseRecord(tableName: string, record: any): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { error } = await supabase.from(tableName).insert(record)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error(`Supabase add error for ${tableName}:`, error)
    return false
  }
}

async function deleteSupabaseRecord(tableName: string, id: string): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error(`Supabase delete error for ${tableName}:`, error)
    return false
  }
}

// Local file system fallback functions
async function getLocalData(fileName: string): Promise<any> {
  const filePath = path.join(process.cwd(), 'public', fileName)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error)
    return fileName === 'admin-tweets.json' 
      ? { adminTweets: [], adminReplies: [] }
      : []
  }
}

async function setLocalData(fileName: string, data: any): Promise<void> {
  // Prevent file writes in production (read-only file system)
  if (isProduction) {
    throw new Error(
      'Cannot write to file system in production. Please configure Supabase environment variables: ' +
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  
  const filePath = path.join(process.cwd(), 'public', fileName)
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error)
    throw error
  }
}

// Public storage interface
export const storage = {
  // Admin tweets
  async getAdminData(): Promise<AdminData> {
    if (hasSupabase) {
      const [adminTweets, adminReplies] = await Promise.all([
        getSupabaseData('admin_tweets'),
        getSupabaseData('admin_replies')
      ])
      return { adminTweets, adminReplies }
    }
    if (!canUseLocalStorage) {
      console.error('Production mode requires Supabase. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return { adminTweets: [], adminReplies: [] }
    }
    return getLocalData('admin-tweets.json')
  },

  async setAdminData(data: AdminData): Promise<void> {
    if (hasSupabase) {
      const success1 = await setSupabaseData('admin_tweets', data.adminTweets)
      const success2 = await setSupabaseData('admin_replies', data.adminReplies)
      if (!success1 || !success2) throw new Error('Failed to save to Supabase')
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      await setLocalData('admin-tweets.json', data)
    }
  },

  // User tweets
  async getUserTweets(): Promise<UserTweet[]> {
    if (hasSupabase) {
      return await getSupabaseData('user_tweets')
    }
    if (!canUseLocalStorage) {
      console.error('Production mode requires Supabase. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return []
    }
    return getLocalData('user-tweets.json')
  },

  async setUserTweets(tweets: UserTweet[]): Promise<void> {
    if (hasSupabase) {
      const success = await setSupabaseData('user_tweets', tweets)
      if (!success) throw new Error('Failed to save to Supabase')
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      await setLocalData('user-tweets.json', tweets)
    }
  },

  // Helper methods for specific operations
  async addAdminTweet(tweet: AdminTweet): Promise<void> {
    if (hasSupabase) {
      const success = await addSupabaseRecord('admin_tweets', tweet)
      if (!success) throw new Error('Failed to add admin tweet to Supabase')
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      const data = await this.getAdminData()
      data.adminTweets.push(tweet)
      await this.setAdminData(data)
    }
  },

  async addUserTweet(tweet: UserTweet): Promise<void> {
    if (hasSupabase) {
      const success = await addSupabaseRecord('user_tweets', tweet)
      if (!success) throw new Error('Failed to add user tweet to Supabase')
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      const tweets = await this.getUserTweets()
      tweets.push(tweet)
      await this.setUserTweets(tweets)
    }
  },

  async deleteAdminTweet(tweetId: string): Promise<void> {
    if (hasSupabase) {
      await deleteSupabaseRecord('admin_tweets', tweetId)
      // Also delete related admin replies
      const { error } = await supabase
        .from('admin_replies')
        .delete()
        .eq('userTweetId', tweetId)
      if (error) throw error
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      const data = await this.getAdminData()
      data.adminTweets = data.adminTweets.filter(t => t.id !== tweetId)
      data.adminReplies = data.adminReplies.filter(r => r.userTweetId !== tweetId)
      await this.setAdminData(data)
    }
  },

  async deleteUserTweet(tweetId: string): Promise<void> {
    if (hasSupabase) {
      await deleteSupabaseRecord('user_tweets', tweetId)
      // Also delete related admin replies
      const { error } = await supabase
        .from('admin_replies')
        .delete()
        .eq('userTweetId', tweetId)
      if (error) throw error
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      const tweets = await this.getUserTweets()
      const filteredTweets = tweets.filter(t => t.id !== tweetId)
      await this.setUserTweets(filteredTweets)
    }
  },

  async addAdminReply(reply: AdminReply): Promise<void> {
    if (hasSupabase) {
      const replyWithId = { ...reply, id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
      const success = await addSupabaseRecord('admin_replies', replyWithId)
      if (!success) throw new Error('Failed to add admin reply to Supabase')
    } else {
      if (!canUseLocalStorage) {
        throw new Error(
          'Production mode requires Supabase. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
      }
      const data = await this.getAdminData()
      data.adminReplies.push(reply)
      await this.setAdminData(data)
    }
  },

  // Check if storage is available
  async isAvailable(): Promise<boolean> {
    try {
      if (hasSupabase) {
        // Test Supabase connection
        const { data, error } = await supabase.from('admin_tweets').select('count')
        return !error
      } else {
        // Test local file system access
        await getLocalData('admin-tweets.json')
        return true
      }
    } catch {
      return false
    }
  }
}

export default storage
