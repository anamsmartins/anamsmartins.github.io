import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type OverlayPhase = 'closed' | 'open' | 'closing'

const CLOSE_ANIMATION_MS = 450

interface MapOverlayContextValue {
  isOverlayVisible: boolean
  isMapOpen: boolean
  isClosing: boolean
  visitedCountries: string[]
  openMap: (visitedCountries: string[]) => void
  closeMap: () => void
  toggleMap: (visitedCountries: string[]) => void
}

const MapOverlayContext = createContext<MapOverlayContextValue | null>(null)

export function MapOverlayProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<OverlayPhase>('closed')
  const [visitedCountries, setVisitedCountries] = useState<string[]>([])

  useEffect(() => {
    if (phase !== 'closing') return

    const timer = window.setTimeout(() => setPhase('closed'), CLOSE_ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  const openMap = useCallback((countries: string[]) => {
    setVisitedCountries(countries)
    setPhase('open')
  }, [])

  const closeMap = useCallback(() => {
    setPhase((current) => (current === 'open' ? 'closing' : current))
  }, [])

  const toggleMap = useCallback((countries: string[]) => {
    setPhase((current) => {
      if (current === 'open') return 'closing'
      if (current === 'closed') {
        setVisitedCountries(countries)
        return 'open'
      }
      return current
    })
  }, [])

  const value = useMemo(
    () => ({
      isOverlayVisible: phase !== 'closed',
      isMapOpen: phase === 'open',
      isClosing: phase === 'closing',
      visitedCountries,
      openMap,
      closeMap,
      toggleMap,
    }),
    [phase, visitedCountries, openMap, closeMap, toggleMap],
  )

  return <MapOverlayContext.Provider value={value}>{children}</MapOverlayContext.Provider>
}

export function useMapOverlay() {
  const context = useContext(MapOverlayContext)
  if (!context) {
    throw new Error('useMapOverlay must be used within MapOverlayProvider')
  }
  return context
}
