// Production-ready storage using Vercel KV for deployment
// Falls back to local file system for development

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

// Check if we're in production and have Vercel KV available
const isProduction = process.env.NODE_ENV === 'production'
const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN

// Vercel KV storage functions
async function getKVData(key: string): Promise<any> {
  if (!hasKV) return null
  
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get(key)
  } catch (error) {
    console.error('KV get error:', error)
    return null
  }
}

async function setKVData(key: string, value: any): Promise<boolean> {
  if (!hasKV) return false
  
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value)
    return true
  } catch (error) {
    console.error('KV set error:', error)
    return false
  }
}

async function deleteKVData(key: string): Promise<boolean> {
  if (!hasKV) return false
  
  try {
    const { kv } = await import('@vercel/kv')
    await kv.del(key)
    return true
  } catch (error) {
    console.error('KV delete error:', error)
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
    if (hasKV) {
      const data = await getKVData('admin-tweets')
      return data || { adminTweets: [], adminReplies: [] }
    }
    return getLocalData('admin-tweets.json')
  },

  async setAdminData(data: AdminData): Promise<void> {
    if (hasKV) {
      const success = await setKVData('admin-tweets', data)
      if (!success) throw new Error('Failed to save to KV')
    } else {
      await setLocalData('admin-tweets.json', data)
    }
  },

  // User tweets
  async getUserTweets(): Promise<UserTweet[]> {
    if (hasKV) {
      const tweets = await getKVData('user-tweets')
      return tweets || []
    }
    return getLocalData('user-tweets.json')
  },

  async setUserTweets(tweets: UserTweet[]): Promise<void> {
    if (hasKV) {
      const success = await setKVData('user-tweets', tweets)
      if (!success) throw new Error('Failed to save to KV')
    } else {
      await setLocalData('user-tweets.json', tweets)
    }
  },

  // Helper methods for specific operations
  async addAdminTweet(tweet: AdminTweet): Promise<void> {
    const data = await this.getAdminData()
    data.adminTweets.push(tweet)
    await this.setAdminData(data)
  },

  async addUserTweet(tweet: UserTweet): Promise<void> {
    const tweets = await this.getUserTweets()
    tweets.push(tweet)
    await this.setUserTweets(tweets)
  },

  async deleteAdminTweet(tweetId: string): Promise<void> {
    const data = await this.getAdminData()
    data.adminTweets = data.adminTweets.filter(t => t.id !== tweetId)
    data.adminReplies = data.adminReplies.filter(r => r.userTweetId !== tweetId)
    await this.setAdminData(data)
  },

  async deleteUserTweet(tweetId: string): Promise<void> {
    const tweets = await this.getUserTweets()
    const filteredTweets = tweets.filter(t => t.id !== tweetId)
    await this.setUserTweets(filteredTweets)
  },

  async addAdminReply(reply: AdminReply): Promise<void> {
    const data = await this.getAdminData()
    data.adminReplies.push(reply)
    await this.setAdminData(data)
  },

  // Check if storage is available
  async isAvailable(): Promise<boolean> {
    try {
      if (hasKV) {
        await getKVData('test')
        return true
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
