import { describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContext } from '../../auth/auth-context'
import { server } from '../../test/server'
import Comments from './Comments'

const endpoint = 'http://localhost:8080/api/v1/posts/api-post/comments'

function renderComments(auth) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <Comments slug="api-post" />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Comments', () => {
  it('shows public comments and a login invitation', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({ items: [{
      id: 'comment-1', authorDisplayName: 'Reader', body: '<b>plain text</b>',
      createdAt: '2026-08-20T10:00:00Z', canDelete: false,
    }] })))
    renderComments({ user: null })
    expect(await screen.findByText('<b>plain text</b>')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
  })

  it('lets a verified user post and delete a comment', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({ items: [] })))
    const created = {
      id: 'comment-2', authorDisplayName: 'Reader', body: 'A useful comment',
      createdAt: '2026-08-20T10:00:00Z', canDelete: true,
    }
    const addComment = vi.fn().mockResolvedValue(created)
    const removeComment = vi.fn().mockResolvedValue(undefined)
    renderComments({ user: { emailVerified: true }, addComment, removeComment })
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Add a comment'), 'A useful comment')
    await user.click(screen.getByRole('button', { name: 'Post comment' }))
    expect(await screen.findByText('A useful comment')).toBeInTheDocument()
    expect(addComment).toHaveBeenCalledWith('api-post', 'A useful comment')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(removeComment).toHaveBeenCalledWith('comment-2')
    expect(screen.queryByText('A useful comment')).not.toBeInTheDocument()
  })
})
