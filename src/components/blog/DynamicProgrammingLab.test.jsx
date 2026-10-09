import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DynamicProgrammingLab from './DynamicProgrammingLab'

describe('DynamicProgrammingLab', () => {
  it('builds the one-dimensional recurrence and exposes its dependencies', async () => {
    const user = userEvent.setup()
    render(<DynamicProgrammingLab />)

    await user.click(screen.getByRole('button', { name: 'Next step' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText('Stair 3: 2 + 1 = 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText('Answer: 21')).toBeInTheDocument()
  })

  it('recomputes grid paths when a visitor changes an obstacle', async () => {
    const user = userEvent.setup()
    render(<DynamicProgrammingLab />)

    await user.click(screen.getByRole('button', { name: /Grid paths/ }))
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    const original = screen.getByText(/^Answer:/).textContent

    await user.click(screen.getByRole('button', { name: 'Cell 1, 2, open' }))
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText(/^Answer:/).textContent).not.toBe(original)
  })

  it('solves and reconstructs the choose-or-skip example', async () => {
    const user = userEvent.setup()
    render(<DynamicProgrammingLab />)

    await user.click(screen.getByRole('button', { name: /0\/1 knapsack/ }))
    await user.click(screen.getByRole('button', { name: 'Finish' }))

    expect(screen.getByText('Answer: 11 — choose Notebook + Jacket')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Zero-one knapsack value table' })
    expect(within(table).getByText('Jacket')).toBeInTheDocument()
  })

  it('resets playback state when switching examples', async () => {
    const user = userEvent.setup()
    render(<DynamicProgrammingLab />)

    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText('Step 8 / 8')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Grid paths/ }))
    expect(screen.getByText('Step 1 / 20')).toBeInTheDocument()
    expect(screen.queryByText(/^Answer:/)).not.toBeInTheDocument()
  })
})
