import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OtabekDevCaseStudy from './OtabekDevCaseStudy'

describe('OtabekDevCaseStudy', () => {
  it('explains the project with architecture, decisions and source links', () => {
    render(<MemoryRouter><OtabekDevCaseStudy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Building otabek.dev' })).toBeInTheDocument()
    expect(screen.getByTitle('otabek.dev production architecture')).toHaveAttribute(
      'src',
      '/diagrams/otabek-dev-architecture.html',
    )
    expect(screen.getByRole('heading', { name: 'Trade-offs made explicit' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All projects/i })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: /Frontend/i })).toHaveAttribute(
      'href',
      'https://github.com/geekuz/personal-blog-frontend',
    )
  })
})
