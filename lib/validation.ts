/**
 * Input validation and sanitization utilities
 * Following OWASP security guidelines
 * 
 * Note: Server-side uses basic sanitization to avoid ES module issues
 * Client-side can use DOMPurify for more comprehensive protection
 */

// Server-side safe sanitization (no DOMPurify dependency)
function serverSideSanitize(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: URIs (except data:image which we handle separately)
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/file:/gi, '') // Remove file: protocol
    .trim()
}

// Username validation rules (popular/common rules)
export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 15,
  pattern: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
  reservedWords: ['admin', 'administrator', 'root', 'system', 'null', 'undefined', 'api', 'www'],
}

// Email validation - just format validation, no sending
export const EMAIL_DOMAINS = ['outlook.com', 'gmail.com', 'yahoo.com']

/**
 * Sanitize user input to prevent XSS attacks
 * Uses server-side safe sanitization to avoid ES module issues
 */
export function sanitizeInput(input: string): string {
  return serverSideSanitize(input)
}

/**
 * Sanitize HTML content for rich text display (allows safe HTML)
 * Uses basic regex-based sanitization for server-side compatibility
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Allow only safe HTML tags
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'code', 'pre', 'a', 'p', 'br']
  const allowedTagPattern = allowedTags.join('|')
  
  // Remove all tags except allowed ones
  let sanitized = html.replace(
    new RegExp(`<(?!\/?(${allowedTagPattern})\\b)[^>]+>`, 'gi'),
    ''
  )
  
  // Remove dangerous attributes from allowed tags
  sanitized = sanitized.replace(
    /<(a)\s+[^>]*(href\s*=\s*["']?([^"'\s>]+)["']?)[^>]*>/gi,
    (match, tag, hrefAttr, href) => {
      // Only allow http/https links
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        return `<${tag} href="${href}" target="_blank" rel="noopener noreferrer">`
      }
      return ''
    }
  )
  
  return sanitized
}

/**
 * Validate email format (format only, no sending)
 */
export function validateEmailFormat(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

/**
 * Validate username according to rules
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' }
  }

  const cleaned = username.trim().replace(/^@+/, '')

  if (cleaned.length < USERNAME_RULES.minLength) {
    return { valid: false, error: `Username must be at least ${USERNAME_RULES.minLength} characters` }
  }

  if (cleaned.length > USERNAME_RULES.maxLength) {
    return { valid: false, error: `Username must be ${USERNAME_RULES.maxLength} characters or less` }
  }

  if (!USERNAME_RULES.pattern.test(cleaned)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }

  if (USERNAME_RULES.reservedWords.includes(cleaned.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' }
  }

  return { valid: true }
}

/**
 * Validate email domain
 */
export function validateEmailDomain(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain || !EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, error: `Only ${EMAIL_DOMAINS.join(', ')} emails are allowed` }
  }

  return { valid: true }
}

/**
 * Validate tweet content
 */
export function validateTweetContent(content: string, maxLength = 280): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Tweet content is required' }
  }

  const sanitized = sanitizeInput(content).trim()

  if (sanitized.length === 0) {
    return { valid: false, error: 'Tweet cannot be empty' }
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Tweet must be ${maxLength} characters or less` }
  }

  // Content moderation check
  const moderationCheck = checkContentModeration(sanitized)
  if (!moderationCheck.valid) {
    return moderationCheck
  }

  return { valid: true }
}

/**
 * Validate comment content
 */
export function validateCommentContent(content: string, maxLength = 500): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Comment is required' }
  }

  const sanitized = sanitizeInput(content).trim()

  if (sanitized.length === 0) {
    return { valid: false, error: 'Comment cannot be empty' }
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Comment must be ${maxLength} characters or less` }
  }

  // Content moderation check
  const moderationCheck = checkContentModeration(sanitized)
  if (!moderationCheck.valid) {
    return moderationCheck
  }

  return { valid: true }
}

/**
 * Content moderation - detect spam and inappropriate content
 */
export function checkContentModeration(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: true } // Empty content handled elsewhere
  }

  const lowerContent = content.toLowerCase()
  const words = content.split(/\s+/).filter(w => w.length > 0)

  // Check for spam keywords
  const spamKeywords = [
    'buy now', 'click here', 'limited time', 'act now',
    'make money', 'get rich', 'free money', 'guaranteed',
    'no credit check', 'winner', 'congratulations', 'prize',
  ]

  for (const keyword of spamKeywords) {
    if (lowerContent.includes(keyword)) {
      return { valid: false, error: 'Content contains prohibited keywords' }
    }
  }

  // NOTE: We intentionally allow CAPITAL LETTERS and repeated characters
  // now to give users more freedom in how they style their tweets.
  // The previous checks for excessive capitalization and repeated
  // characters have been removed.

  // Check for excessive links (potential spam)
  const linkCount = (content.match(/https?:\/\//gi) || []).length
  if (linkCount > 3) {
    return { valid: false, error: 'Too many links in content' }
  }

  return { valid: true }
}
