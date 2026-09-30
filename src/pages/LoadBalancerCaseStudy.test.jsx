import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadBalancerCaseStudy from './LoadBalancerCaseStudy'

describe('LoadBalancerCaseStudy', () => {
  it('presents the verified architecture, build path, evidence and source', () => {
    render(<MemoryRouter><LoadBalancerCaseStudy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Building a Java load balancer' })).toBeInTheDocument()
    expect(screen.getByTitle('Java load balancer architecture')).toHaveAttribute(
      'src',
      '/diagrams/java-load-balancer-architecture.html',
    )
    expect(screen.getByRole('link', { name: 'Build path' })).toHaveAttribute('href', '#build-path')
    expect(screen.getByRole('heading', { name: 'Fairness after a backend fails' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '26 tests' })).toBeInTheDocument()
    expect(screen.getByText(/does not contain a repeatable throughput benchmark/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Source code/i })).toHaveAttribute(
      'href',
      'https://github.com/geekuz/BYO-load-balancer',
    )
  })
})
