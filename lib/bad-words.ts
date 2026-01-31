/**
 * Bad words and prohibited terms list
 * This list is used for content moderation
 * 
 * To add more words, edit lib/bad-words.txt
 */

// Only import fs on server-side
let readFileSync: typeof import('fs').readFileSync | null = null
let join: typeof import('path').join | null = null

if (typeof window === 'undefined') {
  try {
    const fs = require('fs')
    const path = require('path')
    readFileSync = fs.readFileSync
    join = path.join
  } catch (error) {
    // fs not available
  }
}

let badWordsCache: string[] | null = null

/**
 * Load bad words from file (server-side only)
 * Falls back to hardcoded list if file can't be read
 */
function loadBadWords(): string[] {
  if (badWordsCache) {
    return badWordsCache
  }

  try {
    // Try to read from file (server-side only)
    if (typeof window === 'undefined' && readFileSync && join) {
      const filePath = join(process.cwd(), 'lib', 'bad-words.txt')
      const fileContent = readFileSync(filePath, 'utf-8')
      badWordsCache = fileContent
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(word => word.length > 0 && !word.startsWith('#'))
    } else {
      // Client-side: use fallback list
      badWordsCache = getFallbackBadWords()
    }
  } catch (error) {
    // If file can't be read, use fallback
    console.warn('Could not load bad-words.txt, using fallback list:', error)
    badWordsCache = getFallbackBadWords()
  }

  return badWordsCache
}

/**
 * Fallback bad words list (used if file can't be loaded)
 */
function getFallbackBadWords(): string[] {
  return [
    'spam', 'scam', 'fraud', 'hack', 'virus', 'malware', 'phishing',
    'abuse', 'harassment', 'threat', 'violence', 'hate', 'discrimination',
    'illegal', 'drugs', 'weapon', 'terrorism', 'extremism', 'pornography',
    'explicit', 'nsfw', 'inappropriate', 'offensive', 'profanity', 'curse',
    'swear', 'obscene', 'vulgar', 'crude', 'disgusting', 'repulsive',
    'nasty', 'filthy', 'dirty', 'lewd', 'indecent', 'immoral', 'unethical',
    'unlawful', 'criminal', 'murder', 'kill', 'death', 'suicide', 'self-harm',
    'harmful', 'dangerous', 'toxic', 'poison', 'explosive', 'bomb', 'attack',
    'assault', 'rape', 'molest', 'exploit', 'traffic', 'slavery',
    'human-trafficking', 'prostitution', 'gambling', 'casino', 'betting',
    'lottery', 'cheat', 'steal', 'robbery', 'theft', 'burglary', 'extortion',
    'blackmail', 'bribery', 'corruption', 'money-laundering', 'pyramid-scheme',
    'ponzi', 'get-rich-quick', 'make-money-fast'
  ]
}

/**
 * Get bad words list (works on both server and client)
 */
export function getBadWords(): string[] {
  if (typeof window === 'undefined') {
    // Server-side: load from file
    return loadBadWords()
  } else {
    // Client-side: use fallback (or could fetch from API)
    return getFallbackBadWords()
  }
}

/**
 * Check if content contains any bad words
 */
export function containsBadWords(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false
  }

  const lowerContent = content.toLowerCase()
  const badWords = getBadWords()

  // Check for whole word matches (with word boundaries)
  for (const word of badWords) {
    // Create regex with word boundaries to match whole words only
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(lowerContent)) {
      return true
    }
  }

  return false
}
