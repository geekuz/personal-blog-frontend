import { describe, expect, it } from 'vitest'
import { analyticsBeforeSend } from './analytics'

const event = (url) => ({ type: 'pageview', url })

describe('analyticsBeforeSend', () => {
  it('keeps public pages but strips query strings and fragments', () => {
    expect(analyticsBeforeSend(event('https://otabek.dev/blog/hello?ref=x#intro'))).toEqual(
      event('https://otabek.dev/blog/hello'),
    )
    expect(analyticsBeforeSend(event('https://otabek.dev/?q=react&tag=java'))).toEqual(
      event('https://otabek.dev/'),
    )
  })

  it('never reports pages that can carry secrets or private data', () => {
    for (const path of [
      '/reset-password?token=secret',
      '/verify-email?token=secret',
      '/admin',
      '/admin/posts',
      '/account',
      '/Admin/posts',
      '/Reset-Password?token=secret',
    ]) {
      expect(analyticsBeforeSend(event(`https://otabek.dev${path}`)), path).toBeNull()
    }
  })

  it('does not confuse similarly named public paths with private ones', () => {
    expect(analyticsBeforeSend(event('https://otabek.dev/blog/admin-tips'))).not.toBeNull()
  })

  it('drops events whose URL cannot be parsed', () => {
    expect(analyticsBeforeSend(event('not a url'))).toBeNull()
  })
})
