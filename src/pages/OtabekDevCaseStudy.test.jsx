import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OtabekDevCaseStudy from './OtabekDevCaseStudy'

describe('OtabekDevCaseStudy', () => {
  it('explains the project with architecture, development history, decisions and source links', () => {
    render(<MemoryRouter><OtabekDevCaseStudy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Building otabek.dev' })).toBeInTheDocument()
    expect(screen.getByTitle('otabek.dev production architecture')).toHaveAttribute(
      'src',
      '/diagrams/otabek-dev-architecture.html',
    )
    expect(screen.getByRole('heading', { name: 'Trade-offs made explicit' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'From files to a full publishing system' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '#history')
    expect(screen.getAllByRole('listitem').some((item) => item.textContent.includes('Move content behind a Java API'))).toBe(true)
    expect(screen.getByText('29 September 2026 · evening')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All projects/i })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: /Frontend/i })).toHaveAttribute(
      'href',
      'https://github.com/geekuz/personal-blog-frontend',
    )
  })
})
