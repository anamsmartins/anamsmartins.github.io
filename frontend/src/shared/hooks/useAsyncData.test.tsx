import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAsyncData } from './useAsyncData'

function TestHarness({ fetchFn }: { fetchFn: () => Promise<string> }) {
  const { data, status, errorMessage } = useAsyncData(fetchFn)

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="data">{data ?? ''}</span>
      <span data-testid="error">{errorMessage}</span>
    </div>
  )
}

describe('useAsyncData', () => {
  afterEach(() => {
    cleanup()
  })
  it('loads data successfully', async () => {
    const fetchFn = vi.fn(async () => 'hello')

    render(<TestHarness fetchFn={fetchFn} />)

    expect(screen.getByTestId('status').textContent).toBe('loading')

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready')
    })

    expect(screen.getByTestId('data').textContent).toBe('hello')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('captures errors', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('boom')
    })

    render(<TestHarness fetchFn={fetchFn} />)

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error')
    })

    expect(screen.getByTestId('error').textContent).toBe('boom')
  })
})
