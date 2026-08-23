import { type MutableRefObject, type RefObject, useEffect } from 'react'

import {
  getEdgeFlipAction,
  getFlipDistRect,
  isInPageEdgeStripe,
  isInteractiveTarget,
  performEdgePageTurn,
  prepareForPageFlip,
  resetFlipInteractionState,
  getBookFlipRect,
  type BookMode,
  type PageFlipInstance,
} from '../utils/pageEdgeZones'

interface UsePageFlipInteractionsOptions {
  wrapperRef: RefObject<HTMLDivElement>
  bookRef: RefObject<{ pageFlip: () => PageFlipInstance | undefined }>
  pendingEdgeFlipRef: MutableRefObject<'prev' | 'next' | null>
  layoutMode: BookMode
  isOverlayVisible: boolean
  onEdgeFlip: () => void
}

export function usePageFlipInteractions({
  wrapperRef,
  bookRef,
  pendingEdgeFlipRef,
  layoutMode,
  isOverlayVisible,
  onEdgeFlip,
}: UsePageFlipInteractionsOptions): void {
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || isOverlayVisible) return

    const resolveCornerFlipAction = (
      clientX: number,
      clientY: number,
    ): 'prev' | 'next' | null => {
      const flip = bookRef.current?.pageFlip()
      const bookRect = flip ? getFlipDistRect(flip) : null
      if (!bookRect) return null
      return getEdgeFlipAction(clientX, clientY, bookRect, layoutMode)
    }

    const updateFlipCursor = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (isInteractiveTarget(target)) {
        wrapper.classList.remove('book-wrapper--flip-cursor')
        return
      }

      const flip = bookRef.current?.pageFlip()
      const bookRect = flip ? getFlipDistRect(flip) : null
      const inEdgeStripe = bookRect
        ? isInPageEdgeStripe(
            { x: clientX - bookRect.left, y: clientY - bookRect.top },
            getBookFlipRect(bookRect, layoutMode),
          )
        : false

      wrapper.classList.toggle('book-wrapper--flip-cursor', inEdgeStripe)
    }

    const onMouseMove = (event: MouseEvent) => {
      updateFlipCursor(event.clientX, event.clientY, event.target)
    }

    const onMouseLeave = () => {
      wrapper.classList.remove('book-wrapper--flip-cursor')
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (isInteractiveTarget(event.target)) {
        pendingEdgeFlipRef.current = null
        return
      }

      const action = resolveCornerFlipAction(event.clientX, event.clientY)
      pendingEdgeFlipRef.current = action
      if (!action) return

      event.preventDefault()
      event.stopPropagation()
    }

    const performEdgeFlip = (event: MouseEvent | TouchEvent) => {
      const action = pendingEdgeFlipRef.current
      pendingEdgeFlipRef.current = null
      if (!action || isInteractiveTarget(event.target)) return

      event.preventDefault()
      event.stopPropagation()

      const flip = bookRef.current?.pageFlip()
      if (!flip || !prepareForPageFlip(flip, layoutMode)) return

      onEdgeFlip()
      performEdgePageTurn(flip, action, layoutMode)
    }

    const onMouseUp = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (pendingEdgeFlipRef.current) {
        performEdgeFlip(event)
        return
      }

      const flip = bookRef.current?.pageFlip()
      if (!flip) return
      const state = flip.getState()
      if (state === 'fold_corner' || state === 'user_fold') {
        resetFlipInteractionState(flip, layoutMode)
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (!touch) return
      if (isInteractiveTarget(event.target)) {
        pendingEdgeFlipRef.current = null
        return
      }

      const action = resolveCornerFlipAction(touch.clientX, touch.clientY)
      pendingEdgeFlipRef.current = action
      if (!action) return

      event.preventDefault()
      event.stopPropagation()
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!event.changedTouches[0]) return
      if (pendingEdgeFlipRef.current) {
        performEdgeFlip(event)
        return
      }

      const flip = bookRef.current?.pageFlip()
      if (!flip) return
      const state = flip.getState()
      if (state === 'fold_corner' || state === 'user_fold') {
        resetFlipInteractionState(flip, layoutMode)
      }
    }

    wrapper.addEventListener('mousemove', onMouseMove)
    wrapper.addEventListener('mouseleave', onMouseLeave)
    wrapper.addEventListener('mousedown', onMouseDown, true)
    wrapper.addEventListener('mouseup', onMouseUp, true)
    wrapper.addEventListener('touchstart', onTouchStart, true)
    wrapper.addEventListener('touchend', onTouchEnd, true)

    return () => {
      wrapper.classList.remove('book-wrapper--flip-cursor')
      wrapper.removeEventListener('mousemove', onMouseMove)
      wrapper.removeEventListener('mouseleave', onMouseLeave)
      wrapper.removeEventListener('mousedown', onMouseDown, true)
      wrapper.removeEventListener('mouseup', onMouseUp, true)
      wrapper.removeEventListener('touchstart', onTouchStart, true)
      wrapper.removeEventListener('touchend', onTouchEnd, true)
    }
  }, [wrapperRef, bookRef, pendingEdgeFlipRef, layoutMode, isOverlayVisible, onEdgeFlip])
}

export function useMapOverlayFlipLock(
  bookRef: RefObject<{ pageFlip: () => PageFlipInstance | undefined }>,
  isOverlayVisible: boolean,
): void {
  useEffect(() => {
    const flip = bookRef.current?.pageFlip()
    if (!flip) return

    const settings = flip.getSettings()

    if (isOverlayVisible) {
      const rect = flip.getBoundsRect()
      flip.userMove({ x: rect.width / 2, y: rect.height / 2 }, false)

      settings.showPageCorners = false
      settings.useMouseEvents = false
    } else {
      settings.showPageCorners = true
      settings.useMouseEvents = true
    }
  }, [isOverlayVisible, bookRef])
}
