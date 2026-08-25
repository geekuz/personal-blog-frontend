import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from './Admin'
import { AuthContext } from '../auth/auth-context'

const dashboard = {
  publishedPosts: 2, draftPosts: 1, scheduledPosts: 0, subscribers: 7, pendingDeliveries: 3, failedDeliveries: 0,
  posts: [{ id: '1', slug: 'hello-world', title: 'Hello world', summary: 'Summary', content: '# Hello',
    coverImageUrl: null, coverImageAlt: null, status: 'PUBLISHED', scheduledAt: null, updatedAt: '2026-08-21T12:00:00Z',
    tags: [{ name: 'Java', slug: 'java' }] }],
}

describe('Admin dashboard', () => {
  beforeEach(() => localStorage.clear())

  it('shows metrics and saves a draft', async () => {
    const loadDashboard = vi.fn().mockResolvedValue(dashboard)
    const saveAdminPost = vi.fn().mockResolvedValue({})
    render(<MemoryRouter><AuthContext.Provider value={{
      user: { roles: ['USER', 'ADMIN'] }, isLoading: false, loadDashboard, saveAdminPost,
      deleteAdminPost: vi.fn(),
    }}><Admin /></AuthContext.Provider></MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Publishing dashboard' })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'New post' }))
    await user.type(screen.getByLabelText('Title'), 'New draft')
    await user.type(screen.getByLabelText('Slug'), 'new-draft')
    await user.type(screen.getByLabelText('Summary'), 'A useful summary')
    await user.type(screen.getByLabelText('Cover image URL (optional)'), 'https://images.example.com/draft.jpg')
    await user.type(screen.getByLabelText('Cover image alt text'), 'Draft illustration')
    await user.type(screen.getByLabelText('Content (Markdown)'), '# Draft')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    const preview = screen.getByLabelText('Post preview')
    expect(preview).toHaveTextContent('Draft')
    expect(preview.querySelector('h1')).toHaveTextContent('Draft')
    expect(preview.querySelector('img')).toHaveAttribute('src', 'https://images.example.com/draft.jpg')
    expect(preview.querySelector('img')).toHaveAttribute('alt', 'Draft illustration')
    await user.type(screen.getByLabelText('Tags (comma separated)'), 'React, Testing')
    await user.click(screen.getByRole('button', { name: 'Save post' }))

    expect(saveAdminPost).toHaveBeenCalledWith(null, expect.objectContaining({
      slug: 'new-draft', content: '# Draft', coverImageUrl: 'https://images.example.com/draft.jpg',
      coverImageAlt: 'Draft illustration', status: 'DRAFT',
      tags: [{ name: 'React', slug: 'react' }, { name: 'Testing', slug: 'testing' }],
    }))
    expect(await screen.findByRole('status')).toHaveTextContent('Draft saved')
  })

  it('autosaves locally, restores changes, and warns before discarding them', async () => {
    const loadDashboard = vi.fn().mockResolvedValue(dashboard)
    const auth = {
      user: { roles: ['USER', 'ADMIN'] }, isLoading: false, loadDashboard,
      saveAdminPost: vi.fn(), deleteAdminPost: vi.fn(),
    }
    const view = render(<MemoryRouter><AuthContext.Provider value={auth}><Admin /></AuthContext.Provider></MemoryRouter>)
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Publishing dashboard' })
    await user.click(screen.getByRole('button', { name: 'New post' }))
    await user.type(screen.getByLabelText('Title'), 'Recovered draft')

    await waitFor(() => expect(localStorage.getItem('admin-post-draft:new')).toContain('Recovered draft'))
    expect(screen.getByRole('status')).toHaveTextContent('Changes saved locally.')
    const beforeUnload = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(beforeUnload)
    expect(beforeUnload.defaultPrevented).toBe(true)

    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'New post' })).toBeInTheDocument()
    expect(confirm).toHaveBeenCalledWith('Discard your unsaved changes?')

    view.unmount()
    render(<MemoryRouter><AuthContext.Provider value={auth}><Admin /></AuthContext.Provider></MemoryRouter>)
    await screen.findByRole('heading', { name: 'Publishing dashboard' })
    await user.click(screen.getByRole('button', { name: 'New post' }))
    expect(screen.getByLabelText('Title')).toHaveValue('Recovered draft')
    expect(screen.getByRole('status')).toHaveTextContent('Recovered locally saved changes.')

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'New post' })).not.toBeInTheDocument()
    expect(localStorage.getItem('admin-post-draft:new')).toBeNull()
  })

  it('submits a scheduled post as a UTC instant', async () => {
    const loadDashboard = vi.fn().mockResolvedValue(dashboard)
    const saveAdminPost = vi.fn().mockResolvedValue({})
    render(<MemoryRouter><AuthContext.Provider value={{
      user: { roles: ['ADMIN'] }, isLoading: false, loadDashboard, saveAdminPost, deleteAdminPost: vi.fn(),
    }}><Admin /></AuthContext.Provider></MemoryRouter>)
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Publishing dashboard' })
    await user.click(screen.getByRole('button', { name: 'New post' }))
    await user.type(screen.getByLabelText('Title'), 'Scheduled post')
    await user.type(screen.getByLabelText('Slug'), 'scheduled-post')
    await user.type(screen.getByLabelText('Summary'), 'Scheduled summary')
    await user.type(screen.getByLabelText('Content (Markdown)'), 'Scheduled content')
    await user.type(screen.getByLabelText('Tags (comma separated)'), 'Scheduling')
    await user.selectOptions(screen.getByLabelText('Status'), 'SCHEDULED')
    await user.type(screen.getByLabelText('Publish date and time'), '2099-08-26T13:30')
    await user.click(screen.getByRole('button', { name: 'Save post' }))

    expect(saveAdminPost).toHaveBeenCalledWith(null, expect.objectContaining({
      status: 'SCHEDULED', scheduledAt: new Date('2099-08-26T13:30').toISOString(),
    }))
    expect(await screen.findByRole('status')).toHaveTextContent('Post scheduled.')
  })
})
