import HTMLFlipBook from 'react-pageflip'
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
} from 'react'

import { useMapOverlay } from '../features/map/context/MapOverlayContext'
import type { BookPageConfig } from '../shared/types/layouts'
import {
  DESIGN_PAGE_HEIGHT,
  DESIGN_PAGE_WIDTH,
  getFlipBookProps,
  type BookLayout,
} from './hooks/useBookLayout'
import { attachCornerFoldControl } from './hooks/useCornerFoldControl'
import {
  useMapOverlayFlipLock,
  usePageFlipInteractions,
} from './hooks/usePageFlipInteractions'
import PageRenderer from './PageRenderer'
import type { PageFlipInstance } from './utils/pageEdgeZones'

interface FlipBookHandle {
  pageFlip: () => PageFlipInstance | undefined
}

interface FlipBookEvent<T> {
  data: T
  object: PageFlipInstance
}

interface Marker {
  label: string
  page: number
}

interface BookFlipContentProps {
  layout: BookLayout
  pages: BookPageConfig[]
  markers: Marker[]
  markerButtons: ReactNode
  handleInit: (event: FlipBookEvent<unknown>) => void
  handleFlip: (event: FlipBookEvent<number>) => void
  bookRef: RefObject<FlipBookHandle>
  currentPageRef: RefObject<number | null>
}

export default function BookFlipContent({
  layout,
  pages,
  markers,
  markerButtons,
  handleInit,
  handleFlip,
  bookRef,
  currentPageRef,
}: BookFlipContentProps) {
  const { isOverlayVisible, closeMap } = useMapOverlay()
  const bookWrapperRef = useRef<HTMLDivElement>(null)
  const pendingEdgeFlipRef = useRef<'prev' | 'next' | null>(null)

  const handlePageFlip = useCallback(
    (event: FlipBookEvent<number>) => {
      closeMap()
      handleFlip(event)
    },
    [closeMap, handleFlip],
  )

  const handleBookInit = useCallback(
    (event: FlipBookEvent<unknown>) => {
      handleInit(event)
      attachCornerFoldControl(event.object, layout.mode)
    },
    [handleInit, layout.mode],
  )

  usePageFlipInteractions({
    wrapperRef: bookWrapperRef,
    bookRef,
    pendingEdgeFlipRef,
    layoutMode: layout.mode,
    isOverlayVisible,
    onEdgeFlip: closeMap,
  })

  useMapOverlayFlipLock(bookRef, isOverlayVisible)

  return (
    <div
      className={`book-shell book-shell--${layout.mode}${isOverlayVisible ? ' book-shell--map-open' : ''}`}
      style={{ width: layout.bookWidth }}
    >
      <div
        ref={bookWrapperRef}
        className={`book-wrapper book-wrapper--${layout.mode}`}
        style={{ width: layout.bookWidth, height: layout.bookHeight }}
      >
        <HTMLFlipBook
          key={`${layout.pageWidth}x${layout.pageHeight}`}
          {...getFlipBookProps(layout, currentPageRef.current ?? 0)}
          onInit={handleBookInit}
          onFlip={handlePageFlip}
          ref={bookRef}
        >
          {pages.map((page, pageIndex) => (
            <PageRenderer key={page.id} page={page} pageIndex={pageIndex} />
          ))}
        </HTMLFlipBook>
      </div>

      {markers.length > 0 && (
        <nav
          className={`book-markers book-markers--${layout.mode === 'spread' ? 'rail' : 'bar'}`}
          aria-label="Book sections"
        >
          {markerButtons}
        </nav>
      )}
    </div>
  )
}

export { DESIGN_PAGE_WIDTH, DESIGN_PAGE_HEIGHT }
