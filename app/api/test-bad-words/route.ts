import { NextRequest, NextResponse } from 'next/server'
import { containsBadWords } from '@/lib/bad-words'

/**
 * Test endpoint for bad words detection
 */
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const hasBadWords = containsBadWords(content)
    
    return NextResponse.json({
      content,
      hasBadWords,
      message: hasBadWords ? 'Content contains inappropriate words' : 'Content is clean'
    })
  } catch (error) {
    console.error('Error testing bad words:', error)
    return NextResponse.json(
      { error: 'Failed to test content' },
      { status: 500 }
    )
  }
}

/**
 * Test multiple content strings
 */
export async function GET() {
  try {
    const testCases = [
      'This is a clean message',
      'This content contains spam',
      'User name: scammer',
      'Display name: hacker123',
      'zabi zml wld',
      'Hello world',
      'assault weapon',
      'nice person'
    ]

    const results = testCases.map(content => ({
      content,
      hasBadWords: containsBadWords(content)
    }))

    return NextResponse.json({
      testCases: results,
      totalTests: testCases.length,
      flagged: results.filter(r => r.hasBadWords).length
    })
  } catch (error) {
    console.error('Error getting test cases:', error)
    return NextResponse.json(
      { error: 'Failed to get test cases' },
      { status: 500 }
    )
  }
}
