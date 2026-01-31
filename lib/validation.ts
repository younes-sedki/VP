/**
 * Input validation and sanitization utilities
 * Following OWASP security guidelines
 * 
 * Note: Server-side uses basic sanitization to avoid ES module issues
 * Client-side can use DOMPurify for more comprehensive protection
 */

import { containsBadWords } from './bad-words'

// Server-side safe sanitization (no DOMPurify dependency)
function serverSideSanitize(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data:text/html URIs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/file:/gi, '') // Remove file: protocol
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/@import/gi, '') // Remove CSS imports
    .trim()
}

// Username validation rules (popular/common rules)
export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 15,
  pattern: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
  reservedWords: ['admin', 'administrator', 'root', 'system', 'null', 'undefined', 'api', 'www'],
}

// Display name validation rules
export const DISPLAY_NAME_RULES = {
  minLength: 2,
  maxLength: 50,
  reservedNames: ['younes sedki', 'younes-sedki', 'younes_sedki'], // Case-insensitive check
}

// Email validation - just format validation, no sending
export const EMAIL_DOMAINS = ['outlook.com', 'gmail.com', 'yahoo.com']

// Strict email regex validation
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

/**
 * Validate URL format and safety
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' }
  }

  const trimmed = url.trim()

  // Must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' }
  }

  // Basic URL format validation
  try {
    const urlObj = new URL(trimmed)
    // Block dangerous protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
    }
    // Block localhost and private IPs (security)
    const hostname = urlObj.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return { valid: false, error: 'Local URLs are not allowed' }
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  return { valid: true }
}

/**
 * Enhanced email validation with strict regex
 */
export function validateEmailStrict(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const trimmed = email.trim()

  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Check for email injection attempts
  if (trimmed.includes('\n') || trimmed.includes('\r') || trimmed.includes('\0')) {
    return { valid: false, error: 'Email contains invalid characters' }
  }

  // Check length
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' }
  }

  return { valid: true }
}

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
 * Validate display name (author name for tweets)
 */
export function validateDisplayName(displayName: string): { valid: boolean; error?: string } {
  if (!displayName || typeof displayName !== 'string') {
    return { valid: false, error: 'Display name is required' }
  }

  const cleaned = displayName.trim()

  if (cleaned.length < DISPLAY_NAME_RULES.minLength) {
    return { valid: false, error: `Display name must be at least ${DISPLAY_NAME_RULES.minLength} characters` }
  }

  if (cleaned.length > DISPLAY_NAME_RULES.maxLength) {
    return { valid: false, error: `Display name must be ${DISPLAY_NAME_RULES.maxLength} characters or less` }
  }

  // Check if display name matches reserved names (case-insensitive)
  const lowerCleaned = cleaned.toLowerCase()
  for (const reservedName of DISPLAY_NAME_RULES.reservedNames) {
    if (lowerCleaned === reservedName.toLowerCase()) {
      return { valid: false, error: 'This display name is reserved' }
    }
    // Also check if it contains the reserved name as a substring
    if (lowerCleaned.includes(reservedName.toLowerCase())) {
      return { valid: false, error: 'Display name cannot contain reserved names' }
    }
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

  // Check for bad words from bad-words.txt file
  try {
    if (containsBadWords(content)) {
      return { valid: false, error: 'Content contains prohibited words or phrases' }
    }
  } catch (error) {
    // If bad-words module can't be loaded, continue with other checks
    console.warn('Could not check bad words filter:', error)
  }

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
