import type { ReactNode } from 'react'

const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g

export function renderInlineBold(text: string): ReactNode[] {
  return text.split(BOLD_PATTERN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="inline-accent">
          {part.slice(2, -2)}
        </span>
      )
    }
    return part
  })
}
