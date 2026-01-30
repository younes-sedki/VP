/**
 * Input validation and sanitization utilities
 * Following OWASP security guidelines
 */

import DOMPurify from 'isomorphic-dompurify'

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
 * Sanitize user input to prevent XSS attacks using DOMPurify
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Use DOMPurify for comprehensive XSS protection
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed in plain text input
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }) as string
  
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
}

/**
 * Sanitize HTML content for rich text display (allows safe HTML)
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'code', 'pre', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
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

  // Check for excessive repeated characters (e.g., "aaaaa")
  if (/(.)\1{4,}/.test(content)) {
    return { valid: false, error: 'Content contains excessive repeated characters' }
  }

  // Check for excessive capitalization (spam indicator)
  if (words.length >= 3) {
    const capsCount = content.split('').filter(c => c === c.toUpperCase() && c.match(/[A-Z]/)).length
    const capsRatio = capsCount / content.length
    if (capsRatio > 0.7) {
      return { valid: false, error: 'Content contains excessive capitalization' }
    }
  }

  // Check for excessive links (potential spam)
  const linkCount = (content.match(/https?:\/\//gi) || []).length
  if (linkCount > 3) {
    return { valid: false, error: 'Too many links in content' }
  }

  return { valid: true }
}
