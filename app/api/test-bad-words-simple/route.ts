import { NextRequest, NextResponse } from 'next/server'
import { containsBadWords } from '@/lib/bad-words'

/**
 * Quick test for bad words detection
 */
export async function POST(request: NextRequest) {
  try {
    const { test } = await request.json()
    
    const result = containsBadWords(test)
    
    return NextResponse.json({
      input: test,
      containsBadWords: result,
      message: result ? "BAD WORD DETECTED" : "Content is clean"
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
