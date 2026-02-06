import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const author = searchParams.get('author') || 'User'
  const content = searchParams.get('content') || ''
  const handle = searchParams.get('handle') || ''
  const isAdmin = searchParams.get('admin') === '1'
  const likes = searchParams.get('likes') || '0'

  // Truncate content for display
  const displayContent =
    content.length > 200 ? content.substring(0, 197) + '...' : content

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Gradient accent top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '60px 72px',
            justifyContent: 'space-between',
          }}
        >
          {/* Author info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar circle */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '28px',
                background: isAdmin
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              {author[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 700,
                  }}
                >
                  {author}
                </span>
                {isAdmin && (
                  <div
                    style={{
                      background: '#10b981',
                      borderRadius: '12px',
                      padding: '2px 10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    ✓ Verified
                  </div>
                )}
              </div>
              {handle && (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>
                  @{handle}
                </span>
              )}
            </div>
          </div>

          {/* Tweet content */}
          <div
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '36px',
              lineHeight: 1.4,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              maxHeight: '300px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {displayContent || 'A post on sedkiy.dev'}
          </div>

          {/* Bottom bar: likes + branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Likes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#10b981">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>
                {likes} likes
              </span>
            </div>

            {/* Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#10b981',
                }}
              />
              <span
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                sedkiy.dev
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
