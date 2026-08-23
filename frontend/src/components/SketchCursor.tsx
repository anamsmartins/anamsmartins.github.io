import { useEffect, useRef, useState } from 'react'
import './SketchCursor.css'

const POINTER_TARGET_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  'label[for]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]',
].join(', ')

function isPointerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false

  if (target.closest(POINTER_TARGET_SELECTOR)) return true
  if (target.closest('.book-wrapper--flip-cursor')) return true

  return false
}

export default function SketchCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [clicking, setClicking] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (coarsePointer) return

    root.classList.add('sketch-cursor-active')

    const onMove = (event: MouseEvent) => {
      const cursor = cursorRef.current
      if (!cursor) return
      cursor.classList.toggle('sketch-cursor--clickable', isPointerTarget(event.target))
      cursor.style.transform = `translate(${event.clientX - 2}px, ${event.clientY - 2}px)`
      setVisible(true)
    }

    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    root.addEventListener('mouseleave', onLeave)
    root.addEventListener('mouseenter', onEnter)

    return () => {
      root.classList.remove('sketch-cursor-active')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      root.removeEventListener('mouseleave', onLeave)
      root.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className={`sketch-cursor${clicking ? ' sketch-cursor--clicking' : ''}${visible ? '' : ' sketch-cursor--hidden'}`}
      aria-hidden="true"
    >
      <svg className="sketch-cursor__svg" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="sketch-cursor__sparkle">
          <path className="sketch-cursor__sparkle-line" d="M0.11 1.97 L-2.79 1.19" />
          <path className="sketch-cursor__sparkle-line" d="M1.3 0.22 L-0.48 -2.19" />
          <path className="sketch-cursor__sparkle-line" d="M3.34 -0.4 L3.47 -3.39" />
          <path className="sketch-cursor__sparkle-line" d="M5.31 0.39 L7.28 -1.87" />
          <path className="sketch-cursor__sparkle-line" d="M6.35 2.24 L9.3 1.72" />
        </g>
        <path
          className="sketch-cursor__outline"
          d="M3.2 2.8 L3.6 21.4 L10.8 16.2 L13.4 24.6 L16.8 23.2 L14.1 14.8 L24.2 13.1 Z"
        />
        <path
          className="sketch-cursor__fill"
          d="M6.4 6.1 L6.7 18.2 L11.2 14.8 L12.8 20.4 L14.6 19.4 L12.9 13.6 L19.8 12.4 Z"
        />
      </svg>
    </div>
  )
}
