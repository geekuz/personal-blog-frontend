import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCard from './PostCard'
import SearchBar from './SearchBar'
import TagFilter from './TagFilter'

describe('blog components', () => {
  it('renders post metadata and its detail link', () => {
    render(
      <MemoryRouter>
        <PostCard post={{
          slug: 'tested-post', title: 'Tested post', summary: 'Reliable UI',
          coverImageUrl: 'https://images.example.com/tested.jpg', coverImageAlt: 'Test suite dashboard',
          tags: ['testing'], publishedAt: '2026-06-23T12:00:00Z',
          readingTimeMinutes: 4,
        }} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Tested post' })).toHaveAttribute('href', '/blog/tested-post')
    expect(screen.getByRole('img', { name: 'Test suite dashboard' })).toHaveAttribute('src', 'https://images.example.com/tested.jpg')
    expect(screen.getByText('June 23, 2026')).toBeInTheDocument()
    expect(screen.getByText('4 min read')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('reports search input and tag selections', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const { rerender } = render(<SearchBar value="" onChange={onChange} />)
    await user.type(screen.getByRole('searchbox'), 'r')
    expect(onChange).toHaveBeenCalledWith('r')

    rerender(<TagFilter tags={['react']} activeTag={null} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: '#react' }))
    expect(onSelect).toHaveBeenCalledWith('react')
  })
})
