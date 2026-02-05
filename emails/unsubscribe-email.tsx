import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface UnsubscribeEmailProps {
  websiteUrl?: string
  fromName?: string
}

export default function UnsubscribeEmail({
  websiteUrl = 'https://sedkiy.dev',
  fromName = 'Younes',
}: UnsubscribeEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>You&apos;ve been unsubscribed — sorry to see you go.</Preview>

      <Body style={body}>
        <Container style={wrapper}>
          {/* ─── HEADER ─── */}
          <Section style={headerSection}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={nameBadge}>{fromName.toUpperCase()}</td>
                <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                  <div style={statusDotOff} />
                </td>
              </tr>
            </table>
          </Section>

          {/* ─── CONTENT ─── */}
          <Section style={contentSection}>
            <Heading style={heading}>You&apos;ve been unsubscribed</Heading>
            <Text style={paragraph}>
              You won&apos;t receive any more emails from me. If this was a mistake,
              you can always resubscribe from my website.
            </Text>
            <Text style={mutedText}>
              I appreciate the time you spent as a subscriber — thanks for being part of the journey.
            </Text>

            {/* CTA */}
            <Section style={ctaSection}>
              <Link href={websiteUrl} style={ctaButton}>
                Visit sedkiy.dev &rarr;
              </Link>
            </Section>
          </Section>

          {/* ─── FOOTER ─── */}
          <Section style={footer}>
            <Text style={footerText}>
              This is a confirmation of your unsubscription from{' '}
              <Link href={websiteUrl} style={footerLink}>sedkiy.dev</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '40px 16px',
}

const wrapper: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#141414',
  borderRadius: '24px',
  border: '2px solid rgba(255,255,255,0.12)',
  overflow: 'hidden',
}

// ─── Header ────
const headerSection: React.CSSProperties = {
  padding: '36px 40px 0',
  textAlign: 'center' as const,
}

const nameBadge: React.CSSProperties = {
  color: '#fafafa',
  fontSize: '18px',
  fontWeight: 800,
  letterSpacing: '0.5px',
  verticalAlign: 'middle',
}

const statusDotOff: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#737373', // grey — inactive/unsubscribed
  display: 'inline-block',
}

// ─── Content ────
const contentSection: React.CSSProperties = {
  padding: '32px 40px 40px',
  textAlign: 'center' as const,
}

const heading: React.CSSProperties = {
  color: '#fafafa',
  fontSize: '26px',
  fontWeight: 900,
  letterSpacing: '-0.5px',
  lineHeight: 1.2,
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '15px',
  lineHeight: 1.7,
  margin: '0 0 12px',
}

const mutedText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: '0 0 28px',
}

// ─── CTA ────
const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '0',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 36px',
  backgroundColor: '#fafafa',
  color: '#0a0a0a',
  textDecoration: 'none',
  borderRadius: '999px',
  fontWeight: 700,
  fontSize: '14px',
  letterSpacing: '-0.2px',
}

// ─── Footer ────
const footer: React.CSSProperties = {
  padding: '24px 40px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  backgroundColor: '#0f0f0f',
  borderRadius: '0 0 24px 24px',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.3)',
  fontSize: '12px',
  lineHeight: 1.5,
  margin: 0,
}

const footerLink: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  textDecoration: 'underline',
}
