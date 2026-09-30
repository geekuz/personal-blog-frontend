import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SortToolCaseStudy from './SortToolCaseStudy'

describe('SortToolCaseStudy', () => {
  it('presents the verified architecture, build path, algorithm lab and evidence', () => {
    render(<MemoryRouter><SortToolCaseStudy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Building a Unix-style sort tool' })).toBeInTheDocument()
    expect(screen.getByTitle('Sort tool architecture')).toHaveAttribute('src', '/diagrams/sort-tool-architecture.html')
    expect(screen.getByRole('link', { name: 'Lab' })).toHaveAttribute('href', '#lab')
    expect(screen.getByRole('heading', { name: 'Watch the ordering emerge' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '40 tests' })).toBeInTheDocument()
    expect(screen.getByText(/one completed challenge commit on 23 June 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Source code/i })).toHaveAttribute('href', 'https://github.com/geekuz/BYO-sort-tool')
  })
})
