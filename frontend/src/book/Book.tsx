import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import 'page-flip/src/Style/stPageFlip.css'
import './Book.css'

import { BOOK_LAYOUT } from '../config/bookLayout'
import WorldMapOverlay from '../features/map/components/WorldMapOverlay'
import { MapOverlayProvider, useMapOverlay } from '../features/map/context/MapOverlayContext'
import { ProjectsSelectionProvider } from '../features/projects/context/ProjectsSelectionContext'
import BookFlipContent, { DESIGN_PAGE_HEIGHT, DESIGN_PAGE_WIDTH } from './BookFlipContent'
import {
  MARKER_BAR_HEIGHT,
  MARKER_RAIL_WIDTH,
  computeLayout,
  useElementSize,
} from './hooks/useBookLayout'
import { navigateTowardPage, prepareForPageFlip } from './utils/pageEdgeZones'
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

function MapOverlayHost({ bookWidth, bookHeight }: { bookWidth: number; bookHeight: number }) {
  const { isOverlayVisible, isClosing, visitedCountries, closeMap } = useMapOverlay()

  if (!isOverlayVisible) return null

  return (
    <WorldMapOverlay
      visitedCountries={visitedCountries}
      isClosing={isClosing}
      onClose={closeMap}
      bookWidth={bookWidth}
      bookHeight={bookHeight}
    />
  )
}

export default function Book() {
  const stageRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<FlipBookHandle>(null)
  const flipInstanceRef = useRef<PageFlipInstance | null>(null)
  const currentPageRef = useRef(0)
  const stageSize = useElementSize(stageRef)

  const pages = BOOK_LAYOUT
  const statusMessage = pages.length === 0 ? 'This book has no pages yet.' : null

  useEffect(
    () => () => {
      flipInstanceRef.current?.destroy()
      flipInstanceRef.current = null
    },
    [],
  )

  const markers = useMemo<Marker[]>(
    () =>
      pages
        .map((page, index) => ({ page, index }))
        .filter(({ page, index }) => {
          if (index % 2 !== 0) return false
          return Boolean(page.markerLabel?.trim() || page.title?.trim())
        })
        .map(({ page, index }) => ({
          label: (page.markerLabel ?? page.title)!.trim(),
          page: index,
        })),
    [pages],
  )

  const layout = stageSize ? computeLayout(stageSize, markers.length > 0) : null

  const handleInit = useCallback((event: FlipBookEvent<unknown>) => {
    if (flipInstanceRef.current && flipInstanceRef.current !== event.object) {
      flipInstanceRef.current.destroy()
    }
    flipInstanceRef.current = event.object
  }, [])

  const handleFlip = useCallback((event: FlipBookEvent<number>) => {
    currentPageRef.current = event.data
  }, [])

  const goToPage = useCallback((page: number) => {
    const flip = bookRef.current?.pageFlip()
    if (!flip || !layout) return
    if (!prepareForPageFlip(flip, layout.mode)) return
    if (flip.getCurrentPageIndex() === page) return
    navigateTowardPage(flip, page, layout.mode)
  }, [layout])

  const stageStyle = {
    '--page-design-width': `${DESIGN_PAGE_WIDTH}px`,
    '--page-design-height': `${DESIGN_PAGE_HEIGHT}px`,
    '--page-scale': String(layout?.contentScale ?? 1),
    '--book-width': `${layout?.bookWidth ?? DESIGN_PAGE_WIDTH * 2}px`,
    '--book-height': `${layout?.bookHeight ?? DESIGN_PAGE_HEIGHT}px`,
    '--marker-rail-width': `${layout?.markerRailWidth ?? MARKER_RAIL_WIDTH}px`,
    '--marker-bar-height': `${layout?.markerBarHeight ?? MARKER_BAR_HEIGHT}px`,
  } as CSSProperties

  const markerButtons = markers.map((marker) => (
    <button
      key={marker.page}
      type="button"
      className="book-marker"
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
      onClick={(event) => {
        event.stopPropagation()
        goToPage(marker.page)
      }}
    >
      {marker.label}
    </button>
  ))

  return (
    <div className="book-stage" ref={stageRef} style={stageStyle}>
      {layout && statusMessage && (
        <div
          className="book-wrapper book-wrapper--status"
          style={{ width: layout.bookWidth, height: layout.bookHeight }}
        >
          <p>{statusMessage}</p>
        </div>
      )}

      {layout && !statusMessage && (
        <MapOverlayProvider>
          <ProjectsSelectionProvider>
            <BookFlipContent
              layout={layout}
              pages={pages}
              markers={markers}
              markerButtons={markerButtons}
              handleInit={handleInit}
              handleFlip={handleFlip}
              bookRef={bookRef}
              currentPageRef={currentPageRef}
            />
          </ProjectsSelectionProvider>
          <MapOverlayHost bookWidth={layout.bookWidth} bookHeight={layout.bookHeight} />
        </MapOverlayProvider>
      )}
    </div>
  )
}
