import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Contact from './Contact'

describe('Contact', () => {
  it('shows verified public channels and the downloadable résumé', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: "Let's talk." })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /@creative_otabek/i })).toHaveAttribute(
      'href',
      'https://t.me/creative_otabek',
    )
    expect(screen.getByRole('link', { name: /@geekuz/i })).toHaveAttribute(
      'href',
      'https://github.com/geekuz',
    )
    expect(screen.getByRole('link', { name: /Download résumé/i })).toHaveAttribute(
      'href',
      '/otabek-resume.pdf',
    )
  })
})
