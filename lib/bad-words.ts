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
 * This list is now the primary source to ensure production reliability
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
    'ponzi', 'get-rich-quick', 'make-money-fast', 'work-from-home-scam',
    'investment-scam', 'crypto-scam', 'bitcoin-scam', 'nigerian-prince',
    'phishing-email', 'fake-check', 'fake-invoice', 'fake-warrant', 'irs-scam',
    'tax-scam', 'social-security-scam', 'medicare-scam', 'tech-support-scam',
    'romance-scam', 'catfishing', 'identity-theft', 'credit-card-fraud',
    'bank-fraud', 'wire-fraud', 'mail-fraud', 'insurance-fraud',
    'healthcare-fraud', 'elder-abuse', 'elder-financial-abuse', 'senior-scam',
    'grandparent-scam', 'relative-scam', 'family-emergency-scam', 'jail-scam',
    'arrest-scam', 'bail-scam', 'court-scam', 'lawsuit-scam', 'legal-scam',
    'debt-collection-scam', 'debt-settlement-scam', 'credit-repair-scam',
    'account-suspension-scam', 'service-cancellation-scam', 'subscription-scam',
    'auto-renewal-scam', 'billing-scam', 'charge-scam', 'refund-scam',
    'warranty-claim-scam', 'recall-scam', 'class-action-scam', 'settlement-scam',
    'lawsuit-settlement-scam', 'mass-tort-scam', 'prize-scam', 'sweepstakes-scam',
    'inheritance-scam', 'unclaimed-funds-scam', 'tax-refund-scam', 'rebate-scam',
    'warranty-scam', 'extended-warranty-scam', 'insurance-scam', 'medical-device-scam',
    'prescription-drug-scam', 'funeral-scam', 'estate-planning-scam', 'will-scam',
    'trust-scam', 'probate-scam', 'home-repair-scam', 'roofing-scam', 'hvac-scam',
    'plumbing-scam', 'electrical-scam', 'pest-control-scam', 'landscaping-scam',
    'car-scam', 'vehicle-scam', 'boat-scam', 'rv-scam', 'pet-scam', 'puppy-scam',
    'ticket-scam', 'travel-scam', 'vacation-scam', 'hotel-scam', 'airline-scam',
    'package-scam', 'online-auction-scam', 'rental-scam', 'apartment-scam',
    'real-estate-scam', 'property-scam', 'job-scam', 'employment-scam',
    'work-permit-scam', 'scholarship-scam', 'student-loan-scam', 'debt-relief-scam',
    'mortgage-scam', 'refinance-scam', 'foreclosure-scam', 'charity-scam',
    'donation-scam', 'crowdfunding-scam', 'dating-site-scam', 'marriage-scam',
    'immigration-scam', 'visa-scam', 'zabi', 'zbi', 'zaml', 'w9', 'b9', 'wld',
    'zml', 'krk', 'ass', 'zebi', 'zamle', 'zamal', 'wald9', 'wld9', '9a7ba',
    '97ba', 'l7wa'
  ]
}

/**
 * Get bad words list (works on both server and client)
 * Always use embedded list for production reliability
 */
export function getBadWords(): string[] {
  if (badWordsCache) {
    return badWordsCache
  }

  // Always use the embedded list for reliability
  const baseWords = getFallbackBadWords()
  const expandedWords = new Set<string>()

  for (const word of baseWords) {
    expandedWords.add(word)
    expandedWords.add(word.toLowerCase())
    expandedWords.add(word.toUpperCase())
  }

  badWordsCache = Array.from(expandedWords)
  return badWordsCache
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
  
  // Debug logging
  console.log(`[BAD_WORDS_DEBUG] Checking: "${content}" -> "${lowerContent}"`)
  console.log(`[BAD_WORDS_DEBUG] Available words: ${badWords.length}`)

  // Check for bad words.
  // IMPORTANT: We avoid naive substring checks so names like "Hassan" don't trigger on "ass".
  for (const word of badWords) {
    if (!word) continue

    // Escape regex special chars
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Use word boundaries for all words so we only match real tokens,
    // not parts of longer names/usernames.
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(lowerContent)) {
      console.log(`[BAD_WORDS_DEBUG] FOUND WORD: "${word}" in "${lowerContent}"`)
      return true
    }
  }

  console.log(`[BAD_WORDS_DEBUG] NO BAD WORDS FOUND`)
  return false
}
