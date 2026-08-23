import { useEffect, useId, useState } from 'react'
import { Book, Briefcase } from 'react-bootstrap-icons'

import { useTheme } from './ThemeContext'
import './ThemeToggle.css'

const NUDGE_KEY = 'theme-toggle-nudged'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const inputId = useId()
  const isFantasy = theme === 'fantasy'
  const [nudge, setNudge] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(NUDGE_KEY)) return
    setNudge(true)
    const timer = window.setTimeout(() => setNudge(false), 8000)
    return () => window.clearTimeout(timer)
  }, [])

  function handleToggle() {
    sessionStorage.setItem(NUDGE_KEY, '1')
    setNudge(false)
    toggleTheme()
  }

  const label = isFantasy ? 'Switch to professional view' : 'Switch to fantasy view'

  return (
    <label
      className={`theme-switch${nudge ? ' theme-switch--nudge' : ''}`}
      htmlFor={inputId}
      title={label}
    >
      <span
        className={`theme-switch__option${!isFantasy ? ' theme-switch__option--active' : ''}`}
        aria-hidden="true"
      >
        <Briefcase className="theme-switch__icon" aria-hidden="true" />
      </span>

      <span className="theme-switch__control">
        <input
          id={inputId}
          type="checkbox"
          checked={isFantasy}
          onChange={handleToggle}
          aria-label={label}
        />
        <span className="theme-switch__track" aria-hidden="true" />
      </span>

      <span
        className={`theme-switch__option${isFantasy ? ' theme-switch__option--active' : ''}`}
        aria-hidden="true"
      >
        <Book className="theme-switch__icon" aria-hidden="true" />
      </span>
    </label>
  )
}
