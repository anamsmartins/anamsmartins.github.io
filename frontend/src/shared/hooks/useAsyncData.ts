import { useEffect, useState } from 'react'

export function useAsyncData<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setErrorMessage('')
      try {
        const result = await fetchFn()
        if (!cancelled) {
          setData(result)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load data.')
          setStatus('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [fetchFn])

  return { data, status, errorMessage }
}
