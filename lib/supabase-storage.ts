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
  fileType?: 'image' | 'pdf' | 'gif' | null
  fileName?: string | null
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
    console.log('Initializing Supabase client...')
    console.log(`Supabase URL: ${supabaseUrl ? 'set' : 'missing'}`)
    console.log(`Service Key: ${supabaseServiceKey ? 'set (' + supabaseServiceKey.substring(0, 20) + '...)' : 'missing'}`)
    supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!
    )
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
  }
} else {
  console.warn('Supabase not available:', {
    isProduction,
    hasSupabase,
    supabaseUrl: supabaseUrl ? 'set' : 'missing',
    supabaseServiceKey: supabaseServiceKey ? 'set' : 'missing'
  })
}

// Transform database row to code format (snake_case to camelCase where needed)
function transformFromDB(row: any): any {
  if (!row) return row
  return {
    ...row,
    avatarImage: row.avatarImage || row.avatar_image,
    created_at: row.created_at || row.createdAt,
    updatedAt: row.updatedAt || row.updated_at,
    userTweetId: row.userTweetId || row.user_tweet_id,
    commentIndex: row.commentIndex !== undefined ? row.commentIndex : row.comment_index,
    replyId: row.replyId || row.reply_id,
  }
}

// Transform code format to database format (camelCase to snake_case where needed)
function transformToDB(record: any): any {
  if (!record) return record
  const dbRecord: any = { ...record }
  // Map camelCase to snake_case for quoted columns
  if (dbRecord.avatarImage !== undefined) {
    dbRecord.avatarImage = dbRecord.avatarImage
    delete dbRecord.avatar_image
  }
  if (dbRecord.updatedAt !== undefined) {
    dbRecord.updatedAt = dbRecord.updatedAt
    delete dbRecord.updated_at
  }
  if (dbRecord.userTweetId !== undefined) {
    dbRecord.userTweetId = dbRecord.userTweetId
    delete dbRecord.user_tweet_id
  }
  if (dbRecord.commentIndex !== undefined) {
    dbRecord.commentIndex = dbRecord.commentIndex
    delete dbRecord.comment_index
  }
  if (dbRecord.replyId !== undefined) {
    dbRecord.replyId = dbRecord.replyId
    delete dbRecord.reply_id
  }
  return dbRecord
}

// Supabase storage functions
async function getSupabaseData(tableName: string): Promise<any[]> {
  if (!supabase) {
    console.error(`[${tableName}] Supabase client not initialized`)
    console.error(`[${tableName}] hasSupabase: ${hasSupabase}, supabaseUrl: ${supabaseUrl ? 'set' : 'missing'}, supabaseServiceKey: ${supabaseServiceKey ? 'set' : 'missing'}`)
    return []
  }
  
  try {
    console.log(`[${tableName}] Fetching data from Supabase...`)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.error(`[${tableName}] Supabase get error:`, {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }
    
    console.log(`[${tableName}] Fetched ${data?.length || 0} records`)
    if (data && data.length > 0) {
      console.log(`[${tableName}] Sample record:`, JSON.stringify(data[0], null, 2))
    }
    
    // Transform data from database format to code format
    const transformed = (data || []).map(transformFromDB)
    console.log(`[${tableName}] Transformed ${transformed.length} records`)
    return transformed
  } catch (error) {
    console.error(`[${tableName}] Supabase get error:`, error)
    if (error instanceof Error) {
      console.error(`[${tableName}] Error message: ${error.message}`)
    }
    return []
  }
}

async function setSupabaseData(tableName: string, data: any[]): Promise<boolean> {
  if (!supabase) return false
  
  try {
    // Delete existing data
    await supabase.from(tableName).delete().neq('id', 'impossible-id')
    
    // Transform data to database format before inserting
    const transformedData = data.map(transformToDB)
    
    // Insert new data
    const { error } = await supabase.from(tableName).insert(transformedData)
    
    if (error) {
      console.error(`Supabase insert error:`, error)
      throw error
    }
    return true
  } catch (error) {
    console.error(`Supabase set error for ${tableName}:`, error)
    return false
  }
}

async function addSupabaseRecord(tableName: string, record: any): Promise<boolean> {
  if (!supabase) {
    console.error(`Supabase client not initialized for ${tableName}`)
    return false
  }
  
  try {
    // Transform record to database format before inserting
    const transformedRecord = transformToDB(record)
    console.log(`Inserting into ${tableName}:`, JSON.stringify(transformedRecord, null, 2))
    const { data, error } = await supabase.from(tableName).insert(transformedRecord)
    
    if (error) {
      console.error(`Supabase insert error for ${tableName}:`, {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        record: transformedRecord
      })
      throw error
    }
    console.log(`Successfully inserted into ${tableName}`)
    return true
  } catch (error) {
    console.error(`Supabase add error for ${tableName}:`, error)
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`)
      console.error(`Error stack: ${error.stack}`)
    }
    return false
  }
}

async function updateSupabaseRecord(tableName: string, id: string, updates: any): Promise<boolean> {
  if (!supabase) {
    console.error(`Supabase client not initialized for ${tableName}`)
    return false
  }
  
  try {
    // Transform updates to database format
    const transformedUpdates = transformToDB(updates)
    console.log(`Updating ${tableName} record ${id}:`, JSON.stringify(transformedUpdates, null, 2))
    
    const { error } = await supabase
      .from(tableName)
      .update(transformedUpdates)
      .eq('id', id)
    
    if (error) {
      console.error(`Supabase update error for ${tableName}:`, {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        id,
        updates: transformedUpdates
      })
      throw error
    }
    console.log(`Successfully updated ${tableName} record ${id}`)
    return true
  } catch (error) {
    console.error(`Supabase update error for ${tableName}:`, error)
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`)
      console.error(`Error stack: ${error.stack}`)
    }
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
    console.log('getAdminData called, hasSupabase:', hasSupabase)
    if (hasSupabase) {
      console.log('Fetching from Supabase...')
      const [adminTweets, adminReplies] = await Promise.all([
        getSupabaseData('admin_tweets'),
        getSupabaseData('admin_replies')
      ])
      console.log(`getAdminData result: ${adminTweets.length} admin tweets, ${adminReplies.length} admin replies`)
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
    console.log('getUserTweets called, hasSupabase:', hasSupabase)
    if (hasSupabase) {
      console.log('Fetching user tweets from Supabase...')
      const tweets = await getSupabaseData('user_tweets')
      console.log(`getUserTweets result: ${tweets.length} user tweets`)
      return tweets
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
