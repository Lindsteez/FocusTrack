import { useEffect, useState } from 'react'

/**
 * Persists a state value in localStorage under the given key.
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch (err) {
      console.error('useLocalStorage read error:', err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('useLocalStorage write error:', err)
    }
  }, [key, value])

  return [value, setValue]
}
