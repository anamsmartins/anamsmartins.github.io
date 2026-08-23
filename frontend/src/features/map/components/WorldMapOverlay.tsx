import { memo, useCallback, useEffect, useMemo, useRef, type CSSProperties, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { geoArea } from 'd3-geo'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldCountries from 'world-atlas/countries-110m.json'

import '../map.css'

interface WorldMapOverlayProps {
  visitedCountries: string[]
  isClosing: boolean
  onClose: () => void
  bookWidth: number
  bookHeight: number
}

const GEOGRAPHY_STYLE = {
  default: {
    fill: 'var(--book-map-country-color)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 0.65,
    outline: 'none',
  },
  hover: {
    fill: 'var(--book-map-country-color-hover)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 0.85,
    outline: 'none',
  },
  pressed: {
    fill: 'var(--book-map-country-color-pressed)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 0.85,
    outline: 'none',
  },
}

const VISITED_GEOGRAPHY_STYLE = {
  default: {
    fill: 'var(--book-map-visited-country-color)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 0.85,
    outline: 'none',
  },
  hover: {
    fill: 'var(--book-map-visited-country-color-hover)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 1,
    outline: 'none',
  },
  pressed: {
    fill: 'var(--book-map-visited-country-color-pressed)',
    stroke: 'var(--book-map-border-color)',
    strokeWidth: 1,
    outline: 'none',
  },
}

interface MapSvgProps {
  visitedSet: Set<string>
  onCountryEnter: (name: string, visited: boolean, event: MouseEvent<SVGPathElement>) => void
  onCountryLeave: () => void
}

const EXCLUDED_COUNTRIES = new Set(['antarctica'])

const MAP_STARS = [
  { x: 56, y: 92, size: 5, delay: 0.4 },
  { x: 30, y: 88, size: 7, delay: 1.3 },
  { x: 74, y: 88, size: 6, delay: 2.9 },
  { x: 94, y: 86, size: 6, delay: 1.5 },
  { x: 8, y: 82, size: 6, delay: 0.7 },
  { x: 44, y: 80, size: 6, delay: 2.6 },
  { x: 84, y: 78, size: 5, delay: 0.8 },
  { x: 18, y: 76, size: 5, delay: 2.0 },
  { x: 50, y: 74, size: 6, delay: 2.2 },
  { x: 36, y: 72, size: 6, delay: 1.1 },
  { x: 92, y: 68, size: 5, delay: 2.3 },
  { x: 52, y: 64, size: 8, delay: 2.8 },
  { x: 22, y: 58, size: 7, delay: 0.3 },
  { x: 80, y: 52, size: 7, delay: 1.6 },
  { x: 10, y: 42, size: 5, delay: 2.5 },
  { x: 48, y: 38, size: 5, delay: 3.1 },
  { x: 64, y: 32, size: 6, delay: 1.9 },
  { x: 86, y: 24, size: 6, delay: 1.8 },
  { x: 42, y: 22, size: 7, delay: 0.6 },
  { x: 14, y: 18, size: 8, delay: 0 },
  { x: 72, y: 16, size: 7, delay: 0.9 },
  { x: 58, y: 10, size: 5, delay: 2.1 },
] as const

const FRENCH_GUIANA_BOUNDS = { minLon: -55, maxLon: -51, minLat: 0, maxLat: 6 }

interface MapGeography {
  rsmKey: string
  properties?: { name?: string }
  geometry?: { type?: string; coordinates?: unknown }
  svgPath?: string
}

function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0]
  const lon = ring.reduce((sum, coord) => sum + coord[0], 0) / ring.length
  const lat = ring.reduce((sum, coord) => sum + coord[1], 0) / ring.length
  return [lon, lat]
}

function labelForFrancePart(lon: number, lat: number): string {
  if (
    lon >= FRENCH_GUIANA_BOUNDS.minLon &&
    lon <= FRENCH_GUIANA_BOUNDS.maxLon &&
    lat >= FRENCH_GUIANA_BOUNDS.minLat &&
    lat <= FRENCH_GUIANA_BOUNDS.maxLat
  ) {
    return 'French Guiana'
  }
  return 'France'
}

function isCountryVisited(name: string, visitedSet: Set<string>): boolean {
  const lower = name.toLowerCase()
  if (visitedSet.has(lower)) return true
  if (lower === 'french guiana' && visitedSet.has('france')) return true
  return false
}

function expandSplitGeographies(
  geographies: MapGeography[],
  path: (feature: GeoJSON.Feature) => string | null,
): MapGeography[] {
  const expanded: MapGeography[] = []

  for (const geo of geographies) {
    const name = geo.properties?.name ?? ''
    const geometry = geo.geometry as { type?: string; coordinates?: number[][][][] } | undefined

    if (name === 'France' && geometry?.type === 'MultiPolygon' && geometry.coordinates) {
      geometry.coordinates.forEach((polygonCoords, index) => {
        const [lon, lat] = getPolygonCentroid(polygonCoords)
        const displayName = labelForFrancePart(lon, lat)
        const partFeature: GeoJSON.Feature = {
          type: 'Feature',
          properties: { ...geo.properties, name: displayName },
          geometry: { type: 'Polygon', coordinates: polygonCoords },
        }
        expanded.push({
          ...geo,
          rsmKey: `${geo.rsmKey}-part-${index}`,
          properties: { ...geo.properties, name: displayName },
          geometry: partFeature.geometry,
          svgPath: path(partFeature) ?? '',
        })
      })
      continue
    }

    expanded.push(geo)
  }

  return expanded.sort(
    (a, b) =>
      geoArea({ type: 'Feature', geometry: b.geometry as GeoJSON.Geometry, properties: {} }) -
      geoArea({ type: 'Feature', geometry: a.geometry as GeoJSON.Geometry, properties: {} }),
  )
}

