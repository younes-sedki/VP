import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  websiteUrl?: string
  fromName?: string
  unsubscribeUrl?: string
}

const topics = [
  { title: 'Project Progress Reports', desc: 'Weekly updates on challenges overcome and milestones reached' },
  { title: 'Work Showcases', desc: 'Recently completed projects with behind-the-scenes insights' },
  { title: 'Work-in-Progress Previews', desc: 'Exclusive early looks at what I\'m currently developing' },
  { title: 'Skills & Tools Updates', desc: 'New techniques and tools that improve my workflow' },
  { title: 'Industry Observations', desc: 'Reflections on trends and changes in the field' },
  { title: 'Wins & Lessons', desc: 'Celebrating successes and sharing valuable learnings' },
]

export default function WelcomeEmail({
  websiteUrl = 'https://sedkiy.dev',
  fromName = 'Younes',
  unsubscribeUrl = '#',
}: WelcomeEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>Welcome aboard — here&apos;s what to expect from my newsletter.</Preview>

      <Body style={body}>
        <Container style={wrapper}>
          {/* ─── HERO HEADER ─── */}
          <Section style={heroSection}>
            {/* Name + status dot */}
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={nameBadge}>{fromName.split(' ')[0].toUpperCase()}</td>
                <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                  <div style={statusDot} />
                </td>
              </tr>
            </table>

            <Heading style={heroHeading}>
              Welcome to my<br />newsletter
            </Heading>
            <Text style={heroSubtext}>
              Full-Stack Developer focused on building modern web applications,
              with a strong interest in infrastructure, DevOps, and security.
            </Text>
          </Section>

          {/* ─── INTRO ─── */}
          <Section style={contentSection}>
            <Text style={paragraph}>
              Hey there! Thanks for subscribing — I&apos;m genuinely glad you&apos;re here.
            </Text>
            <Text style={paragraph}>
              Every week, I&apos;ll share real updates from my journey as a developer:
              what I&apos;m building, what I&apos;m learning, and what caught my eye in
              the tech world.
            </Text>
          </Section>

          {/* ─── TOPIC CARDS GRID ─── */}
          <Section style={contentSection}>
            <Heading as="h2" style={sectionHeading}>What you&apos;ll receive</Heading>

            {/* Row 1 */}
            <Row style={topicRow}>
              <Column style={topicColumnLeft}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[0].title}</Text>
                  <Text style={topicDesc}>{topics[0].desc}</Text>
                </div>
              </Column>
              <Column style={topicColumnRight}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[1].title}</Text>
                  <Text style={topicDesc}>{topics[1].desc}</Text>
                </div>
              </Column>
            </Row>

            {/* Row 2 */}
            <Row style={topicRow}>
              <Column style={topicColumnLeft}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[2].title}</Text>
                  <Text style={topicDesc}>{topics[2].desc}</Text>
                </div>
              </Column>
              <Column style={topicColumnRight}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[3].title}</Text>
                  <Text style={topicDesc}>{topics[3].desc}</Text>
                </div>
              </Column>
            </Row>

            {/* Row 3 */}
            <Row style={topicRow}>
              <Column style={topicColumnLeft}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[4].title}</Text>
                  <Text style={topicDesc}>{topics[4].desc}</Text>
                </div>
              </Column>
              <Column style={topicColumnRight}>
                <div style={topicCard}>
                  <Text style={topicTitle}>{topics[5].title}</Text>
                  <Text style={topicDesc}>{topics[5].desc}</Text>
                </div>
              </Column>
            </Row>
          </Section>

          {/* ─── CTA ─── */}
          <Section style={ctaSection}>
            <Link href={websiteUrl} style={ctaButton}>
              Explore My Portfolio &rarr;
            </Link>
          </Section>

          <Hr style={divider} />

          {/* ─── SOCIALS ─── */}
          <Section style={socialSection}>
            <Text style={socialLabel}>Find me elsewhere</Text>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tr>
                <td style={{ paddingRight: '16px' }}>
                  <Link href="https://github.com/younes-sedki" style={socialLink}>
                    GitHub
                  </Link>
                </td>
                <td style={{ color: '#525252', fontSize: '14px' }}>·</td>
                <td style={{ paddingLeft: '16px' }}>
                  <Link href="https://linkedin.com/in/younes-sedki" style={socialLink}>
                    LinkedIn
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          {/* ─── FOOTER ─── */}
          <Section style={footer}>
            <Text style={footerText}>
              You signed up for updates at{' '}
              <Link href={websiteUrl} style={footerLink}>sedkiy.dev</Link>
            </Text>
            <Text style={footerMuted}>No spam. Unsubscribe anytime.</Text>
            <Link href={unsubscribeUrl} style={unsubscribeButtonLink}>
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
// Mirroring sedkiy.dev: neutral-950 bg, rounded-2xl/3xl cards,
// border-white/20, emerald-500 status dot, pill CTA buttons

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
  backgroundColor: '#0a0a0a',
  borderRadius: '24px',
  border: '2px solid rgba(16,185,129,0.25)',
  overflow: 'hidden',
}

