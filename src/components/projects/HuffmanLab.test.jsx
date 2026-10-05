import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import HuffmanLab from './HuffmanLab'

describe('HuffmanLab', () => {
  it('steps through every merge of the default input', async () => {
    const user = userEvent.setup()
    render(<HuffmanLab />)

    expect(screen.getByText('Step 1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '5 trees in the priority queue' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Step →' }))
    expect(screen.getByText('Merge 1: c (1) + d (1) → 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText('Step 5 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '1 tree in the priority queue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
  })

  it('reports the same codes and HUF1 size as the Java encoder', () => {
    render(<HuffmanLab />)

    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('a505')
    expect(screen.getByText('61 B · 555%')).toBeInTheDocument()
    expect(screen.getByText(/Round trip ✓/)).toBeInTheDocument()
  })

  it('compresses custom text and validates empty input', async () => {
    const user = userEvent.setup()
    render(<HuffmanLab />)
    const input = screen.getByLabelText(/Text to compress/)

    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'Compress' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter between 1 and 120 characters.')

    await user.type(input, 'aaaa')
    await user.click(screen.getByRole('button', { name: 'Compress' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Step 1 / 1')).toBeInTheDocument()
    expect(screen.getByText('19 B · 475%')).toBeInTheDocument()
  })
})