const MAP_PROJECTION = { scale: 198, center: [10, 4] as [number, number] }
const MAP_VIEW_WIDTH = 804
const MAP_VIEW_HEIGHT = 420

const MapSvg = memo(function MapSvg({ visitedSet, onCountryEnter, onCountryLeave }: MapSvgProps) {
  return (
    <ComposableMap
      width={MAP_VIEW_WIDTH}
      height={MAP_VIEW_HEIGHT}
      projectionConfig={MAP_PROJECTION}
      className="world-map-svg"
    >
      <Geographies geography={worldCountries}>
        {({ geographies, path }) => {
          const renderGeographies = expandSplitGeographies(geographies, path)

          return renderGeographies
            .filter((geo) => {
              const name = ((geo.properties?.name as string | undefined) ?? '').toLowerCase()
              return !EXCLUDED_COUNTRIES.has(name)
            })
            .map((geo) => {
              const name = (geo.properties?.name as string | undefined) ?? ''
              const visited = isCountryVisited(name, visitedSet)
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className={
                    visited ? 'world-map-geography world-map-geography--visited' : 'world-map-geography'
                  }
                  style={visited ? VISITED_GEOGRAPHY_STYLE : GEOGRAPHY_STYLE}
                  onMouseEnter={(event) => onCountryEnter(name, visited, event)}
                  onMouseLeave={onCountryLeave}
                />
              )
            })
        }}
      </Geographies>
    </ComposableMap>
  )
})

export default function WorldMapOverlay({
  visitedCountries,
  isClosing,
  onClose,
  bookWidth,
  bookHeight,
}: WorldMapOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const overlayRectRef = useRef<DOMRect | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)

  const visitedSet = useMemo(
    () => new Set(visitedCountries.map((name) => name.toLowerCase())),
    [visitedCountries],
  )

  const refreshOverlayRect = useCallback(() => {
    overlayRectRef.current = overlayRef.current?.getBoundingClientRect() ?? null
  }, [])

  const paintTooltip = useCallback((clientX: number, clientY: number) => {
    const tooltip = tooltipRef.current
    const rect = overlayRectRef.current
    if (!tooltip || !rect) return

    const x = clientX - rect.left
    const y = clientY - rect.top
    tooltip.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, calc(-100% - 14px))`
  }, [])

  const scheduleTooltipPaint = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0
      const { x, y } = pointerRef.current
      paintTooltip(x, y)
    })
  }, [paintTooltip])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      pointerRef.current.x = event.clientX
      pointerRef.current.y = event.clientY
      scheduleTooltipPaint()
    },
    [scheduleTooltipPaint],
  )

  const handleCountryLeave = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    if (tooltipRef.current) {
      tooltipRef.current.hidden = true
    }
  }, [handlePointerMove])

  const handleCountryEnter = useCallback(
    (name: string, visited: boolean, event: MouseEvent<SVGPathElement>) => {
      const tooltip = tooltipRef.current
      if (!tooltip || !name) return

      refreshOverlayRect()
      pointerRef.current.x = event.clientX
      pointerRef.current.y = event.clientY

      tooltip.textContent = name
      tooltip.classList.toggle('world-map-country-label--visited', visited)
      tooltip.hidden = false
      paintTooltip(event.clientX, event.clientY)

      window.removeEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
    },
    [handlePointerMove, paintTooltip, refreshOverlayRect],
  )

  useEffect(() => {
    refreshOverlayRect()
    const overlay = overlayRef.current
    if (!overlay) return

    const observer = new ResizeObserver(refreshOverlayRect)
    observer.observe(overlay)

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handlePointerMove, refreshOverlayRect])

  useEffect(() => {
    if (!isClosing) return

    window.removeEventListener('pointermove', handlePointerMove)
    if (tooltipRef.current) {
      tooltipRef.current.hidden = true
    }
  }, [isClosing, handlePointerMove])

  const overlayStyle = {
    '--book-width': `${bookWidth}px`,
    '--book-height': `${bookHeight}px`,
  } as CSSProperties

  return createPortal(
    <div
      className={`world-map-overlay${isClosing ? ' world-map-overlay--closing' : ''}`}
      ref={overlayRef}
      role="presentation"
      style={overlayStyle}
    >
      <button
        type="button"
        className="world-map-backdrop"
        onClick={onClose}
        aria-label="Close map"
      />
      <div className="world-map-aura" role="presentation">
        <div className="world-map-glow-ring" aria-hidden />
        <div className="world-map-glow-ring world-map-glow-ring--outer" aria-hidden />
        <MapSvg
          visitedSet={visitedSet}
          onCountryEnter={handleCountryEnter}
          onCountryLeave={handleCountryLeave}
        />
        <div className="world-map-sparkles" aria-hidden>
          {MAP_STARS.map((star, index) => (
            <span
              key={index}
              className="world-map-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div ref={tooltipRef} className="world-map-country-label" role="tooltip" hidden />

      <div className="world-map-legend" role="note">
        <span className="world-map-legend-swatch" aria-hidden="true" />
        <span className="world-map-legend-label">Visited Countries</span>
      </div>
    </div>,
    document.body,
  )
}
