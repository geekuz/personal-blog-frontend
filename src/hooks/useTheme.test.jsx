import { expect, it } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from './useTheme'

it('persists and applies the selected theme', async () => {
  window.localStorage.setItem('theme', JSON.stringify('dark'))
  const { result } = renderHook(() => useTheme())

  await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
  expect(result.current.theme).toBe('dark')

  act(() => result.current.toggleTheme())
  await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
  expect(JSON.parse(window.localStorage.getItem('theme'))).toBe('light')
})
