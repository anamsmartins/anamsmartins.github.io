import { type ComponentProps, type RefObject, useEffect, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

export const DESIGN_PAGE_WIDTH = 550
export const DESIGN_PAGE_HEIGHT = 600
export const MARKER_RAIL_WIDTH = 150
export const MARKER_BAR_HEIGHT = 104

const PAGE_ASPECT_RATIO = DESIGN_PAGE_WIDTH / DESIGN_PAGE_HEIGHT

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

const PAGE_RATIO_DIVISOR = greatestCommonDivisor(DESIGN_PAGE_WIDTH, DESIGN_PAGE_HEIGHT)
const PAGE_WIDTH_STEP = DESIGN_PAGE_WIDTH / PAGE_RATIO_DIVISOR
const PAGE_HEIGHT_STEP = DESIGN_PAGE_HEIGHT / PAGE_RATIO_DIVISOR
const MIN_PAGE_STEPS = 8
const SPREAD_MIN_STAGE_WIDTH = 820
const MAX_PAGE_WIDTH = Math.round(DESIGN_PAGE_WIDTH * 1.25)
const RESIZE_SETTLE_MS = 120

export type BookMode = 'spread' | 'single'

export interface Size {
  width: number
  height: number
}

export interface BookLayout {
  mode: BookMode
  pageWidth: number
  pageHeight: number
  bookWidth: number
  bookHeight: number
  contentScale: number
  markerRailWidth: number
  markerBarHeight: number
}

export function computeLayout(stage: Size, hasMarkers: boolean): BookLayout {
  const mode: BookMode = stage.width >= SPREAD_MIN_STAGE_WIDTH ? 'spread' : 'single'
  const pagesAcross = mode === 'spread' ? 2 : 1

  const markerRailWidth =
    hasMarkers && mode === 'spread'
      ? Math.min(MARKER_RAIL_WIDTH, Math.round(stage.width * 0.15))
      : 0
  const markerBarHeight =
    hasMarkers && mode === 'single' ? Math.min(MARKER_BAR_HEIGHT, Math.round(stage.height * 0.28)) : 0

  const fittedWidth = Math.min(
    (stage.width - markerRailWidth * 2) / pagesAcross,
    (stage.height - markerBarHeight) * PAGE_ASPECT_RATIO,
    MAX_PAGE_WIDTH,
  )
  const steps = Math.max(MIN_PAGE_STEPS, Math.floor(fittedWidth / PAGE_WIDTH_STEP))
  const pageWidth = steps * PAGE_WIDTH_STEP
  const pageHeight = steps * PAGE_HEIGHT_STEP

  return {
    mode,
    pageWidth,
    pageHeight,
    bookWidth: pageWidth * pagesAcross,
    bookHeight: pageHeight,
    contentScale: pageWidth / DESIGN_PAGE_WIDTH,
    markerRailWidth,
    markerBarHeight,
  }
}

export function useElementSize(ref: RefObject<HTMLElement>): Size | null {
  const [size, setSize] = useState<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let measured = false
    let settleTimer: number | undefined

    const apply = (next: Size) => {
      setSize((current) =>
        current && current.width === next.width && current.height === next.height ? current : next,
      )
    }

    const observer = new ResizeObserver(([entry]) => {
      const next = {
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      }

      if (!measured) {
        measured = true
        apply(next)
        return
      }

      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => apply(next), RESIZE_SETTLE_MS)
    })

    observer.observe(element)

    return () => {
      window.clearTimeout(settleTimer)
      observer.disconnect()
    }
  }, [ref])

  return size
}

export function getFlipBookProps(
  layout: BookLayout,
  startPage: number,
): Omit<ComponentProps<typeof HTMLFlipBook>, 'children'> {
  return {
    className: 'flipbook',
    style: {},
    width: layout.pageWidth,
    height: layout.pageHeight,
    size: 'fixed',
    minWidth: layout.pageWidth,
    maxWidth: layout.pageWidth,
    minHeight: layout.pageHeight,
    maxHeight: layout.pageHeight,
    startPage,
    drawShadow: true,
    flippingTime: 1000,
    renderOnlyPageLengthChange: true,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    maxShadowOpacity: 0.3,
    showCover: false,
    mobileScrollSupport: true,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 30,
    showPageCorners: true,
    disableFlipByClick: true,
  }
}
