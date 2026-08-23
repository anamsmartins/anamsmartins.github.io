import { useCallback } from 'react'

import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { loadVisitedCountries } from '../../../shared/data/loadContent'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { useMapOverlay } from '../context/MapOverlayContext'
import type { MapData } from '../types'
import '../map.css'

interface MapPageProps {
  title?: string | null
  data: MapData
}

export default function MapPage({ data: mapData }: MapPageProps) {
  const { isMapOpen, toggleMap } = useMapOverlay()
  const loadCountries = useCallback(() => loadVisitedCountries(), [])
  const { data: visitedCountries, status, errorMessage } = useAsyncData(loadCountries)

  if (status === 'loading') {
    return <PageLoading />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  const countries = visitedCountries ?? []
  const isRightPage = mapData.mapSide === 'right'
  const showButton = isRightPage && (Boolean(mapData.buttonLabel) || countries.length > 0)
  const buttonLabel = mapData.buttonLabel || 'See Map'

  return (
    <div className={`map-page${isRightPage ? ' map-page--right' : ''}`}>
      {showButton && (
        <button
          type="button"
          className={`map-page-button${mapData.buttonImageUrl ? ' map-page-button--image' : ''}${isMapOpen ? ' map-page-button--active' : ''}`}
          onClick={() => toggleMap(countries)}
          aria-pressed={isMapOpen}
          aria-label={buttonLabel}
          style={
            mapData.buttonImageUrl
              ? { backgroundImage: `url(${assetUrl(mapData.buttonImageUrl)})` }
              : undefined
          }
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
