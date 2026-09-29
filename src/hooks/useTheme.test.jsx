import { expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from './useTheme'

it('uses light mode by default even when the operating system prefers dark', async () => {
  const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
  const { result } = renderHook(() => useTheme())

  await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
  expect(result.current.theme).toBe('light')
  matchMedia.mockRestore()
})

it('persists and applies the selected theme', async () => {
  window.localStorage.setItem('theme', JSON.stringify('dark'))
  const { result } = renderHook(() => useTheme())

  await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
  expect(result.current.theme).toBe('dark')

  act(() => result.current.toggleTheme())
  await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
  expect(JSON.parse(window.localStorage.getItem('theme'))).toBe('light')
})
