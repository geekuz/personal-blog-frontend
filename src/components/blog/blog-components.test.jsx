import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoverImage from './CoverImage'
import MarkdownContent from './MarkdownContent'
import PostCard from './PostCard'
import SearchBar from './SearchBar'
import TagFilter from './TagFilter'

describe('blog components', () => {
  it('retries a cover image once and resets failures when its URL changes', () => {
    const { rerender } = render(<CoverImage src="https://images.example.com/first.jpg" alt="First cover" />)

    fireEvent.error(screen.getByRole('img', { name: 'First cover' }))
    expect(screen.getByRole('img', { name: 'First cover' })).toBeInTheDocument()

    fireEvent.error(screen.getByRole('img', { name: 'First cover' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cover image could not be loaded.')

    rerender(<CoverImage src="https://images.example.com/second.jpg" alt="Second cover" />)
    expect(screen.getByRole('img', { name: 'Second cover' })).toHaveAttribute('src', 'https://images.example.com/second.jpg')
  })

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

  it('highlights and copies code while linking headings in a generated table of contents', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    render(<MarkdownContent tableOfContents>{`## Install\n\n### Run it\n\n\`\`\`js\nconst ready = true\n\`\`\``}</MarkdownContent>)

    const contents = screen.getByRole('navigation', { name: 'Table of contents' })
    expect(contents).toHaveTextContent('Install')
    expect(contents).toHaveTextContent('Run it')
    expect(within(contents).getByRole('link', { name: 'Install' })).toHaveAttribute('href', '#post-install')
    expect(document.querySelector('code')).toHaveClass('hljs', 'language-js')

    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('const ready = true')
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
  })
})