// ─── Hero ────
const heroSection: React.CSSProperties = {
  padding: '48px 40px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid rgba(16,185,129,0.15)',
}

const nameBadge: React.CSSProperties = {
  color: '#fafafa',
  fontSize: '18px',
  fontWeight: 800,
  letterSpacing: '0.5px',
  verticalAlign: 'middle',
}

const statusDot: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  display: 'inline-block',
}

const heroHeading: React.CSSProperties = {
  color: '#fafafa',
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '-0.5px',
  lineHeight: 1.1,
  margin: '24px 0 0',
}

const heroSubtext: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '16px auto 0',
  maxWidth: '420px',
}

// ─── Content ─────
const contentSection: React.CSSProperties = {
  padding: '32px 40px 0',
}

const paragraph: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '15px',
  lineHeight: 1.7,
  margin: '0 0 16px',
}

const sectionHeading: React.CSSProperties = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: 900,
  letterSpacing: '-0.3px',
  margin: '8px 0 20px',
}

// ─── Topic cards ─────
const topicRow: React.CSSProperties = {
  marginBottom: '12px',
}

const topicColumnBase: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top',
}

const topicColumnLeft: React.CSSProperties = {
  ...topicColumnBase,
  paddingRight: '6px',
}

const topicColumnRight: React.CSSProperties = {
  ...topicColumnBase,
  paddingLeft: '6px',
}

const topicCard: React.CSSProperties = {
  backgroundColor: 'rgba(16,185,129,0.05)',
  border: '1px solid rgba(16,185,129,0.2)',
  borderRadius: '16px',
  padding: '16px 18px',
}

const topicTitle: React.CSSProperties = {
  color: '#34d399',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 6px',
  lineHeight: 1.3,
}

const topicDesc: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '12px',
  lineHeight: 1.5,
  margin: 0,
}

// ─── CTA ─────
const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '32px 40px 8px',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 36px',
  backgroundColor: '#10b981',
  color: '#0a0a0a',
  textDecoration: 'none',
  borderRadius: '999px',
  fontWeight: 700,
  fontSize: '14px',
  letterSpacing: '-0.2px',
}

// ─── Divider ─────
const divider: React.CSSProperties = {
  borderColor: 'rgba(16,185,129,0.15)',
  margin: '32px 40px',
}

// ─── Social ─────
const socialSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '0 40px 32px',
}

const socialLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '13px',
  margin: '0 0 12px',
  fontWeight: 500,
}

const socialLink: React.CSSProperties = {
  color: '#34d399',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
}

// ─── Footer ─────
const footer: React.CSSProperties = {
  padding: '28px 40px',
  borderTop: '1px solid rgba(16,185,129,0.15)',
  backgroundColor: '#050505',
  borderRadius: '0 0 24px 24px',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '12px',
  lineHeight: 1.5,
  margin: '0 0 4px',
}

const footerMuted: React.CSSProperties = {
  color: 'rgba(255,255,255,0.25)',
  fontSize: '11px',
  margin: '0 0 12px',
}

const footerLink: React.CSSProperties = {
  color: '#10b981',
  textDecoration: 'underline',
}

const unsubscribeButtonLink: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  textDecoration: 'underline',
  fontSize: '12px',
}
