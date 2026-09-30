import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SortAlgorithmLab from './SortAlgorithmLab'

describe('SortAlgorithmLab', () => {
  it('finishes the default merge trace in lexical order', async () => {
    const user = userEvent.setup()
    render(<SortAlgorithmLab />)

    await user.click(screen.getByRole('button', { name: 'Finish' }))

    const values = within(screen.getByRole('list', { name: 'Current line order' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent.replace(/^\d+/, ''))
    expect(values).toEqual(['apple', 'apple', 'banana', 'date', 'fig', 'grape', 'kiwi', 'pear'])
    expect(screen.getByText('Merge sort complete')).toBeInTheDocument()
  })

  it('applies custom input and switches to the repository heap sorter', async () => {
    const user = userEvent.setup()
    render(<SortAlgorithmLab />)

    await user.clear(screen.getByLabelText(/Lines to sort/i))
    await user.type(screen.getByLabelText(/Lines to sort/i), 'zebra, alpha, mango, Alpha')
    await user.click(screen.getByRole('button', { name: 'Apply input' }))
    await user.click(screen.getByRole('button', { name: /Heap/i }))
    await user.click(screen.getByRole('button', { name: 'Finish' }))

    expect(screen.getByText('Heap sort complete')).toBeInTheDocument()
    expect(screen.getByText('Implicit max-heap')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Heap/i })).toHaveAttribute('aria-pressed', 'true')
    const values = within(screen.getByRole('list', { name: 'Current line order' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent.replace(/^\d+/, ''))
    expect(values).toEqual(['Alpha', 'alpha', 'mango', 'zebra'])
  })

  it('rejects input outside the bounded visualization size', async () => {
    const user = userEvent.setup()
    render(<SortAlgorithmLab />)

    await user.clear(screen.getByLabelText(/Lines to sort/i))
    await user.type(screen.getByLabelText(/Lines to sort/i), 'only-one')
    await user.click(screen.getByRole('button', { name: 'Apply input' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter between 2 and 18 non-empty lines.')
  })
})
