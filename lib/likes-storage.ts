/**
 * localStorage utilities for persisting likes
 */

const LIKES_STORAGE_KEY = 'tweetLikes'
const LIKES_DELTA_KEY = 'tweetLikesDelta' // Track local changes to like counts

export interface LikesStorage {
  [tweetId: string]: boolean // true = liked, false = not liked
}

export interface LikesDelta {
  [tweetId: string]: number // +1 if liked locally, -1 if unliked locally, 0 if no change
}

/**
 * Load likes from localStorage
 */
export function loadLikes(): LikesStorage {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save likes to localStorage
 */
export function saveLikes(likes: LikesStorage): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes))
  } catch (err) {
    console.error('Failed to save likes to localStorage:', err)
  }
}

/**
 * Load likes delta from localStorage
 */
function loadLikesDelta(): LikesDelta {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(LIKES_DELTA_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save likes delta to localStorage
 */
function saveLikesDelta(delta: LikesDelta): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LIKES_DELTA_KEY, JSON.stringify(delta))
  } catch (err) {
    console.error('Failed to save likes delta to localStorage:', err)
  }
}

/**
 * Toggle like for a tweet
 */
export function toggleLike(tweetId: string): boolean {
  const likes = loadLikes()
  const delta = loadLikesDelta()
  const isLiked = likes[tweetId] === true
  
  // Update like state
  const newLikedState = !isLiked
  likes[tweetId] = newLikedState
  saveLikes(likes)
  
  // Update delta: if was liked, subtract 1; if wasn't liked, add 1
  const currentDelta = delta[tweetId] || 0
  if (isLiked) {
    // Unliking: subtract 1 from delta
    delta[tweetId] = currentDelta - 1
  } else {
    // Liking: add 1 to delta
    delta[tweetId] = currentDelta + 1
  }
  saveLikesDelta(delta)
  
  return newLikedState
}

/**
 * Get the local delta for a tweet (how many likes were added/removed locally)
 */
export function getLikeDelta(tweetId: string): number {
  const delta = loadLikesDelta()
  return delta[tweetId] || 0
}

/**
 * Get the adjusted like count (server count + local delta)
 */
export function getAdjustedLikeCount(tweetId: string, serverCount: number): number {
  const delta = getLikeDelta(tweetId)
  return Math.max(0, serverCount + delta)
}

/**
 * Check if a tweet is liked
 */
export function isLiked(tweetId: string): boolean {
  const likes = loadLikes()
  return likes[tweetId] === true
}

/**
 * Get all liked tweet IDs
 */
export function getLikedTweets(): Set<string> {
  const likes = loadLikes()
  return new Set(
    Object.entries(likes)
      .filter(([_, isLiked]) => isLiked === true)
      .map(([tweetId]) => tweetId)
  )
}
