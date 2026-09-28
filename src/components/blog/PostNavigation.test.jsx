import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PostNavigation from './PostNavigation'

function renderNavigation(props) {
  return render(
    <MemoryRouter>
      <PostNavigation {...props} />
    </MemoryRouter>,
  )
}

describe('PostNavigation', () => {
  it('links to the older and newer posts', () => {
    renderNavigation({
      previousPost: { slug: 'older', title: 'Older title' },
      nextPost: { slug: 'newer', title: 'Newer title' },
      relatedPosts: [],
    })
    const nav = screen.getByRole('navigation', { name: 'Older and newer posts' })
    expect(within(nav).getByRole('link', { name: /older post.*older title/i })).toHaveAttribute('href', '/blog/older')
    expect(within(nav).getByRole('link', { name: /newer post.*newer title/i })).toHaveAttribute('href', '/blog/newer')
  })

  it('shows only the neighbour that exists', () => {
    renderNavigation({ previousPost: null, nextPost: { slug: 'newer', title: 'Newer title' }, relatedPosts: [] })
    expect(screen.queryByRole('link', { name: /older post/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /newer post/i })).toBeInTheDocument()
  })

  it('lists related posts with their summaries', () => {
    renderNavigation({
      relatedPosts: [
        { slug: 'first', title: 'First related', summary: 'First summary' },
        { slug: 'second', title: 'Second related', summary: 'Second summary' },
      ],
    })
    const section = screen.getByRole('region', { name: 'Related posts' })
    const links = within(section).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/blog/first', '/blog/second'])
    expect(within(section).getByText('Second summary')).toBeInTheDocument()
  })

  it('renders nothing when there is nowhere to go', () => {
    const { container } = renderNavigation({ previousPost: null, nextPost: null, relatedPosts: [] })
    expect(container).toBeEmptyDOMElement()
  })

  it('tolerates responses from an API without navigation fields', () => {
    const { container } = renderNavigation({})
    expect(container).toBeEmptyDOMElement()
  })
})
