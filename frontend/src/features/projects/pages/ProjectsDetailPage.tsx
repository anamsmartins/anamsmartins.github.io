import { useEffect, useState } from 'react'

import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { assetUrl } from '../../../shared/utils/assetUrl'
import ProjectMockupLightbox from '../components/ProjectMockupLightbox'
import ProjectLinkIcon from '../components/ProjectLinkIcon'
import { useProjectsSelection } from '../context/ProjectsSelectionContext'
import { getProjectImages, getProjectThumbnail, getProjectThumbnailIndex, getProjectThumbnailLegend } from '../utils/projectImages'
import '../projects.css'

export default function ProjectsDetailPage() {
  const { selectedProject, status, errorMessage } = useProjectsSelection()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setLightboxOpen(false)
  }, [selectedProject?.id])

  if (status === 'loading') {
    return <PageLoading label="Loading projects…" />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  if (!selectedProject) {
    return (
      <div className="projects-detail projects-detail--empty">
        <p className="projects-detail-empty">Select a project on the left page to explore it here.</p>
      </div>
    )
  }

  const techStack = selectedProject.techStack ?? []
  const features = selectedProject.features ?? []
  const links = selectedProject.links ?? []
  const projectImages = getProjectImages(selectedProject)
  const thumbnail = getProjectThumbnail(selectedProject)
  const thumbnailLegend = getProjectThumbnailLegend(selectedProject)
  const thumbnailIndex = getProjectThumbnailIndex(selectedProject)

  return (
    <div className="projects-detail">
      <div className="projects-detail-hero">
        <div className="projects-detail-summary">
          <div className="book-page-title">{selectedProject.name}</div>
          {techStack.length > 0 ? (
            <p className="projects-detail-tech">{techStack.join(' • ')}</p>
          ) : null}
        </div>
        <div
          className={`projects-detail-mockup${thumbnail ? '' : ' projects-detail-mockup--empty'}`}
        >
          <div className="projects-detail-mockup-tilt">
            {thumbnail ? (
              <button
                type="button"
                className="projects-detail-mockup-open"
                onClick={() => setLightboxOpen(true)}
                aria-label={`View ${selectedProject.name} screenshots${projectImages.length > 1 ? ` (${projectImages.length} images)` : ''}`}
              >
                <img
                  className="projects-detail-mockup-image"
                  src={assetUrl(thumbnail)}
                  alt={
                    thumbnailLegend
                      ? `${selectedProject.name} — ${thumbnailLegend}`
                      : `${selectedProject.name} preview`
                  }
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {lightboxOpen && projectImages.length > 0 ? (
        <ProjectMockupLightbox
          images={projectImages}
          alt={`${selectedProject.name} preview`}
          initialIndex={thumbnailIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}

      <div className="projects-detail-body">
        <div className="projects-detail-about">
          <h3 className="projects-detail-section-title">About this Project</h3>
          <p>{selectedProject.description}</p>
        </div>

        {features.length > 0 ? (
          <div className="projects-detail-features">
            <h3 className="projects-detail-section-title">Key Features</h3>
            <ul>
              {features.map((feature) => (
                <li key={feature}>
                  <svg
                    className="projects-detail-check"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M7.2 12.6 L10.5 15.7 L16.8 8.6" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {selectedProject.impact ? (
          <section className="projects-detail-impact">
            <h3 className="projects-detail-section-title">Impact</h3>
            <p>{selectedProject.impact}</p>
            <div className="projects-detail-impact-chart" aria-hidden="true">
              <svg viewBox="0 0 64 36" fill="none">
                <path
                  d="M4 30 C14 28, 18 22, 26 18 S40 14, 48 8 L60 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M4 32 H60" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
              </svg>
            </div>
          </section>
        ) : null}
      </div>

      {links.length > 0 ? (
        <section className="projects-detail-links">
          <h3 className="projects-detail-section-title">Links</h3>
          <ul>
            {links.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  <ProjectLinkIcon type={link.type} />
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
