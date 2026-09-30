import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LoadBalancerPlayground from './LoadBalancerPlayground'

describe('LoadBalancerPlayground', () => {
  it('routes evenly across every healthy backend', async () => {
    const user = userEvent.setup()
    render(<LoadBalancerPlayground />)

    await user.click(screen.getByRole('button', { name: 'Send 6 requests' }))

    for (const id of ['A', 'B', 'C']) {
      expect(within(screen.getByRole('article', { name: `Backend ${id}` })).getByText('2')).toBeInTheDocument()
    }
    expect(screen.getByText('Request #6 routed to Backend C')).toBeInTheDocument()
  })

  it('removes unhealthy backends while keeping the remaining rotation fair', async () => {
    const user = userEvent.setup()
    render(<LoadBalancerPlayground />)

    await user.click(screen.getByRole('button', { name: 'Mark backend B unhealthy' }))
    await user.click(screen.getByRole('button', { name: 'Send 6 requests' }))

    expect(within(screen.getByRole('article', { name: 'Backend A' })).getByText('3')).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Backend B' })).getByText('0')).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Backend C' })).getByText('3')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Routing event log' })).queryByText(/Backend B/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark backend B healthy' }))
    await user.click(screen.getByRole('button', { name: 'Send 6 requests' }))

    expect(within(screen.getByRole('article', { name: 'Backend A' })).getByText('5')).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Backend B' })).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Backend C' })).getByText('5')).toBeInTheDocument()
  })

  it('returns 503 when every backend is unavailable and reset restores the model', async () => {
    const user = userEvent.setup()
    render(<LoadBalancerPlayground />)

    for (const id of ['A', 'B', 'C']) {
      await user.click(screen.getByRole('button', { name: `Mark backend ${id} unhealthy` }))
    }
    await user.click(screen.getByRole('button', { name: 'Send request' }))

    expect(screen.getByText('Request #1 returned 503 — no healthy backends')).toBeInTheDocument()
    expect(screen.getByText('→ 503 unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Ready for request #1')).toBeInTheDocument()
    expect(screen.getByText('No requests yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark backend A unhealthy' })).toBeInTheDocument()
  })
})
