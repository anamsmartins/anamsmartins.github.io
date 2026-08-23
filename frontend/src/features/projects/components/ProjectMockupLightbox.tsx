import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { assetUrl } from '../../../shared/utils/assetUrl'
import type { ProjectImage } from '../types'
import '../projects.css'

interface ProjectMockupLightboxProps {
  images: ProjectImage[]
  alt: string
  onClose: () => void
  initialIndex?: number
  variant?: 'fantasy' | 'professional'
}

export default function ProjectMockupLightbox({
  images,
  alt,
  onClose,
  initialIndex = 0,
  variant = 'fantasy',
}: ProjectMockupLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const hasMultiple = images.length > 1
  const activeImage = images[activeIndex]

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length)
  }, [images.length])

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [images, initialIndex])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (!hasMultiple) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasMultiple, onClose, showNext, showPrevious])

  if (!activeImage) return null

  const imageAlt = activeImage.legend
    ? `${alt} — ${activeImage.legend}`
    : `${alt} — screenshot ${activeIndex + 1} of ${images.length}`

  return createPortal(
    <div
      className={`projects-mockup-lightbox${variant === 'professional' ? ' projects-mockup-lightbox--professional' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — enlarged view`}
    >
      <button
        type="button"
        className="projects-mockup-lightbox-backdrop"
        onClick={onClose}
        aria-label="Close preview"
      />
      <figure className="projects-mockup-lightbox-content">
        <div className="projects-mockup-lightbox-panel">
          <div className="projects-mockup-lightbox-toolbar">
            <div className="projects-mockup-lightbox-toolbar-start" aria-live="polite">
              <span className="projects-mockup-lightbox-counter">
                {activeIndex + 1} / {images.length}
              </span>
              {activeImage.legend ? (
                <span className="projects-mockup-lightbox-legend">{activeImage.legend}</span>
              ) : null}
            </div>
            <button
              type="button"
              className="projects-mockup-lightbox-close"
              onClick={onClose}
              aria-label="Close preview"
            >
              ×
            </button>
          </div>

          <div className="projects-mockup-lightbox-stage">
            <div className="projects-mockup-lightbox-frame">
              {hasMultiple ? (
                <button
                  type="button"
                  className="projects-mockup-lightbox-nav projects-mockup-lightbox-nav--prev"
                  onClick={showPrevious}
                  aria-label="Previous screenshot"
                >
                  ‹
                </button>
              ) : null}
              <div className="projects-mockup-lightbox-image-wrap">
                <img
                  className="projects-mockup-lightbox-image"
                  src={assetUrl(activeImage.url)}
                  alt={imageAlt}
                  decoding="async"
                />
              </div>
              {hasMultiple ? (
                <button
                  type="button"
                  className="projects-mockup-lightbox-nav projects-mockup-lightbox-nav--next"
                  onClick={showNext}
                  aria-label="Next screenshot"
                >
                  ›
                </button>
              ) : null}
            </div>
          </div>

          {hasMultiple ? (
            <div className="projects-mockup-lightbox-thumbs" role="tablist" aria-label="Screenshots">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={image.legend || `Screenshot ${index + 1}`}
                  title={image.legend || undefined}
                  className={`projects-mockup-lightbox-thumb${index === activeIndex ? ' projects-mockup-lightbox-thumb--active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img src={assetUrl(image.url)} alt="" decoding="async" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </figure>
    </div>,
    document.body,
  )
}
