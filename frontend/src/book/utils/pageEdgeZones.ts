export const PAGE_EDGE_ZONE_FRACTION = 0.15

export interface PageFlipRect {
  width: number
  height: number
  pageWidth: number
}

export type BookMode = 'spread' | 'single'

export function isInPageEdgeStripe(
  pos: { x: number; y: number },
  rect: { width: number; pageWidth: number },
): boolean {
  const edgeW = rect.pageWidth * PAGE_EDGE_ZONE_FRACTION
  return pos.x < edgeW || pos.x > rect.width - edgeW
}

export function isInCornerHoverZone(
  pos: { x: number; y: number },
  rect: { width: number; height: number; pageWidth: number },
): boolean {
  if (!isInPageEdgeStripe(pos, rect)) return false

  const cornerH = rect.height * PAGE_EDGE_ZONE_FRACTION
  return pos.y < cornerH || pos.y > rect.height - cornerH
}

export function clampBookPosForCornerFold(
  pos: { x: number; y: number },
  rect: { width: number; pageWidth: number },
): { x: number; y: number } {
  const minPageX = rect.pageWidth * (1 - PAGE_EDGE_ZONE_FRACTION)
  const spineX = rect.width / 2

  if (pos.x < spineX) {
    return { x: Math.min(pos.x, spineX - minPageX), y: pos.y }
  }

  return { x: Math.max(pos.x, spineX + minPageX), y: pos.y }
}

export function getBookFlipRect(bookRect: DOMRect, mode: BookMode): PageFlipRect {
  return {
    width: bookRect.width,
    height: bookRect.height,
    pageWidth: mode === 'spread' ? bookRect.width / 2 : bookRect.width,
  }
}

export function getEdgeFlipAction(
  clientX: number,
  clientY: number,
  bookRect: DOMRect,
  mode: BookMode,
): 'prev' | 'next' | null {
  const pos = { x: clientX - bookRect.left, y: clientY - bookRect.top }
  const flipRect = getBookFlipRect(bookRect, mode)

  if (!isInPageEdgeStripe(pos, flipRect)) return null

  return pos.x < bookRect.width / 2 ? 'prev' : 'next'
}

export function canStartEdgeFlip(flipState: string | undefined): boolean {
  return flipState === 'read' || flipState === 'fold_corner'
}

export function getFlipInteractionRect(
  flip: PageFlipInstance,
  mode: BookMode,
): PageFlipRect | null {
  const distRect = getFlipDistRect(flip)
  if (!distRect) return null
  return getBookFlipRect(distRect, mode)
}

/** Clear a stuck corner preview or in-progress drag so navigation can resume. */
export function resetFlipInteractionState(flip: PageFlipInstance, mode: BookMode): void {
  const state = flip.getState()
  const flipRect = getFlipInteractionRect(flip, mode)
  if (!flipRect) return

  if (state === 'fold_corner') {
    flip.userMove({ x: flipRect.width / 2, y: flipRect.height / 2 }, false)
    return
  }

  if (state === 'user_fold') {
    flip.getFlipController?.()?.stopMove?.()
  }
}

export function prepareForPageFlip(flip: PageFlipInstance, mode: BookMode): boolean {
  const state = flip.getState()
  if (state === 'flipping') return false

  if (state === 'fold_corner' || state === 'user_fold') {
    resetFlipInteractionState(flip, mode)
  }

  return canStartEdgeFlip(flip.getState())
}

/** Animated edge turn. Portrait mode needs book-space coords for prev (flipPrev x=10 misses corners). */
export function performEdgePageTurn(
  flip: PageFlipInstance,
  direction: 'prev' | 'next',
  mode: BookMode,
): void {
  if (direction === 'next') {
    flip.flipNext()
    return
  }

  if (mode === 'single') {
    const bounds = flip.getBoundsRect()
    flip.getFlipController?.()?.flip({ x: bounds.left + 10, y: 1 })
    return
  }

  flip.flipPrev()
}

/**
 * Marker / programmatic navigation. Backward jumps in portrait call flipPrev internally,
 * which fails the corner check — patch it for the duration of the flip call.
 */
export function navigateTowardPage(
  flip: PageFlipInstance,
  targetPage: number,
  mode: BookMode,
): void {
  const current = flip.getCurrentPageIndex()
  if (current === targetPage) return

  const goingBackward = targetPage < current
  if (!goingBackward || mode !== 'single') {
    flip.flip(targetPage)
    return
  }

  const controller = flip.getFlipController?.()
  if (!controller?.flipPrev) {
    flip.flip(targetPage)
    return
  }

  const originalFlipPrev = controller.flipPrev.bind(controller)
  controller.flipPrev = () => {
    performEdgePageTurn(flip, 'prev', mode)
  }

  try {
    flip.flip(targetPage)
  } finally {
    controller.flipPrev = originalFlipPrev
  }
}

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return Boolean(
    target instanceof HTMLElement &&
      target.closest('button, a, input, textarea, select, label, [role="button"]'),
  )
}

export interface PageFlipBoundsRect {
  left: number
  top: number
  width: number
  height: number
  pageWidth: number
}

export interface PageFlipInstance {
  flip: (pageIndex: number) => void
  flipNext: () => void
  flipPrev: () => void
  getPageCount: () => number
  getCurrentPageIndex: () => number
  getState: () => string
  destroy: () => void
  getSettings: () => { showPageCorners: boolean; useMouseEvents: boolean }
  getBoundsRect: () => PageFlipBoundsRect
  userMove: (pos: { x: number; y: number }, isTouch: boolean) => void
  getUI?: () => { getDistElement: () => HTMLElement }
  getFlipController?: () => {
    flip: (pos: { x: number; y: number }) => void
    flipPrev: (corner?: string) => void
    stopMove: () => void
  }
}

export function getFlipDistRect(flip: PageFlipInstance): DOMRect | null {
  return flip.getUI?.()?.getDistElement()?.getBoundingClientRect() ?? null
}
