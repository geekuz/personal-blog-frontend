import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Projects from './Projects'

describe('Projects', () => {
  it('presents selected work with usable destination links', () => {
    render(<MemoryRouter><Projects /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'otabek.dev' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Java HTTP Load Balancer' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /case study/i })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Read otabek.dev case study' })).toHaveAttribute(
      'href',
      '/projects/otabek-dev',
    )
    expect(screen.getByRole('link', { name: 'Read Java HTTP Load Balancer case study' })).toHaveAttribute(
      'href',
      '/projects/java-load-balancer',
    )
    expect(screen.getByRole('link', { name: /Visit site/i })).toHaveAttribute('href', 'https://otabek.dev')
    expect(screen.getAllByRole('link', { name: /View source/i })).toHaveLength(3)
    expect(screen.getByRole('link', { name: /Browse all repositories/i })).toHaveAttribute(
      'href',
      'https://github.com/geekuz?tab=repositories',
    )
  })
})
