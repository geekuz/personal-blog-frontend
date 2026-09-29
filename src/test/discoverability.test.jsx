import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import vercelConfig from '../../vercel.json'
import Footer from '../components/layout/Footer.jsx'

const BACKEND = 'https://api.otabek.dev'
const OLD_HOST = 'personal-blog-frontend-virid.vercel.app'
const { rewrites, redirects = [] } = vercelConfig

function rewriteFor(source) {
  return rewrites.find((rule) => rule.source === source)
}

function previewBotPattern() {
  const rule = rewriteFor('/blog/:slug')
  const header = rule.has.find((condition) => condition.key === 'user-agent')
  return new RegExp(`^${header.value}$`)
}

describe('Vercel discoverability rewrites', () => {
  it('proxies the feed and sitemap to the backend on the reader-facing domain', () => {
    expect(rewriteFor('/feed.xml').destination).toBe(`${BACKEND}/feed.xml`)
    expect(rewriteFor('/sitemap.xml').destination).toBe(`${BACKEND}/sitemap.xml`)
  })

  it('permanently redirects the old vercel.app address to otabek.dev, keeping the path', () => {
    const rule = redirects.find((r) => r.has?.some((c) => c.type === 'host' && c.value === OLD_HOST))
    expect(rule).toMatchObject({
      source: '/:path*',
      destination: 'https://otabek.dev/:path*',
      permanent: true,
    })
  })

  it('keeps the SPA fallback last so it cannot shadow the proxied paths', () => {
    expect(rewrites.at(-1)).toEqual({ source: '/(.*)', destination: '/index.html' })
  })

  it('sends only link-preview bots to the backend share page', () => {
    expect(rewriteFor('/blog/:slug').destination).toBe(
      `${BACKEND}/share/blog/:slug`,
    )
    const bots = previewBotPattern()
    for (const agent of [
      'TelegramBot (like TwitterBot)',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Twitterbot/1.0',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
      'WhatsApp/2.23.20.0',
    ]) {
      expect(bots.test(agent), agent).toBe(true)
    }
    for (const agent of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    ]) {
      expect(bots.test(agent), agent).toBe(false)
    }
  })
})

describe('Footer', () => {
  it('links to the RSS feed', () => {
    render(<Footer year={2026} />)
    expect(screen.getByRole('link', { name: /rss feed/i })).toHaveAttribute(
      'href',
      '/feed.xml',
    )
  })
})
